const mongoose = require('mongoose');

let pendingConnection;

async function connectDB() {
    if (mongoose.connection.readyState === 1) return mongoose;
    pendingConnection ??= mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
    }).finally(() => { pendingConnection = undefined; });
    return pendingConnection;
}

module.exports = connectDB;
