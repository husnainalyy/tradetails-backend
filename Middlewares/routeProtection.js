const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// Protect routes middleware
exports.protect = async (req, res, next) => {
    let token;

    // Extract the token from the Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // If no token is provided
    if (!token) {
        return res.status(401).json({
            status: "fail",
            message: "You are not logged in! Please log in to access.",
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Use Promise.all to check for the entity in both User and Shop collections
        const [currentUser, currentShop] = await Promise.all([
            User.findById(decoded.id),
            Shop.findById(decoded.id),
        ]);

        // Check if the user exists in either User or Shop collection
        if (!currentUser && !currentShop) {
            return res.status(401).json({
                status: "fail",
                message: "The user belonging to this token no longer exists.",
            });
        }

        // Attach the authenticated entity to req.user
        if (currentUser) {
            req.user = currentUser;
        }

        next(); // Pass control to the next middleware
    } catch (err) {
        res.status(401).json({
            status: "fail",
            message: "Token is invalid or expired.",
        });
    }
};
