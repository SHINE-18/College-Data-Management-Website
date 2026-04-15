const mongoose = require('mongoose');
const { normalizeDepartment } = require('../utils/departmentUtils');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    resourceType: {
        type: String,
        enum: ['PPT', 'Notes', 'Video', 'Link', 'Other'],
        required: true
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
        set: normalizeDepartment
    },
    fileUrl: {
        type: String // Required if type is NOT 'Link'
    },
    externalLink: {
        type: String // Required if type IS 'Link'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
