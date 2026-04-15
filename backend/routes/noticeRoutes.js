// ============================================
// routes/noticeRoutes.js — Notice API Endpoints
// ============================================

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const Notice = require('../models/Notice');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/authMiddleware');
const { notifyNewPost } = require('../utils/emailService');
const { uploadNotice } = require('../middleware/upload');
const {
    buildDepartmentMatch,
    departmentsMatch,
    normalizeDepartment,
} = require('../utils/departmentUtils');

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
    query('source').optional().trim(),
    query('excludeSource').optional().trim(),
], validate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const matchConditions = [{ isActive: true }];

        if (req.query.search) {
            matchConditions.push({ $text: { $search: req.query.search } });
        }
        if (req.query.category) {
            matchConditions.push({ category: req.query.category });
        }
        if (req.query.department) {
            matchConditions.push({
                department: buildDepartmentMatch(req.query.department, { includeAll: true })
            });
        }
        if (req.query.source) {
            if (req.query.source === 'Internal') {
                matchConditions.push({
                    $or: [
                        { source: 'Internal' },
                        { source: { $exists: false } },
                        { source: null }
                    ]
                });
            } else {
                matchConditions.push({ source: req.query.source });
            }
        }
        if (req.query.excludeSource) {
            matchConditions.push({
                $or: [
                    { source: { $ne: req.query.excludeSource } },
                    { source: { $exists: false } },
                    { source: null }
                ]
            });
        }

        const searchQuery = matchConditions.length === 1
            ? matchConditions[0]
            : { $and: matchConditions };

        const notices = await Notice.aggregate([
            { $match: searchQuery },
            {
                $addFields: {
                    sortDate: { $ifNull: ['$publishedAt', '$createdAt'] }
                }
            },
            { $sort: { sortDate: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
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
    uploadNotice.single('attachment'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').optional().isIn(['General', 'Exam', 'Admission', 'Events', 'Placement', 'Other']).withMessage('Invalid category'),
    body('department').optional().trim(),
], validate, async (req, res) => {
    try {
        const notice = new Notice({
            ...req.body,
            department: req.user.role === 'hod'
                ? normalizeDepartment(req.user.department)
                : normalizeDepartment(req.body.department || 'All'),
            postedBy: req.user.name,
            source: 'Internal',
            publishedAt: req.body.publishedAt || new Date(),
            attachment: req.file ? (req.file.path || req.file.secure_url || req.file.location) : null,
        });
        const saved = await notice.save();

        // Auto-create in-app notifications for all students in this department (async)
        (async () => {
            try {
                const deptFilter = saved.department && saved.department !== 'All'
                    ? { department: saved.department, isActive: true }
                    : { isActive: true };
                const students = await Student.find(deptFilter).select('_id');
                if (students.length > 0) {
                    await Notification.insertMany(students.map(s => ({
                        userId: s._id,
                        userModel: 'Student',
                        title: `New Notice: ${saved.title}`,
                        message: saved.content.substring(0, 200),
                        type: 'notice',
                        link: '/notices'
                    })));
                }
            } catch (err) {
                console.error('Notification creation failed:', err);
            }
        })();

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

        if (req.user.role === 'hod' && !departmentsMatch(existingNotice.department, req.user.department)) {
            return res.status(403).json({ message: 'Not authorized to update notices outside your department' });
        }

        const updateData = { ...req.body, postedBy: existingNotice.postedBy };
        if (req.user.role === 'hod') {
            updateData.department = normalizeDepartment(req.user.department);
        } else if (updateData.department) {
            updateData.department = normalizeDepartment(updateData.department);
        }

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
        if (req.user.role === 'hod' && !departmentsMatch(deleted.department, req.user.department)) {
            return res.status(403).json({ message: 'Not authorized to delete notices outside your department' });
        }
        await deleted.deleteOne();
        res.json({ message: `Notice "${deleted.title}" has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

module.exports = router;
