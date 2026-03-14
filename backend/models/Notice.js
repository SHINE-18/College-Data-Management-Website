// ============================================
// models/Notice.js — Notice Data Structure
// ============================================

const mongoose = require('mongoose');

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
        default: 'All',
    },
    postedBy: {
        type: String,
        required: true,
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
// Compound index for common query patterns
noticeSchema.index({ isActive: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
