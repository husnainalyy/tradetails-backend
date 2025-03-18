const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const specsController =require('../controllers/Specs');
const { upload } = require("../config/Aws-s3.js");
const authenticateUserByClerkId = require('../Middlewares/authenticateUserByClerkId');

router.use(authenticateUserByClerkId)

// Create an ad
router.post('/', authenticateUserByClerkId, upload.array("images", 10), adController.createAd);

// Get all ads
router.get('/', adController.getAllAds);

router.post(
    "/specs",
    specsController.specs
);

// Get ads by category
router.get('/category/:category', adController.getAdsByCategory);

// Get a specific ad
router.get('/:adId', adController.getAdById);

// Update an ad
router.put('/:adId', adController.updateAd);

// Delete an ad
router.delete('/:adId', adController.deleteAd);

// Mark an ad as sold
router.patch('/:adId/sold', adController.markAdAsSold);
router.get('/name/:adId', adController.getAdName)
// Get all reviews for a specific ad
router.get('/:adId/reviews', adController.getAdReviews);

// Add a review to an ad
router.post('/:adId/reviews', adController.addReview);

router.post("/scam-detection", adController.scamDetection);

module.exports = router;
