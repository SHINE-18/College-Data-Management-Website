const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    established: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    detailAbout: {
        type: String,
        default: ''
    },
    vision: {
        type: String,
        default: ''
    },
    mission: {
        type: String,
        default: ''
    },
    hod: {
        name: { type: String, default: 'Unassigned' },
        message: { type: String, default: '' }
    },
    achievements: [{
        type: String
    }],
    researchAreas: [{
        title: String,
        faculty: Number,
        projects: Number,
        courses: Number
    }],
    placementStats: [{
        name: String,
        count: Number
    }],
    stats: [{
        val: String,
        label: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    mapCoordinates: {
        points: { type: String, default: '' },       // SVG polygon points string e.g. "100,200,300,200..."
        color: { type: String, default: '' },         // Optional custom highlight colour
        showOnMap: { type: Boolean, default: false }  // Whether to render this dept on the campus map
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
