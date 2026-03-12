// ============================================
// models/Faculty.js — Faculty Data Structure
// ============================================
// This defines WHAT a faculty record looks like in the database.
// Think of it as a form template with predefined fields.

const mongoose = require('mongoose');

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
        enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Lecturer'],
        // enum = only these values are allowed (like a dropdown)
    },
    department: {
        type: String,
        default: 'Computer Engineering',
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

    // This automatically adds "createdAt" and "updatedAt" timestamps
}, { timestamps: true });

// mongoose.model() creates a "collection" (table) called "faculties" in MongoDB
// The first argument 'Faculty' becomes the collection name (lowercased + pluralized)
module.exports = mongoose.model('Faculty', facultySchema);
