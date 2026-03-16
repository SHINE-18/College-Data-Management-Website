// ============================================
// middleware/authMiddleware.js — JWT Authentication
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, no token provided'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                message: 'Not authorized, user not found'
            });
        }

        if (!req.user.isActive) {
            return res.status(401).json({
                message: 'Not authorized, account is deactivated'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Not authorized, token invalid'
        });
    }
};

// Authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Protect routes for students
const protectStudent = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Use student model instead of user
        const Student = require('../models/Student');
        req.student = await Student.findById(decoded.id).select('-password');

        if (!req.student) {
            return res.status(401).json({ message: 'Not authorized, student not found' });
        }

        if (!req.student.isActive) {
            return res.status(401).json({ message: 'Not authorized, account is deactivated' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
};

module.exports = { protect, authorize, generateToken, protectStudent };

