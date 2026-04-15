// ============================================
// routes/placementRoutes.js — Placement Statistics API
// ============================================

const express = require('express');
const router = express.Router();
const Placement = require('../models/Placement');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// GET /api/placements — Public, filterable by year and department
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.year) filter.year = Number(req.query.year);
        if (req.query.department) filter.department = req.query.department;
        if (req.query.type) filter.type = req.query.type;

        const placements = await Placement.find(filter).sort({ year: -1, studentsPlaced: -1 });
        res.json(placements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/placements/summary — Aggregated stats
router.get('/summary', async (req, res) => {
    try {
        const year = req.query.year ? Number(req.query.year) : null;
        const matchStage = year ? { $match: { year } } : { $match: {} };

        const stats = await Placement.aggregate([
            matchStage,
            {
                $group: {
                    _id: null,
                    totalPlaced: { $sum: '$studentsPlaced' },
                    avgPackage: { $avg: '$package' },
                    highestPackage: { $max: '$package' },
                    totalCompanies: { $sum: 1 }
                }
            }
        ]);

        const perYear = await Placement.aggregate([
            { $group: { _id: '$year', studentsPlaced: { $sum: '$studentsPlaced' }, companies: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            summary: stats[0] || { totalPlaced: 0, avgPackage: 0, highestPackage: 0, totalCompanies: 0 },
            perYear
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/placements — Admin / HOD only
router.post('/', [
    protect,
    authorize('super_admin', 'hod'),
    body('year').isInt({ min: 2000 }).withMessage('Valid year required'),
    body('companyName').trim().notEmpty().withMessage('Company name required'),
    body('package').isFloat({ min: 0 }).withMessage('Package (LPA) required'),
    body('studentsPlaced').isInt({ min: 1 }).withMessage('Students placed must be at least 1'),
    body('department').notEmpty().withMessage('Department required'),
    validate
], async (req, res) => {
    try {
        const placement = await Placement.create(req.body);
        res.status(201).json(placement);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/placements/:id — Admin only
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const placement = await Placement.findByIdAndDelete(req.params.id);
        if (!placement) return res.status(404).json({ message: 'Placement not found' });
        res.json({ message: 'Placement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
