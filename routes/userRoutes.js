const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateUserByClerkId = require('../Middlewares/authenticateUserByClerkId');



router.use((req, res, next) => {
    if (req.path.startsWith('/clerk')) {
        return next(); // Skip middleware for '/clerk/:clerkUserId'
    }
    if (req.path.startsWith('/clerkid')) {
        return next(); // Skip middleware for '/clerk/:clerkUserId'
    }
    authenticateUserByClerkId(req, res, next);
});


// Register a user
// Register a user
router.post('/register', userController.registerUser);

// Login a user 
router.post('/login', userController.loginUser);

// Get user profile
router.get('/:userId', userController.getUserProfile);

// Update user profile
router.put('/:userId', userController.updateUserProfile);

// Delete a user account
router.delete('/:userId', userController.deleteUser);

// Get all reviews for a user
router.get('/:userId/reviews', userController.getUserReviews);

// Add a review for a user
router.post('/:userId/reviews', userController.addUserReview);

//get user id from clerk 
router.get('/clerk/:clerkUserId', userController.getUserIdFromClerk);
//get user id from clerk

//get user profile
router.get('/profileUser/:userId', userController.getUserInfo);

//get user profile
router.get('/profile/:userId', userController.getUserInfoID);


//save posts
router.post('/post/save/:postId', userController.savePost);

//unsave posts 
router.get('/post/unsave/:postId', userController.unsavePost);

//get all posts
router.get('/post', userController.getSavedPosts);


//get clerk user id 
router.get('/clerkid/:userId', userController.getclerkuseridfromuser);

module.exports = router;