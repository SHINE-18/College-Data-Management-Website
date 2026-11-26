const assert = require('node:assert/strict');
const { describe, it, before, after, afterEach } = require('node:test');
const request = require('supertest');
const mongoose = require('mongoose');
const { connect, close, clear } = require('./setup');
process.env.NODE_ENV = 'test';
const app = require('../server');
const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

describe('Student Portal & Attendance Integration', () => {
    before(async () => {
        await connect();
        process.env.JWT_SECRET = 'testsecret';
    });
    after(async () => await close());
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

        assert.equal(res.status, 201);
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

        assert.equal(res.status, 200);
        assert.ok(res.body.length > 0);
    });

    it('limits attendance writes to the authenticated faculty department', async () => {
        const faculty = await User.create({ name: 'Faculty', email: 'faculty@example.test', password: 'password123', department: 'CE' });
        const student = await Student.create({ name: 'Student', email: 'student@example.edu', enrollmentNumber: 'EN042',
            semester: 1, batch: '2025', department: 'IT', password: 'password123' });
        await request(app).post('/api/faculty/attendance').set('Authorization', 'Bearer ' + getAuthToken(faculty._id))
            .send({ records: [{ student: student._id, semester: 1, subject: 'Math', status: 'Present' }] }).expect(403);
        assert.equal(await Attendance.countDocuments(), 0);
    });

    it('delivers new result PDFs through signed links scoped to eligible students', async (t) => {
        const { Writable } = require('node:stream');
        const cloud = require('../config/cloudinary');
        cloud.config({ cloud_name: 'qa-only', api_key: 'test-key', api_secret: 'test-secret' });
        t.mock.method(cloud.uploader, 'upload_stream', (options, callback) => {
            assert.equal(options.resource_type, 'raw');
            assert.equal(options.type, 'authenticated');
            return new Writable({
                write(chunk, encoding, done) { done(); },
                final(done) {
                    callback(null, { secure_url: 'https://example.test/raw/authenticated/result.pdf',
                        public_id: 'vgec/results/test.pdf', bytes: 12 });
                    done();
                },
            });
        });
        const faculty = await User.create({ name: 'Staff', email: 'pdf@example.edu', password: 'password123', department: 'CE' });
        await request(app).post('/api/faculty/result-pdfs').set('Authorization', 'Bearer ' + getAuthToken(faculty._id))
            .field('title', 'Test results').field('semester', '3').field('examType', 'Final').field('academicYear', '2025')
            .attach('resultPdf', Buffer.from('%PDF-1.4 test'), 'result.pdf').expect(201);

        const student = await Student.create({ name: 'Student', email: 'file@example.edu', enrollmentNumber: 'EN043',
            semester: 3, batch: '2025', department: 'CE', password: 'password123' });
        const list = () => request(app).get('/api/student/result-pdfs').set('Authorization', 'Bearer ' + getAuthToken(student._id));
        const { body } = await list().expect(200);
        assert.equal(body.length, 1);
        const url = new URL(body[0].pdfUrl);
        assert.equal(url.searchParams.get('public_id'), 'vgec/results/test.pdf');
        assert.equal(url.searchParams.get('type'), 'authenticated');
        assert.ok(url.searchParams.get('signature'));
        const remaining = Number(url.searchParams.get('expires_at')) - Date.now() / 1000;
        assert.ok(remaining > 890 && remaining <= 900);
        student.department = 'IT';
        await student.save();
        assert.deepEqual((await list().expect(200)).body, []);
        await request(app).get('/api/student/result-pdfs').expect(401);
    });
});
