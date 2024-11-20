import mongoose, { Schema, Document } from 'mongoose';

// Interface tanımlamaları
interface IMenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

interface IMenuSection {
    id: string;
    title: string;
    items: IMenuItem[];
}

// Menu interface'i
interface IMenuBase {
    id: string;
    language: string;
    name: string;
    description: string;
    sections: IMenuSection[];
    currency: string;
}

interface IRestaurant extends Document {
    userId: string;
    restaurantId: string;
    name: string;
    description: string;
    imageUrl: string;
    menus: IMenuBase[];
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        website?: string;
    };
    address: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    };
    location: {
        type: string;
        coordinates: number[];
        isManuallySet: boolean;
    };
    openingHours: string;
}

// Şema tanımlamaları
const MenuItemSchema = new Schema<IMenuItem>({
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: '' }
}, { _id: false });

const MenuSectionSchema = new Schema<IMenuSection>({
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    items: [MenuItemSchema]
}, { _id: false });

const MenuSubSchema = new Schema({
    id: { type: String, required: true },
    language: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    sections: {
        type: [MenuSectionSchema],
        default: []
    },
    currency: { type: String, default: 'EUR' }
}, { _id: false });

const RestaurantSchema = new Schema<IRestaurant>({
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    menus: [MenuSubSchema],
    socialMedia: {
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
        isManuallySet: {
            type: Boolean,
            default: false
        }
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        country: { type: String, default: '' },
        postalCode: { type: String, default: '' }
    },
    openingHours: { type: String, default: '' }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Geospatial index
RestaurantSchema.index({ location: '2dsphere' });

// Model oluşturma
export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);