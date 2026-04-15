// ============================================
// routes/timetableRoutes.js — Timetable API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadTimetable } = require('../middleware/upload');
const {
    buildDepartmentMatch,
    departmentsMatch,
    normalizeDepartment,
} = require('../utils/departmentUtils');

// GET /api/timetables — Get all active timetables (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { department, semester, division } = req.query;
        let query = { isActive: true };

        if (department) query.department = buildDepartmentMatch(department);
        if (semester) query.semester = parseInt(semester);
        if (division && division !== 'All') {
            query.division = { $in: [division, 'All'] };
        }

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
            department: buildDepartmentMatch(req.params.dept),
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
router.post('/', protect, authorize('hod', 'super_admin'), uploadTimetable.single('pdf'), async (req, res) => {
    try {
        const { title, department, semester, division, uploadedBy } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'PDF file is required' });
        }

        const timetable = new Timetable({
            title: title || `Timetable - ${normalizeDepartment(req.user.role === 'hod' ? req.user.department : department)} - Sem ${semester} - ${division}`,
            department: normalizeDepartment(req.user.role === 'hod' ? req.user.department : department),
            semester: parseInt(semester),
            division: division || 'All',
            pdfUrl: req.file ? (req.file.path || req.file.secure_url || req.file.location) : null,
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

        if (req.user.role === 'hod' && !departmentsMatch(existingTimetable.department, req.user.department)) {
            return res.status(403).json({ message: 'Not authorized to update timetables outside your department' });
        }

        const updated = await Timetable.findByIdAndUpdate(
            req.params.id,
            {
                title,
                department: normalizeDepartment(req.user.role === 'hod' ? req.user.department : department),
                semester,
                division: division || 'All',
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

        if (req.user.role === 'hod' && !departmentsMatch(existingTimetable.department, req.user.department)) {
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

