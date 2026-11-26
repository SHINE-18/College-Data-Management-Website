const { after, before, it } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const mongoose = require('mongoose');
const request = require('supertest');
const { connect, close } = require('./setup');
const { readImports, inspectDatabase } = require('../scripts/releaseInventory');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'inventory-test-only';
const app = require('../server');
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

before(connect);
after(close);

it('matches a duplicate import to one working student login and inventories file metadata', async t => {
    const dir = await mkdtemp(path.join(tmpdir(), 'vgec-inventory-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const file = path.join(dir, 'synthetic.csv');
    const row = 'EN101,Example Student,student@example.edu,test-password,2,CE,2025';
    await writeFile(file, ['enrollmentNumber,name,email,password,semester,department,batch', row, row].join('\n'));
    const imports = await readImports([file]);
    assert.equal(imports.rows, 2);
    assert.deepEqual([...imports.enrollmentNumbers], ['EN101']);
    assert.deepEqual([...imports.emails], ['student@example.edu']);

    const admin = await User.create({ role: 'super_admin', email: 'admin@example.edu', name: 'Admin', password: 'test-password' });
    const imported = await request(app).post('/api/admin/import-students').set('Authorization', 'Bearer ' + generateToken(admin))
        .attach('csv', file).expect(200);
    assert.equal(imported.body.created.length, 1);
    assert.equal(imported.body.errors.length, 1);
    assert.match(imported.body.errors[0].reason, /already exists/);
    const login = await request(app).post('/api/student-auth/login')
        .send({ enrollmentNumber: 'EN101', password: 'test-password' }).expect(200);
    await request(app).get('/api/student-auth/me').set('Authorization', 'Bearer ' + login.body.token).expect(200);

    const db = mongoose.connection.db;
    const base = 'https://res.cloudinary.com/classroom/raw/';
    await db.collection('resultpdfs').insertMany([
        { pdfUrl: base + 'upload/v123/old.pdf' },
        { pdfUrl: base + 'authenticated/v123/results/new.pdf', deliveryType: 'authenticated', cloudinaryPublicId: 'results/new.pdf' },
        { pdfUrl: base + 'authenticated/v123/results/missing-id.pdf', deliveryType: 'authenticated' },
    ]);
    const student = new mongoose.Types.ObjectId(login.body._id);
    await db.collection('submissions').insertMany([
        { student, assignment: new mongoose.Types.ObjectId(), fileUrl: '/uploads/submissions/work.zip' },
        { student, assignment: new mongoose.Types.ObjectId(), fileUrl: 'https://different.example.edu/legacy.pdf' },
    ]);
    const records = [];
    const summary = await inspectDatabase(db, imports, 'classroom', (collection, id, category) => records.push({ collection, id, category }));
    assert.deepEqual(summary.matchedStudents, { active: 1, inactive: 0 });
    assert.deepEqual(summary.resultpdfs, { authenticatedReference: 1, publicCloudinary: 1, legacyLocal: 0, review: 1 });
    assert.deepEqual(summary.submissions, { authenticatedReference: 0, publicCloudinary: 0, legacyLocal: 1, review: 1 });
    assert.equal(records.length, 5);
    assert.equal(await db.collection('students').countDocuments(), 1);
});
