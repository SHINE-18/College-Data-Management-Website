// ============================================
// routes/facultyRoutes.js — Faculty API Endpoints
// ============================================
// This file defines ALL the URLs related to faculty.
// Each route calls a specific function to handle the request.

const express = require('express');
const router = express.Router();
// Router is like a mini-app that handles a group of related routes

// Import the Faculty model (our data structure)
const Faculty = require('../models/Faculty');

// ────────────────────────────────────────────
// GET /api/faculty — Get ALL faculty members
// ────────────────────────────────────────────
// When React calls: fetch('http://localhost:5000/api/faculty')
router.get('/', async (req, res) => {
    try {
        // Faculty.find() asks MongoDB: "Give me ALL documents in the faculties collection"
        // .sort({ name: 1 }) sorts alphabetically by name (1 = A→Z, -1 = Z→A)
        const faculty = await Faculty.find().sort({ name: 1 });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        // 500 = Internal Server Error (something broke on our end)
    }
});

// ────────────────────────────────────────────
// GET /api/faculty/:id — Get ONE faculty by ID
// ────────────────────────────────────────────
// :id is a URL parameter — it changes for each faculty
// Example: /api/faculty/abc123 → req.params.id = "abc123"
router.get('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        // findById looks for a document with that specific MongoDB _id

        if (!faculty) {
            // 404 = Not Found (no faculty with that ID exists)
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ────────────────────────────────────────────
// POST /api/faculty — CREATE a new faculty
// ────────────────────────────────────────────
// POST = sending data TO the server (like submitting a form)
// The data comes in req.body (parsed by express.json() middleware)
router.post('/', async (req, res) => {
    try {
        // req.body contains the JSON data sent by the frontend
        // Example: { name: "Dr. Patel", designation: "Professor", email: "..." }
        const newFaculty = new Faculty(req.body);

        // .save() inserts the document into MongoDB
        const saved = await newFaculty.save();

        // 201 = Created (successfully created a new resource)
        res.status(201).json(saved);
    } catch (error) {
        // 400 = Bad Request (client sent invalid data, like missing required field)
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// ────────────────────────────────────────────
// PUT /api/faculty/:id — UPDATE a faculty
// ────────────────────────────────────────────
// PUT = replacing/updating existing data
router.put('/:id', async (req, res) => {
    try {
        // findByIdAndUpdate does 3 things:
        // 1. Finds the document by ID
        // 2. Updates it with req.body data
        // 3. { new: true } returns the UPDATED document (not the old one)
        // { runValidators: true } checks that new data follows schema rules
        const updated = await Faculty.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

// ────────────────────────────────────────────
// DELETE /api/faculty/:id — DELETE a faculty
// ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Faculty.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        // Return success message with the deleted faculty's name
        res.json({ message: `${deleted.name} has been removed` });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed', error: error.message });
    }
});

// Export the router so server.js can use it
module.exports = router;
