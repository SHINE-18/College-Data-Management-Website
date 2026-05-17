// middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');


// ════════════════════════════════════════════════════════════════════════
// 1. Public APIs — 500 requests per 15 minutes
// ════════════════════════════════════════════════════════════════════════
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: {
        success: false,
        message: 'Too many requests on public APIs. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ════════════════════════════════════════════════════════════════════════
// 2. Login Limiter — 5 attempts per 15 minutes
// ════════════════════════════════════════════════════════════════════════
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ════════════════════════════════════════════════════════════════════════
// 3. Password Reset Limiter — 3 requests per hour
// ════════════════════════════════════════════════════════════════════════
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset or change attempts. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ════════════════════════════════════════════════════════════════════════
// 4. File Upload Limiter — 20 uploads per hour
// ════════════════════════════════════════════════════════════════════════
const fileUploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        success: false,
        message: 'Too many file upload requests. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ════════════════════════════════════════════════════════════════════════
// 5. Admin APIs — Strict rate limiting (50 requests per 15 minutes)
// ════════════════════════════════════════════════════════════════════════
const adminApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: {
        success: false,
        message: 'Too many administrative requests. Access throttled for security. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ════════════════════════════════════════════════════════════════════════
// 6. Scraper/API Sync Routes — Secret Token Protection Middleware
// ════════════════════════════════════════════════════════════════════════
const validateSyncToken = (req, res, next) => {
    // Read secret token from process env, fallback to secure placeholder in dev
    const secretToken = process.env.SYNC_SECRET_TOKEN || 'vgec_secret_sync_token_2026';
    const clientToken = req.headers['x-sync-token'] || req.query.token;

    if (!clientToken || clientToken !== secretToken) {
        return res.status(403).json({
            success: false,
            message: 'Access denied: Scraper and sync operations are restricted to authorized clients with a valid sync token.'
        });
    }
    next();
};

module.exports = {
    publicLimiter,
    loginLimiter,
    passwordResetLimiter,
    fileUploadLimiter,
    adminApiLimiter,
    validateSyncToken
};
