// ============================================
// server.js — The main entry point of your backend
// Think of this as the "App.jsx" of your backend
// ============================================

// Step 1: Import the packages we installed
const express = require('express');   // The web framework (creates the server)
const cors = require('cors');         // Allows React frontend to talk to this backend
const dotenv = require('dotenv');     // Loads secret config from .env file
const connectDB = require('./config/database'); // Our MongoDB connection function
const path = require('path');         // For file path handling
const fs = require('fs');             // For file system operations

// Import error handling middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Step 2: Load environment variables from .env file
// This is where we'll store database URL, secrets, etc.
dotenv.config();

// Step 3: Create an Express application
// This is like calling createRoot() in React — it initializes everything
const app = express();

// Step 4: Set the port number
// The backend will run on port 5000 (React runs on 5173)
// process.env.PORT lets hosting services like Render set their own port
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE — Functions that run on EVERY request
// Think of them as "wrappers" that process all incoming requests
// ============================================

// Middleware 1: CORS
// Without this, your React app (localhost:5173) would be BLOCKED from
// calling your backend (localhost:5000) — it's a browser security feature.
// cors() tells the browser: "It's okay, let the frontend talk to me"
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Middleware 2: JSON Parser
// When React sends data (like a new notice), it sends it as JSON.
// This middleware parses that JSON so we can use it in our code.
// Without this, req.body would be undefined!
app.use(express.json());

// ============================================
// ROUTES — The API endpoints your frontend will call
// Think of these as the "menu items" in our restaurant
// ============================================

// A simple test route to check if the server is running
// When you visit http://localhost:5000/ in your browser, you'll see this
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to VGEC CE Department API! 🚀',
        status: 'Server is running',
        endpoints: {
            faculty: '/api/faculty',
            notices: '/api/notices',
            events: '/api/events',
        }
    });
});

// ── Register Route Files ──
// app.use('/api/faculty', ...) means:
//   "Any request starting with /api/faculty → send it to facultyRoutes.js"
// Inside facultyRoutes.js, '/' means '/api/faculty' and '/:id' means '/api/faculty/:id'
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const timetablesDir = path.join(uploadsDir, 'timetables');
if (!fs.existsSync(timetablesDir)) {
    fs.mkdirSync(timetablesDir, { recursive: true });
}

const eventsDir = path.join(uploadsDir, 'events');
if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
}

const facultyDir = path.join(uploadsDir, 'faculty');
if (!fs.existsSync(facultyDir)) {
    fs.mkdirSync(facultyDir, { recursive: true });
}

const circularsDir = path.join(uploadsDir, 'circulars');
if (!fs.existsSync(circularsDir)) {
    fs.mkdirSync(circularsDir, { recursive: true });
}

// Serve uploaded timetable PDFs statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// ============================================
// START THE SERVER
// ============================================
// We connect to MongoDB FIRST, then start the server
// This ensures the database is ready before we accept any requests
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Backend server is running!`);
        console.log(`📍 Local: http://localhost:${PORT}`);
        console.log(`📍 API:   http://localhost:${PORT}/api/faculty`);
        console.log(`\nPress Ctrl+C to stop the server\n`);
    });
});
