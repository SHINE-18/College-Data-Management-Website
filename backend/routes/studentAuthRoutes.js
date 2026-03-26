const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { generateToken, protectStudent } = require('../middleware/authMiddleware');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// POST /api/student-auth/login - Student Login
router.post('/login', [
    body('enrollmentNumber').notEmpty().withMessage('Enrollment number is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], async (req, res) => {
    try {
        const { enrollmentNumber, password } = req.body;
        console.log('Login attempt for:', enrollmentNumber);

        const student = await Student.findOne({ enrollmentNumber }).select('+password');

        if (!student || !student.isActive) {
            console.log('Student not found or inactive');
            return res.status(401).json({ message: 'Invalid credentials or inactive account' });
        }

        const isMatch = await student.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        student.lastLogin = new Date();
        await student.save({ validateBeforeSave: false });

        const token = generateToken(student._id);

        res.json({
            _id: student._id,
            name: student.name,
            enrollmentNumber: student.enrollmentNumber,
            email: student.email,
            semester: student.semester,
            department: student.department,
            role: 'student',
            token: token
        });
    } catch (error) {
        console.error('CRITICAL LOGIN ERROR:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: error.stack
        });
    }
});

// GET /api/student-auth/me - Get current student
router.get('/me', protectStudent, async (req, res) => {
    try {
        const student = await Student.findById(req.student._id);
        res.json({
            _id: student._id,
            name: student.name,
            enrollmentNumber: student.enrollmentNumber,
            email: student.email,
            semester: student.semester,
            department: student.department,
            role: 'student'
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
