require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Notice = require('./models/Notice');
    const fs = require('fs');
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(3);
    fs.writeFileSync('output.json', JSON.stringify(notices, null, 2));
    process.exit(0);
});
