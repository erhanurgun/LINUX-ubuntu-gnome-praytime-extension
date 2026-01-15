import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Tercihler penceresi
export default class PraytimePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Konum Sayfası
        const locationPage = new Adw.PreferencesPage({
            title: 'Konum',
            icon_name: 'find-location-symbolic',
        });
        window.add(locationPage);

        this._buildLocationPage(locationPage, settings);

        // Bildirim Sayfası
        const notificationPage = new Adw.PreferencesPage({
            title: 'Bildirimler',
            icon_name: 'preferences-system-notifications-symbolic',
        });
        window.add(notificationPage);

        this._buildNotificationPage(notificationPage, settings);

        // Gösterim Sayfası
        const displayPage = new Adw.PreferencesPage({
            title: 'Gösterim',
            icon_name: 'preferences-desktop-display-symbolic',
        });
        window.add(displayPage);

        this._buildDisplayPage(displayPage, settings);
    }

    _buildLocationPage(page, settings) {
        const group = new Adw.PreferencesGroup({
            title: 'Konum Ayarları',
            description: 'Namaz vakitlerinin hesaplanacağı konum',
        });
        page.add(group);

        // Manuel konum switch
        const manualRow = new Adw.SwitchRow({
            title: 'Manuel Konum Kullan',
            subtitle: 'Otomatik konum yerine aşağıdaki koordinatları kullan',
        });
        group.add(manualRow);
        settings.bind('use-manual-location', manualRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        // Şehir adı
        const cityRow = new Adw.EntryRow({
            title: 'Şehir Adı',
        });
        group.add(cityRow);
        settings.bind('city-name', cityRow, 'text', Gio.SettingsBindFlags.DEFAULT);

        // Enlem
        const latRow = new Adw.SpinRow({
            title: 'Enlem (Latitude)',
            subtitle: '-90 ile 90 arası',
            adjustment: new Gtk.Adjustment({
                lower: -90,
                upper: 90,
                step_increment: 0.0001,
                page_increment: 1,
            }),
            digits: 4,
        });
        group.add(latRow);
        settings.bind('latitude', latRow, 'value', Gio.SettingsBindFlags.DEFAULT);

        // Boylam
        const lonRow = new Adw.SpinRow({
            title: 'Boylam (Longitude)',
            subtitle: '-180 ile 180 arası',
            adjustment: new Gtk.Adjustment({
                lower: -180,
                upper: 180,
                step_increment: 0.0001,
                page_increment: 1,
            }),
            digits: 4,
        });
        group.add(lonRow);
        settings.bind('longitude', lonRow, 'value', Gio.SettingsBindFlags.DEFAULT);
    }

    _buildNotificationPage(page, settings) {
        const group = new Adw.PreferencesGroup({
            title: 'Bildirim Ayarları',
            description: 'Namaz vakti bildirimleri',
        });
        page.add(group);

        // Bildirim aktif
        const enableRow = new Adw.SwitchRow({
            title: 'Bildirimleri Etkinleştir',
            subtitle: 'Namaz vakti girince bildirim göster',
        });
        group.add(enableRow);
        settings.bind('notifications-enabled', enableRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        // Kaç dakika önce
        const beforeRow = new Adw.SpinRow({
            title: 'Önceden Bildir',
            subtitle: 'Vakit girmeden kaç dakika önce bildirim göster',
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 30,
                step_increment: 1,
                page_increment: 5,
            }),
        });
        group.add(beforeRow);
        settings.bind('notify-before-minutes', beforeRow, 'value', Gio.SettingsBindFlags.DEFAULT);

        // Vakit girince bildir
        const onTimeRow = new Adw.SwitchRow({
            title: 'Vakit Girince Bildir',
            subtitle: 'Vakit tam girdiğinde bildirim göster',
        });
        group.add(onTimeRow);
        settings.bind('notify-on-time', onTimeRow, 'active', Gio.SettingsBindFlags.DEFAULT);
    }

    _buildDisplayPage(page, settings) {
        const group = new Adw.PreferencesGroup({
            title: 'Gösterim Ayarları',
            description: 'Panel görünümü',
        });
        page.add(group);

        // Geri sayım göster
        const countdownRow = new Adw.SwitchRow({
            title: 'Geri Sayım Göster',
            subtitle: 'Sonraki vakte kalan süreyi panelde göster',
        });
        group.add(countdownRow);
        settings.bind('show-countdown', countdownRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        // Panel konumu
        const positionRow = new Adw.ComboRow({
            title: 'Panel Konumu',
            subtitle: 'Extension panelde nerede gösterilecek',
        });

        const positionModel = new Gtk.StringList();
        positionModel.append('Sol');
        positionModel.append('Orta');
        positionModel.append('Sağ');
        positionRow.model = positionModel;

        const positionMap = { 'left': 0, 'center': 1, 'right': 2 };
        const reverseMap = ['left', 'center', 'right'];

        positionRow.selected = positionMap[settings.get_string('panel-position')] || 2;

        // Settings değişikliğini dinle ve temizle
        const signalId = settings.connect('changed::panel-position', () => {
            const pos = settings.get_string('panel-position');
            if (positionRow.selected !== positionMap[pos]) {
                positionRow.selected = positionMap[pos] || 2;
            }
        });

        positionRow.connect('notify::selected', () => {
            settings.set_string('panel-position', reverseMap[positionRow.selected]);
        });

        // Pencere kapatıldığında signal'i temizle
        page.connect('destroy', () => {
            settings.disconnect(signalId);
        });

        group.add(positionRow);
    }
}
