import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true,
        set: (v: any) => v.toString()
    },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    imageUrl: String
}, { _id: false });

const MenuSectionSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true,
        set: (v: any) => v.toString()
    },
    title: { type: String, required: true },
    items: [MenuItemSchema]
}, { _id: false });

const RestaurantSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    sections: [MenuSectionSchema]
});

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);