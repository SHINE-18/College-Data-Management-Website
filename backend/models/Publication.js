// ============================================
// models/Publication.js — Faculty Publications Data Structure
// ============================================

const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    facultyName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    authors: [{
        type: String,
        trim: true
    }],
    journalName: {
        type: String,
        trim: true
    },
    conferenceName: {
        type: String,
        trim: true
    },
    publicationType: {
        type: String,
        required: true,
        enum: ['Journal', 'Conference', 'Book Chapter', 'Book', 'Patent']
    },
    publicationDate: {
        type: Date
    },
    volume: {
        type: String
    },
    issue: {
        type: String
    },
    pages: {
        type: String
    },
    doi: {
        type: String,
        trim: true
    },
    publisher: {
        type: String,
        trim: true
    },
    impactFactor: {
        type: Number
    },
    isIndexed: {
        type: Boolean,
        default: false
    },
    indexingDetails: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// ============================================
// INDEXES — For improved query performance
// ============================================
publicationSchema.index({ facultyId: 1 });
publicationSchema.index({ publicationType: 1 });
publicationSchema.index({ publicationDate: -1 });
publicationSchema.index({ title: 'text', journalName: 'text', conferenceName: 'text' });
publicationSchema.index({ isIndexed: 1 });

module.exports = mongoose.model('Publication', publicationSchema);

