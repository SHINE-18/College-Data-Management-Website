const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true,
        default: 'All'
    },
    faculty: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    fileUrl: {
        type: String // Optional PDF/Doc attached by faculty
    },
    totalMarks: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
