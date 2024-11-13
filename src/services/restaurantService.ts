import type { Restaurant } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const restaurantService = {
    async getRestaurant(userId: string): Promise<Restaurant | null> {
        try {
            const response = await fetch(`${API_URL}/restaurant/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data || null;
        } catch (error) {
            console.error('Failed to fetch restaurant data:', error);
            throw error;
        }
    },

    async updateRestaurant(userId: string, data: Partial<Restaurant>): Promise<Restaurant> {
        try {
            const response = await fetch(`${API_URL}/restaurant/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update restaurant data');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};