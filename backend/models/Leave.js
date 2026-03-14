// ============================================
// models/Leave.js — Leave Application Data Structure
// ============================================

const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    facultyName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true,
        enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT']
    },
    leaveType: {
        type: String,
        required: true,
        enum: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Medical Emergency', 'Other']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: String,
        default: null
    },
    approvedDate: {
        type: Date,
        default: null
    },
    remarks: {
        type: String,
        default: null
    }
}, { timestamps: true });

// ============================================
// INDEXES — For improved query performance
// ============================================
leaveSchema.index({ facultyId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ department: 1 });
leaveSchema.index({ startDate: -1 });
leaveSchema.index({ createdAt: -1 });
// Compound index for common query patterns
leaveSchema.index({ status: 1, department: 1 });

module.exports = mongoose.model('Leave', leaveSchema);

