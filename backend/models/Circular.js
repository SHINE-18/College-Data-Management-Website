// ============================================
// models/Circular.js — HOD Circulars Data Structure
// ============================================

const mongoose = require('mongoose');

const circularSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true,
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
        ]
    },
    priority: {
        type: String,
        enum: ['Normal', 'Important', 'Urgent'],
        default: 'Normal'
    },
    circularType: {
        type: String,
        required: true,
        enum: ['General', 'Academic', 'Exam', 'Event', 'Administrative', 'Other']
    },
    targetAudience: {
        type: String,
        enum: ['Faculty', 'Students', 'All'],
        default: 'All'
    },
    attachmentUrl: {
        type: String
    },
    attachmentName: {
        type: String
    },
    expiryDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// ============================================
// INDEXES — For improved query performance
// ============================================
circularSchema.index({ department: 1 });
circularSchema.index({ circularType: 1 });
circularSchema.index({ priority: 1 });
circularSchema.index({ targetAudience: 1 });
circularSchema.index({ isActive: 1 });
circularSchema.index({ expiryDate: 1 });
circularSchema.index({ createdAt: -1 });
circularSchema.index({ title: 'text', description: 'text' });
// Compound index for common query patterns
circularSchema.index({ isActive: 1, department: 1, createdAt: -1 });

module.exports = mongoose.model('Circular', circularSchema);

