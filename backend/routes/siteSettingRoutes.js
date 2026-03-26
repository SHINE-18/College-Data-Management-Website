// ============================================
// routes/siteSettingRoutes.js — Site Settings API
// ============================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const SiteSetting = require('../models/SiteSetting');

// GET /api/settings — Get current site settings (public)
router.get('/', async (req, res) => {
    try {
        const settings = await SiteSetting.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/settings — Update site settings (super_admin only)
router.put('/', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { collegeName, email, phone, address, website } = req.body;

        let settings = await SiteSetting.getSettings();

        if (collegeName !== undefined) settings.collegeName = collegeName;
        if (email !== undefined) settings.email = email;
        if (phone !== undefined) settings.phone = phone;
        if (address !== undefined) settings.address = address;
        if (website !== undefined) settings.website = website;

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
