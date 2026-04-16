const express = require('express');
const router = express.Router();
const { protect, authorize, protectBoth } = require('../middleware/authMiddleware');
const Syllabus = require('../models/Syllabus');
const Resource = require('../models/Resource');
const { uploadSyllabus, uploadResource } = require('../middleware/upload');

// ── SYLLABUS ROUTES ──

// GET /api/academics/syllabi - Accessible to both users and students
router.get('/syllabi', async (req, res) => {
    try {
        const { semester, search, department } = req.query;
        let query = { isActive: true };
        if (semester) query.semester = Number(semester);
        if (search) query.courseTitle = new RegExp(search, 'i');
        if (department) query.department = department;

        const syllabi = await Syllabus.find(query).sort('semester courseTitle');
        res.json(syllabi);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/academics/syllabi - Admin/Faculty upload
router.post('/syllabi', protect, authorize('faculty', 'hod', 'super_admin'), uploadSyllabus.single('syllabusFile'), async (req, res) => {
    try {
        const syllabusData = {
            ...req.body,
            syllabusUrl: req.file ? (req.file.path || req.file.secure_url || req.file.location) : null,
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

// GET /api/academics/resources - Filtered resources (accessible to both users and students)
router.get('/resources', protectBoth, async (req, res) => {
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
router.post('/resources', protect, authorize('faculty', 'hod', 'super_admin'), uploadResource.single('resourceFile'), async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            uploadedBy: req.user._id
        };

        if (req.file) {
            resourceData.fileUrl = req.file.path || req.file.secure_url || req.file.location;
        }

        const resource = new Resource(resourceData);
        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        res.status(400).json({ message: 'Upload failed', error: error.message });
    }
});

module.exports = router;
