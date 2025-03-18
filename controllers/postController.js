const Post = require('../models/PostModel');
const User = require('../models/UserModel');
const mongoose = require('mongoose');

// Create a post
exports.createPost = async (req, res) => {
    try {
        const { title, description } = req.body;

        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        // Extract image URLs from uploaded files
        const images = req.files.map((file) => file.location); // S3's public URL

        // Create a new post
        const newPost = new Post({
            title,
            description,
            images,
            createdBy: user._id
        });

        await newPost.save();

        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            message: 'Error creating post',
            error: error.message || error
        });
    }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('createdBy', 'name username image ')
            .populate('likes.userId', 'name username image')
            .populate('comments.userId', 'name username image');

        res.status(200).json({ message: 'Posts fetched successfully', posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts', error });
    }
};

// Get a specific post
exports.getPostById = async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId)
            .populate('createdBy', 'name username image')
            .populate('likes.userId', 'name username')
            .populate('comments.userId', 'name username');

        if (!post) {
            return res.status(404).json({ message: `Post with ID ${postId} not found` });
        }

        res.status(200).json({ message: 'Post fetched successfully', post });
    } catch (error) {
        console.error(`Error fetching post with ID ${postId}:`, error);
        res.status(500).json({ message: `Error fetching post with ID ${postId}`, error });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    const { postId } = req.params;
    const { title, description } = req.body;
    const newImages = req.files;  // This assumes multer or other file upload middleware

    try {
        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: `Post with ID ${postId} not found` });
        }

        // Check if the post belongs to the user
        if (post.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "User not authorized to update this post" });
        }

        // Update title and description if provided
        if (title) post.title = title;
        if (description) post.description = description;

        // Handle new images (add URLs of uploaded files)
        if (newImages && newImages.length > 0) {
            const imagePaths = newImages.map((file) => file.location || `uploads/${file.filename}`);
            post.images.push(...imagePaths);
        }

        // Save updated post
        const updatedPost = await post.save();

        res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
    } catch (error) {
        console.error(`Error updating post with ID ${postId}:`, error);
        res.status(500).json({ message: `Error updating post with ID ${postId}`, error: error.message || error });
    }
};


// Delete a post
exports.deletePost = async (req, res) => {
    const { postId } = req.params;

    try {
        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the post belongs to the user
        if (post.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "User not authorized to delete this post" });
        }

        // Delete the post
        await Post.deleteOne({ _id: postId });

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: `Error deleting post with ID ${postId}`, error });
    }
};
// Like or Unlike a Post
exports.likePost = async (req, res) => {
    const { postId } = req.params;

    try {
        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: `Post with ID ${postId} not found` });
        }

        const likeIndex = post.likes.findIndex(like => like.userId.toString() === user._id.toString());

        if (likeIndex === -1) {
            post.likes.push({ userId: user._id });
            await post.save();
            return res.status(200).json({ message: 'Post liked successfully', post });
        } else {
            post.likes.splice(likeIndex, 1);
            await post.save();
            return res.status(200).json({ message: 'Post unliked successfully', post });
        }
    } catch (error) {
        console.error(`Error liking post with ID ${postId}:`, error);
        res.status(500).json({ message: `Error liking post with ID ${postId}`, error });
    }
};




// Comment on a Post
exports.commentOnPost = async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;

    try {
        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate comment content
        if (!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: `Post with ID ${postId} not found` });
        }

        // Create new comment object
        const newComment = {
            commentId: new mongoose.Types.ObjectId(),
            userId: user._id,
            comment,
            commentAt: Date.now()
        };

        // Add comment to post's comments array
        post.comments.push(newComment);

        // Save the post with the new comment
        await post.save();

        // Respond with success message
        res.status(201).json({ message: 'Comment added successfully', post });
    } catch (error) {
        console.error(`Error commenting on post with ID ${postId}:`, error);
        res.status(500).json({ message: 'Error commenting on post', error: error.message });
    }
};



// Share a post
exports.sharePost = async (req, res) => {
    const { postId } = req.params;
    const { sharedTo } = req.body;

    try {
        // Check if the user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!sharedTo || sharedTo.trim() === '') {
            return res.status(400).json({ message: 'The platform or audience (sharedTo) is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: `Post with ID ${postId} not found` });
        }

        const newShare = {
            sharedBy: user._id,
            sharedTo,
            sharedAt: Date.now()
        };

        post.shares.push(newShare);

        await post.save();

        res.status(201).json({ message: 'Post shared successfully', post });
    } catch (error) {
        console.error(`Error sharing post with ID ${postId}:`, error);
        res.status(500).json({ message: `Error sharing post with ID ${postId}`, error });
    }
};