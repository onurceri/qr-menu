import type { Restaurant, Menu } from '../types/restaurant';
import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || '';
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

const getAuthToken = async (): Promise<string | null> => {
    const auth = getAuth();
    return auth.currentUser?.getIdToken() || null;
};

// Sadece development ortamında log basacak
const logError = (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(message, error);
    }
};

interface UpdateRestaurantData {
    name: string;
    description: string;
    address: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    };
    openingHours: string;
    imageUrl: string;
}

interface CreateMenuRequest {
    language: string;
    name: string;
    description: string;
    sections: any[];
    currency: 'TRY';
}

declare global {
    interface Window {
        google: any;
    }
}

// Google Maps API'nin yüklenmesini bekleyen yardımcı fonksiyon
export const waitForGoogleMaps = (): Promise<void> => {
    return new Promise((resolve) => {
        if (window.google && window.google.maps && window.google.maps.marker && window.google.maps.places) {
            resolve();
            return;
        }

        const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.marker && window.google.maps.places) {
                clearInterval(checkGoogleMaps);
                resolve();
            }
        }, 100);
    });
};

export const restaurantService = {
    async getRestaurant(restaurantId: string): Promise<Restaurant> {
        try {
            const token = await getAuthToken();
            console.log('Fetching restaurant with ID:', restaurantId);
            
            const response = await fetch(`${API_URL}/api/restaurants/${restaurantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch restaurant:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                throw new Error(`Failed to fetch restaurant: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Restaurant data fetched successfully:', restaurantId);
            return data;
        } catch (error) {
            console.error('Error in getRestaurant:', error);
            logError('Error fetching restaurant:', error);
            throw error;
        }
    },

    async updateRestaurant(restaurantId: string, data: UpdateRestaurantData): Promise<Restaurant> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/restaurants/${restaurantId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update restaurant');
            }

            const updatedRestaurant = await response.json();
            console.log('Update successful, received:', updatedRestaurant); // Debug için log
            return updatedRestaurant;
        } catch (error) {
            console.error('updateRestaurant error:', error);
            throw error;
        }
    },

    async getRestaurants(userId: string): Promise<Restaurant[]> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/users/${userId}/restaurants`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                logError('getRestaurants response error:', { 
                    status: response.status, 
                    error: errorData 
                });
                return [];
            }
            
            return await response.json();
        } catch (error) {
            logError('getRestaurants error:', error);
            return [];
        }
    },

    createRestaurant: async (userId: string, restaurantData: { name: string, description?: string }): Promise<Response> => {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/restaurants`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...restaurantData,
                    userId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create restaurant');
            }

            return response;
        } catch (error) {
            console.error('createRestaurant error:', error);
            throw error;
        }
    },

    async deleteRestaurant(restaurantId: string): Promise<void> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/restaurants/${restaurantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete restaurant');
            }
        } catch (error) {
            console.error('deleteRestaurant error:', error);
            throw error;
        }
    },

    async getMenu(menuId: string): Promise<Menu | null> {
        try {
            const response = await fetch(`${API_URL}/api/menus/${menuId}`);
            
            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('getMenu error:', error);
            return null;
        }
    },

    async updateMenu(menuId: string, data: Menu): Promise<Menu> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/menus/${menuId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update menu');
            }

            return await response.json();
        } catch (error) {
            console.error('updateMenu error:', error);
            throw error;
        }
    },

    async uploadImage(file: File, restaurantId: string): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('image', file, file.name);
            formData.append('restaurantId', restaurantId);

            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/images/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || 'Failed to upload image');
            }
            const data = await response.json();
            return data.url;
        } catch (error) {
            logError('uploadImage error:', error);
            throw error;
        }
    },

    async geocodeAddress(address: string): Promise<[number, number] | null> {
        try {
            console.log('Geocoding address with Google Maps:', address);
            await waitForGoogleMaps();

            const geocoder = new google.maps.Geocoder();
            
            return new Promise((resolve) => {
                geocoder.geocode({ address }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const location = results[0].geometry.location;
                        const coordinates: [number, number] = [location.lat(), location.lng()];
                        console.log('Google geocoding result:', coordinates);
                        resolve(coordinates);
                    } else {
                        console.error('Geocoding failed:', status);
                        resolve(null);
                    }
                });
            });
        } catch (error) {
            console.error('geocodeAddress error:', error);
            return null;
        }
    },

    async deleteImage(restaurantId: string): Promise<void> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/images/${restaurantId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete image');
        } catch (error) {
            logError('deleteImage error:', error);
            throw new Error('Failed to delete image');
        }
    },

    async createMenu(restaurantId: string, menuData: CreateMenuRequest) {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/restaurants/${restaurantId}/menus`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(menuData)
            });

            if (!response.ok) {
                throw new Error('Failed to create menu');
            }

            return await response.json();
        } catch (error) {
            console.error('createMenu error:', error);
            throw error;
        }
    },

    async deleteMenu(restaurantId: string, menuId: string) {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/restaurants/${restaurantId}/menus/${menuId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete menu');
            }
        } catch (error) {
            console.error('deleteMenu error:', error);
            throw error;
        }
    },

    async getRestaurantByMenuId(menuId: string): Promise<Restaurant | null> {
        try {
            const response = await fetch(`${API_URL}/api/restaurants/by-menu/${menuId}`);
            
            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('getRestaurantByMenuId error:', error);
            return null;
        }
    },

    async searchPlaces(query: string): Promise<Array<{
        description: string;
        placeId: string;
    }>> {
        await waitForGoogleMaps();
        return new Promise((resolve, reject) => {
            const service = new window.google.maps.places.AutocompleteService();
            service.getPlacePredictions(
                { input: query },
                (predictions: any[], status: string) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        resolve(predictions.map(prediction => ({
                            description: prediction.description,
                            placeId: prediction.place_id
                        })));
                    } else {
                        resolve([]);
                    }
                }
            );
        });
    },

    async getPlaceDetails(placeId: string): Promise<{
        coordinates: [number, number];
        address: {
            street: string;
            city: string;
            country: string;
            postalCode: string;
        };
    } | null> {
        await waitForGoogleMaps();
        return new Promise((resolve, reject) => {
            // We need a map or div element to create PlacesService
            const tempDiv = document.createElement('div');
            const service = new window.google.maps.places.PlacesService(tempDiv);
            
            service.getDetails(
                {
                    placeId: placeId,
                    fields: ['geometry', 'address_components']
                },
                (place: any, status: string) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                        const address = {
                            street: '',
                            city: '',
                            country: '',
                            postalCode: ''
                        };

                        place.address_components.forEach((component: any) => {
                            const types = component.types;
                            if (types.includes('street_number') || types.includes('route')) {
                                address.street += component.long_name + ' ';
                            } else if (types.includes('locality')) {
                                address.city = component.long_name;
                            } else if (types.includes('country')) {
                                address.country = component.long_name;
                            } else if (types.includes('postal_code')) {
                                address.postalCode = component.long_name;
                            }
                        });

                        address.street = address.street.trim();

                        resolve({
                            coordinates: [
                                place.geometry.location.lng(),
                                place.geometry.location.lat()
                            ],
                            address
                        });
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    },

    async reverseGeocode(coordinates: [number, number]): Promise<{
        street: string;
        city: string;
        country: string;
        postalCode: string;
    } | null> {
        await waitForGoogleMaps();
        return new Promise((resolve, reject) => {
            const geocoder = new window.google.maps.Geocoder();
            const [lng, lat] = coordinates;
            
            geocoder.geocode(
                {
                    location: { lat, lng }
                },
                (results: any[], status: string) => {
                    if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                        const address = {
                            street: '',
                            city: '',
                            country: '',
                            postalCode: ''
                        };

                        results[0].address_components.forEach((component: any) => {
                            const types = component.types;
                            if (types.includes('street_number') || types.includes('route')) {
                                address.street += component.long_name + ' ';
                            } else if (types.includes('locality')) {
                                address.city = component.long_name;
                            } else if (types.includes('country')) {
                                address.country = component.long_name;
                            } else if (types.includes('postal_code')) {
                                address.postalCode = component.long_name;
                            }
                        });

                        address.street = address.street.trim();
                        resolve(address);
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    },
};