// ============================================
// routes/achievementRoutes.js — Achievements API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Achievement = require('../models/Achievement');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// GET /api/achievements - Get all achievements (with filters)
router.get('/', async (req, res) => {
    try {
        const { facultyId, achievementType, isVerified } = req.query;
        let query = {};

        if (facultyId) query.facultyId = facultyId;
        if (achievementType) query.achievementType = achievementType;
        if (isVerified !== undefined) query.isVerified = isVerified === 'true';

        const achievements = await Achievement.find(query).sort({ date: -1 });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/achievements/faculty/:id - Get achievements by faculty
router.get('/faculty/:id', async (req, res) => {
    try {
        const achievements = await Achievement.find({ facultyId: req.params.id }).sort({ date: -1 });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/achievements - Add achievement
router.post('/', [
    protect,
    authorize('faculty', 'hod'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('achievementType').isIn(['Award', 'Certification', 'Honor', 'Recognition', 'Prize', 'Other']).withMessage('Invalid achievement type'),
    validate
], async (req, res) => {
    try {
        const achievement = new Achievement({
            ...req.body,
            facultyId: req.user.facultyId || req.user._id,
            facultyName: req.user.name
        });

        await achievement.save();
        res.status(201).json(achievement);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/achievements/:id - Update achievement
router.put('/:id', protect, authorize('faculty', 'hod', 'super_admin'), async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        
        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        // Only the owner or admin can update
        if (achievement.facultyId.toString() !== (req.user.facultyId || req.user._id).toString() 
            && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(achievement, req.body);
        await achievement.save();
        res.json(achievement);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/achievements/:id/verify - Verify achievement (admin only)
router.put('/:id/verify', protect, authorize('super_admin'), async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        
        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        achievement.isVerified = true;
        await achievement.save();
        res.json(achievement);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/achievements/:id - Delete achievement
router.delete('/:id', protect, authorize('faculty', 'hod', 'super_admin'), async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        
        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        // Only the owner or admin can delete
        if (achievement.facultyId.toString() !== (req.user.facultyId || req.user._id).toString() 
            && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await achievement.deleteOne();
        res.json({ message: 'Achievement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

