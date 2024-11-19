import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    restaurantId: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    numberOfGuests: {
        type: Number,
        required: true,
        min: 1
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    specialRequests: String,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for availability checks
reservationSchema.index({ restaurantId: 1, date: 1, time: 1 });

export const Reservation = mongoose.model('Reservation', reservationSchema); 