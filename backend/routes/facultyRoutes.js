// ============================================
// routes/facultyRoutes.js — Faculty API Endpoints
// ============================================
// This file defines ALL the URLs related to faculty.
// Each route calls a specific function to handle the request.

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

// Import models
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadFaculty } = require('../middleware/upload');
const {
    buildDepartmentMatch,
    departmentsMatch,
    normalizeDepartment,
} = require('../utils/departmentUtils');

const mapDesignationToUserRole = (designation) => (designation === 'HOD' ? 'hod' : 'faculty');

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
            const departmentMatch = buildDepartmentMatch(req.query.department);
            if (departmentMatch) {
                searchQuery.department = departmentMatch;
            }
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
            query.department = buildDepartmentMatch(req.user.department);
        } else if (req.query.department) {
            query.department = buildDepartmentMatch(req.query.department);
        }

        const faculty = await Faculty.find(query).sort({ department: 1, name: 1 });
        const facultyIds = faculty.map((member) => member._id);
        const users = await User.find({ facultyId: { $in: facultyIds } })
            .select('facultyId role isActive');
        const userByFacultyId = new Map(users.map((member) => [String(member.facultyId), member]));

        res.json(faculty.map((member) => {
            const linkedUser = userByFacultyId.get(String(member._id));
            return {
                ...member.toObject(),
                portalRole: linkedUser?.role || mapDesignationToUserRole(member.designation),
                userActive: linkedUser?.isActive ?? true
            };
        }));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/faculty/me — Get the current logged-in user's faculty profile
router.get('/me', protect, async (req, res) => {
    try {
        // Try finding by facultyId first, then by email
        let faculty = null;
        if (req.user.facultyId) {
            faculty = await Faculty.findById(req.user.facultyId);
        }
        
        if (!faculty) {
            faculty = await Faculty.findOne({ email: req.user.email.toLowerCase() });
        }

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found' });
        }
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
router.post('/', protect, authorize('hod', 'super_admin'), uploadFaculty.single('profilePhoto'), [
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
        const facultyData = { ...req.body };

        if (req.user.role === 'hod') {
            facultyData.department = normalizeDepartment(req.user.department);
        } else if (facultyData.department) {
            facultyData.department = normalizeDepartment(facultyData.department);
        }

        if (req.file) {
            facultyData.profilePhoto = req.file.path || req.file.secure_url || req.file.location;
        }

        // Enforce ONE HOD per department constraint
        if (facultyData.designation === 'HOD' && facultyData.department) {
            const existingHOD = await Faculty.findOne({
                department: facultyData.department,
                designation: 'HOD',
                isActive: true
            });
            if (existingHOD) {
                return res.status(400).json({ message: `An HOD already exists for the ${facultyData.department} department.` });
            }
        }

        // 1. Create Faculty Profile
        const newFaculty = new Faculty(facultyData);
        const savedFaculty = await newFaculty.save();

        // 2. Automatically create User Account (if not exists)
        const userExists = await User.findOne({ email: facultyData.email.toLowerCase() });
        if (!userExists) {
            await User.create({
                name: facultyData.name,
                email: facultyData.email,
                password: 'Faculty@VGEC123', // Default password
                role: mapDesignationToUserRole(facultyData.designation),
                department: facultyData.department,
                designation: facultyData.designation,
                facultyId: savedFaculty._id
            });
        } else {
            userExists.name = facultyData.name;
            userExists.email = facultyData.email.toLowerCase();
            userExists.department = facultyData.department;
            userExists.designation = facultyData.designation;
            userExists.role = mapDesignationToUserRole(facultyData.designation);
            userExists.facultyId = savedFaculty._id;
            await userExists.save();
        }

        res.status(201).json(savedFaculty);
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
router.put('/:id', protect, authorize('faculty', 'hod', 'super_admin'), uploadFaculty.single('profilePhoto'), [
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

        if (req.user.role === 'hod' && !departmentsMatch(existingFaculty.department, req.user.department)) {
            return res.status(403).json({ message: 'Not authorized to update faculty outside your department' });
        }

        const updateData = { ...req.body };

        if (req.user.role === 'faculty') {
            delete updateData.isActive;
            delete updateData.department;
        }

        if (req.user.role === 'hod') {
            updateData.department = normalizeDepartment(req.user.department);
        } else if (updateData.department) {
            updateData.department = normalizeDepartment(updateData.department);
        }

        if (req.file) {
            updateData.profilePhoto = req.file.path || req.file.secure_url || req.file.location;
        }

        // Enforce ONE HOD per department constraint during updates
        const checkDesignation = updateData.designation || existingFaculty.designation;
        const checkDepartment = updateData.department || existingFaculty.department;

        if (checkDesignation === 'HOD' && checkDepartment) {
            const existingHOD = await Faculty.findOne({
                department: checkDepartment,
                designation: 'HOD',
                isActive: true,
                _id: { $ne: req.params.id }
            });
            if (existingHOD) {
                return res.status(400).json({ message: `An HOD already exists for the ${checkDepartment} department.` });
            }
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

        const linkedUser = await User.findOne({
            $or: [
                { facultyId: updated._id },
                { email: existingFaculty.email.toLowerCase() }
            ]
        });

        if (linkedUser) {
            linkedUser.name = updated.name;
            linkedUser.email = updated.email.toLowerCase();
            linkedUser.designation = updated.designation;
            linkedUser.department = updated.department;
            linkedUser.role = mapDesignationToUserRole(updated.designation);
            if (typeof updateData.isActive === 'boolean') {
                linkedUser.isActive = updateData.isActive;
            }
            linkedUser.facultyId = updated._id;
            await linkedUser.save();
        }

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

        if (req.user.role === 'hod' && !departmentsMatch(faculty.department, req.user.department)) {
            return res.status(403).json({ message: 'Not authorized to delete faculty outside your department' });
        }

        await User.deleteOne({ facultyId: faculty._id });
        await faculty.deleteOne();


        // Return success message with the deleted faculty's name
        res.json({ message: `${faculty.name} has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

// POST /api/faculty/initialize — Create own profile if missing
router.post('/initialize', protect, uploadFaculty.single('profilePhoto'), async (req, res) => {
    try {
        const existing = await Faculty.findOne({ email: req.user.email.toLowerCase() });
        if (existing) return res.status(400).json({ message: 'Profile already exists' });
        const facultyData = { ...req.body, email: req.user.email.toLowerCase(), department: req.user.department, isActive: true };
        if (req.file) facultyData.profilePhoto = req.file.path || req.file.secure_url || req.file.location;
        const saved = await new Faculty(facultyData).save();
        await User.findByIdAndUpdate(req.user._id, { facultyId: saved._id });
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Export the router so server.js can use it
module.exports = router;
