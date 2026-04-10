// ============================================
// seedAdmin.js — Create the very first Admin User
// Run this once: node seedAdmin.js
// ============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    // Read credentials from environment variables — never hardcode secrets!
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file before running this script.');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // Check if a super admin already exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log(`⚠️ Admin user already exists. You can log in with ${adminEmail}`);
        } else {
            // Create the first super admin
            const adminUser = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'super_admin',
                department: 'All',
                designation: 'System Administrator'
            });
            console.log('🎉 First Super Admin created successfully!');
            console.log(`Email: ${adminEmail}`);
            console.log('Password: [as set in .env]');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
