import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true,
        maxlength: 100
    },
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100
    },
    description: { 
        type: String, 
        maxlength: 500,
        default: ''
    },
    price: { 
        type: Number, 
        required: true,
        min: 0,
        max: 1000000
    },
    imageUrl: { 
        type: String, 
        maxlength: 1000,
        default: ''
    }
}, { _id: false });

const MenuSectionSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true,
        maxlength: 100
    },
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100
    },
    items: {
        type: [MenuItemSchema],
        validate: [
            {
                validator: function(items: any[]) {
                    return items.length <= 100; // Max 100 item per section
                },
                message: 'Too many items in section'
            }
        ]
    }
}, { _id: false });

const MenuSchema = new mongoose.Schema({
    id: { 
        type: String,
        required: true,
        unique: true
    },
    language: {
        type: String,
        required: true,
        maxlength: 10
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500,
        default: ''
    },
    sections: [MenuSectionSchema],
    currency: {
        type: String,
        default: 'TRY'
    }
}, { timestamps: true });

const RestaurantSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    restaurantId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500,
        default: ''
    },
    imageUrl: {
        type: String,
        maxlength: 1000,
        default: ''
    },
    menus: [MenuSchema],
    profileImage: {
        type: String,
        maxlength: 1000,
        default: ''
    },
    address: {
        street: {
            type: String,
            maxlength: 200,
            default: ''
        },
        city: {
            type: String,
            maxlength: 100,
            default: ''
        },
        country: {
            type: String,
            maxlength: 100,
            default: ''
        },
        postalCode: {
            type: String,
            maxlength: 20,
            default: ''
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: undefined
        },
        isManuallySet: {
            type: Boolean,
            default: false
        }
    },
    defaultMenuId: {
        type: String,
        default: null
    },
    openingHours: {
        type: String,
        maxlength: 1000,
        default: ''
    }
}, { timestamps: true });

// Add geospatial index
RestaurantSchema.index({ location: '2dsphere' });

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);