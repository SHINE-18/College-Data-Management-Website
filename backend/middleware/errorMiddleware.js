// ============================================
// middleware/errorMiddleware.js — Global Error Handling
// ============================================

// Custom error class for application-specific errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// 404 handler - for routes that don't exist
const notFound = (req, res, next) => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};

// Global error handler - catches all errors
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    if (err.name === 'MulterError') {
        error = new AppError(err.message, err.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
    }

    // Mongoose bad ObjectId error
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value: ${field}. Please use another value.`;
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token. Please log in again.', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new AppError('Your token has expired. Please log in again.', 401);
    }

    if (error.statusCode >= 500 && process.env.NODE_ENV === 'production') {
        console.error('Request failed', req.method, req.baseUrl, err.name || 'Error');
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' && error.statusCode >= 500
            ? 'Server error' : error.message || 'Server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    AppError,
    notFound,
    errorHandler
};

