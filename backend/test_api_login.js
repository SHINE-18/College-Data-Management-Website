const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('Testing student login...');
        const response = await axios.post('http://localhost:5000/api/student-auth/login', {
            enrollmentNumber: '210280107001',
            password: 'Password@123'
        });

        console.log('✅ Login Successful!');
        console.log('User:', response.data.name);
        console.log('Token:', response.data.token ? 'Received' : 'Missing');
    } catch (error) {
        console.error('❌ Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
};

testLogin();
