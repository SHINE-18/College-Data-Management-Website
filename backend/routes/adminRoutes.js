// ============================================
// routes/adminRoutes.js — Admin Dashboard Stats API
// ============================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Publication = require('../models/Publication');
const Notice = require('../models/Notice');
const Student = require('../models/Student');
const Event = require('../models/Event');
const { syncGtuCirculars } = require('../services/gtuSyncService');
const { normalizeDepartment } = require('../utils/departmentUtils');

// GET /api/admin/stats — Aggregate dashboard statistics
router.get('/stats', protect, authorize('super_admin'), async (req, res) => {
    try {
        // Count all entities in parallel for performance
        const [
            totalFaculty,
            totalStudents,
            totalPublications,
            activeNotices,
            totalEvents,
            departmentStats
        ] = await Promise.all([
            User.countDocuments({ role: { $in: ['faculty', 'hod'] }, isActive: true }),
            Student.countDocuments({ isActive: true }),
            Publication.countDocuments(),
            Notice.countDocuments({ isActive: true }),
            Event.countDocuments(),
            // Aggregate faculty count by department
            User.aggregate([
                { $match: { role: { $in: ['faculty', 'hod'] }, isActive: true } },
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Format department stats for the chart
        const deptChartData = departmentStats.map(dept => ({
            name: dept._id === 'All' ? 'All' : dept._id
                .split(' ')
                .map(w => w[0])
                .join(''),
            fullName: dept._id,
            faculty: dept.count
        }));

        res.json({
            totalFaculty,
            totalStudents,
            totalPublications,
            activeNotices,
            totalEvents,
            departmentStats: deptChartData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/admin/import-students — Bulk import students from CSV
router.post('/import-students', protect, authorize('super_admin'), async (req, res) => {
    const multer = require('multer');
    const csvParser = require('csv-parser');
    const stream = require('stream');
    const bcrypt = require('bcryptjs');

    // Use memory storage for CSV (no disk needed)
    const upload = multer({ storage: multer.memoryStorage() });

    upload.single('csv')(req, res, async (err) => {
        if (err) return res.status(400).json({ message: 'File upload error', error: err.message });
        if (!req.file) return res.status(400).json({ message: 'CSV file is required' });

        const rows = [];
        const errors = [];
        const created = [];

        try {
            await new Promise((resolve, reject) => {
                const bufferStream = new stream.PassThrough();
                bufferStream.end(req.file.buffer);
                bufferStream.pipe(csvParser())
                    .on('data', (row) => rows.push(row))
                    .on('end', resolve)
                    .on('error', reject);
            });

            const Student = require('../models/Student');
            const User = require('../models/User');

            for (const row of rows) {
                const enrollmentNumber = row.enrollmentNumber || row.enrollmentNo;
                const { name, email, semester, department, batch } = row;
                if (!name || !email || !enrollmentNumber) {
                    errors.push({ row, reason: 'Missing required fields (name, email, enrollmentNumber)' });
                    continue;
                }

                try {
                    const existing = await Student.findOne({
                        $or: [{ email }, { enrollmentNumber }]
                    });
                    if (existing) {
                        errors.push({ row, reason: 'Email or enrollmentNumber already exists' });
                        continue;
                    }

                    const defaultPassword = row.password || `Vgec@${enrollmentNumber}`;
                    const student = await Student.create({
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                        enrollmentNumber: enrollmentNumber.trim(),
                        semester: parseInt(semester) || 1,
                        department: normalizeDepartment(department ? department.trim() : 'Computer Engineering'),
                        batch: batch ? batch.trim() : '2023-2027',
                        password: defaultPassword,
                        isActive: true
                    });
                    created.push({
                        name: student.name,
                        email: student.email,
                        enrollmentNumber: student.enrollmentNumber
                    });
                } catch (rowErr) {
                    errors.push({ row, reason: rowErr.message });
                }
            }

            res.json({
                message: `Import complete: ${created.length} created, ${errors.length} failed`,
                created,
                errors
            });
        } catch (parseError) {
            res.status(400).json({ message: 'CSV parsing failed', error: parseError.message });
        }
    });
});

// POST /api/admin/sync/gtu — Manually pull GTU engineering circulars into notices
router.post('/sync/gtu', protect, authorize('super_admin'), async (req, res) => {
    try {
        const summary = await syncGtuCirculars();
        res.json({
            message: `GTU sync complete. Imported ${summary.imported} notices.`,
            ...summary,
        });
    } catch (error) {
        res.status(500).json({ message: 'GTU sync failed', error: error.message });
    }
});

module.exports = router;
