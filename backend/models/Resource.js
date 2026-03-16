const mongoose = require('mongoose');

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
        default: 'Computer Engineering'
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
