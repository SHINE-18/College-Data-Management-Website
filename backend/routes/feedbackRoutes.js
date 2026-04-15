// ============================================
// routes/feedbackRoutes.js — Feedback & Grievance API
// ============================================

const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// POST /api/feedback — Public submission
router.post('/', [
    body('type').isIn(['feedback', 'grievance']).withMessage('Type must be feedback or grievance'),
    body('category').isIn(['General', 'Academic', 'Infrastructure', 'Faculty', 'Administration', 'Other'])
        .withMessage('Invalid category'),
    body('message').trim().isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters'),
    validate
], async (req, res) => {
    try {
        const { type, category, message, isAnonymous, department } = req.body;

        // If not anonymous, try to get userId from token (optional)
        let userId = null;
        const authHeader = req.headers.authorization;
        if (!isAnonymous && authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
                userId = decoded.id;
            } catch {
                // Ignore auth errors for public route
            }
        }

        const feedback = await Feedback.create({
            type,
            category,
            message,
            isAnonymous: isAnonymous || false,
            userId: isAnonymous ? null : userId,
            department: department || 'General'
        });

        res.status(201).json({
            message: 'Thank you! Your feedback has been submitted successfully.',
            id: feedback._id
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/feedback — Admin only: view all feedback
router.get('/', protect, authorize('super_admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) filter.type = req.query.type;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;

        const feedbacks = await Feedback.find(filter)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });

        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PATCH /api/feedback/:id/respond — Admin only
router.patch('/:id/respond', [
    protect,
    authorize('super_admin'),
    body('adminResponse').trim().notEmpty().withMessage('Response is required'),
    body('status').isIn(['reviewed', 'resolved', 'dismissed']).withMessage('Invalid status'),
    validate
], async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            {
                adminResponse: req.body.adminResponse,
                status: req.body.status,
                respondedAt: new Date()
            },
            { new: true }
        );
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
