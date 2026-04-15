// ============================================
// routes/notificationRoutes.js — In-app Notifications API
// ============================================

const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, protectStudent } = require('../middleware/authMiddleware');

// Middleware: allow both User and Student tokens
const protectAny = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const Student = require('../models/Student');

        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) { req.actorId = user._id; req.actorModel = 'User'; return next(); }

        const student = await Student.findById(decoded.id).select('-password');
        if (student && student.isActive) { req.actorId = student._id; req.actorModel = 'Student'; return next(); }

        return res.status(401).json({ message: 'Not authorized' });
    } catch {
        return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
};

// GET /api/notifications — Get current user's notifications (newest first)
router.get('/', protectAny, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.actorId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ userId: req.actorId, isRead: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PATCH /api/notifications/:id/read — Mark a single notification as read
router.patch('/:id/read', protectAny, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.actorId },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', protectAny, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.actorId, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/notifications/clear — Clear all notifications
router.delete('/clear', protectAny, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.actorId });
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
