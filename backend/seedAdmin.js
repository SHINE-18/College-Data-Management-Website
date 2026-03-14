// ============================================
// seedAdmin.js — Create the very first Admin User
// Run this once: node seedAdmin.js
// ============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // Check if a super admin already exists
        const adminExists = await User.findOne({ email: 'admin@vgecg.ac.in' });

        if (adminExists) {
            console.log('⚠️ Admin user already exists. You can log in with admin@vgecg.ac.in');
        } else {
            // Create the first super admin
            const adminUser = await User.create({
                name: 'System Admin',
                email: 'admin@vgecg.ac.in',
                password: 'AdminPassword123!', // You should change this after first login
                role: 'super_admin',
                department: 'All',
                designation: 'System Administrator'
            });
            console.log('🎉 First Super Admin created successfully!');
            console.log('Email: admin@vgecg.ac.in');
            console.log('Password: AdminPassword123!');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
