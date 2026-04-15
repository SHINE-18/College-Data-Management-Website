// ============================================
// models/Faculty.js — Faculty Data Structure
// ============================================
// This defines WHAT a faculty record looks like in the database.
// Think of it as a form template with predefined fields.

const mongoose = require('mongoose');
const { normalizeDepartment } = require('../utils/departmentUtils');

// mongoose.Schema() defines the structure
// Each field has a TYPE (String, Number, etc.) and RULES (required, default, etc.)
const facultySchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Faculty name is required'],  // Can't be empty
        trim: true,   // Removes extra spaces: "  Dr. Patel  " → "Dr. Patel"
    },
    designation: {
        type: String,
        required: true,
        enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Lecturer', 'Computer Operator', 'Lab Assistant'],
        // enum = only these values are allowed (like a dropdown)
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
            'Information and Communication Technology'
        ],
        default: 'Computer Engineering',
        set: normalizeDepartment,
    },
    email: {
        type: String,
        required: true,
        unique: true,  // No two faculty can have the same email
        lowercase: true, // Automatically converts to lowercase
    },
    phone: {
        type: String,
    },
    qualification: {
        type: String,   // e.g., "M.E., Ph.D."
    },
    specialization: {
        type: String,   // e.g., "Machine Learning & AI"
    },
    experience: {
        type: String,   // e.g., "15+ Years"
    },
    joiningDate: {
        type: Date,
        default: null,
    },
    // Profile photo URL
    profilePhoto: {
        type: String,
        default: null,
    },
    // Research/interests
    researchInterests: {
        type: String,
    },
    bio: {
        type: String,
    },
    // Academic & Professional Arrays
    qualifications: [{
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: String, required: true },
    }],
    publications: [{
        title: { type: String, required: true },
        journal: { type: String, required: true },
        year: { type: String, required: true },
        link: { type: String },
    }],
    achievements: [{
        title: { type: String, required: true },
        description: { type: String },
        date: { type: String },
    }],
    // Publications count (can be updated automatically)
    publicationsCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // This automatically adds "createdAt" and "updatedAt" timestamps
}, { timestamps: true });

// ============================================
// INDEXES — For improved query performance
// ============================================
facultySchema.index({ name: 1 });

facultySchema.index({ designation: 1 });
facultySchema.index({ department: 1 });
facultySchema.index({ isActive: 1 });
facultySchema.index({ specialization: 1 });
// Compound index for common query pattern
facultySchema.index({ department: 1, designation: 1 });

// mongoose.model() creates a "collection" (table) called "faculties" in MongoDB
// The first argument 'Faculty' becomes the collection name (lowercased + pluralized)
module.exports = mongoose.model('Faculty', facultySchema);

