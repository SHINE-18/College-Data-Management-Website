const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/authMiddleware');
const Syllabus = require('../models/Syllabus');
const Resource = require('../models/Resource');

// Configure Multer for Syllabi
const syllabusStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/syllabi/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'syllabus-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadSyllabus = multer({ storage: syllabusStorage });

// Configure Multer for Resources
const resourceStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/resources/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resource-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadResource = multer({ storage: resourceStorage });

// ── SYLLABUS ROUTES ──

// GET /api/academics/syllabi - Public list
router.get('/syllabi', async (req, res) => {
    try {
        const { semester, search } = req.query;
        let query = { isActive: true };
        if (semester) query.semester = Number(semester);
        if (search) query.courseTitle = new RegExp(search, 'i');

        const syllabi = await Syllabus.find(query).sort('semester courseTitle');
        res.json(syllabi);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/academics/syllabi - Admin/Faculty upload
router.post('/syllabi', protect, authorize('hod', 'super_admin'), uploadSyllabus.single('syllabusFile'), async (req, res) => {
    try {
        const syllabusData = {
            ...req.body,
            syllabusUrl: `/uploads/syllabi/${req.file.filename}`,
            uploadedBy: req.user._id
        };
        const syllabus = new Syllabus(syllabusData);
        await syllabus.save();
        res.status(201).json(syllabus);
    } catch (error) {
        res.status(400).json({ message: 'Upload failed', error: error.message });
    }
});

// ── RESOURCE ROUTES ──

// GET /api/academics/resources - Filtered resources
router.get('/resources', protect, async (req, res) => {
    try {
        const { semester, type, subject } = req.query;
        let query = { isActive: true };
        if (semester) query.semester = Number(semester);
        if (type) query.resourceType = type;
        if (subject) query.subject = new RegExp(subject, 'i');

        const resources = await Resource.find(query).sort('-createdAt');
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/academics/resources - Faculty upload
router.post('/resources', protect, authorize('faculty', 'hod'), uploadResource.single('resourceFile'), async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            uploadedBy: req.user._id
        };

        if (req.file) {
            resourceData.fileUrl = `/uploads/resources/${req.file.filename}`;
        }

        const resource = new Resource(resourceData);
        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        res.status(400).json({ message: 'Upload failed', error: error.message });
    }
});

module.exports = router;
