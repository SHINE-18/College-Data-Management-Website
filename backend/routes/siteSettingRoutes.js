// ============================================
// routes/siteSettingRoutes.js — Site Settings API
// ============================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const SiteSetting = require('../models/SiteSetting');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require('../utils/cloudinary');

// GET /api/settings — Get current site settings (public)
router.get('/', async (req, res) => {
    try {
        const settings = await SiteSetting.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/settings/visitor-count — Get public visitor count
router.get('/visitor-count', async (req, res) => {
    try {
        const settings = await SiteSetting.getSettings();
        res.json({ visitorCount: settings.visitorCount || 0 });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/settings/visitor-count — Increment visitor count
router.post('/visitor-count', async (req, res) => {
    try {
        const settings = await SiteSetting.getSettings();
        settings.visitorCount = (settings.visitorCount || 0) + 1;
        await settings.save();

        res.json({ visitorCount: settings.visitorCount });
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

// POST /api/settings/calendar — Upload academic calendar PDF (HOD, Super Admin)
router.post('/calendar', protect, authorize('hod', 'super_admin'), upload.single('calendarPdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file provided.' });
        }

        let settings = await SiteSetting.getSettings();

        // If there's an existing calendar, try to delete it from Cloudinary
        if (settings.academicCalendarPdf) {
            const oldPublicId = getPublicIdFromUrl(settings.academicCalendarPdf);
            if (oldPublicId) {
                await deleteFromCloudinary(oldPublicId, 'raw').catch(console.error);
            }
        }

        // Upload new file to Cloudinary as 'raw' (good for PDFs)
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'academic_calendar', 'raw');

        // Save URL
        settings.academicCalendarPdf = uploadResult.secure_url;
        await settings.save();

        res.json({ message: 'Academic calendar updated', url: uploadResult.secure_url });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

module.exports = router;
