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

const RestaurantSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        index: true,
        maxlength: 100
    },
    restaurantId: { 
        type: String, 
        required: true, 
        unique: true,
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
    currency: { 
        type: String, 
        enum: ['TRY', 'USD', 'EUR', 'GBP'],
        default: 'TRY'
    },
    sections: {
        type: [MenuSectionSchema],
        validate: [
            {
                validator: function(sections: any[]) {
                    return sections.length <= 20; // Max 20 sections
                },
                message: 'Too many sections'
            }
        ]
    }
}, {
    timestamps: true, // created_at ve updated_at ekler
    collection: 'restaurants'
});

RestaurantSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });
RestaurantSchema.index({ "sections.items.name": "text" }); // Arama için

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);