const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Faculty = require('./models/Faculty');

dotenv.config();

const activateHOD = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'kajalpatel@vgecg.ac.in';
        const result = await Faculty.updateOne(
            { email: email },
            { $set: { isActive: true } }
        );
        console.log(`Updated faculty: ${JSON.stringify(result)}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

activateHOD();
