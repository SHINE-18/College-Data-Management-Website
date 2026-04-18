const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true });
        res.json({ success: true, count: departments.length, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @desc    Get a single department by code or name
// @route   GET /api/departments/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { code, name } = req.query;
        let query = { isActive: true };

        if (code) {
            query.code = new RegExp(`^${code}$`, 'i');
        } else if (name) {
            query.name = new RegExp(`^${name}$`, 'i');
        } else {
            return res.status(400).json({ success: false, message: 'Please provide a code or name parameter' });
        }

        const department = await Department.findOne(query);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/SuperAdmin
router.post('/', protect, authorize('super_admin'), async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/SuperAdmin
router.put('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        // Flatten nested objects so partial updates (e.g. only mapCoordinates.showOnMap)
        // don't wipe sibling fields.
        const updatePayload = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                for (const [subKey, subVal] of Object.entries(value)) {
                    updatePayload[`${key}.${subKey}`] = subVal;
                }
            } else {
                updatePayload[key] = value;
            }
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { $set: updatePayload },
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Delete a department (Soft delete by setting isActive to false)
// @route   DELETE /api/departments/:id
// @access  Private/SuperAdmin
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        // Soft delete
        department.isActive = false;
        await department.save();

        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
