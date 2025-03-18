const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkUserId: {
        type: String,
        required: true,
        unique: true, // Clerk user ID (provided when a user signs in)
    },
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    bio: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    image: {
        type: String,
        default: 'default-avatar.jpg', // Placeholder for user image
    },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        review: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', // Reference to the Post model
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;