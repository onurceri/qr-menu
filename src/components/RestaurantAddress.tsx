import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { SearchableDropdown } from './SearchableDropdown';
import { locationService } from '../services/locationService';

interface Address {
    street: string;
    city: string;
    country: string;
    postalCode: string;
}

interface RestaurantAddressProps {
    address: Address;
    onAddressChange: (address: Address) => void;
}

export function RestaurantAddress({ address, onAddressChange }: RestaurantAddressProps) {
    const { t } = useTranslation();

    const handleCountrySearch = async (query: string) => {
        const results = await locationService.searchCountries(query);
        return results.map(country => ({
            name: country.name,
            value: country.code
        }));
    };

    const handleCitySearch = async (query: string) => {
        if (!address.country) return [];
        const results = await locationService.getCities(address.country, query);
        return results.map(city => ({
            name: city.name,
            value: city.name
        }));
    };

    return (
        <div className="border-t border-zinc-200 pt-6">
            <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {t('restaurants.address')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        {t('restaurants.country')}
                    </label>
                    <SearchableDropdown
                        value={address.country}
                        onChange={(value) => {
                            onAddressChange({
                                ...address,
                                country: value,
                                city: '' // Reset city when country changes
                            });
                        }}
                        onSearch={handleCountrySearch}
                        placeholder={t('restaurants.selectCountry')}
                        label={t('restaurants.country')}
                        minSearchLength={2}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        {t('restaurants.city')}
                    </label>
                    <SearchableDropdown
                        value={address.city}
                        onChange={(value) => onAddressChange({
                            ...address,
                            city: value
                        })}
                        onSearch={handleCitySearch}
                        placeholder={t('restaurants.selectCity')}
                        label={t('restaurants.city')}
                        minSearchLength={2}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        {t('restaurants.street')}
                    </label>
                    <input
                        type="text"
                        value={address.street}
                        onChange={e => onAddressChange({
                            ...address,
                            street: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        {t('restaurants.postalCode')}
                    </label>
                    <input
                        type="text"
                        value={address.postalCode}
                        onChange={e => onAddressChange({
                            ...address,
                            postalCode: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
                    />
                </div>
            </div>
        </div>
    );
}
