const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
        required: true
    },
    fileUrl: {
        type: String, // Path to the uploaded PDF, Zip, or Doc
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    marksAwarded: {
        type: Number
    },
    facultyFeedback: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending Review', 'Graded', 'Returned'],
        default: 'Pending Review'
    }
}, {
    timestamps: true
});

// A student can only submit once per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
