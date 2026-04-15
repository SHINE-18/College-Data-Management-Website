// ============================================
// models/Feedback.js — Feedback & Grievance
// ============================================

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['feedback', 'grievance'],
        required: [true, 'Type is required']
    },
    category: {
        type: String,
        enum: ['General', 'Academic', 'Infrastructure', 'Faculty', 'Administration', 'Other'],
        required: [true, 'Category is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    department: {
        type: String,
        default: 'General'
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    adminResponse: {
        type: String,
        trim: true,
        maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});

feedbackSchema.index({ status: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
