import type { ReservationRequest } from '../types/reservation';

export const reservationService = {
    async getAvailableSlots(restaurantId: string, date: string, token: string, language: string = 'tr') {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reservations/${restaurantId}/availability?date=${date}&language=${language}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch available slots');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching available slots:', error);
            throw error;
        }
    },

    async createReservation(data: ReservationRequest, token: string) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to create reservation');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw error;
        }
    }
};
