// ============================================
// routes/qualificationRoutes.js — Qualifications API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Qualification = require('../models/Qualification');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    resolveFacultyProfileId,
    syncQualificationSummary,
} = require('../utils/facultyDataSync');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// GET /api/qualifications - Get all qualifications (with filters)
router.get('/', async (req, res) => {
    try {
        const { facultyId, degreeType } = req.query;
        let query = {};

        if (facultyId) query.facultyId = facultyId;
        if (degreeType) query.degreeType = degreeType;

        const qualifications = await Qualification.find(query).sort({ endYear: -1 });
        res.json(qualifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/qualifications/faculty/:id - Get qualifications by faculty
router.get('/faculty/:id', async (req, res) => {
    try {
        const qualifications = await Qualification.find({ facultyId: req.params.id }).sort({ endYear: -1 });
        res.json(qualifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/qualifications - Add qualification
router.post('/', [
    protect,
    authorize('faculty', 'hod'),
    body('degree').trim().notEmpty().withMessage('Degree is required'),
    body('fieldOfStudy').trim().notEmpty().withMessage('Field of study is required'),
    body('institution').trim().notEmpty().withMessage('Institution is required'),
    body('degreeType').isIn(['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate', 'Other']).withMessage('Invalid degree type'),
    validate
], async (req, res) => {
    try {
        const facultyId = await resolveFacultyProfileId(req.user);
        if (!facultyId) {
            return res.status(400).json({ message: 'Faculty profile not found for this user' });
        }

        const qualification = new Qualification({
            ...req.body,
            facultyId
        });

        await qualification.save();
        await syncQualificationSummary(facultyId);
        res.status(201).json(qualification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/qualifications/:id - Update qualification
router.put('/:id', protect, authorize('faculty', 'hod', 'super_admin'), async (req, res) => {
    try {
        const qualification = await Qualification.findById(req.params.id);
        
        if (!qualification) {
            return res.status(404).json({ message: 'Qualification not found' });
        }

        // Only the owner or admin can update
        if (qualification.facultyId.toString() !== (req.user.facultyId || req.user._id).toString() 
            && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(qualification, req.body);
        await qualification.save();
        await syncQualificationSummary(qualification.facultyId);
        res.json(qualification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/qualifications/:id/verify - Verify qualification (admin only)
router.put('/:id/verify', protect, authorize('super_admin'), async (req, res) => {
    try {
        const qualification = await Qualification.findById(req.params.id);
        
        if (!qualification) {
            return res.status(404).json({ message: 'Qualification not found' });
        }

        qualification.isVerified = true;
        await qualification.save();
        res.json(qualification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/qualifications/:id - Delete qualification
router.delete('/:id', protect, authorize('faculty', 'hod', 'super_admin'), async (req, res) => {
    try {
        const qualification = await Qualification.findById(req.params.id);
        
        if (!qualification) {
            return res.status(404).json({ message: 'Qualification not found' });
        }

        // Only the owner or admin can delete
        if (qualification.facultyId.toString() !== (req.user.facultyId || req.user._id).toString() 
            && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const facultyId = qualification.facultyId;
        await qualification.deleteOne();
        await syncQualificationSummary(facultyId);
        res.json({ message: 'Qualification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

