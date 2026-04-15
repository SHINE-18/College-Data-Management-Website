// ============================================
// importComputerEngineeringFaculty.js
// Import faculty from JSON file to database
// Run: node importComputerEngineeringFaculty.js
// ============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Faculty = require('./models/Faculty');

dotenv.config();

const DEFAULT_PASSWORD = 'Vgec@2026'; // Default password - faculty should change this on first login

const importFaculty = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Read JSON file with faculty data
        const filePath = path.join(__dirname, '../vgecg-2026-04-10(Computer Engineering).json');
        const facultyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`\n📋 Found ${facultyData.length} faculty members to import\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const faculty of facultyData) {
            try {
                const name = faculty['card-title'];
                const designation = faculty['card-text'];
                const qualification = faculty['card-text (2)'];
                const email = faculty['card-text (3)'];
                const imageUrl = faculty['rounded-circle src'];

                // Validate required fields
                if (!name || !email) {
                    console.log(`⚠️ Skipping: Missing name or email for entry`);
                    errorCount++;
                    continue;
                }

                // Check if user already exists
                const existingUser = await User.findOne({ email: email.toLowerCase() });
                const existingFaculty = await Faculty.findOne({ email: email.toLowerCase() });
                
                if (existingUser || existingFaculty) {
                    console.log(`⏭️ Skipping ${name} - Already exists`);
                    successCount++; // Count as success since already there
                    continue;
                }

                // Create User account
                const user = await User.create({
                    name: name,
                    email: email.toLowerCase(),
                    password: DEFAULT_PASSWORD,
                    role: 'faculty',
                    department: 'Computer Engineering',
                    designation: designation
                });

                // Create Faculty profile
                const facultyProfile = await Faculty.create({
                    name: name,
                    designation: designation,
                    department: 'Computer Engineering',
                    email: email.toLowerCase(),
                    qualification: qualification,
                    profilePhoto: imageUrl,
                    isActive: true
                });

                console.log(`✅ Added: ${name} (${email})`);
                successCount++;

            } catch (error) {
                console.log(`❌ Error adding ${faculty['card-title']}: ${error.message}`);
                errorCount++;
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 Import Summary:`);
        console.log(`✅ Successfully added: ${successCount} faculty members`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`${'='.repeat(60)}\n`);

        console.log(`🔐 Default Password: ${DEFAULT_PASSWORD}`);
        console.log(`⚠️  Faculty members should change password on first login!\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Fatal Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

importFaculty();
