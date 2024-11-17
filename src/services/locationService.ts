import countriesData from '../data/countries.min.json';

// TypeScript için tip tanımlamaları
type CountriesData = {
    [key: string]: string[];
};

// JSON dosyasının tipini belirt
const typedCountriesData = countriesData as CountriesData;

interface Country {
    name: string;
}

interface City {
    name: string;
}

export const locationService = {
    async searchCountries(query: string): Promise<Country[]> {
        try {
            const countries = Object.keys(typedCountriesData)
                .filter(country => 
                    country.toLowerCase().includes(query.toLowerCase())
                )
                .map(country => ({ name: country }));
            return countries;
        } catch (error) {
            console.error('Error searching countries:', error);
            return [];
        }
    },

    async getCities(country: string, query: string = ''): Promise<City[]> {
        try {
            if (!country) return [];
            
            const cities = typedCountriesData[country] || [];
            const filteredCities = cities
                .filter(city => 
                    city.toLowerCase().includes(query.toLowerCase())
                )
                .map(city => ({ name: city }));
                
            return filteredCities;
        } catch (error) {
            console.error('Error fetching cities:', error);
            return [];
        }
    }
}; 