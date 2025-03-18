const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        auto: true, // Auto-generate ObjectId for each post
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [{
        type: String, // This will store URLs/paths to the images associated with the post
    }],
    likes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User who liked the post
            required: true,
        },
        likedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    comments: [{
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            auto: true, // Auto-generate ObjectId for each comment
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the user who commented
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
        commentAt: {
            type: Date,
            default: Date.now,
        },
    }],
    shares: [{
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the user who shared the post
            required: true,
        },
        sharedTo: {
            type: String, // Can be a specific platform or audience (e.g., "Instagram", "WhatsApp", etc.)
            required: true,
        },
        sharedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the user who created the post
        required: true,
    }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
