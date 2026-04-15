// ============================================
// models/Notification.js — In-app Notifications
// ============================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required']
        // Can reference either User or Student — we don't use ref to keep it flexible
    },
    userModel: {
        type: String,
        enum: ['User', 'Student'],
        default: 'User'
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    type: {
        type: String,
        enum: ['notice', 'assignment', 'leave', 'result', 'general'],
        default: 'general'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
