// ============================================
// routes/facultyRoutes.js — Faculty API Endpoints
// ============================================
// This file defines ALL the URLs related to faculty.
// Each route calls a specific function to handle the request.

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const router = express.Router();
// Router is like a mini-app that handles a group of related routes

// Import the Faculty model (our data structure)
const Faculty = require('../models/Faculty');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure Multer for profile photo upload
const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/faculty/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'faculty-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter to only accept image files
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadPhoto = multer({
    storage: photoStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
};

// ────────────────────────────────────────────
// GET /api/faculty — Get ALL faculty members (with pagination & search)
// ────────────────────────────────────────────
// When React calls: fetch('http://localhost:5000/api/faculty?page=1&limit=10&search=john')
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim(),
    query('designation').optional().trim(),
    query('department').optional().trim(),
], validate, async (req, res) => {
    try {
        // Parse pagination params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery = { isActive: true };
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            searchQuery.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { specialization: searchRegex },
                { qualification: searchRegex }
            ];
        }
        if (req.query.designation) {
            searchQuery.designation = req.query.designation;
        }
        if (req.query.department) {
            searchQuery.department = req.query.department;
        }

        // Execute query with pagination
        const faculty = await Faculty.find(searchQuery)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Faculty.countDocuments(searchQuery);

        res.json({
            success: true,
            data: faculty,
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

router.get('/admin/all', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const query = {};

        if (req.user.role === 'hod') {
            query.department = req.user.department;
        } else if (req.query.department) {
            query.department = req.query.department;
        }

        const faculty = await Faculty.find(query).sort({ name: 1 });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ────────────────────────────────────────────
// GET /api/faculty/:id — Get ONE faculty by ID
// ────────────────────────────────────────────
// :id is a URL parameter — it changes for each faculty
// Example: /api/faculty/abc123 → req.params.id = "abc123"
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid faculty ID')
], validate, async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        // findById looks for a document with that specific MongoDB _id

        if (!faculty || !faculty.isActive) {
            // 404 = Not Found (no faculty with that ID exists)
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ────────────────────────────────────────────
// POST /api/faculty — CREATE a new faculty (with optional profile photo)
// ────────────────────────────────────────────
// POST = sending data TO the server (like submitting a form)
// The data comes in req.body (parsed by express.json() middleware)
router.post('/', protect, authorize('hod', 'super_admin'), uploadPhoto.single('profilePhoto'), [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('designation').isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Lecturer']).withMessage('Invalid designation'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department').optional().trim(),
    body('phone').optional().trim(),
    body('qualification').optional().trim(),
    body('specialization').optional().trim(),
    body('experience').optional().trim(),
], validate, async (req, res) => {
    try {
        // req.body contains the JSON data sent by the frontend
        // Example: { name: "Dr. Patel", designation: "Professor", email: "..." }

        const facultyData = { ...req.body };

        if (req.user.role === 'hod') {
            facultyData.department = req.user.department;
        }

        // Add profile photo URL if uploaded
        if (req.file) {
            facultyData.profilePhoto = `/uploads/faculty/${req.file.filename}`;
        }

        const newFaculty = new Faculty(facultyData);

        // .save() inserts the document into MongoDB
        const saved = await newFaculty.save();

        // 201 = Created (successfully created a new resource)
        res.status(201).json(saved);
    } catch (error) {
        // 400 = Bad Request (client sent invalid data, like missing required field)
        // Check for duplicate email
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// ────────────────────────────────────────────
// PUT /api/faculty/:id — UPDATE a faculty (with optional profile photo)
// ────────────────────────────────────────────
// PUT = replacing/updating existing data
router.put('/:id', protect, authorize('faculty', 'hod', 'super_admin'), uploadPhoto.single('profilePhoto'), [
    param('id').isMongoId().withMessage('Invalid faculty ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('designation').optional().isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Lecturer']).withMessage('Invalid designation'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
], validate, async (req, res) => {
    try {
        const existingFaculty = await Faculty.findById(req.params.id);

        if (!existingFaculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        if (req.user.role === 'faculty') {
            const isOwnProfile =
                existingFaculty.email === req.user.email ||
                (req.user.facultyId && existingFaculty._id.equals(req.user.facultyId));

            if (!isOwnProfile) {
                return res.status(403).json({ message: 'Not authorized to update this faculty profile' });
            }
        }

        if (req.user.role === 'hod' && existingFaculty.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to update faculty outside your department' });
        }

        const updateData = { ...req.body };

        if (req.user.role === 'faculty') {
            delete updateData.isActive;
            delete updateData.department;
        }

        if (req.user.role === 'hod') {
            updateData.department = req.user.department;
        }

        // Add new profile photo URL if uploaded
        if (req.file) {
            updateData.profilePhoto = `/uploads/faculty/${req.file.filename}`;
        }

        // findByIdAndUpdate does 3 things:
        // 1. Finds the document by ID
        // 2. Updates it with req.body data
        // 3. { new: true } returns the UPDATED document (not the old one)
        // { runValidators: true } checks that new data follows schema rules
        const updated = await Faculty.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updated);
    } catch (error) {
        // Check for duplicate email
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// ────────────────────────────────────────────
// DELETE /api/faculty/:id — DELETE a faculty
// ────────────────────────────────────────────
router.delete('/:id', protect, authorize('hod', 'super_admin'), [
    param('id').isMongoId().withMessage('Invalid faculty ID')
], validate, async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        if (req.user.role === 'hod' && faculty.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to delete faculty outside your department' });
        }

        await faculty.deleteOne();

        // Return success message with the deleted faculty's name
        res.json({ message: `${faculty.name} has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

// Export the router so server.js can use it
module.exports = router;
