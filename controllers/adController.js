const Ad = require('../models/AdModel');
const User = require('../models/UserModel'); // Assuming you have a User model
const { spawn } = require("child_process");

// Create a new ad
exports.createAd = async (req, res) => {
    try {
        const { title, brand, category, location, price, condition, description, specifications } = req.body;
        const imageUrls = req.files?.map((file) => file.location) || []; // Use S3 URLs or empty array

        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated or ID missing" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newAd = new Ad({
            images: imageUrls,
            title,
            brand,
            category,
            location,
            price,
            condition,
            description,
            specifications,
            createdBy: user._id,
        });

        await newAd.save();
        res.status(201).json({ success: true, data: newAd });
    } catch (error) {
        console.error("Error creating ad:", error);
        res.status(500).json({ error: "Error creating ad" });
    }
};

// Get all ads
exports.getAllAds = async (req, res) => {
    try {
        // const ads = await Ad.find({ isActive: true }).populate('createdBy', 'name email'); Is Active not working
        const ads = await Ad.find().populate('createdBy', 'name email');
        res.status(200).json({ success: true, data: ads });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ads', error });
    }
};


// Get ads by category
exports.getAdsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const ads = await Ad.find({ category });//is active not working here aswell
        res.status(200).json({ success: true, data: ads });
    } catch (error) {
        res.status(500).json({ message: `Error fetching ads for category ${category}`, error });
    }
};

exports.getAdName = async (req, res) => {
    const { adId } = req.params;
    try {
        const ad = await Ad.findById(adId, 'title');
        console.log(ad);
        if (!ad) {
            return res.status(404).json({ error: "Ad not found" });
        }
        res.status(200).json({ sucess: true, data: ad })

    }
    catch (error) {
        res.status(500).json({ message: `Error fetching ad with ID ${adId}`, error });
    }
}

// Get a specific ad by ID
exports.getAdById = async (req, res) => {
    const { adId } = req.params;
    try {
        const ad = await Ad.findById(adId).populate('createdBy', 'name email image createdAt');
        if (!ad) {
            return res.status(404).json({ error: "Ad not found" });
        }
        console.log(ad)
        res.status(200).json({ success: true, data: ad });
    } catch (error) {
        res.status(500).json({ message: `Error fetching ad with ID ${adId}`, error });
    }
};

//working but only updates what you provide..So we will need to first get all the data,and replace the new data with that particular part
//Update an ad
exports.updateAd = async (req, res) => {
    const { adId } = req.params;
    console.log(JSON.stringify(req.body, null, 2));

    try {
        // Use { new: true } to return the updated document
        const updatedAd = await Ad.findByIdAndUpdate(adId, req.body, { new: true });

        if (!updatedAd) {
            return res.status(404).json({ error: "Ad not found" });
        }

        // Send back the updated ad
        res.status(200).json({ success: true, data: updatedAd });
    } catch (error) {
        res.status(500).json({ message: `Error updating ad with ID ${adId}`, error });
    }
};

exports.deleteAd = async (req, res) => {
    const { adId } = req.params;
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
        // Find the ad by ID
        const ad = await Ad.findById(adId);
        if (!ad) {
            return res.status(404).json({ error: "Ad not found" });
        }
        // Check if the ad belongs to the user
        if (ad.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "User not authorized to delete this ad" });
        }
        // Delete the ad
        await Ad.deleteOne({ _id: adId });
        res.status(200).json({ success: true, message: "Ad deleted successfully" });
    } catch (error) {

        res.status(500).json({ message: `Error deleting ad with ID ${adId}`, error });
    }
};
// Mark an ad as sold
exports.markAdAsSold = async (req, res) => {
    const { adId } = req.params;
    try {
        const soldAd = await Ad.findByIdAndUpdate(adId, { sold: true }, { new: true });
        if (!soldAd) {
            return res.status(404).json({ error: "Ad not found" });
        }
        res.status(200).json({ success: true, data: soldAd });
    } catch (error) {
        res.status(500).json({ message: `Error marking ad with ID ${adId} as sold`, error });
    }
};



//Not tested
// Get all reviews for a specific ad
exports.getAdReviews = async (req, res) => {
    const { adId } = req.params;
    try {
        const ad = await Ad.findById(adId).select('reviews').populate('reviews.userId', 'name email');
        if (!ad) {
            return res.status(404).json({ error: "Ad not found" });
        }
        res.status(200).json({ success: true, data: ad.reviews });
    } catch (error) {
        res.status(500).json({ message: `Error fetching reviews for ad with ID ${adId}`, error });
    }
};
//Not working
// Add a review to an ad
// exports.addReview = async (req, res) => {
//     const { adId } = req.params;
//     const { rating, comment } = req.body;
//     try {
//         const ad = await Ad.findById(adId);

//         if (!ad) {
//             return res.status(404).json({ error: "Ad not found" });
//         }
//         console.log(req.body);
//         const newReview = {
//             userId: req.userId,
//             rating,
//             comment,
//         };
//         console.log(req.body);
//         ad.reviews.push(newReview);
//         console.log(req.body);
//         await ad.save();
//         console.log(req.body);

//         res.status(201).json({ success: true, data: newReview });
//     } catch (error) {
//         res.status(500).json({ message: `Error adding review to ad with ID ${adId}`, error });
//     }
// };

exports.addReview = async (req, res) => {
    const { adId } = req.params; // The ID of the ad to add the review to
    const { rating, comment } = req.body; // Review fields from the request body

    try {
        // Create the review object
        const newReview = {
            userId: req.userId || "674eaea36815194f0e775606", // Replace with a valid user ID if req.userId is missing
            rating,
            comment,
        };

        // Update the ad by pushing the new review into the `reviews` array
        const updatedAd = await Ad.findByIdAndUpdate(
            adId,
            { $push: { reviews: newReview } },
            { new: true, runValidators: true } // Ensure only updated fields are validated
        );

        if (!updatedAd) {
            return res.status(404).json({ error: "Ad not found" });
        }

        res.status(201).json({ success: true, data: newReview });
    } catch (error) {
        res.status(500).json({ message: `Error adding review to ad with ID ${adId}`, error });
    }
};


exports.scamDetection = async (req, res) => {
    const description = req.body.description;

    if (!description) {
        return res.status(400).json({ error: "Description is required" });
    }

    // Call the Python script
    const pythonProcess = spawn("python", [
        "C:/Users/IT LAND/Desktop/DataBaseApp/backend/config/scam_detection.py",
        description,
    ]);

    let output = "";
    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            res.json({ result: output.trim() });
        } else {
            res.status(500).json({ error: "Python script failed" });
        }
    });
};