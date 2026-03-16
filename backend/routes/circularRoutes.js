// ============================================
// routes/circularRoutes.js — Circulars API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Circular = require('../models/Circular');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/circulars/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'circular-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /api/circulars - Get all active circulars
router.get('/', async (req, res) => {
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/circulars/:id - Get single circular
router.get('/:id', async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        // Increment views
        circular.views += 1;
        await circular.save();

        res.json(circular);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { notifyNewPost } = require('../utils/emailService');

// POST /api/circulars - Create circular (HOD only)
router.post('/', [
    protect,
    authorize('hod', 'super_admin'),
    upload.single('attachment')
], async (req, res) => {
    try {
        const { title, description, department, priority, circularType, targetAudience, expiryDate } = req.body;

        const circular = new Circular({
            title,
            description,
            department: department || req.user.department,
            priority: priority || 'Normal',
            circularType: circularType || 'General',
            targetAudience: targetAudience || 'All',
            expiryDate,
            createdBy: req.user.name,
            attachmentUrl: req.file ? `/uploads/circulars/${req.file.filename}` : null,
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/circulars/:id - Update circular
router.put('/:id', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        Object.assign(circular, req.body);
        await circular.save();
        res.json(circular);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/circulars/:id/toggle - Toggle circular active status
router.put('/:id/toggle', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/circulars/:id - Delete circular
router.delete('/:id', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        await circular.deleteOne();
        res.json({ message: 'Circular deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

