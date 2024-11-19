export interface TimeSlot {
    time: string;
    available: boolean;
}

export interface ReservationRequest {
    restaurantId: string;
    date: string;
    time: string;
    numberOfGuests: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    specialRequests?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
}

export interface AvailabilityResponse {
    date: string;
    timeSlots: TimeSlot[];
}
