// ============================================
// models/Timetable.js — Timetable Data Structure
// ============================================

const mongoose = require('mongoose');
const { normalizeDepartment } = require('../utils/departmentUtils');

const timetableSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Timetable title is required'],
        trim: true,
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: [
            'Chemical Engineering',
            'Computer Engineering',
            'Civil Engineering',
            'Electrical Engineering',
            'Electronics & Communication Engineering',
            'Information Technology',
            'Instrumentation & Control Engineering',
            'Mechanical Engineering',
            'Power Electronics Engineering',
            'Computer Science and Engineering (Data Science)',
            'Electronics And Instrumentation Engineering',
            'Information and Communication Technology'
        ],
        set: normalizeDepartment,
    },
    semester: {
        type: Number,
        required: [true, 'Semester is required'],
        min: 1,
        max: 8,
    },
    division: {
        type: String,
        required: [true, 'Division is required'],
        trim: true,
    },
    // PDF file URL (stored after upload)
    pdfUrl: {
        type: String,
        required: [true, 'PDF file is required'],
    },
    uploadedBy: {
        type: String,
        required: true,
    },
    // isActive lets HOD hide/show timetables without deleting them
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
// timestamps: true → MongoDB automatically tracks createdAt & updatedAt

// ============================================
// INDEXES — For improved query performance
// ============================================
timetableSchema.index({ department: 1, semester: 1, division: 1 });
timetableSchema.index({ isActive: 1 });
timetableSchema.index({ uploadedBy: 1 });
timetableSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Timetable', timetableSchema);

