const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { privateDocumentUrl, discardRejectedUpload } = require('../utils/cloudinary');
const Student = require('../models/Student');
const { uploadSubmission } = require('../middleware/upload');
const { getDepartmentAliases } = require('../utils/departmentUtils');

// Sub-routes for the logged in student

// GET /api/student/dashboard - Aggregate summary
router.get('/dashboard', protectStudent, async (req, res, next) => {
    try {
        const studentId = req.student._id;

        const attendanceRecords = await Attendance.find({ student: studentId });
        const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
        const totalClasses = attendanceRecords.length;
        const attendancePercentage = totalClasses === 0 ? 100 : Math.round((presentCount / totalClasses) * 100);

        const assignmentsPending = await Assignment.countDocuments({
            semester: req.student.semester,
            department: { $in: [...getDepartmentAliases(req.student.department), 'All'] },
            _id: { $nin: await Submission.distinct('assignment', { student: studentId }) }
        });

        res.json({
            attendancePercentage,
            assignmentsPending,
            totalClasses
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/student/attendance - Detailed attendance
router.get('/attendance', protectStudent, async (req, res, next) => {
    try {
        const records = await Attendance.find({ student: req.student._id }).sort('-date');
        res.json(records);
    } catch (error) {
        next(error);
    }
});

// GET /api/student/results - All results (legacy marks-based)
router.get('/results', protectStudent, async (req, res, next) => {
    try {
        const results = await Result.find({ student: req.student._id }).sort('-createdAt');
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// GET /api/student/result-pdfs - Result PDFs for student's semester & department
router.get('/result-pdfs', protectStudent, async (req, res, next) => {
    try {
        const ResultPDF = require('../models/ResultPDF');
        const semester = req.query.semester ? Number(req.query.semester) : { $lte: req.student.semester };
        if (req.query.semester && (!Number.isInteger(semester) || semester < 1 || semester > req.student.semester)) {
            return res.status(400).json({ message: 'Choose a current or previous semester' });
        }
        const deptAliases = getDepartmentAliases(req.student.department);

        const pdfs = await ResultPDF.find({
            semester,
            department: { $in: deptAliases }
        })
            .populate('uploadedBy', 'name')
            .sort('-createdAt');

        res.json(pdfs.map(pdf => pdf.forDownload()));
    } catch (error) {
        next(error);
    }
});

// GET /api/student/assignments - Fetch assignments for student's semester
router.get('/assignments', protectStudent, async (req, res, next) => {
    try {
        const studentId = req.student._id;
        const studentSemester = req.student.semester;

        const assignments = await Assignment.find({
            semester: studentSemester,
            department: { $in: [...getDepartmentAliases(req.student.department), 'All'] }
        }).sort('-dueDate').lean();

        const submissions = await Submission.find({ student: studentId });
        const submittedMap = new Set(submissions.map(s => s.assignment.toString()));

        const assignmentsWithStatus = assignments.map(a => ({
            ...a,
            isSubmitted: submittedMap.has(a._id.toString())
        }));

        res.json(assignmentsWithStatus);
    } catch (error) {
        next(error);
    }
});

// POST /api/student/submissions - Upload submission
router.post('/submissions', protectStudent, uploadSubmission.single('submissionFile'), async (req, res, next) => {
    try {
        const { assignmentId } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Submission file is required' });
        if (!require('mongoose').isObjectIdOrHexString(assignmentId)) {
            await discardRejectedUpload(req.file);
            return res.status(400).json({ message: 'A valid assignment ID is required' });
        }

        const eligible = await Assignment.exists({ _id: assignmentId, semester: req.student.semester,
            department: { $in: [...getDepartmentAliases(req.student.department), 'All'] } });
        if (!eligible) {
            await discardRejectedUpload(req.file);
            return res.status(404).json({ message: 'Assignment unavailable' });
        }
        const submission = new Submission({
            assignment: assignmentId,
            student: req.student._id,
            fileUrl: req.file.path,
            cloudinaryPublicId: req.file.filename,
            submittedAt: new Date()
        });

        await submission.save();
        res.status(201).json({ ...submission.toObject(), fileUrl: privateDocumentUrl(submission.cloudinaryPublicId) });
    } catch (error) {
        if (error.code === 11000 || error.name === 'ValidationError') {
            await discardRejectedUpload(req.file);
            return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000
                ? 'Assignment already submitted' : 'Invalid submission' });
        }
        next(error);
    }
});

// PATCH /api/student/profile — Edit student profile
router.patch('/profile', protectStudent, async (req, res, next) => {
    try {
        const { phone, address, guardianName, guardianContact } = req.body;
        const student = await Student.findById(req.student._id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        if (phone !== undefined) student.phone = phone;
        if (address !== undefined) student.address = address;
        if (guardianName !== undefined) student.guardianName = guardianName;
        if (guardianContact !== undefined) student.guardianContact = guardianContact;

        const updated = await student.save();
        res.json({ message: 'Profile updated successfully', student: updated });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
