const Ad = require('../models/AdModel');
const Post = require('../models/PostModel');
const User = require('../models/UserModel'); // Import the User model

// Register a user
exports.registerUser = async (req, res) => {
    try {
        // Logic for registering a new user
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Login a user
exports.loginUser = async (req, res) => {
    try {
        // Logic for logging in a user
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user', error });
    }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
    const { userId } = req.params;
    try {
        // Logic for fetching a user's profile by their ID
    } catch (error) {
        res.status(500).json({ message: `Error fetching profile for user ID ${userId}`, error });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    try {
        // Logic for updating a user's profile
    } catch (error) {
        res.status(500).json({ message: `Error updating profile for user ID ${userId}`, error });
    }
};

// Delete a user account
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        // Logic for deleting a user account
    } catch (error) {
        res.status(500).json({ message: `Error deleting user ID ${userId}`, error });
    }
};

// Get all reviews for a user
exports.getUserReviews = async (req, res) => {
    const { userId } = req.params;
    try {
        // Logic for fetching all reviews for a user
    } catch (error) {
        res.status(500).json({ message: `Error fetching reviews for user ID ${userId}`, error });
    }
};

// Add a review for a user
exports.addUserReview = async (req, res) => {
    const { userId } = req.params;
    try {
        // Logic for adding a review for a user
    } catch (error) {
        res.status(500).json({ message: `Error adding review for user ID ${userId}`, error });
    }
};

exports.getUserIdFromClerk = async (req, res) => {
    try {
        console.log('Request params:', req.params); // Log request params
        const { clerkUserId } = req.params;
        console.log(req.params);
        if (!clerkUserId) {
            return res.status(400).json({ message: 'Clerk User ID is required' }); // Handle missing parameter
        }

        console.log('Clerk User ID:', clerkUserId);

        // Case-insensitive query for clerkUserId
        const user = await User.findOne({ clerkUserId: new RegExp(`^${clerkUserId}$`, 'i') });

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Return 404 if user not found
        }

        console.log('User found:', user);
        res.status(200).json({ userId: user._id }); // Return the user ID
    } catch (error) {
        console.error('Error fetching user by Clerk User ID:', error.message); // Log the error
        res.status(500).json({ message: 'Error fetching user', error: error.message }); // Return 500 on server error
    }
};


exports.getUserInfo = async (req, res) => {
    
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ createdBy: user._id });
        const ads = await Ad.find({ createdBy: user._id });

        res.status(200).json({
            success: true,
            data: {
                user,
                posts,
                ads
            }
        });
    } catch (error) {
        res.status(500).json({ message: `Error fetching user info for ID ${user._id}`, error });
    }
};


exports.getUserInfoID = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ createdBy: user._id });
        const ads = await Ad.find({ createdBy: user._id });

        res.status(200).json({
            success: true,
            data: {
                user,
                posts,
                ads
            }
        });
    } catch (error) {
        res.status(500).json({ message: `Error fetching user info for ID ${req.params.userId}`, error });
    }
};

exports.unsavePost = async (req, res) => {
    const { postId } = req.params;

    try {
        const user = req.user; // User is already attached to req by the middleware

        // Check if the post is in the savedPosts array
        if (!user.savedPosts.includes(postId)) {
            return res.status(400).json({ message: "Post not saved" });
        }

        // Remove the postId from the savedPosts array
        user.savedPosts = user.savedPosts.filter(post => post.toString() !== postId);
        await user.save();

        return res.status(200).json({ message: "Post unsaved successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error unsaving post" });
    }
};

exports.savePost = async (req, res) => {
    const { postId } = req.params;
    try {
        const user = req.user; // User is already attached to req by the middleware

        // Check if the post is already saved to avoid duplicates
        if (user.savedPosts.includes(postId)) {
            return res.status(400).json({ message: "Post is already saved" });
        }

        // Add postId to the savedPosts array
        user.savedPosts.push(postId);
        await user.save();

        return res.status(200).json({ message: "Post saved successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error saving post" });
    }
};

exports.getSavedPosts = async (req, res) => {
    console.log("ndcnjwc  cjw cwe")
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        const user = await User.findById(req.user._id).populate('savedPosts');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.savedPosts || user.savedPosts.length === 0) {
            return res.status(200).json({ message: "No saved posts found" });
        }

        // Get the saved posts by postId in the savedPosts array
        const savedPosts = await Post.find({ '_id': { $in: user.savedPosts } });

        return res.status(200).json(savedPosts);
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        return res.status(500).json({ message: "Error fetching saved posts" });
    }
};


exports.getclerkuseridfromuser = async (req, res) => {
    const { userId } = req.params;
    console.log("this is user id in clerkuserid", userId);
    try {
        // Find the user by MongoDB ObjectId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(user.clerkUserId);

        // Respond with the Clerk user ID
        res.status(200).json({ clerkUserId: user.clerkUserId });
    } catch (error) {
        console.error('Error fetching Clerk user ID:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}