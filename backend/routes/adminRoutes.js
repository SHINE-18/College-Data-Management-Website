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

module.exports = router;
