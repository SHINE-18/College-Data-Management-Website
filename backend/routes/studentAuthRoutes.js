const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { generateToken, protectStudent } = require('../middleware/authMiddleware');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array().map(({ path, msg }) => ({ path, msg })) });
    next();
};

// POST /api/student-auth/login - Student Login
router.post('/login', [
    body('enrollmentNumber').isString().bail().trim().notEmpty().withMessage('Enrollment number is required'),
    body('password').isString().bail().notEmpty().withMessage('Password is required'),
    validate
], async (req, res, next) => {
    try {
        const { enrollmentNumber, password } = req.body;


        const student = await Student.findOne({ enrollmentNumber }).select('+password');

        if (!student || !student.isActive) {

            return res.status(401).json({ message: 'Invalid credentials or inactive account' });
        }

        const isMatch = await student.comparePassword(password);
        if (!isMatch) {

            return res.status(401).json({ message: 'Invalid credentials' });
        }

        student.lastLogin = new Date();
        await student.save({ validateBeforeSave: false });

        const token = generateToken(student, '7d');

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
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/student-auth/me - Get current student
router.get('/me', protectStudent, async (req, res, next) => {
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
        next(error);
    }
});

// PUT /api/student-auth/password - Change student password
router.put('/password', [
    protectStudent,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate
], async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const student = await Student.findById(req.student._id).select('+password');

        // Verify current password
        const isMatch = await student.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        student.password = newPassword;
        await student.save();

        res.json({ message: 'Password updated successfully', token: generateToken(student, '7d') });
    } catch (error) {
        console.error('Password change error:', error);
        next(error);
    }
});

module.exports = router;
