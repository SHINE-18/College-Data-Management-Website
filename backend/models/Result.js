const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
        required: true
    },
    examType: {
        type: String, // Mid-sem, Final, Internal, Practical
        required: true,
        enum: ['Mid-Sem', 'Final', 'Practical', 'Internal', 'Viva']
    },
    semester: {
        type: Number,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    marksObtained: {
        type: Number,
        required: true,
        min: 0
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 1
    },
    faculty: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true // Faculty who uploaded the result
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

// Student gets one result per subject per exam type
resultSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
