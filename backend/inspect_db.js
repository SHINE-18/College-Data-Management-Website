const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');

dotenv.config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const student = await Student.findOne({ enrollmentNumber: '210280107001' }).select('+password');

        if (student) {
            console.log('Student found:');
            console.log(JSON.stringify(student, null, 2));
            console.log('enrollmentNumber type:', typeof student.enrollmentNumber);
        } else {
            console.log('Student not found with enrollmentNumber: 210280107001');
            const all = await Student.find().limit(5);
            console.log('Available students:', all.map(s => s.enrollmentNumber));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspect();
