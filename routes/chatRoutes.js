const express = require('express');
const chatController = require('../controllers/chatController');

module.exports = (io) => {
    const router = express.Router();

    // Create a new chat for an ad
    router.post('/', chatController.createChat);

    // Get all chats for a user
    router.get('/user/:clerkUserId', chatController.getUserChats);
    // Get messages from a specific chat
    router.get('/:chatId/messages', chatController.getChatMessages);

    // Send a new message in a chat
    router.post('/:chatId/messages', (req, res) => chatController.sendMessage(req, res, io));

    // Get a specific chat
    router.get('/:chatId', chatController.getChatById);

    // Mark chat as read or closed (optional)
    router.patch('/:chatId/status', chatController.updateChatStatus);

    return router;
};