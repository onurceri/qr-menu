import type { Restaurant, MenuSection, MenuItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const normalizeId = (id: string | number, prefix: string): string => {
    const stringId = String(id);
    return stringId.startsWith(prefix) ? stringId : `${prefix}-${stringId}`;
};

export const restaurantService = {
    async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
        try {
            const response = await fetch(`${API_URL}/restaurant/${restaurantId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Normalize data before returning
            if (data && data.sections) {
                data.sections = data.sections.map((section: MenuSection) => ({
                    ...section,
                    id: normalizeId(section.id, 'section'),
                    items: section.items.map((item: MenuItem) => ({
                        ...item,
                        id: normalizeId(item.id, 'item')
                    }))
                }));
            }
            
            return data;
        } catch (error) {
            console.error('Failed to fetch restaurant data:', error);
            throw error;
        }
    },

    async updateRestaurant(restaurantId: string, data: Partial<Restaurant>): Promise<Restaurant> {
        try {
            const normalizedData = { ...data };
            
            // Normalize all IDs before sending to backend
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(normalizedData),
            });
            
            if (!response.ok) throw new Error('Failed to update restaurant data');
            
            const updatedData = await response.json();
            
            // Normalize response data before returning
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
            const response = await fetch(`${API_URL}/user/${userId}/restaurants`);
            const restaurants = await response.json();
            console.log("restaurants", restaurants);
            return restaurants;
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
            throw error;
        }
    },

    createRestaurant: async (userId: string, restaurantData: { name: string, description?: string }): Promise<Response> => {
        try {
            return await fetch(`${API_URL}/restaurant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...restaurantData }),
            });
        } catch (error) {
            console.error('Failed to create restaurant:', error);
            throw error;
        }
    },

    deleteRestaurant: async (restaurantId: string): Promise<Response> => {
        try {
            return await fetch(`${API_URL}/restaurant/${restaurantId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to delete restaurant:', error);
            throw error;
        }
    },
};