const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    images: [{
        type: String, // Array to store URLs or paths to images for the ad
    }],
    title: {
        type: String,
    },
    brand: {
        type: String,  // Brand of the item being sold
        required: true,
    },
    category: {
        type: String,  // Category under which the ad falls (e.g., Electronics, Furniture, etc.)
    },
    location: {
        type: String,  // Location where the item is being sold (e.g., city, province)
        required: true,
    },
    price: {
        type: Number,  // Price of the item
        required: true,
    },
    condition: {
        type: String,  // Condition of the item (e.g., New, Used, Refurbished)
        required: true,
    },
    description: {
        type: String,  // Detailed description of the item
        required: true,
    },
    specifications: {
        type: Object,  // Store specifications as an object (could be multiple fields like size, weight, etc.)
        required: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the user who created the ad
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Timestamp for when the ad was created
    },
    isActive: {
        type: Boolean,
        default: true,  // Ad is active or not
    },
    sold: {
        type: Boolean,
        default: false,  // Mark ad as sold when the item is sold
    },
    listedAt: {
        type: Date,
        default: Date.now,  // Timestamp when the ad was listed
    },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Reference to the user who left the review
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,  // Rating for the ad (1 to 5 stars)
            required: true,
        },
        comment: {
            type: String,  // Review comment about the ad
            required: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,  // Timestamp for when the review was posted
        }
    }]
}, { timestamps: true });

const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;
