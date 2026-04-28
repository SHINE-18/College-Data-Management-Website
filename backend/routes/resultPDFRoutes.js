const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadResult } = require('../middleware/upload');
const ResultPDF = require('../models/ResultPDF');
const cloudinary = require('../config/cloudinary');

// ──────────────────────────────────────────────────────────
// POST /api/faculty/result-pdfs — Upload a result PDF
// ──────────────────────────────────────────────────────────
router.post(
    '/result-pdfs',
    protect,
    authorize('faculty', 'hod', 'admin'),
    uploadResult.single('resultPdf'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'PDF file is required' });
            }

            const { title, description, semester, examType, academicYear } = req.body;
            if (!title || !semester || !examType || !academicYear) {
                return res.status(400).json({ message: 'Title, semester, exam type, and academic year are required' });
            }

            const pdfUrl = req.file.path || req.file.secure_url || req.file.location;
            const cloudinaryPublicId = req.file.filename || req.file.public_id || '';

            const resultPDF = new ResultPDF({
                title: title.trim(),
                description: (description || '').trim(),
                semester: Number(semester),
                examType,
                academicYear: academicYear.trim(),
                department: req.user.department || 'CE',
                pdfUrl,
                cloudinaryPublicId,
                uploadedBy: req.user._id
            });

            await resultPDF.save();
            await resultPDF.populate('uploadedBy', 'name');

            res.status(201).json({ message: 'Result PDF uploaded successfully', resultPDF });
        } catch (error) {
            console.error('Result PDF upload error:', error);
            res.status(500).json({ message: 'Failed to upload result PDF', error: error.message });
        }
    }
);

// ──────────────────────────────────────────────────────────
// GET /api/faculty/result-pdfs — List all result PDFs uploaded by this faculty
// ──────────────────────────────────────────────────────────
router.get('/result-pdfs', protect, authorize('faculty', 'hod', 'admin'), async (req, res) => {
    try {
        const filter = {};

        // Admin sees all; faculty sees their own department
        if (req.user.role !== 'admin') {
            filter.department = req.user.department || 'CE';
        }

        const pdfs = await ResultPDF.find(filter)
            .populate('uploadedBy', 'name')
            .sort('-createdAt');

        res.json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch result PDFs', error: error.message });
    }
});

// ──────────────────────────────────────────────────────────
// DELETE /api/faculty/result-pdfs/:id — Delete a result PDF
// ──────────────────────────────────────────────────────────
router.delete('/result-pdfs/:id', protect, authorize('faculty', 'hod', 'admin'), async (req, res) => {
    try {
        const pdf = await ResultPDF.findById(req.params.id);
        if (!pdf) return res.status(404).json({ message: 'Result PDF not found' });

        // Only uploader or admin can delete
        if (
            req.user.role !== 'admin' &&
            pdf.uploadedBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorised to delete this PDF' });
        }

        // Remove from Cloudinary
        if (pdf.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(pdf.cloudinaryPublicId, { resource_type: 'raw' });
            } catch (e) {
                console.warn('Cloudinary delete failed (continuing):', e.message);
            }
        }

        await pdf.deleteOne();
        res.json({ message: 'Result PDF deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete result PDF', error: error.message });
    }
});

module.exports = router;
