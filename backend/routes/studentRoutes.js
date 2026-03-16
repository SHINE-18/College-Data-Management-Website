const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// Sub-routes for the logged in student

// GET /api/student/dashboard - Aggregate summary
router.get('/dashboard', protectStudent, async (req, res) => {
    try {
        const studentId = req.student._id;

        // Fetch overview metrics
        const attendanceRecords = await Attendance.find({ student: studentId });
        const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
        const totalClasses = attendanceRecords.length;
        const attendancePercentage = totalClasses === 0 ? 100 : Math.round((presentCount / totalClasses) * 100);

        const assignmentsPending = await Assignment.countDocuments({
            semester: req.student.semester,
            department: { $in: [req.student.department, 'All'] },
            _id: { $nin: await Submission.distinct('assignment', { student: studentId }) }
        });

        res.json({
            attendancePercentage,
            assignmentsPending,
            totalClasses
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/student/attendance - Detailed attendance
router.get('/attendance', protectStudent, async (req, res) => {
    try {
        const records = await Attendance.find({ student: req.student._id }).sort('-date');

        // Group by subject logic could go here or on frontend

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const multer = require('multer');
const path = require('path');

// Configure upload for student submissions
const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/submissions/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'sub-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadSub = multer({ storage: submissionStorage });

// GET /api/student/results - All results
router.get('/results', protectStudent, async (req, res) => {
    try {
        const results = await Result.find({ student: req.student._id }).sort('-createdAt');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/student/assignments - Fetch assignments for student's semester
router.get('/assignments', protectStudent, async (req, res) => {
    try {
        const studentId = req.student._id;
        const studentSemester = req.student.semester;

        const assignments = await Assignment.find({
            semester: studentSemester,
            department: { $in: [req.student.department, 'All'] }
        }).sort('-dueDate').lean();

        // Check if student has submitted each assignment
        const submissions = await Submission.find({ student: studentId });
        const submittedMap = new Set(submissions.map(s => s.assignment.toString()));

        const assignmentsWithStatus = assignments.map(a => ({
            ...a,
            isSubmitted: submittedMap.has(a._id.toString())
        }));

        res.json(assignmentsWithStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/student/submissions - Upload submission
router.post('/submissions', protectStudent, uploadSub.single('submissionFile'), async (req, res) => {
    try {
        const { assignmentId } = req.body;
        if (!assignmentId) return res.status(400).json({ message: 'Assignment ID is required' });

        const submission = new Submission({
            assignment: assignmentId,
            student: req.student._id,
            fileUrl: req.file ? `/uploads/submissions/${req.file.filename}` : '',
            submittedAt: new Date()
        });

        await submission.save();
        res.status(201).json(submission);
    } catch (error) {
        res.status(400).json({ message: 'Submission failed', error: error.message });
    }
});

module.exports = router;
