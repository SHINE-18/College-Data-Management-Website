// ============================================
// models/Placement.js — Placement Statistics
// ============================================

const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [2000, 'Year must be 2000 or later']
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    package: {
        type: Number,
        required: [true, 'Package (LPA) is required'],
        min: [0, 'Package must be non-negative']
    },
    studentsPlaced: {
        type: Number,
        required: [true, 'Number of students placed is required'],
        min: [1, 'Must be at least 1']
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
            'Information and Communication Technology',
            'All'
        ]
    },
    type: {
        type: String,
        enum: ['on-campus', 'off-campus'],
        default: 'on-campus'
    },
    logoUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

placementSchema.index({ year: -1 });
placementSchema.index({ department: 1 });

module.exports = mongoose.model('Placement', placementSchema);
