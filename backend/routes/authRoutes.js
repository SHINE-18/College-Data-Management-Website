// ============================================
// routes/authRoutes.js — Authentication API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, generateToken } = require('../middleware/authMiddleware');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// POST /api/auth/register - Register a new user (admin/hod hierarchical)
router.post('/register', [
    protect,
    authorize('super_admin', 'hod'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['faculty', 'hod']).withMessage('Invalid role'),
    body('department').optional().isIn(['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'All']),
    validate
], async (req, res) => {
    try {
        const { name, email, password, role, department, designation } = req.body;

        // Eforce Hierarchy
        if (req.user.role === 'super_admin') {
            if (role !== 'hod') {
                return res.status(403).json({ message: 'Super Admin can only register HODs' });
            }
        } else if (req.user.role === 'hod') {
            if (role !== 'faculty') {
                return res.status(403).json({ message: 'HOD can only register Faculty' });
            }
            // Ensure HOD only registers faculty for their own department
            if (department && department !== req.user.department) {
                return res.status(403).json({ message: 'HOD can only register faculty for their own department' });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            department: req.user.role === 'hod' ? req.user.department : (department || 'All'),
            designation
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            designation: user.designation,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/auth/login - Login user
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            designation: user.designation,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            designation: user.designation,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', [
    protect,
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('department').optional().isIn(['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'All']),
    validate
], async (req, res) => {
    try {
        const { name, department, designation } = req.body;

        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (department) user.department = department;
        if (designation) user.designation = designation;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            designation: updatedUser.designation
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/auth/password - Change password
router.put('/password', [
    protect,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate
], async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/auth/users - Get all users (admin only)
router.get('/users', protect, authorize('super_admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/auth/users/:id - Delete user (admin only)
router.delete('/users/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/auth/users/:id/toggle - Toggle user active status (admin only)
router.put('/users/:id/toggle', protect, authorize('super_admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: user.isActive
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/auth/forgot-password - Send reset link to email
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    validate
], async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            // Return success even if user not found (security best practice)
            return res.json({ message: 'If that email is registered, a reset link has been sent.' });
        }

        // Generate a random token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash and store the token
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save({ validateBeforeSave: false });

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                <div style="background: #1e3a5f; color: white; padding: 24px; text-align: center;">
                    <h2 style="margin: 0;">VGEC CE Department</h2>
                </div>
                <div style="padding: 24px;">
                    <h3>Password Reset Request</h3>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
                    <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
                    <p style="color: #6b7280; font-size: 13px;">If you did not request this, ignore this email. Your password will not change.</p>
                </div>
            </div>
        `;

        try {
            const { sendEmail } = require('../utils/emailService');
            await sendEmail({ to: user.email, subject: 'VGEC CE Portal — Password Reset', html });
            res.json({ message: 'If that email is registered, a reset link has been sent.' });
        } catch (emailError) {
            // If email fails, clean up the token so user can retry
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/auth/reset-password/:token - Reset password using token
router.post('/reset-password/:token', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
], async (req, res) => {
    try {
        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new one.' });
        }

        // Set new password and clear reset fields
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
