const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    enrollmentNumber: {
        type: String,
        required: [true, 'Please add an enrollment number'],
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    semester: {
        type: Number,
        required: [true, 'Please add a semester'],
        min: 1,
        max: 8
    },
    department: {
        type: String,
        required: [true, 'Please add a department'],
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
        ]
    },
    batch: {
        type: String, // e.g. "2023-2027"
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
studentSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
studentSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
