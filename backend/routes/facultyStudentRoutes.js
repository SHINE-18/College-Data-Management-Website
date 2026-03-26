const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');

// Multi-part form handling for assignment files
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/assignments/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET /api/faculty/students?semester=X - Fetch students for marking
router.get('/students', protect, authorize('faculty', 'hod'), async (req, res) => {
    try {
        const { semester } = req.query;
        if (!semester) return res.status(400).json({ message: 'Semester is required' });

        const students = await Student.find({
            semester: Number(semester),
            isActive: true
        }).select('name enrollmentNumber semester');

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/faculty/attendance - Batch attendance
router.post('/attendance', protect, authorize('faculty', 'hod'), async (req, res) => {
    try {
        const { records } = req.body;
        if (!Array.isArray(records)) return res.status(400).json({ message: 'Invalid records' });

        // Add faculty ID to each record
        const attendanceWithFaculty = records.map(r => ({ ...r, faculty: req.user._id }));

        await Attendance.insertMany(attendanceWithFaculty);
        res.status(201).json({ message: 'Attendance records saved successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to save attendance', error: error.message });
    }
});

// POST /api/faculty/results - Batch results
router.post('/results', protect, authorize('faculty', 'hod'), async (req, res) => {
    try {
        const { records } = req.body;
        if (!Array.isArray(records)) return res.status(400).json({ message: 'Invalid records' });

        await Result.insertMany(records);
        res.status(201).json({ message: 'Results published successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to save results', error: error.message });
    }
});

// POST /api/faculty/assignments - Create assignment
router.post('/assignments', protect, authorize('faculty', 'hod'), upload.single('assignmentFile'), async (req, res) => {
    try {
        const assignmentData = {
            ...req.body,
            faculty: req.user._id,
            department: req.user.department || 'All'
        };

        if (req.file) {
            assignmentData.fileUrl = `/uploads/assignments/${req.file.filename}`;
        }

        const assignment = new Assignment(assignmentData);
        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create assignment', error: error.message });
    }
});

module.exports = router;
