import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

const API_BASE_URL = 'https://prayertimes.api.abdus.dev';

// Diyanet namaz vakitleri API istemcisi
export class PrayerTimesApiClient {
    constructor() {
        this._session = new Soup.Session({
            user_agent: 'praytime@erho.dev/0.1.0',
            timeout: 30,
        });
    }

    // Koordinatlara göre namaz vakitlerini al
    async fetchPrayerTimes(latitude, longitude) {
        const url = `${API_BASE_URL}/api/diyanet/prayertimes?latitude=${latitude}&longitude=${longitude}`;

        try {
            const data = await this._fetchJson(url);

            if (!data || !data.times) {
                throw new Error('API yanıtı geçersiz format');
            }

            return this._transformResponse(data);
        } catch (error) {
            console.error(`[Praytime] API hatası: ${error.message}`);
            throw error;
        }
    }

    // Şehir araması yap
    async searchCity(query) {
        const url = `${API_BASE_URL}/api/diyanet/search?q=${encodeURIComponent(query)}`;

        try {
            const data = await this._fetchJson(url);
            return data.results || [];
        } catch (error) {
            console.error(`[Praytime] Şehir arama hatası: ${error.message}`);
            return [];
        }
    }

    // JSON veri çek
    _fetchJson(url) {
        return new Promise((resolve, reject) => {
            const message = Soup.Message.new('GET', url);

            this._session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (session, result) => {
                    try {
                        const bytes = session.send_and_read_finish(result);
                        const status = message.get_status();

                        if (status !== 200) {
                            reject(new Error(`HTTP ${status}`));
                            return;
                        }

                        const text = new TextDecoder().decode(bytes.get_data());
                        const json = JSON.parse(text);
                        resolve(json);
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    // API yanıtını domain formatına dönüştür
    _transformResponse(data) {
        const times = data.times;
        const timeRegex = /^\d{2}:\d{2}$/;

        const result = {
            İmsak: times.fajr || times.Fajr || times.imsak || null,
            Güneş: times.sunrise || times.Sunrise || times.gunes || null,
            Öğle: times.dhuhr || times.Dhuhr || times.ogle || null,
            İkindi: times.asr || times.Asr || times.ikindi || null,
            Akşam: times.maghrib || times.Maghrib || times.aksam || null,
            Yatsı: times.isha || times.Isha || times.yatsi || null,
        };

        // Validasyon
        for (const [key, value] of Object.entries(result)) {
            if (!value || !timeRegex.test(value)) {
                throw new Error(`API yanıtı geçersiz: ${key} değeri hatalı (${value})`);
            }
        }

        return result;
    }

    destroy() {
        this._session = null;
    }
}
