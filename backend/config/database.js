// ============================================
// config/database.js — MongoDB Connection
// This file handles connecting to our MongoDB Atlas database
// ============================================

const mongoose = require('mongoose');

// This function connects to MongoDB
// We make it "async" because connecting to a remote database takes time
// (it's like calling someone on the phone — you have to wait for them to pick up)
const connectDB = async () => {
    try {
        // mongoose.connect() sends a connection request to MongoDB Atlas
        // process.env.MONGODB_URI reads the connection string from our .env file
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        // If we reach this line, connection was successful! 🎉
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
    } catch (error) {
        // If something goes wrong (wrong password, no internet, etc.)
        console.error(`❌ MongoDB Connection Error: ${error.message}`);

        // Exit the application — no point running a backend without a database
        process.exit(1);
    }
};

// Export the function so server.js can use it
module.exports = connectDB;
