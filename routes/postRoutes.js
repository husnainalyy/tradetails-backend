const express = require('express');
const router = express.Router();
const { upload } = require('../config/Aws-s3'); // Assuming you're using AWS S3 for storage
const postController = require('../controllers/postController');


const authenticateUserByClerkId = require('../Middlewares/authenticateUserByClerkId');
router.use(authenticateUserByClerkId)

// Create a post with file uploads
router.post('/', upload.array('images', 10), postController.createPost); // Allow up to 5 image uploads


// Get all posts
router.get('/', postController.getAllPosts);

// Get a specific post
router.get('/:postId', postController.getPostById);

// Update a post
router.put('/posts/:postId', upload.array('images', 5), postController.updatePost);

// Delete a post
router.delete('/:postId', postController.deletePost);

// Like a post
router.post('/:postId/like', postController.likePost);

// Comment on a post
router.post('/:postId/comment', postController.commentOnPost);

// Share a post
router.post('/:postId/share', postController.sharePost);


module.exports = router;
