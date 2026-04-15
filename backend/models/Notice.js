// ============================================
// models/Notice.js — Notice Data Structure
// ============================================

const mongoose = require('mongoose');
const { normalizeDepartment } = require('../utils/departmentUtils');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Notice title is required'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Notice content is required'],
    },
    category: {
        type: String,
        enum: ['General', 'Exam', 'Admission', 'Events', 'Placement', 'Other'],
        default: 'General',
    },
    department: {
        type: String,
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
            'Information and Communication Technology',
            'All'
        ],
        default: 'All',
        set: normalizeDepartment,
    },
    postedBy: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        enum: ['Internal', 'GTU'],
        default: 'Internal',
    },
    sourceUrl: {
        type: String,
        default: null,
    },
    sourcePage: {
        type: String,
        default: null,
    },
    externalId: {
        type: String,
        default: null,
    },
    publishedAt: {
        type: Date,
        default: Date.now,
    },
    // attachment URL (if any PDF/file is attached)
    attachment: {
        type: String,  // Will store the file URL
        default: null,
    },
    // isActive lets HOD hide/show notices without deleting them
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
// timestamps: true → MongoDB automatically tracks createdAt & updatedAt

// ============================================
// INDEXES — For improved query performance
// ============================================
noticeSchema.index({ title: 'text', content: 'text' }); // Text index for search
noticeSchema.index({ category: 1 });
noticeSchema.index({ department: 1 });
noticeSchema.index({ isActive: 1 });
noticeSchema.index({ createdAt: -1 });
noticeSchema.index({ publishedAt: -1 });
noticeSchema.index({ source: 1, publishedAt: -1 });
noticeSchema.index({ externalId: 1 }, { unique: true, sparse: true });
// Compound index for common query patterns
noticeSchema.index({ isActive: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
