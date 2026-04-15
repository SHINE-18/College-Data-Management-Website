const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const { uploadAssignment } = require('../middleware/upload');
const { buildDepartmentMatch, normalizeDepartment } = require('../utils/departmentUtils');

// GET /api/faculty/students?semester=X - Fetch students for marking
router.get('/students', protect, authorize('faculty', 'hod'), async (req, res) => {
    try {
        const { semester } = req.query;
        if (!semester) return res.status(400).json({ message: 'Semester is required' });

        const query = {
            semester: Number(semester),
            isActive: true
        };

        if (req.user.department) {
            query.department = buildDepartmentMatch(req.user.department);
        }

        const students = await Student.find(query).select('name enrollmentNumber semester department');

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/faculty/attendance - Batch attendance
router.post('/attendance', protect, authorize('faculty', 'hod'), async (req, res) => {
    try {
        const { records } = req.body;
        if (!Array.isArray(records)) return res.status(400).json({ message: 'Invalid records' });

        // Add faculty ID to each record
        const attendanceWithFaculty = records.map(r => ({ ...r, faculty: req.user._id }));

        await Attendance.insertMany(attendanceWithFaculty);
        res.status(201).json({ message: 'Attendance records saved successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to save attendance', error: error.message });
    }
});

// POST /api/faculty/results - Batch results
router.post('/results', protect, authorize('faculty', 'hod'), async (req, res) => {
    try {
        const { records } = req.body;
        
        // Debug: Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        // Ensure we have a valid faculty ID (as ObjectId)
        const facultyId = req.user._id;
        if (!facultyId || !mongoose.Types.ObjectId.isValid(facultyId)) {
            console.error('Invalid Faculty ID:', facultyId);
            return res.status(401).json({ message: 'Invalid faculty ID in user data' });
        }

        if (!Array.isArray(records)) {
            return res.status(400).json({ message: 'Invalid records format' });
        }
        
        if (records.length === 0) {
            return res.status(400).json({ message: 'No records to save' });
        }

        // Validate each record
        const errors = [];
        records.forEach((record, idx) => {
            if (!record.student) errors.push(`Record ${idx}: Missing student ID`);
            if (!record.subject || typeof record.subject !== 'string') errors.push(`Record ${idx}: Invalid subject`);
            if (!record.examType || !['Mid-Sem', 'Final', 'Practical', 'Internal', 'Viva'].includes(record.examType)) {
                errors.push(`Record ${idx}: Invalid exam type`);
            }
            if (record.marksObtained === undefined || record.marksObtained === null) {
                errors.push(`Record ${idx}: Missing marks obtained`);
            }
            if (!record.totalMarks || record.totalMarks <= 0) {
                errors.push(`Record ${idx}: Invalid total marks`);
            }
            if (isNaN(record.marksObtained)) {
                errors.push(`Record ${idx}: Marks must be a number`);
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed',
                error: errors.join('; ')
            });
        }

        // Add faculty ID to each record - ensure all fields are properly typed
        const resultsWithFaculty = records.map(r => {
            return {
                student: new mongoose.Types.ObjectId(r.student),
                subject: String(r.subject).trim(),
                examType: String(r.examType).trim(),
                semester: Number(r.semester),
                marksObtained: Number(r.marksObtained),
                totalMarks: Number(r.totalMarks),
                remarks: r.remarks ? String(r.remarks).trim() : '',
                faculty: facultyId  // Use the already-validated facultyId
            };
        });

        // Use upsert to handle duplicate results (update if exists, insert if not)
        const bulkOps = resultsWithFaculty.map(record => ({
            updateOne: {
                filter: {
                    student: record.student,
                    subject: record.subject,
                    examType: record.examType
                },
                update: { $set: record },
                upsert: true
            }
        }));

        const result = await Result.bulkWrite(bulkOps);
        res.status(201).json({ 
            message: `${records.length} results saved successfully`,
            modified: result.modifiedCount,
            inserted: result.upsertedCount,
            total: records.length
        });
    } catch (error) {
        console.error('Result save error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            errmsg: error.errmsg
        });
        
        let errorMsg = error.message;
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            errorMsg = 'This student already has a result for this subject and exam type. Results have been updated.';
        }
        
        res.status(400).json({ 
            message: 'Failed to save results', 
            error: errorMsg
        });
    }
});

// POST /api/faculty/assignments - Create assignment
router.post('/assignments', protect, authorize('faculty', 'hod'), uploadAssignment.single('assignmentFile'), async (req, res) => {
    try {
        const assignmentData = {
            ...req.body,
            faculty: req.user._id,
            department: normalizeDepartment(req.user.department || 'All')
        };

        if (req.file) {
            assignmentData.fileUrl = req.file.path || req.file.secure_url || req.file.location;
        }

        const assignment = new Assignment(assignmentData);
        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create assignment', error: error.message });
    }
});

module.exports = router;
