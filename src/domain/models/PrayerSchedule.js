import { PrayerTime } from './PrayerTime.js';

// Günlük namaz vakitlerini yöneten model
export class PrayerSchedule {
    constructor(prayers = []) {
        this._prayers = prayers;
        this._date = new Date();
    }

    get prayers() {
        return this._prayers;
    }

    get date() {
        return this._date;
    }

    // API verisinden schedule oluştur
    static fromApiResponse(data, date = new Date()) {
        const prayerMap = [
            { name: 'İmsak', nameEn: 'Imsak', key: 'İmsak' },
            { name: 'Güneş', nameEn: 'Sunrise', key: 'Güneş' },
            { name: 'Öğle', nameEn: 'Dhuhr', key: 'Öğle' },
            { name: 'İkindi', nameEn: 'Asr', key: 'İkindi' },
            { name: 'Akşam', nameEn: 'Maghrib', key: 'Akşam' },
            { name: 'Yatsı', nameEn: 'Isha', key: 'Yatsı' },
        ];

        const prayers = prayerMap.map(p => {
            const timeStr = data[p.key];
            if (!timeStr) return null;

            const [hours, minutes] = timeStr.split(':').map(Number);
            const prayerDate = new Date(date);
            prayerDate.setHours(hours, minutes, 0, 0);

            return new PrayerTime(p.name, p.nameEn, prayerDate);
        }).filter(p => p !== null);

        const schedule = new PrayerSchedule(prayers);
        schedule._date = date;
        return schedule;
    }

    // Sıradaki namaz vaktini bul
    getNextPrayer(fromDate = new Date()) {
        for (const prayer of this._prayers) {
            if (!prayer.isPassed(fromDate)) {
                return prayer;
            }
        }
        // Tüm vakitler geçtiyse null dön (yarın için yeni veri gerekli)
        return null;
    }

    // Mevcut aktif vakti bul (en son geçen vakit)
    getCurrentPrayer(fromDate = new Date()) {
        let current = null;
        for (const prayer of this._prayers) {
            if (prayer.isPassed(fromDate)) {
                current = prayer;
            } else {
                break;
            }
        }
        return current;
    }

    // Belirli vakti isimle bul
    getPrayerByName(name) {
        return this._prayers.find(p => p.name === name || p.nameEn === name);
    }
}
