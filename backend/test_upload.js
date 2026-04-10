const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const mongoose = require('mongoose');

async function testUpload() {
    try {
        const form = new FormData();
        form.append('title', 'Test Script Upload');
        form.append('content', 'Testing multer setup');
        form.append('category', 'General');
        form.append('department', 'CE');
        form.append('attachment', Buffer.from('dummy pdf content'), {
            filename: 'test.pdf',
            contentType: 'application/pdf'
        });

        // We need a dummy student or hod token to post
        // Let's connect to DB to get an admin token
        require('dotenv').config();
        await mongoose.connect(process.env.MONGODB_URI);
        const jwt = require('jsonwebtoken');
        const AdminUser = require('./models/User'); // Or whatever the admin model is
        const admin = await mongoose.connection.collection('users').findOne({ role: 'super_admin' });
        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const res = await axios.post('http://localhost:5000/api/notices', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Upload Success!", res.data);
    } catch (e) {
        fs.writeFileSync('error.json', JSON.stringify(e.response ? e.response.data : { message: e.message }, null, 2));
    } finally {
        process.exit();
    }
}
testUpload();
