import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { Location } from '../../domain/models/Location.js';

const GEOCLUE_BUS_NAME = 'org.freedesktop.GeoClue2';
const GEOCLUE_MANAGER_PATH = '/org/freedesktop/GeoClue2/Manager';

// Konum sağlayıcısı (GeoClue2 + Manuel)
export class LocationProvider {
    constructor(settings) {
        this._settings = settings;
        this._cancellable = null;
    }

    // Mevcut konumu al
    async getLocation() {
        // Manuel konum aktifse onu kullan
        if (this._settings.get_boolean('use-manual-location')) {
            return this._getManualLocation();
        }

        // Otomatik konum dene
        try {
            return await this._getAutoLocation();
        } catch (error) {
            console.warn(`[Praytime] Otomatik konum alınamadı: ${error.message}`);
            return this._getManualLocation();
        }
    }

    // Manuel konum
    _getManualLocation() {
        const lat = this._settings.get_double('latitude');
        const lon = this._settings.get_double('longitude');
        const city = this._settings.get_string('city-name');

        return new Location(lat, lon, city);
    }

    // GeoClue2 ile otomatik konum
    _getAutoLocation() {
        return new Promise((resolve, reject) => {
            this._cancellable = new Gio.Cancellable();

            Gio.DBusProxy.new_for_bus(
                Gio.BusType.SYSTEM,
                Gio.DBusProxyFlags.NONE,
                null,
                GEOCLUE_BUS_NAME,
                GEOCLUE_MANAGER_PATH,
                'org.freedesktop.GeoClue2.Manager',
                this._cancellable,
                (source, result) => {
                    try {
                        const manager = Gio.DBusProxy.new_for_bus_finish(result);
                        this._getClientFromManager(manager, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                }
            );

            // 10 saniye timeout
            GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
                if (this._cancellable && !this._cancellable.is_cancelled()) {
                    this._cancellable.cancel();
                    reject(new Error('Konum zaman aşımı'));
                }
                return GLib.SOURCE_REMOVE;
            });
        });
    }

    _getClientFromManager(manager, resolve, reject) {
        manager.call(
            'GetClient',
            null,
            Gio.DBusCallFlags.NONE,
            -1,
            this._cancellable,
            (proxy, result) => {
                try {
                    const [clientPath] = proxy.call_finish(result).deep_unpack();
                    this._setupClient(clientPath, resolve, reject);
                } catch (error) {
                    reject(error);
                }
            }
        );
    }

    _setupClient(clientPath, resolve, reject) {
        Gio.DBusProxy.new_for_bus(
            Gio.BusType.SYSTEM,
            Gio.DBusProxyFlags.NONE,
            null,
            GEOCLUE_BUS_NAME,
            clientPath,
            'org.freedesktop.GeoClue2.Client',
            this._cancellable,
            (source, result) => {
                try {
                    const client = Gio.DBusProxy.new_for_bus_finish(result);

                    // Uygulama bilgisi ayarla
                    client.call(
                        'org.freedesktop.DBus.Properties.Set',
                        new GLib.Variant('(ssv)', [
                            'org.freedesktop.GeoClue2.Client',
                            'DesktopId',
                            new GLib.Variant('s', 'praytime@erho.dev'),
                        ]),
                        Gio.DBusCallFlags.NONE,
                        -1,
                        null,
                        null
                    );

                    // Konum güncelleme dinle
                    const signalId = client.connect('g-signal', (proxy, sender, signal, params) => {
                        if (signal === 'LocationUpdated') {
                            client.disconnect(signalId);
                            const [, newPath] = params.deep_unpack();
                            this._getLocationFromPath(newPath, resolve, reject);
                        }
                    });

                    // Konumu başlat
                    client.call('Start', null, Gio.DBusCallFlags.NONE, -1, null, null);
                } catch (error) {
                    reject(error);
                }
            }
        );
    }

    _getLocationFromPath(locationPath, resolve, reject) {
        Gio.DBusProxy.new_for_bus(
            Gio.BusType.SYSTEM,
            Gio.DBusProxyFlags.NONE,
            null,
            GEOCLUE_BUS_NAME,
            locationPath,
            'org.freedesktop.GeoClue2.Location',
            null,
            (source, result) => {
                try {
                    const location = Gio.DBusProxy.new_for_bus_finish(result);
                    const lat = location.get_cached_property('Latitude').unpack();
                    const lon = location.get_cached_property('Longitude').unpack();

                    resolve(new Location(lat, lon));
                } catch (error) {
                    reject(error);
                }
            }
        );
    }

    destroy() {
        if (this._cancellable) {
            this._cancellable.cancel();
            this._cancellable = null;
        }
        this._settings = null;
    }
}
