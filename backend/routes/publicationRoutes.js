// ============================================
// routes/publicationRoutes.js — Publications API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Publication = require('../models/Publication');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    resolveFacultyProfileId,
    syncPublicationSummary,
} = require('../utils/facultyDataSync');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// GET /api/publications - Get all publications (with filters)
router.get('/', async (req, res) => {
    try {
        const { facultyId, publicationType, isIndexed } = req.query;
        let query = {};

        if (facultyId) query.facultyId = facultyId;
        if (publicationType) query.publicationType = publicationType;
        if (isIndexed !== undefined) query.isIndexed = isIndexed === 'true';

        const publications = await Publication.find(query).sort({ publicationDate: -1 });
        res.json(publications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/publications/faculty/:id - Get publications by faculty
router.get('/faculty/:id', async (req, res) => {
    try {
        const publications = await Publication.find({ facultyId: req.params.id }).sort({ publicationDate: -1 });
        res.json(publications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/publications - Add publication
router.post('/', [
    protect,
    authorize('faculty', 'hod'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('publicationType').isIn(['Journal', 'Conference', 'Book Chapter', 'Book', 'Patent']).withMessage('Invalid publication type'),
    validate
], async (req, res) => {
    try {
        const facultyId = await resolveFacultyProfileId(req.user);
        if (!facultyId) {
            return res.status(400).json({ message: 'Faculty profile not found for this user' });
        }

        const publication = new Publication({
            ...req.body,
            facultyId,
            facultyName: req.user.name
        });

        await publication.save();
        await syncPublicationSummary(facultyId);
        res.status(201).json(publication);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/publications/:id - Update publication
router.put('/:id', protect, authorize('faculty', 'hod', 'super_admin'), async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id);
        
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        // Only the owner or admin can update
        if (publication.facultyId.toString() !== (req.user.facultyId || req.user._id).toString() 
            && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(publication, req.body);
        await publication.save();
        await syncPublicationSummary(publication.facultyId);
        res.json(publication);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/publications/:id - Delete publication
router.delete('/:id', protect, authorize('faculty', 'hod', 'super_admin'), async (req, res) => {
    try {
        const publication = await Publication.findById(req.params.id);
        
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        // Only the owner or admin can delete
        if (publication.facultyId.toString() !== (req.user.facultyId || req.user._id).toString() 
            && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const facultyId = publication.facultyId;
        await publication.deleteOne();
        await syncPublicationSummary(facultyId);
        res.json({ message: 'Publication deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

