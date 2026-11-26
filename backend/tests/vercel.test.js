const assert = require('node:assert/strict');
const { it } = require('node:test');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.VERCEL = '1';
process.env.VERCEL_URL = 'staging.example.test';
const app = require('../server');

it('connects on the first Vercel request and reuses the connection', async t => {
    const db = await MongoMemoryServer.create();
    process.env.MONGODB_URI = db.getUri();
    t.after(async () => {
        await mongoose.disconnect();
        await db.stop();
    });

    const connect = t.mock.method(mongoose, 'connect');
    const health = () => request(app).get('/api/health')
        .set('Origin', 'https://staging.example.test')
        .expect('Access-Control-Allow-Origin', 'https://staging.example.test')
        .expect('Cache-Control', /no-store/)
        .expect(200, { status: 'ready' });

    assert.equal(mongoose.connection.readyState, 0);
    await Promise.all([health(), health()]);
    await request(app).get('/api/missing').expect(404).expect('Content-Type', /json/);
    assert.equal(connect.mock.callCount(), 1);
});
