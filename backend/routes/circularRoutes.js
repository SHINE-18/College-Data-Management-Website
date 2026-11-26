const { departmentsMatch } = require('../utils/departmentUtils');
// ============================================
// routes/circularRoutes.js — Circulars API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const Circular = require('../models/Circular');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadCircular } = require('../middleware/upload');

// GET /api/circulars - Get all active circulars
router.get('/', async (req, res, next) => {
    try {
        const { department, circularType, priority } = req.query;
        let query = { isActive: true };

        // Filter by department
        if (department) {
            query.$or = [
                { department: department },
                { department: 'All' }
            ];
        }
        if (circularType) query.circularType = circularType;
        if (priority) query.priority = priority;

        const circulars = await Circular.find(query).sort({ createdAt: -1 });
        res.json(circulars);
    } catch (error) {
        next(error);
    }
});

// GET /api/circulars/:id - Get single circular
router.get('/:id', async (req, res, next) => {
    try {
        const circular = await Circular.findOne({ _id: req.params.id, isActive: true });

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        // Increment views
        circular.views += 1;
        await circular.save();

        res.json(circular);
    } catch (error) {
        next(error);
    }
});

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { notifyNewPost } = require('../utils/emailService');

// POST /api/circulars - Create circular (HOD only)
router.post('/', [
    protect,
    authorize('hod', 'super_admin'),
    uploadCircular.single('attachment')
], async (req, res, next) => {
    try {
        const { title, description, department, priority, circularType, targetAudience, expiryDate } = req.body;

        const circular = new Circular({
            title,
            description,
            department: req.user.role === 'hod' ? req.user.department : department || req.user.department,
            priority: priority || 'Normal',
            circularType: circularType || 'General',
            targetAudience: targetAudience || 'All',
            expiryDate,
            createdBy: req.user.name,
            attachmentUrl: req.file ? (req.file.path || req.file.secure_url || req.file.location) : null,
            attachmentName: req.file ? req.file.originalname : null
        });

        const saved = await circular.save();

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
                    await notifyNewPost(saved, 'Circular', emails);
                }
            } catch (err) {
                console.error("Delayed broadcast failed:", err);
            }
        })();

        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
});

// PUT /api/circulars/:id - Update circular
router.put('/:id', protect, authorize('hod', 'super_admin'), async (req, res, next) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (circular && req.user.role === 'hod' && !departmentsMatch(circular.department, req.user.department)) {
            return res.status(403).json({ message: 'Circular belongs to another department' });
        }
        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        Object.assign(circular, req.body);
        if (req.user.role === 'hod') circular.department = req.user.department;
        await circular.save();
        res.json(circular);
    } catch (error) {
        next(error);
    }
});

// PUT /api/circulars/:id/toggle - Toggle circular active status
router.put('/:id/toggle', protect, authorize('hod', 'super_admin'), async (req, res, next) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (circular && req.user.role === 'hod' && !departmentsMatch(circular.department, req.user.department)) {
            return res.status(403).json({ message: 'Circular belongs to another department' });
        }
        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        circular.isActive = !circular.isActive;
        await circular.save();

        res.json({
            message: `Circular ${circular.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: circular.isActive
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/circulars/:id - Delete circular
router.delete('/:id', protect, authorize('hod', 'super_admin'), async (req, res, next) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (circular && req.user.role === 'hod' && !departmentsMatch(circular.department, req.user.department)) {
            return res.status(403).json({ message: 'Circular belongs to another department' });
        }
        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        await circular.deleteOne();
        res.json({ message: 'Circular deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

