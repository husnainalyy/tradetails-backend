const { Webhook } = require('svix');
const User = require('../models/UserModel');

const handleWebhook = async (req, res) => {
    try {
        console.log("Webhook called");
        const payload = req.body; // Use raw body
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
        } else if (eventType === 'user.updated') {
            const { first_name, last_name, email_addresses, profile_image_url } = event.data;

            const email = email_addresses?.[0]?.email_address || null;
            const name = `${first_name} ${last_name}`;

            // Find and update the user
            const updatedUser = await User.findOneAndUpdate(
                { clerkUserId: id },
                {
                    name,
                    email,
                    image: profile_image_url || 'default-avatar.jpg',
                },
                { new: true } // Return the updated document
            );

            if (!updatedUser) {
                console.error(`User with ID ${id} not found for update.`);
                return res.status(404).json({
                    success: false,
                    message: 'User not found for update',
                });
            }

            console.log('User updated:', updatedUser);

            return res.status(200).json({
                success: true,
                message: 'User updated successfully',
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
};

module.exports = { handleWebhook };
