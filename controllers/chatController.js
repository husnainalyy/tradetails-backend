const Chat = require('../models/ChatModel');
const User = require('../models/UserModel'); // Import the User model

// Helper function to get userId from clerkUserId
const getUserIdFromClerkUserId = async (clerkUserId) => {
    const user = await User.findOne({ clerkUserId });
    if (!user) throw new Error('User not found');
    return user._id;
};



// Create a new chat for an ad
exports.createChat = async (req, res) => {
    const { adId, participants } = req.body;

    try {
        // Map clerkUserIds to userIds
        const participantsWithUserIds = await Promise.all(
            participants.map(async (participant) => {
                const userId = await getUserIdFromClerkUserId(participant.clerkUserId);
                return { ...participant, userId };
            })
        );

        // Check if a chat with the same participants and ad already exists
        const existingChat = await Chat.findOne({
            adId,
            'participants.userId': { $all: participantsWithUserIds.map(p => p.userId) },
        });

        if (existingChat) {
            return res.status(200).json({ message: 'Chat already exists', chat: existingChat });
        }

        // Create a new chat
        const newChat = new Chat({
            adId,
            participants: participantsWithUserIds,
        });

        // Save the chat to the database
        const savedChat = await newChat.save();
        res.status(201).json({ message: 'Chat created successfully', chat: savedChat });
    } catch (error) {
        res.status(500).json({ message: 'Error creating chat', error: error.message });
    }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {

    const { clerkUserId } = req.params;

    try {
        const userId = await getUserIdFromClerkUserId(clerkUserId);
        // Find all chats where the user is a participant
        const chats = await Chat.find({ 'participants.userId': userId })
            .populate('adId', 'title description') // Populate ad details
            .populate('participants.userId', 'name image') // Populate user details
            .sort({ createdAt: -1 });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user chats', error: error.message });
    }
};

// Send message
exports.sendMessage = async (req, res, io) => {
    const { chatId } = req.params;
    const { clerkUserId, message, messageType } = req.body;

    try {
        console.log(req.params);
        console.log(req.body);
        const senderId = await getUserIdFromClerkUserId(clerkUserId);

        if (!chatId || !senderId || !message) {
            return res.status(400).json({ message: 'Chat ID, sender ID, and message are required.' });
        }

        const chat = await Chat.findById(chatId);
        console.log(chat);
        if (!chat) return res.status(404).json({ message: 'Chat not found.' });

        const isParticipant = chat.participants.some(participant => participant.userId.toString() === senderId.toString());
        if (!isParticipant) return res.status(403).json({ message: 'Sender is not a participant in this chat.' });

        const newMessage = { senderId, message, messageType, sentAt: new Date() };
        chat.messages.push(newMessage);
        await chat.save();

        io.to(chatId).emit('message', newMessage);
        console.log("request completes");
        res.status(200).json({ message: 'Message sent successfully.', chat });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message.', error: error.message });
    }
};

// Get a specific chat
exports.getChatById = async (req, res) => {
    const { chatId } = req.params;

    try {
        const chat = await Chat.findById(chatId)
            .populate('adId', 'title description')
            .populate('participants.userId', 'name image')
            .select('messages participants');

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat', error: error.message });
    }
};

// Get messages from a specific chat
exports.getChatMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const chat = await Chat.findById(chatId).select('messages -_id');

        if (!chat) return res.status(404).json({ message: 'No chats found for this user' });

        res.status(200).json({ messages: chat.messages });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat messages', error: error.message });
    }
};

// Update chat status
exports.updateChatStatus = async (req, res) => {
    const { chatId } = req.params;
    const { status } = req.body;

    try {
        if (!['read', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const chat = await Chat.findByIdAndUpdate(
            chatId,
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        res.status(200).json({ message: 'Chat status updated successfully', chat });
    } catch (error) {
        res.status(500).json({ message: 'Error updating chat status', error: error.message });
    }
};


exports.createChat = async (req, res) => {
    const { adId, participants } = req.body;

    try {
        console.log("Request body received:", req.body);

        // Map clerkUserIds to userIds and ensure required fields are populated
        const participantsWithUserIds = await Promise.all(
            participants.map(async (participant) => {
                console.log("Processing participant:", participant);
                const userId = await getUserIdFromClerkUserId(participant.clerkUserId);
                if (!userId) {
                    throw new Error(`User ID not found for Clerk User ID: ${participant.clerkUserId}`);
                }

                // Ensure the participant has a name; use a default value if missing
                const name = participant.name || "Unknown";

                return {
                    ...participant,
                    userId,
                    name // Ensure name is included
                };
            })
        );
        console.log("Mapped participants with User IDs:", participantsWithUserIds);

        // Create a new chat
        const newChat = new Chat({
            adId,
            participants: participantsWithUserIds,
        });

        await newChat.save();
        console.log("New chat created:", newChat);

        res.status(201).json({ message: 'Chat created successfully', chat: newChat });
    } catch (error) {
        console.error("Error creating chat:", error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};