import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

// Bildirim yöneticisi
export class NotificationManager {
    constructor() {
        this._source = null;
    }

    // Bildirim goster
    show(title, body) {
        this._ensureSource();

        const notification = new MessageTray.Notification(this._source, title, body);
        notification.setTransient(false);
        this._source.showNotification(notification);
    }

    // Acil bildirim
    showUrgent(title, body) {
        this._ensureSource();

        const notification = new MessageTray.Notification(this._source, title, body);
        notification.setTransient(false);
        notification.setUrgency(MessageTray.Urgency.CRITICAL);
        this._source.showNotification(notification);
    }

    // Source oluştur
    _ensureSource() {
        if (this._source) return;

        this._source = new MessageTray.Source({
            title: 'Praytime',
            iconName: 'preferences-system-time-symbolic',
        });

        Main.messageTray.add(this._source);
    }

    destroy() {
        if (this._source) {
            this._source.destroy();
            this._source = null;
        }
    }
}
