// ============================================
// routes/notificationRoutes.js — In-app Notifications API
// ============================================

const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protectBoth } = require('../middleware/authMiddleware');

// GET /api/notifications — Get current user's notifications (newest first)
router.get('/', protectBoth, async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: (req.user || req.student)._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ userId: (req.user || req.student)._id, isRead: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/notifications/read-all — Mark all as read
// NOTE: This MUST come before /:id/read to avoid Express treating 'read-all' as an :id param
router.patch('/read-all', protectBoth, async (req, res, next) => {
    try {
        await Notification.updateMany({ userId: (req.user || req.student)._id, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/notifications/:id/read — Mark a single notification as read
router.patch('/:id/read', protectBoth, async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: (req.user || req.student)._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/notifications/clear — Clear all notifications
router.delete('/clear', protectBoth, async (req, res, next) => {
    try {
        await Notification.deleteMany({ userId: (req.user || req.student)._id });
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
