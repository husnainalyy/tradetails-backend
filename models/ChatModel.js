const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    adId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ad',  // Reference to the Ad related to the chat
        required: true,
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Reference to the user (either seller or buyer)
            required: true,
        },
        role: {
            type: String,
            enum: ['seller', 'buyer'],  // Define whether the user is the seller or buyer
            required: true,
        },
        name: {
            type: String,  // Optional: Store the user's name in chat for quick access
            required: true,
        },
        image: {
            type: String,  // Optional: Store user's image for quick access in chat
            default: 'default-avatar.jpg',
        },
    }],
    messages: [{
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true,  // Auto-generate ObjectId for each message
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Reference to the sender (buyer or seller)
            required: true,
        },
        message: {
            type: String,
            required: true,  // The content of the message
        },
        sentAt: {
            type: Date,
            default: Date.now,  // Timestamp when the message was sent
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file'],  // Different types of messages (text, images, files)
            default: 'text',
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,  // Timestamp for when the chat was created
    },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
