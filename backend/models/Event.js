// ============================================
// models/Event.js — Event Data Structure
// ============================================

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,       // JavaScript Date object — can store both date and time
        required: true,
    },
    type: {
        type: String,
        enum: ['Conference', 'Workshop', 'Cultural', 'Sports', 'Placement', 'Lecture', 'Competition', 'Other'],
        default: 'Other',
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
        default: 'Computer Engineering',
    },
    venue: {
        type: String,
    },
    // Image URL for event banner/thumbnail
    image: {
        type: String,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// ============================================
// INDEXES — For improved query performance
// ============================================
eventSchema.index({ title: 'text', description: 'text' }); // Text index for search
eventSchema.index({ date: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ department: 1 });
eventSchema.index({ isActive: 1 });
// Compound index for common query patterns
eventSchema.index({ isActive: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);

