import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    imageUrl: String
});

const MenuSectionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    items: [MenuItemSchema]
});

const RestaurantSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    sections: [MenuSectionSchema]
});

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);