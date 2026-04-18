// ============================================
// server.js — The main entry point of your backend
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { startGtuSyncScheduler } = require('./services/gtuSyncService');

// Import error handling and rate limiting middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Load environment variables FIRST
dotenv.config();

// ── Startup env variable validation ──
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers (must be before CORS)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images from Cloudinary
    contentSecurityPolicy: false // Disable CSP to avoid breaking React app served in production
}));

// CORS — supports localhost dev, all Vercel preview/production deployments,
// Netlify preview/production deployments, and any extra origins set via
// FRONTEND_URL / PRODUCTION_URL env vars on Render.
const allowedOriginPatterns = [
    /^http:\/\/localhost:\d+$/,            // any localhost port (local dev)
    /^https:\/\/.*\.vercel\.app$/,        // all Vercel domains (preview + production)
    /^https:\/\/.*\.netlify\.app$/,       // all Netlify domains (preview + production)
    /^https:\/\/.*\.onrender\.com$/,      // Render itself if needed
];

// Exact origins from env (comma-separated) + hardcoded production domain
const exactAllowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.PRODUCTION_URL,
    'https://college-data-management-website.vercel.app',
]
    .filter(Boolean)
    .flatMap(u => u.split(',').map(s => s.trim()));

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server / same-origin requests (no Origin header)
        if (!origin) return callback(null, true);
        // Exact match
        if (exactAllowedOrigins.includes(origin)) return callback(null, true);
        // Pattern match (handles Vercel preview URLs like project-xyz-abc.vercel.app)
        if (allowedOriginPatterns.some(p => p.test(origin))) return callback(null, true);
        console.warn(`CORS blocked origin: ${origin}`);
        return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS requests explicitly
app.options('/{*path}', cors());

// Cookie parser (needed for JWT refresh tokens)
app.use(cookieParser());

// JSON body parser
app.use(express.json());

// Serve legacy local uploads when present
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to VGEC CE Department API! 🚀',
        status: 'Server is running',
    });
});

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/student-auth', authLimiter);

// ── Existing routes ──

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
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'Frontend', 'dist');
    app.use(express.static(distPath));
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
if (process.env.NODE_ENV !== 'test') {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`\n🚀 Backend server is running!`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`\nPress Ctrl+C to stop the server\n`);
        });
        startGtuSyncScheduler(console);

        // Keep-alive ping for Render free tier (spins down after 15 min of inactivity)
        if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
            const https = require('https');
            setInterval(() => {
                https.get(process.env.RENDER_EXTERNAL_URL, () => {
                    console.log('🏓 Keep-alive ping sent');
                }).on('error', () => {});
            }, 14 * 60 * 1000); // every 14 minutes
        }
    });
}

module.exports = app;
