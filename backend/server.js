// ============================================
// server.js — The main entry point of your backend
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const fs = require('node:fs');
const connectDB = require('./config/database');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { startGtuSyncScheduler } = require('./services/gtuSyncService');

// Import error handling and rate limiting middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const {
    publicLimiter,
    loginLimiter,
    passwordResetLimiter,
    fileUploadLimiter,
    adminApiLimiter,
    validateSyncToken
} = require('./middleware/rateLimiter');

const production = process.env.NODE_ENV === 'production';
const onVercel = process.env.VERCEL === '1';
if (process.env.NODE_ENV !== 'test') {
    const required = ['MONGODB_URI', 'JWT_SECRET'];
    if (production) required.push('FRONTEND_URL', 'JWT_REFRESH_SECRET', 'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'EMAIL_USER', 'EMAIL_PASS');
    const missing = required.filter(key => !process.env[key]?.trim());
    if (missing.length) throw new Error('Missing settings: ' + missing.join(', '));
    if (production && (process.env.JWT_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32 ||
        process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET)) {
        throw new Error('Set distinct JWT signing secrets of at least 32 characters');
    }
}

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy hop (required on Render / Heroku so that
// express-rate-limit reads the real client IP from X-Forwarded-For
// instead of Render's internal load-balancer IP, which would cause
// ALL users to share a single rate-limit counter).
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARE
// ============================================

// Security headers (must be before CORS)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images from Cloudinary
    contentSecurityPolicy: false // Disable CSP to avoid breaking React app served in production
}));

// FRONTEND_URL is also the canonical base for password reset emails.
const allowedOrigins = new Set();
const vercelOrigins = onVercel
    ? [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean).map(host => 'https://' + host)
    : [];
for (const value of [process.env.FRONTEND_URL, ...vercelOrigins, ...(process.env.PRODUCTION_URL || '').split(',')]) {
    if (!value?.trim()) continue;
    const url = new URL(value.trim());
    if ((production && url.protocol !== 'https:') || url.origin !== value.trim().replace(/\/$/, '')) {
        throw new Error('Configure frontend origins as scheme and hostname only');
    }
    allowedOrigins.add(url.origin);
}

app.use(cors({
    origin(origin, callback) {
        const localDev = !production && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        if (!origin || localDev || allowedOrigins.has(origin)) return callback(null, true);
        return callback(Object.assign(new Error('Origin is not allowed'), { statusCode: 403 }));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Sync-Token'],
}));

// Cookie parser (needed for JWT refresh tokens)
app.use(cookieParser());

// JSON body parser
app.use(express.json());

// Serve legacy local uploads when present
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ============================================
// ROUTES
// ============================================

app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    next();
});
if (onVercel) {
    app.use('/api', async (req, res, next) => {
        try {
            await connectDB();
        } catch (error) {
            console.error('MongoDB connection unavailable:', error.name);
            return res.status(503).json({ status: 'unavailable' });
        }
        next();
    });
}
app.get('/api/health', (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable' });
});

const distPath = path.join(__dirname, '..', 'Frontend', 'dist');
const serveFrontend = production && !onVercel && fs.existsSync(path.join(distPath, 'index.html'));
app.get('/', (req, res, next) => {
    if (serveFrontend) return next();
    res.json({
        message: 'Welcome to VGEC CE Department API! 🚀',
        status: 'Server is running',
    });
});

// Rate limiting
// Scraper/API sync routes — protected with secret token BEFORE rate limits or routers
app.post('/api/admin/sync/gtu', validateSyncToken);

// Login routes rate limiters (5 attempts per 15 minutes)
app.post('/api/auth/login', loginLimiter);
app.post('/api/student-auth/login', loginLimiter);

// Password reset & changing limiters (3 attempts per hour)
app.post('/api/auth/forgot-password', passwordResetLimiter);
app.post('/api/auth/reset-password/:token', passwordResetLimiter);
app.put('/api/auth/password', passwordResetLimiter);
app.put('/api/student-auth/password', passwordResetLimiter);

// File Upload rate limiters (20 uploads per hour)
app.post('/api/faculty/result-pdfs', fileUploadLimiter);
app.post('/api/student/submissions', fileUploadLimiter);
app.post('/api/events', fileUploadLimiter);
app.post('/api/admin/import-students', fileUploadLimiter);
app.post('/api/notices', fileUploadLimiter);
app.post('/api/circulars', fileUploadLimiter);
app.post('/api/timetables', fileUploadLimiter);
app.post('/api/academics/syllabi', fileUploadLimiter);
app.post('/api/academics/resources', fileUploadLimiter);
app.post('/api/settings/calendar', fileUploadLimiter);

// Admin & HOD APIs — strict limiter (50 requests per 15 minutes)
app.use('/api/admin', adminApiLimiter);
app.use('/api/hod', adminApiLimiter);

// General/Public APIs — 500 requests per 15 minutes
app.use('/api', publicLimiter);



// ── Existing routes ──

app.use('/api/faculty', require('./routes/resultPDFRoutes'));
app.use('/api/faculty', require('./routes/facultyStudentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));

app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/timetables', require('./routes/timetableRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/publications', require('./routes/publicationRoutes'));
app.use('/api/achievements', require('./routes/achievementRoutes'));
app.use('/api/qualifications', require('./routes/qualificationRoutes'));
app.use('/api/circulars', require('./routes/circularRoutes'));
app.use('/api/student-auth', require('./routes/studentAuthRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/academics', require('./routes/academicRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/siteSettingRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));

// ── New routes ──
app.use('/api/placements', require('./routes/placementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// ── Production: Serve React Frontend ──
app.use('/api', notFound);
app.use('/uploads', notFound);
if (serveFrontend) {
    app.use(express.static(distPath));
    app.use('/assets', notFound);
    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
}

// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// ============================================
// START THE SERVER
// ============================================
if (require.main === module && !onVercel && process.env.NODE_ENV !== 'test') {
    connectDB().then(() => {
        const server = app.listen(PORT, () => {
            console.log(`\n🚀 Backend server is running!`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`\nPress Ctrl+C to stop the server\n`);
        });
        const scheduler = startGtuSyncScheduler(console);
        const shutdown = () => {
            clearInterval(scheduler);
            const deadline = setTimeout(() => process.exit(1), 10000).unref();
            server.close(async () => {
                try {
                    await mongoose.disconnect();
                } finally {
                    clearTimeout(deadline);
                }
            });
        };
        process.once('SIGTERM', shutdown);
        process.once('SIGINT', shutdown);
    }).catch(error => {
        console.error('MongoDB startup failed:', error.name);
        process.exitCode = 1;
    });
}

module.exports = app;
