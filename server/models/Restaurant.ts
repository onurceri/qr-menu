import mongoose, { Schema, Document } from 'mongoose';

// Interface tanımlamaları
interface IMenuItem extends Document {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

interface IMenuSection extends Document {
    id: string;
    title: string;
    items: IMenuItem[];
}

interface IMenu extends Document {
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
    menus: IMenu[];
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

const MenuSchema = new Schema<IMenu>({
    id: { 
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v: string): boolean {
                return Boolean(v && v.length > 0);
            },
            message: 'Menu ID cannot be empty'
        }
    },
    language: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sections: [MenuSectionSchema],
    currency: { type: String, default: 'TRY' }
}, { timestamps: true });

const RestaurantSchema = new Schema<IRestaurant>({
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    menus: {
        type: [MenuSchema],
        default: [],
        validate: [
            {
                validator: function(menus: IMenu[]): boolean {
                    const ids = menus.map(menu => menu.id);
                    return new Set(ids).size === ids.length;
                },
                message: 'Duplicate menu IDs are not allowed'
            },
            {
                validator: function(menus: IMenu[]): boolean {
                    return menus.every(menu => Boolean(menu.id && menu.id.length > 0));
                },
                message: 'All menus must have valid IDs'
            }
        ]
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        country: { type: String, default: '' },
        postalCode: { type: String, default: '' }
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: undefined },
        isManuallySet: { type: Boolean, default: false }
    },
    openingHours: { type: String, default: '' }
}, { timestamps: true });

// Geospatial index
RestaurantSchema.index({ location: '2dsphere' });

// Model oluşturma
export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);