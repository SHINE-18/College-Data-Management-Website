// ============================================
// routes/noticeRoutes.js — Notice API Endpoints
// ============================================
// Same pattern as Faculty routes: GET, POST, PUT, DELETE

const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');

// GET /api/notices — Get all notices (newest first)
router.get('/', async (req, res) => {
    try {
        // { isActive: true } = only get notices that haven't been hidden
        // .sort({ createdAt: -1 }) = newest first (-1 = descending)
        const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/notices/:id — Get one notice
router.get('/:id', async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/notices — Create a new notice
router.post('/', async (req, res) => {
    try {
        const notice = new Notice(req.body);
        const saved = await notice.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// PUT /api/notices/:id — Update a notice
router.put('/:id', async (req, res) => {
    try {
        const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Notice not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// DELETE /api/notices/:id — Delete a notice
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Notice.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Notice not found' });
        res.json({ message: `Notice "${deleted.title}" has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

module.exports = router;
