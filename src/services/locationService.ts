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
const API_URL = import.meta.env.VITE_API_URL;
const LOCATION_API_URL = `${API_URL}/api/location`;

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

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            cache.set(cacheKey, { data, timestamp: Date.now() });
            
            return data;
        } catch (error) {
            console.error(`Failed to fetch from ${url}:`, error);
            throw error;
        }
    },

    async searchLocations(query: string): Promise<Location[]> {
        if (!query || query.length < 2) return [];

        try {
            const url = `${LOCATION_API_URL}/geocode?q=${encodeURIComponent(query)}`;
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
            const url = `${COUNTRIES_API_URL}/name/${encodeURIComponent(query)}`;
            const data = await this.fetchWithCache(url);
            return data.map((country: any) => ({
                name: country.translations.tur?.common || country.name.common,
                code: country.cca2,
                flag: country.flags.svg
            }));
        } catch (error) {
            console.error('Error searching countries:', error);
            return [];
        }
    },

    async getCities(countryCode: string, query: string = ''): Promise<City[]> {
        if (!query || query.length < 2) return [];

        try {
            const url = `${LOCATION_API_URL}/geocode?q=${encodeURIComponent(query)},${countryCode}`;
            const data = await this.fetchWithCache(url);

            return data.map((item: any) => ({
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