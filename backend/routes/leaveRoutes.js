// ============================================
// routes/leaveRoutes.js — Leave Application API Endpoints
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    buildDepartmentMatch,
    departmentsMatch,
    normalizeDepartment,
} = require('../utils/departmentUtils');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// GET /api/leaves - Get all leaves (with filters)
router.get('/', protect, async (req, res) => {
    try {
        const { status, department, startDate, endDate } = req.query;
        let query = {};

        // Faculty can only see their own leaves
        if (req.user.role === 'faculty') {
            query.facultyId = req.user.facultyId || req.user._id;
        }
        // HOD can see leaves from their department
        else if (req.user.role === 'hod') {
            query.department = buildDepartmentMatch(req.user.department);
        }
        // Admin can see all
        else if (req.user.role === 'super_admin') {
            if (department) query.department = buildDepartmentMatch(department);
        }

        if (status) query.status = status;

        if (startDate) query.startDate = { $gte: new Date(startDate) };
        if (endDate) query.endDate = { $lte: new Date(endDate) };

        const leaves = await Leave.find(query).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/leaves/pending - Get pending leaves for HOD approval
router.get('/pending', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const query = { status: 'Pending' };
        
        if (req.user.role === 'hod') {
            query.department = req.user.department;
        }

        const leaves = await Leave.find(query).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/leaves - Apply for leave
router.post('/', [
    protect,
    authorize('faculty', 'hod'),
    body('leaveType').isIn(['Casual Leave', 'Sick Leave', 'Earned Leave', 'Medical Emergency', 'Other']).withMessage('Invalid leave type'),
    body('startDate').isISO8601().withMessage('Start date is required'),
    body('endDate').isISO8601().withMessage('End date is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
    validate
], async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = new Leave({
            facultyId: req.user.facultyId || req.user._id,
            facultyName: req.user.name,
            department: normalizeDepartment(req.user.department),
            leaveType,
            startDate: start,
            endDate: end,
            totalDays,
            reason
        });

        await leave.save();
        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/leaves/:id/approve - Approve leave (HOD only)
router.put('/:id/approve', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const { remarks } = req.body;
        
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Leave is not pending' });
        }

        if (req.user.role === 'hod' && !departmentsMatch(leave.department, req.user.department)) {
            return res.status(403).json({ message: 'Not authorized to approve leave outside your department' });
        }

        leave.status = 'Approved';
        leave.approvedBy = req.user.name;
        leave.approvedDate = new Date();
        if (remarks) leave.remarks = remarks;

        await leave.save();
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/leaves/:id/reject - Reject leave (HOD only)
router.put('/:id/reject', protect, authorize('hod', 'super_admin'), async (req, res) => {
    try {
        const { remarks } = req.body;
        
        if (!remarks) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }
        
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Leave is not pending' });
        }

        if (req.user.role === 'hod' && !departmentsMatch(leave.department, req.user.department)) {
            return res.status(403).json({ message: 'Not authorized to reject leave outside your department' });
        }

        leave.status = 'Rejected';
        leave.approvedBy = req.user.name;
        leave.approvedDate = new Date();
        leave.remarks = remarks;

        await leave.save();
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/leaves/:id - Delete/cancel leave
router.delete('/:id', protect, async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        // Only the applicant or admin can delete
        const requesterFacultyId = (req.user.facultyId || req.user._id).toString();

        if (leave.facultyId.toString() !== requesterFacultyId && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Can only delete pending leaves
        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only delete pending leaves' });
        }

        await leave.deleteOne();
        res.json({ message: 'Leave deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

