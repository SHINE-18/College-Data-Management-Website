const assert = require('node:assert/strict');
const { describe, it, before, after, afterEach } = require('node:test');
const request = require('supertest');
const { connect, close, clear } = require('./setup');

process.env.NODE_ENV = 'test';
const app = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Administrative Hierarchy Integration', () => {
    before(async () => {
        await connect();
        process.env.JWT_SECRET = 'testsecret';
    });
    after(async () => await close());
    afterEach(async () => await clear());

    const getAuthToken = (user) => {
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    };

    it('should allow Super Admin to register an HOD', async () => {
        const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'super_admin' });
        const token = getAuthToken(admin);

        const res = await request(app)
            .post('/api/auth/register')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'HOD CSE',
                email: 'hod.cse@test.com',
                password: 'password123',
                role: 'hod',
                department: 'CSE'
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.role, 'hod');
    });

    it('should NOT allow Super Admin to register a Faculty directly', async () => {
        const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'super_admin' });
        const token = getAuthToken(admin);

        const res = await request(app)
            .post('/api/auth/register')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Faculty Direct',
                email: 'faculty.direct@test.com',
                password: 'password123',
                role: 'faculty',
                department: 'CSE'
            });

        assert.equal(res.status, 403);
        assert.match(res.body.message, /only register.*HOD/i);
    });

    it('should allow HOD to register a Faculty member', async () => {
        const hod = await User.create({ name: 'HOD', email: 'hod@test.com', password: 'password123', role: 'hod', department: 'CSE' });
        const token = getAuthToken(hod);

        const res = await request(app)
            .post('/api/auth/register')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'New Faculty',
                email: 'new.faculty@test.com',
                password: 'password123',
                role: 'faculty',
                department: 'CSE'
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.role, 'faculty');
    });

    it('should NOT allow HOD to register another HOD', async () => {
        const hod = await User.create({ name: 'HOD', email: 'hod@test.com', password: 'password123', role: 'hod', department: 'CSE' });
        const token = getAuthToken(hod);

        const res = await request(app)
            .post('/api/auth/register')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Rival HOD',
                email: 'rival.hod@test.com',
                password: 'password123',
                role: 'hod',
                department: 'IT'
            });

        assert.equal(res.status, 403);
    });

    it('keeps department assignment under administrator control', async () => {
        const hod = await User.create({ name: 'HOD', email: 'hod@example.test', password: 'password123', role: 'hod', department: 'CE' });
        const res = await request(app).put('/api/auth/profile').set('Authorization', 'Bearer ' + getAuthToken(hod))
            .send({ department: 'Information Technology' });
        assert.equal(res.status, 403);
        assert.equal((await User.findById(hod._id)).department, 'Computer Engineering');
    });

    it('serves database readiness and missing API paths as uncached JSON', async () => {
        await request(app).get('/api/health').expect('Cache-Control', /no-store/).expect(200, { status: 'ready' });
        await request(app).get('/api/missing').expect('Content-Type', /json/).expect(404);
    });

    it('checks the configured origin before accepting credentialed requests', async () => {
        await request(app).options('/api/auth/login').set('Origin', 'https://unlisted.example.test').expect(403);
        await request(app).options('/api/auth/login').set('Origin', 'http://localhost:5173')
            .expect('Access-Control-Allow-Origin', 'http://localhost:5173')
            .expect('Access-Control-Allow-Credentials', 'true').expect(204);
    });

    it('returns only row identifiers and reasons for rejected import rows', async () => {
        const admin = await User.create({ name: 'Admin', email: 'import@example.test', password: 'password123', role: 'super_admin' });
        const csv = Buffer.from('name,email,enrollmentNumber,password\n,student@example.test,EN101,test-only\n');
        const res = await request(app).post('/api/admin/import-students').set('Authorization', 'Bearer ' + getAuthToken(admin))
            .attach('csv', csv, 'example.csv').expect(200);
        assert.equal(res.body.errors.length, 1);
        assert.deepEqual(res.body.errors[0].row, { email: 'student@example.test', enrollmentNumber: 'EN101' });
        assert.ok(!res.text.includes('test-only'));
    });

    it('uses a password reset once and revokes the previous access and refresh tokens', async (t) => {
        const user = await User.create({ name: 'Staff', email: 'reset@example.edu', password: 'initial-test-password', role: 'faculty' });
        const agent = request.agent(app);
        const login = await agent.post('/api/auth/login').send({ email: user.email, password: 'initial-test-password' }).expect(200);
        let resetPath;
        t.mock.method(require('../utils/emailService'), 'sendEmail', async ({ to, html }) => {
            assert.equal(to, user.email);
            const url = html.match(/href="([^"]+\/reset-password\/[a-f0-9]+)"/)[1];
            resetPath = '/api/auth' + new URL(url).pathname;
        });
        await agent.post('/api/auth/forgot-password').send({ email: user.email }).expect(200);
        const results = await Promise.all([1, 2].map(() => request(app).post(resetPath)
            .send({ password: 'new-test-password' })));
        assert.deepEqual(results.map(r => r.status).sort(), [200, 400]);
        await agent.get('/api/auth/me').set('Authorization', 'Bearer ' + login.body.token).expect(401);
        await agent.post('/api/auth/refresh').expect(401);
        await agent.post('/api/auth/login').send({ email: user.email, password: 'new-test-password' }).expect(200);
    });
});
