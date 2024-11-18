import type { Restaurant, MenuSection, MenuItem, Menu } from '../types/restaurant';
import { getAuth } from 'firebase/auth';

const API_URL = '/api';

const normalizeId = (id: string | number, prefix: string): string => {
    if (prefix === 'menu') return String(id);
    
    const stringId = String(id);
    return stringId.startsWith(prefix) ? stringId : `${prefix}-${stringId}`;
};

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
            const response = await fetch(`${API_URL}/restaurant/${restaurantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch restaurant');
            }

            return response.json();
        } catch (error) {
            logError('getRestaurant error:', error);
            throw new Error('Failed to fetch restaurant');
        }
    },

    async updateRestaurant(restaurantId: string, data: UpdateRestaurantData): Promise<Restaurant> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            console.log('Sending update request with data:', data); // Debug için log

            const response = await fetch(`${API_URL}/restaurant/${restaurantId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Update restaurant error response:', errorData);
                throw new Error(errorData.message || 'Failed to update restaurant');
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

            const response = await fetch(`${API_URL}/user/${userId}/restaurants`, {
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

            const response = await fetch(`${API_URL}/restaurant`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, ...restaurantData }),
            });

            if (!response.ok) throw new Error('Failed to create restaurant');
            return response;
        } catch (error) {
            logError('createRestaurant error:', error);
            throw new Error('Failed to create restaurant');
        }
    },

    deleteRestaurant: async (restaurantId: string): Promise<Response> => {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/restaurant/${restaurantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete restaurant');
            return response;
        } catch (error) {
            logError('deleteRestaurant error:', error);
            throw new Error('Failed to delete restaurant');
        }
    },

    async getMenu(menuId: string): Promise<Menu | null> {
        try {
            const response = await fetch(`${API_URL}/restaurant/menu/${menuId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch menu');
            }
            
            return await response.json();
        } catch (error) {
            logError('getMenu error:', error);
            throw new Error('Failed to fetch menu');
        }
    },

    async updateMenu(menuId: string, data: Menu): Promise<Menu> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/restaurant/menu/${menuId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) throw new Error('Failed to update menu');
            
            return await response.json();
        } catch (error) {
            logError('updateMenu error:', error);
            throw new Error('Failed to update menu');
        }
    },

    async uploadImage(file: File, restaurantId: string): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('restaurantId', restaurantId);

            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/restaurant/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload image');
            const data = await response.json();
            return data.url;
        } catch (error) {
            logError('uploadImage error:', error);
            throw new Error('Failed to upload image');
        }
    },

    async geocodeAddress(address: string): Promise<[number, number] | null> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    address
                )}`
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

            const response = await fetch(`${API_URL}/restaurant/delete-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ restaurantId })
            });

            if (!response.ok) throw new Error('Failed to delete image');
        } catch (error) {
            logError('deleteImage error:', error);
            throw new Error('Failed to delete image');
        }
    },

    createMenu: async (restaurantId: string, menuData: CreateMenuRequest) => {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/restaurant/${restaurantId}/menus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(menuData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Create menu error:', errorData);
                throw new Error('Failed to create menu');
            }

            return response;
        } catch (error) {
            logError('createMenu error:', error);
            throw new Error('Failed to create menu');
        }
    },

    deleteMenu: async (restaurantId: string, menuId: string) => {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/restaurant/${restaurantId}/menu/${menuId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Delete menu error:', errorData);
                throw new Error('Failed to delete menu');
            }

            return response;
        } catch (error) {
            logError('deleteMenu error:', error);
            throw new Error('Failed to delete menu');
        }
    },
};