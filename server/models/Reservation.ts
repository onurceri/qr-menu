import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
    restaurantId: string;
    date: string;
    time: string;
    numberOfGuests: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    specialRequests?: string;
    status: 'pending' | 'confirmed' | 'cancelled | rejected';
    createdAt: Date;
    updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>({
    restaurantId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    numberOfGuests: { type: Number, required: true, min: 1, max: 20 },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    specialRequests: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'rejected'], 
        default: 'pending' 
    }
}, {
    timestamps: true
});

// Composite index for checking availability
ReservationSchema.index({ restaurantId: 1, date: 1, time: 1 });

export const Reservation = mongoose.model<IReservation>('Reservation', ReservationSchema); 