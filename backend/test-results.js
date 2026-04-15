const mongoose = require('mongoose');
const path = require('path');

// Load environment
require('dotenv').config();

const Result = require('./models/Result');
const Student = require('./models/Student');
const User = require('./models/User');

async function test() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vgec');
        console.log('✓ Connected to MongoDB');

        // Get a test student
        const student = await Student.findOne().limit(1);
        if (!student) {
            console.log('✗ No students found in database');
            process.exit(1);
        }
        console.log('✓ Found student:', student._id);

        // Get a test faculty/user
        const faculty = await User.findOne({ role: 'faculty' }).limit(1);
        if (!faculty) {
            console.log('✗ No faculty found in database');
            process.exit(1);
        }
        console.log('✓ Found faculty:', faculty._id);

        // Try to save a test result
        const testResult = {
            student: student._id,
            subject: 'Test Subject',
            examType: 'Mid-Sem',
            semester: 1,
            marksObtained: 20,
            totalMarks: 30,
            faculty: faculty._id,
            remarks: 'Test'
        };

        console.log('\nAttempting to save:', testResult);

        const result = new Result(testResult);
        await result.save();
        console.log('✓ Result saved successfully');

    } catch (error) {
        console.log('✗ Error:', error.message);
        if (error.errors) {
            console.log('Validation errors:', error.errors);
        }
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

test();
