// ============================================
// routes/eventRoutes.js — Event API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/events — Get all active events (upcoming first)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({ isActive: true }).sort({ date: 1 });
        // sort by date ascending (1) = upcoming events first
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/events/:id — Get one event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/events — Create a new event
router.post('/', async (req, res) => {
    try {
        const event = new Event(req.body);
        const saved = await event.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// PUT /api/events/:id — Update an event
router.put('/:id', async (req, res) => {
    try {
        const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'Event not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// DELETE /api/events/:id — Delete an event
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: `Event "${deleted.title}" has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

module.exports = router;
