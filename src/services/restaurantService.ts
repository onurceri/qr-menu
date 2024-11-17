import type { Restaurant, MenuSection, MenuItem } from '../types/restaurant';
import { getAuth } from 'firebase/auth';

const API_URL = '/api';

const normalizeId = (id: string | number, prefix: string): string => {
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

export const restaurantService = {
    async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
        try {
            const response = await fetch(`${API_URL}/restaurant/${restaurantId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch restaurant');
            }
            
            return await response.json();
        } catch (error) {
            logError('getRestaurant error:', error);
            throw new Error('Failed to fetch restaurant');
        }
    },

    async updateRestaurant(restaurantId: string, data: Partial<Restaurant>): Promise<Restaurant> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const normalizedData = { ...data };
            if (normalizedData.sections) {
                normalizedData.sections = normalizedData.sections.map((section: MenuSection) => ({
                    ...section,
                    id: normalizeId(section.id, 'section'),
                    items: section.items.map((item: MenuItem) => ({
                        ...item,
                        id: normalizeId(item.id, 'item')
                    }))
                }));
            }

            const response = await fetch(`${API_URL}/restaurant/${restaurantId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(normalizedData),
            });
            
            if (!response.ok) throw new Error('Failed to update restaurant');
            
            return await response.json();
        } catch (error) {
            logError('updateRestaurant error:', error);
            throw new Error('Failed to update restaurant');
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
};