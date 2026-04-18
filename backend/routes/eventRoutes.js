// ============================================
// routes/eventRoutes.js â€” Event API Endpoints
// ============================================

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure Multer for image upload
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/events/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter to only accept image files
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
};

// GET /api/events â€” Get all active events (with pagination & search)
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim(),
    query('type').optional().trim(),
    query('department').optional().trim(),
], validate, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = { isActive: true };

        if (req.query.search) {
            searchQuery.$text = { $search: req.query.search };
        }
        if (req.query.type) {
            searchQuery.type = req.query.type;
        }
        if (req.query.department) {
            searchQuery.department = req.query.department;
        }

        const events = await Event.find(searchQuery)
            .sort({ date: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Event.countDocuments(searchQuery);

        res.json({
            success: true,
            data: events,
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

// GET /api/events/:id â€” Get one event
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid event ID')
], validate, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/events â€” Create a new event (with optional image)
router.post('/', protect, authorize('faculty', 'hod', 'super_admin'), uploadImage.single('image'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('type').optional().isIn(['Conference', 'Workshop', 'Cultural', 'Sports', 'Placement', 'Lecture', 'Competition', 'Other']).withMessage('Invalid event type'),
    body('department').optional().trim(),
    body('venue').optional().trim(),
], validate, async (req, res) => {
    try {
        const { title, description, date, type, department, venue } = req.body;

        const eventData = {
            title,
            description,
            date,
            type: type || 'Other',
            department: (req.user.role === 'hod' || req.user.role === 'faculty') ? req.user.department : (department || 'All'),
            venue,
        };

        if (req.file) {
            eventData.image = `/uploads/events/${req.file.filename}`;
        }

        const event = new Event(eventData);
        const saved = await event.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// PUT /api/events/:id â€” Update an event (with optional image update)
router.put('/:id', protect, authorize('faculty', 'hod', 'super_admin'), uploadImage.single('image'), [
    param('id').isMongoId().withMessage('Invalid event ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
    body('type').optional().isIn(['Conference', 'Workshop', 'Cultural', 'Sports', 'Placement', 'Lecture', 'Competition', 'Other']).withMessage('Invalid event type'),
], validate, async (req, res) => {
    try {
        const existingEvent = await Event.findById(req.params.id);

        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if ((req.user.role === 'hod' || req.user.role === 'faculty') && existingEvent.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to update events outside your department' });
        }

        const updateData = { ...req.body };

        if (req.user.role === 'hod' || req.user.role === 'faculty') {
            updateData.department = req.user.department;
        }

        if (req.file) {
            updateData.image = `/uploads/events/${req.file.filename}`;
        }

        const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// DELETE /api/events/:id â€” Delete an event
router.delete('/:id', protect, authorize('faculty', 'hod', 'super_admin'), [
    param('id').isMongoId().withMessage('Invalid event ID')
], validate, async (req, res) => {
    try {
        const deleted = await Event.findById(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Event not found' });

        if (req.user.role === 'hod' && deleted.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to delete events outside your department' });
        }

        await deleted.deleteOne();
        res.json({ message: `Event "${deleted.title}" has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

module.exports = router;
