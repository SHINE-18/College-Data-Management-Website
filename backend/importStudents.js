// ============================================
// importStudents.js — Bulk import students from CSV
// Run this: node importStudents.js <path_to_csv>
// ============================================

const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Student = require('./models/Student');

dotenv.config();

const importCSV = async (filePath) => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 2. Setup File Reading
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let isFirstLine = true;
        let count = 0;
        let errors = 0;

        console.log('🚀 Starting import...');

        for await (const line of rl) {
            // Skip the header
            if (isFirstLine) {
                isFirstLine = false;
                continue;
            }

            // Simple CSV parsing: enrollmentNumber,name,email,password,semester,department,batch
            const [enrollmentNumber, name, email, password, semester, department, batch] = line.split(',').map(s => s.trim());

            if (!enrollmentNumber || !email) continue;

            try {
                // Check if student already exists
                const existing = await Student.findOne({ enrollmentNumber });
                if (existing) {
                    console.log(`⚠️ Skipping ${enrollmentNumber}: Already exists`);
                    continue;
                }

                await Student.create({
                    enrollmentNumber,
                    name,
                    email,
                    password: password || 'VGEC@12345', // Use provided password or default
                    semester: parseInt(semester) || 1,
                    department,
                    batch
                });
                count++;
                console.log(`✅ Imported: ${enrollmentNumber} (${name})`);
            } catch (err) {
                errors++;
                console.error(`❌ Error importing ${enrollmentNumber}:`, err.message);
            }
        }

        console.log(`\n🎉 Import Complete!`);
        console.log(`📊 Total Successful: ${count}`);
        console.log(`📊 Total Failed:     ${errors}`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Critical Error:', error.message);
        process.exit(1);
    }
};

// Get file path from command line arguments
const csvPath = process.argv[2];

if (!csvPath) {
    console.log('Please provide the path to your CSV file.');
    console.log('Usage: node importStudents.js student_data.csv');
    process.exit(1);
}

importCSV(csvPath);
