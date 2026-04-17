const mongoose = require('mongoose');
const Faculty = require('./backend/models/Faculty');
const User = require('./backend/models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const HOD_DATA = [
    { name: "Prof. Chhaya Zala", designation: "HOD", department: "Information Technology", email: "chhayazala@vgecg.ac.in" },
    { name: "Prof. N. S. Patel", designation: "HOD", department: "Electronics & Communication Engineering", email: "nspatel@vgecg.ac.in" },
    { name: "Prof. S. N. Vora", designation: "HOD", department: "Electrical Engineering", email: "snvora@vgecg.ac.in" },
    { name: "Prof. R. B. Jadeja", designation: "HOD", department: "Mechanical Engineering", email: "rbjadeja@vgecg.ac.in" },
    { name: "Prof. J. K. Thaker", designation: "HOD", department: "Civil Engineering", email: "jkthaker@vgecg.ac.in" },
    { name: "Prof. K. R. Gurjar", designation: "HOD", department: "Chemical Engineering", email: "krgurjar@vgecg.ac.in" },
    { name: "Prof. P. S. Shah", designation: "HOD", department: "Instrumentation & Control Engineering", email: "psshah@vgecg.ac.in" }
];

async function seedHODs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const data of HOD_DATA) {
            // Check if faculty already exists
            let faculty = await Faculty.findOne({ email: data.email });
            if (!faculty) {
                faculty = await Faculty.create(data);
                console.log(`Created faculty: ${data.name}`);
            }

            // Check if user already exists
            let user = await User.findOne({ email: data.email });
            const password = 'HOD@VGEC123';
            if (!user) {
                user = await User.create({
                    ...data,
                    password,
                    role: 'hod',
                    facultyId: faculty._id
                });
                console.log(`Created user: ${data.email} with password: ${password}`);
            } else {
                user.facultyId = faculty._id;
                user.role = 'hod';
                await user.save();
                console.log(`Updated user: ${data.email}`);
            }
        }

        console.log('HOD Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedHODs();
