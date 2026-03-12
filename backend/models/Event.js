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
        default: 'Computer Engineering',
    },
    venue: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
