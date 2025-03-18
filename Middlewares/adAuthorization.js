const Ad = require("../models/AdModel");

exports.adAuthorization = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    console.log("here is ad", ad);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check if the user is the owner of the ad
    if (ad.createdBy.toString() !== req.User._id.toString()) 
    {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    console.log("posted by", ad.createdBy.toString());
    console.log("user id", req.User._id.toString());
    
    // If authorized, proceed to the next middleware/controller
    next();
  } catch (error) {
    console.log("here is error in authorization..", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
