// ============================================
// models/Qualification.js — Faculty Qualifications Data Structure
// ============================================

const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    degree: {
        type: String,
        required: true,
        trim: true
    },
    fieldOfStudy: {
        type: String,
        required: true,
        trim: true
    },
    institution: {
        type: String,
        required: true,
        trim: true
    },
    university: {
        type: String,
        trim: true
    },
    startYear: {
        type: Number
    },
    endYear: {
        type: Number
    },
    grade: {
        type: String,
        trim: true
    },
    degreeType: {
        type: String,
        enum: ['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate', 'Other'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    certificateUrl: {
        type: String
    }
}, { timestamps: true });

// ============================================
// INDEXES — For improved query performance
// ============================================
qualificationSchema.index({ facultyId: 1 });
qualificationSchema.index({ degreeType: 1 });
qualificationSchema.index({ fieldOfStudy: 1 });
qualificationSchema.index({ institution: 1 });
qualificationSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Qualification', qualificationSchema);

