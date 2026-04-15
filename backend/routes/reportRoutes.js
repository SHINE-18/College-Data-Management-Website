// ============================================
// routes/reportRoutes.js — HOD Analytics Reports
// ============================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { buildDepartmentMatch, departmentsMatch } = require('../utils/departmentUtils');

// All report routes are HOD-only
const hodOnly = [protect, authorize('hod', 'super_admin')];

// GET /api/reports/attendance?department=&semester=
router.get('/attendance', hodOnly, async (req, res) => {
    try {
        const { department, semester } = req.query;
        const filter = {};
        if (semester) filter.semester = Number(semester);

        const records = await Attendance.find(filter)
            .populate('student', 'name enrollmentNumber department')
            .sort({ subject: 1 });

        const filteredRecords = department
            ? records.filter(record => record.student && departmentsMatch(record.student.department, department))
            : records;

        // Group by subject and calculate attendance %
        const bySubject = {};
        for (const record of filteredRecords) {
            if (!bySubject[record.subject]) {
                bySubject[record.subject] = { attended: 0, total: 0, students: new Set() };
            }

            bySubject[record.subject].total += 1;
            if (record.status !== 'Absent') {
                bySubject[record.subject].attended += 1;
            }
            if (record.student?._id) {
                bySubject[record.subject].students.add(record.student._id.toString());
            }
        }

        const summary = Object.entries(bySubject).map(([subject, data]) => ({
            subject,
            attended: data.attended,
            total: data.total,
            percentage: data.total > 0 ? parseFloat(((data.attended / data.total) * 100).toFixed(1)) : 0,
            studentCount: data.students.size
        }));

        res.json({ department, semester, summary });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/reports/results?department=&semester=
router.get('/results', hodOnly, async (req, res) => {
    try {
        const { department, semester } = req.query;
        const filter = {};
        if (semester) filter.semester = Number(semester);

        const results = await Result.find(filter)
            .populate('student', 'name enrollmentNumber department');

        const filteredResults = department
            ? results.filter(result => result.student && departmentsMatch(result.student.department, department))
            : results;

        // Group by subject and calculate average marks
        const bySubject = {};
        for (const result of filteredResults) {
            const subjectName = result.subject || 'Unknown';
            if (!bySubject[subjectName]) {
                bySubject[subjectName] = { marks: [], totalMarks: result.totalMarks || 100 };
            }
            if (result.marksObtained !== undefined) {
                bySubject[subjectName].marks.push(Number(result.marksObtained));
            }
        }

        const summary = Object.entries(bySubject).map(([subject, data]) => {
            const avg = data.marks.length > 0
                ? parseFloat((data.marks.reduce((a, b) => a + b, 0) / data.marks.length).toFixed(1))
                : 0;
            const highest = data.marks.length > 0 ? Math.max(...data.marks) : 0;
            const passed = data.marks.filter(m => m >= (data.totalMarks * 0.35)).length;
            return { subject, avgMarks: avg, highestMarks: highest, studentCount: data.marks.length, passed, passRate: data.marks.length > 0 ? parseFloat(((passed / data.marks.length) * 100).toFixed(1)) : 0 };
        });

        res.json({ department, semester, summary });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/reports/faculty-workload?department=
router.get('/faculty-workload', hodOnly, async (req, res) => {
    try {
        const { department } = req.query;
        const filter = department ? { department: buildDepartmentMatch(department) } : {};

        const faculties = await Faculty.find(filter)
            .select('name designation department')
            .sort({ name: 1 });

        const facultyIds = faculties.map(faculty => faculty._id);
        const users = await User.find({ facultyId: { $in: facultyIds } })
            .select('_id facultyId role');
        const facultyUserMap = new Map(users.map(user => [String(user.facultyId), String(user._id)]));
        const userIds = users.map(user => user._id);

        const [attendanceRecords, resultRecords] = await Promise.all([
            Attendance.find({ faculty: { $in: userIds } }).select('faculty subject date'),
            Result.find({ faculty: { $in: userIds } }).select('faculty subject')
        ]);

        const workloadByUser = new Map();
        userIds.forEach(userId => {
            workloadByUser.set(String(userId), {
                subjects: new Set(),
                sessions: new Set()
            });
        });

        attendanceRecords.forEach(record => {
            const userId = String(record.faculty);
            if (!workloadByUser.has(userId)) {
                workloadByUser.set(userId, { subjects: new Set(), sessions: new Set() });
            }

            workloadByUser.get(userId).subjects.add(record.subject);
            const dateKey = record.date instanceof Date
                ? record.date.toISOString().split('T')[0]
                : String(record.date);
            workloadByUser.get(userId).sessions.add(`${record.subject}|${dateKey}`);
        });

        resultRecords.forEach(record => {
            const userId = String(record.faculty);
            if (!workloadByUser.has(userId)) {
                workloadByUser.set(userId, { subjects: new Set(), sessions: new Set() });
            }

            workloadByUser.get(userId).subjects.add(record.subject);
        });

        const summary = faculties.map(f => ({
            _id: f._id,
            name: f.name,
            designation: f.designation,
            department: f.department,
            totalHours: facultyUserMap.has(String(f._id))
                ? workloadByUser.get(facultyUserMap.get(String(f._id)))?.sessions.size || 0
                : 0,
            subjects: facultyUserMap.has(String(f._id))
                ? workloadByUser.get(facultyUserMap.get(String(f._id)))?.subjects.size || 0
                : 0,
        }));

        res.json({ department, summary });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
