// ============================================
// routes/noticeRoutes.js — Notice API Endpoints
// ============================================

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Notice = require('../models/Notice');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { protect, authorize } = require('../middleware/authMiddleware');
const { notifyNewPost } = require('../utils/emailService');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/notices/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'notice-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
};

// GET /api/notices — Get all notices
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim(),
    query('category').optional().trim(),
    query('department').optional().trim(),
], validate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = { isActive: true };

        if (req.query.search) {
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

        const notices = await Notice.find(searchQuery).sort({ createdAt: -1 }).skip(skip).limit(limit);
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
    upload.single('attachment'),
    (req, res, next) => {
        require('fs').writeFileSync('debug.txt', JSON.stringify({
            contentType: req.headers['content-type'],
            body: req.body,
            file: req.file
        }, null, 2));
        next();
    },
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').optional().isIn(['General', 'Exam', 'Admission', 'Events', 'Placement', 'Other']).withMessage('Invalid category'),
    body('department').optional().trim(),
], validate, async (req, res) => {
    try {
        const notice = new Notice({
            ...req.body,
            department: req.user.role === 'hod' ? req.user.department : (req.body.department || 'All'),
            postedBy: req.user.name,
            attachment: req.file ? `/uploads/notices/${req.file.filename}` : null,
        });
        const saved = await notice.save();

        // Broadcast email notification (asynchronously)
        (async () => {
            try {
                const students = await Student.find({ isActive: true }).select('email');
                const facultyArr = await Faculty.find({ isActive: true }).select('email');
                const emails = [...new Set([
                    ...students.map(s => s.email),
                    ...facultyArr.map(f => f.email)
                ])].filter(Boolean);

                if (emails.length > 0) {
                    await notifyNewPost(saved, 'Notice', emails);
                }
            } catch (err) {
                console.error("Delayed broadcast failed:", err);
            }
        })();

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
        if (!existingNotice) return res.status(404).json({ message: 'Notice not found' });

        if (req.user.role === 'hod' && existingNotice.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to update notices outside your department' });
        }

        const updateData = { ...req.body, postedBy: existingNotice.postedBy };
        if (req.user.role === 'hod') updateData.department = req.user.department;

        const updated = await Notice.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
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
