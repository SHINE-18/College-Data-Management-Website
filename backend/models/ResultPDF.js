const mongoose = require('mongoose');

const resultPDFSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    examType: {
        type: String,
        required: true,
        enum: ['Mid-Sem', 'Final', 'Practical', 'Internal', 'Viva', 'University']
    },
    academicYear: {
        type: String,
        required: true,
        trim: true  // e.g. "2024-25"
    },
    department: {
        type: String,
        required: true,
        default: 'CE'
    },
    pdfUrl: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String,
        default: ''
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ResultPDF', resultPDFSchema);
