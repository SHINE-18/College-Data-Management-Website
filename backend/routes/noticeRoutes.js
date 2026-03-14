// ============================================
// routes/noticeRoutes.js — Notice API Endpoints
// ============================================
// Same pattern as Faculty routes: GET, POST, PUT, DELETE

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
};

// GET /api/notices — Get all notices (with pagination & search)
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim(),
    query('category').optional().trim(),
    query('department').optional().trim(),
], validate, async (req, res) => {
    try {
        // Parse pagination params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery = { isActive: true };

        if (req.query.search) {
            // Use text search for better performance
            searchQuery.$text = { $search: req.query.search };
        }
        if (req.query.category) {
            searchQuery.category = req.query.category;
        }
        if (req.query.department) {
            searchQuery.$or = [
                { department: req.query.department },
                { department: 'All' }
            ];
        }

        // Execute query with pagination
        const notices = await Notice.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Notice.countDocuments(searchQuery);

        res.json({
            success: true,
            data: notices,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/notices/:id — Get one notice
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid notice ID')
], validate, async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/notices — Create a new notice
router.post('/', [
    protect,
    authorize('hod', 'super_admin'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').optional().isIn(['General', 'Exam', 'Admission', 'Events', 'Placement', 'Other']).withMessage('Invalid category'),
    body('department').optional().trim(),
    body('attachment').optional().trim(),
], validate, async (req, res) => {
    try {
        const notice = new Notice({
            ...req.body,
            department: req.user.role === 'hod' ? req.user.department : (req.body.department || 'All'),
            postedBy: req.user.name,
        });
        const saved = await notice.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// PUT /api/notices/:id — Update a notice
router.put('/:id', [
    protect,
    authorize('hod', 'super_admin'),
    param('id').isMongoId().withMessage('Invalid notice ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    body('category').optional().isIn(['General', 'Exam', 'Admission', 'Events', 'Placement', 'Other']).withMessage('Invalid category'),
], validate, async (req, res) => {
    try {
        const existingNotice = await Notice.findById(req.params.id);

        if (!existingNotice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        if (req.user.role === 'hod' && existingNotice.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to update notices outside your department' });
        }

        const updateData = {
            ...req.body,
            postedBy: existingNotice.postedBy,
        };

        if (req.user.role === 'hod') {
            updateData.department = req.user.department;
        }

        const updated = await Notice.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Notice not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// DELETE /api/notices/:id — Delete a notice
router.delete('/:id', [
    protect,
    authorize('hod', 'super_admin'),
    param('id').isMongoId().withMessage('Invalid notice ID')
], validate, async (req, res) => {
    try {
        const deleted = await Notice.findById(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Notice not found' });

        if (req.user.role === 'hod' && deleted.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to delete notices outside your department' });
        }

        await deleted.deleteOne();
        res.json({ message: `Notice "${deleted.title}" has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

module.exports = router;

