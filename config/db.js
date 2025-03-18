const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const DB = process.env.DATABASE.replace(
            '<PASSWORD>',
            process.env.DATABASE_PASSWORD
        );
        const con = await mongoose.connect(DB, {
            useNewUrlParser: true,
           
        });
        console.log('Database connected successfully!');
    } catch (err) {
        console.error('Database connection error!', err);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;