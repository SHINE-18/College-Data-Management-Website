// ============================================
// routes/timetableRoutes.js — Timetable API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Timetable = require('../models/Timetable');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure Multer for PDF file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/timetables/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'timetable-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter to only accept PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /api/timetables — Get all active timetables (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { department, semester, division } = req.query;
        let query = { isActive: true };
        
        if (department) query.department = department;
        if (semester) query.semester = parseInt(semester);
        if (division) query.division = division;
        
        const timetables = await Timetable.find(query).sort({ createdAt: -1 });
        res.json(timetables);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/timetables/departments/:dept — Get timetables by department
router.get('/departments/:dept', async (req, res) => {
    try {
        const timetables = await Timetable.find({ 
            department: req.params.dept,
            isActive: true 
        }).sort({ semester: 1, division: 1 });
        res.json(timetables);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/timetables/:id — Get one timetable
router.get('/:id', async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/timetables — Upload a new timetable (with PDF file)
router.post('/', protect, authorize('hod', 'super_admin'), upload.single('pdf'), async (req, res) => {
    try {
        const { title, department, semester, division, uploadedBy } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'PDF file is required' });
        }

        const timetable = new Timetable({
            title: title || `Timetable - ${req.user.role === 'hod' ? req.user.department : department} - Sem ${semester} - ${division}`,
            department: req.user.role === 'hod' ? req.user.department : department,
            semester: parseInt(semester),
            division,
            pdfUrl: `/uploads/timetables/${req.file.filename}`,
            uploadedBy: uploadedBy || req.user.name,
        });

        const saved = await timetable.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// PUT /api/timetables/:id — Update timetable details (not the file)
router.put('/:id', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const { title, department, semester, division, isActive } = req.body;

        const existingTimetable = await Timetable.findById(req.params.id);

        if (!existingTimetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        if (req.user.role === 'hod' && existingTimetable.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to update timetables outside your department' });
        }
        
        const updated = await Timetable.findByIdAndUpdate(
            req.params.id,
            {
                title,
                department: req.user.role === 'hod' ? req.user.department : department,
                semester,
                division,
                isActive
            },
            { new: true, runValidators: true }
        );
        
        if (!updated) return res.status(404).json({ message: 'Timetable not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// DELETE /api/timetables/:id — Delete (hide) a timetable
router.delete('/:id', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const existingTimetable = await Timetable.findById(req.params.id);

        if (!existingTimetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        if (req.user.role === 'hod' && existingTimetable.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to delete timetables outside your department' });
        }

        // Soft delete - just set isActive to false
        const deleted = await Timetable.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!deleted) return res.status(404).json({ message: 'Timetable not found' });
        res.json({ message: `Timetable "${deleted.title}" has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

module.exports = router;

