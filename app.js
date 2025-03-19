// Import required dependencies
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const { Webhook } = require('svix');
const User = require('./models/UserModel');

// Load environment variables
dotenv.config();

// Initialize Express app   
const app = express();

// Middleware setup
app.use(cors());
// Middleware to parse raw JSON body for webhook verification
app.use('/api/webhooks', bodyParser.raw({ type: 'application/json' }));// Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
connectDB();

// Import routes
const adRoutes = require("./routes/adRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const webhookRoutes = require('./routes/webhookRoutes');

// Middleware to parse raw JSON body for webhook verification

// API routes
app.use("/api/ads", adRoutes);  // Ads-related routes
app.use("/api/posts", postRoutes);  // Post-related routes
app.use("/api/users", userRoutes);  // User-related routes
app.use('/api/webhooks', webhookRoutes);





// Webhook endpoint
app.post('/api/webhooks', async (req, res) => {
    try {
        // Use raw body for signature verification
        const payload = req.body;
        const svixHeaders = req.headers;

        // Verify webhook signature
        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY);
        const event = webhook.verify(payload, svixHeaders);

        const { id } = event.data; // Clerk user ID
        const eventType = event.type;

        if (eventType === 'user.created') {
            const { first_name, last_name, email_addresses, profile_image_url } = event.data;

            const email = email_addresses?.[0]?.email_address || null;
            const name = `${first_name} ${last_name}`;
            const username = email?.split('@')[0]; // Generate a username from the email (ensure uniqueness)

            // Validate required fields
            if (!email || !name) {
                console.error('Missing required user fields from webhook payload.');
                return res.status(400).json({
                    success: false,
                    message: 'Required user fields are missing',
                });
            }

            // Save new user to MongoDB
            const newUser = new User({
                clerkUserId: id,
                name,
                username, // Ensure uniqueness
                email,
                image: profile_image_url || 'default-avatar.jpg',
                isVerified: true, // Assuming users are verified on creation
            });

            await newUser.save();
            console.log('User created:', newUser);

            return res.status(200).json({
                success: true,
                message: 'User created and webhook processed successfully',
            });
        } else if (eventType === 'user.deleted') {
            // Delete user and related data
            const user = await User.findOneAndDelete({ clerkUserId: id });

            if (!user) {
                console.error(`User with ID ${id} not found in MongoDB.`);
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            console.log('User deleted with ID:', id);

            return res.status(200).json({
                success: true,
                message: 'User and related data deleted successfully',
            });
        } else {
            console.log('Unhandled event type:', eventType);
            return res.status(400).json({
                success: false,
                message: `Unhandled event type: ${eventType}`,
            });
        }
    } catch (error) {
        console.error('Error processing webhook:', error.message);
        return res.status(400).json({
            success: false,
            message: 'Webhook verification failed',
        });
    }
});


// Connect to MongoDB
const mongoose = require('mongoose');

mongoose
    .connect(
        'mongodb+srv://alyhusnaiin:databasers@tradetales.yenje.mongodb.net/?retryWrites=true&w=majority&appName=TradeTales', // Your connection string
        {
            socketTimeoutMS: 45000,
        }
    )
    .then(() => console.log("MongoDB connected successfully"))
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    });

// Export the app
module.exports = app;

























































































































































































