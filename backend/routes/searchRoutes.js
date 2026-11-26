const literalSearch = require('../utils/search');
// ============================================
// routes/searchRoutes.js — Global Search API
// ============================================

const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Syllabus = require('../models/Syllabus');

// GET /api/search?q=keyword — Search across multiple collections
router.get('/', async (req, res, next) => {
    try {
        const { q, dept } = req.query;
        if (typeof q !== 'string' || q.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const regex = literalSearch(q.trim());
        const deptFilter = dept ? { department: dept } : {};

        const [faculty, notices, events, syllabi] = await Promise.all([
            Faculty.find({
                isActive: true,
                ...deptFilter,
                $or: [{ name: regex }, { designation: regex }, { specialization: regex }]
            }).select('name designation profilePhoto department').limit(5),

            Notice.find({
                isActive: true,
                ...deptFilter,
                $or: [{ title: regex }, { content: regex }]
            }).select('title category department createdAt').limit(5),

            Event.find({
                isActive: true,
                ...deptFilter,
                $or: [{ title: regex }, { description: regex }]
            }).select('title date venue department').limit(5),

            Syllabus.find({
                isActive: true,
                ...deptFilter,
                $or: [{ courseTitle: regex }, { subjectCode: regex }]
            }).select('courseTitle subjectCode semester department').limit(5),
        ]);

        res.json({
            query: q,
            results: {
                faculty: faculty.map(f => ({
                    _id: f._id,
                    title: f.name,
                    subtitle: f.designation,
                    department: f.department,
                    type: 'faculty',
                    link: `/faculty/${f._id}`,
                    image: f.profilePhoto
                })),
                notices: notices.map(n => ({
                    _id: n._id,
                    title: n.title,
                    subtitle: n.category,
                    department: n.department,
                    type: 'notice',
                    link: '/notices',
                    date: n.createdAt
                })),
                events: events.map(e => ({
                    _id: e._id,
                    title: e.title,
                    subtitle: e.venue,
                    department: e.department,
                    type: 'event',
                    link: '/events',
                    date: e.date
                })),
                syllabi: syllabi.map(s => ({
                    _id: s._id,
                    title: s.courseTitle,
                    subtitle: `${s.subjectCode} · Sem ${s.semester}`,
                    department: s.department,
                    type: 'syllabus',
                    link: '/syllabi'
                })),
            },
            total: faculty.length + notices.length + events.length + syllabi.length
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
