const request = require('supertest');
const mongoose = require('mongoose');
const { connect, close, clear } = require('./setup');
const app = require('../server');
const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

describe('Student Portal & Attendance Integration', () => {
    beforeAll(async () => {
        await connect();
        process.env.JWT_SECRET = 'testsecret';
    });
    afterAll(async () => await close());
    afterEach(async () => await clear());

    const getAuthToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    };

    it('should allow faculty to mark attendance', async () => {
        const faculty = await User.create({ name: 'Faculty', email: 'f4@test.com', password: 'password123', role: 'faculty', department: 'CSE' });
        const student = await Student.create({
            name: 'Student',
            email: 's4@test.com',
            password: 'password123',
            enrollmentNumber: 'EN005',
            department: 'CSE',
            semester: 1,
            batch: '2022'
        });
        const token = getAuthToken(faculty._id);

        const res = await request(app)
            .post('/api/faculty/attendance')
            .set('Authorization', `Bearer ${token}`)
            .send({
                records: [
                    {
                        student: student._id,
                        subject: 'SUB001',
                        status: 'Present',
                        semester: 1,
                        date: new Date().toISOString()
                    }
                ]
            });

        expect(res.status).toBe(201);
    });

    it('should allow student to view their attendance', async () => {
        const studentProfile = await Student.create({
            name: 'Student Viewer',
            email: 'sv2@test.com',
            password: 'password123',
            enrollmentNumber: 'EN006',
            department: 'CSE',
            semester: 1,
            batch: '2022'
        });

        // Mock some attendance data
        await Attendance.create({
            date: new Date(),
            subject: 'Test Subject',
            status: 'Present',
            student: studentProfile._id,
            faculty: new mongoose.Types.ObjectId(),
            semester: 1
        });

        // Use studentProfile._id for token (as per protectStudent middleware)
        const token = getAuthToken(studentProfile._id);

        const res = await request(app)
            .get('/api/student/attendance')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });
});
