// TypeScript için tip tanımlamaları
interface Location {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
}

interface Country {
    name: string;
    code: string;
    flag?: string;
}

interface City {
    name: string;
    state?: string;
    country: string;
    lat: number;
    lon: number;
}

const COUNTRIES_API_URL = 'https://restcountries.com/v3.1';
const OPENWEATHER_API_URL = 'http://api.openweathermap.org/geo/1.0';
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Önbellekleme için basit bir cache mekanizması
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 saat

export const locationService = {
    async fetchWithCache(url: string): Promise<any> {
        const cacheKey = url;
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        cache.set(cacheKey, { data, timestamp: Date.now() });
        
        return data;
    },

    async searchLocations(query: string): Promise<Location[]> {
        if (!query || query.length < 2) return [];

        try {
            const url = `${OPENWEATHER_API_URL}/direct?q=${encodeURIComponent(query)}&limit=10&appid=${OPENWEATHER_API_KEY}`;
            const data = await this.fetchWithCache(url);

            return data.map((item: any) => ({
                name: item.name,
                country: item.country,
                state: item.state,
                lat: item.lat,
                lon: item.lon
            }));
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    },

    async searchCountries(query: string): Promise<Country[]> {
        if (!query || query.length < 1) return [];
        
        try {
            // REST Countries API'den ülke ara
            const url = `${COUNTRIES_API_URL}/name/${encodeURIComponent(query)}`;
            const data = await this.fetchWithCache(url);

            return data.map((country: any) => ({
                name: country.translations.tur?.common || country.name.common,
                code: country.cca2,
                flag: country.flags.svg
            }));
        } catch (error) {
            // Eğer hata 404 ise (sonuç bulunamadı), boş array dön
            if (error instanceof Error && error.message.includes('404')) {
                return [];
            }
            console.error('Error searching countries:', error);
            return [];
        }
    },

    async getCities(countryCode: string, query: string = ''): Promise<City[]> {
        if (!countryCode) return [];

        try {
            const url = `${OPENWEATHER_API_URL}/direct?q=${encodeURIComponent(query)},${countryCode}&limit=10&appid=${OPENWEATHER_API_KEY}`;
            const data = await this.fetchWithCache(url);

            return data
                .filter((item: any) => item.country === countryCode)
                .map((item: any) => ({
                    name: item.name,
                    state: item.state,
                    country: item.country,
                    lat: item.lat,
                    lon: item.lon
                }));
        } catch (error) {
            console.error('Error getting cities:', error);
            return [];
        }
    },

    // ISO ülke kodundan ülke adını al
    getCountryName(countryCode: string): string {
        const regionNames = new Intl.DisplayNames(['tr'], { type: 'region' });
        try {
            return regionNames.of(countryCode) || countryCode;
        } catch {
            return countryCode;
        }
    }
};