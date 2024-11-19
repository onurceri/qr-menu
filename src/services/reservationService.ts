import type { ReservationRequest, TimeSlot } from '../types/reservation';

export const reservationService = {
    async getAvailableSlots(
        restaurantId: string,
        date: string,
        language: string = 'tr'
    ): Promise<{ timeSlots: TimeSlot[] }> {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reservations/${restaurantId}/availability?date=${date}&language=${language || 'tr'}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Restaurant not found');
                }
                const errorData = await response.json().catch(() => ({ error: 'Failed to fetch available slots' }));
                throw new Error(errorData.error || 'Failed to fetch available slots');
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
                const errorData = await response.json().catch(() => ({ error: 'Failed to create reservation' }));
                throw new Error(errorData.error || 'Failed to create reservation');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw error;
        }
    }
};
