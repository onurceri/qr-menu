import type { Restaurant, Menu } from '../types/restaurant';
import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

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

export const restaurantService = {
    async getRestaurant(restaurantId: string): Promise<Restaurant> {
        try {
            const token = await getAuthToken();
            const response = await fetch(`${API_URL}/api/restaurants/${restaurantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch restaurant');
            }

            return response.json();
        } catch (error) {
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

            const response = await fetch(`${API_URL}/api/image/upload`, {
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
            const response = await fetch(
                `${API_URL}/api/location/nominatim?q=${encodeURIComponent(address)}`
            );

            if (!response.ok) throw new Error('Geocoding failed');

            const data = await response.json();
            if (data && data[0]) {
                return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
            }
            return null;
        } catch (error) {
            logError('geocodeAddress error:', error);
            return null;
        }
    },

    async deleteImage(restaurantId: string): Promise<void> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/api/image/${restaurantId}`, {
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
};