import type { Restaurant, MenuSection, MenuItem } from '../types/restaurant';
import { getAuth } from 'firebase/auth';

const API_URL = '/api';

const normalizeId = (id: string | number, prefix: string): string => {
    const stringId = String(id);
    return stringId.startsWith(prefix) ? stringId : `${prefix}-${stringId}`;
};

// Token alma yardımcı fonksiyonu
const getAuthToken = async (): Promise<string | null> => {
    const auth = getAuth();
    return auth.currentUser?.getIdToken() || null;
};

// Hata yakalama ve loglama ekleyelim
const handleApiError = (error: any, message: string) => {
  console.error(`API Error (${message}):`, error);
  throw error;
};

export const restaurantService = {
    async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
        try {
            const response = await fetch(`${API_URL}/restaurant/${restaurantId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            handleApiError(error, 'Failed to fetch restaurant data');
            throw error;
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
            
            if (!response.ok) throw new Error('Failed to update restaurant data');
            
            const updatedData = await response.json();
            
            if (updatedData.sections) {
                updatedData.sections = updatedData.sections.map((section: MenuSection) => ({
                    ...section,
                    id: normalizeId(section.id, 'section'),
                    items: section.items.map((item: MenuItem) => ({
                        ...item,
                        id: normalizeId(item.id, 'item')
                    }))
                }));
            }
            
            return updatedData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getRestaurants(userId: string): Promise<Restaurant[]> {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/user/${userId}/restaurants`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch restaurants');
            
            const restaurants = await response.json();
            return restaurants;
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
            throw error;
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
            console.error('Failed to create restaurant:', error);
            throw error;
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
            console.error('Failed to delete restaurant:', error);
            throw error;
        }
    },
};