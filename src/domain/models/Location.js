// Konum bilgisini temsil eden model
export class Location {
    constructor(latitude, longitude, cityName = null) {
        this._latitude = latitude;
        this._longitude = longitude;
        this._cityName = cityName;
    }

    get latitude() {
        return this._latitude;
    }

    get longitude() {
        return this._longitude;
    }

    get cityName() {
        return this._cityName;
    }

    // İstanbul varsayılan konum
    static getDefault() {
        return new Location(41.0082, 28.9784, 'İstanbul');
    }

    // Geçerli konum mu
    isValid() {
        return (
            typeof this._latitude === 'number' &&
            typeof this._longitude === 'number' &&
            this._latitude >= -90 && this._latitude <= 90 &&
            this._longitude >= -180 && this._longitude <= 180
        );
    }

    toString() {
        return `${this._cityName || 'Konum'} (${this._latitude.toFixed(4)}, ${this._longitude.toFixed(4)})`;
    }
}
