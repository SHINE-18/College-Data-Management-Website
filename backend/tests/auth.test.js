const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { connect, close, clear } = require('./setup');

const app = require('../server');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');

describe('Administrative Hierarchy Integration', () => {
    beforeAll(async () => {
        await connect();
        process.env.JWT_SECRET = 'testsecret';
    });
    afterAll(async () => await close());
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

        expect(res.status).toBe(201);
        expect(res.body.role).toBe('hod');
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

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/only register.*HOD/i);
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

        expect(res.status).toBe(201);
        expect(res.body.role).toBe('faculty');
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

        expect(res.status).toBe(403);
    });
});
