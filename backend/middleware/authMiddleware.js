const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

function sessionIsCurrent(account, claims) {
    return account?.isActive && account.sessionVersion === claims.sessionVersion;
}

function generateToken(account, expiresIn = '15m') {
    return jwt.sign({ id: account._id, sessionVersion: account.sessionVersion, purpose: 'access' },
        process.env.JWT_SECRET, { expiresIn });
}

function generateRefreshToken(account) {
    return jwt.sign({ id: account._id, sessionVersion: account.sessionVersion, purpose: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function findSessionAccount(req, models = [User, Student]) {
    const token = req.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return null;
    let claims;
    try {
        claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
        return null;
    }
    // Legacy access tokens have no purpose or sessionVersion.
    if ((claims.purpose && claims.purpose !== 'access') || !/^[a-f\d]{24}$/i.test(claims.id)) return null;
    for (const model of models) {
        const account = await model.findById(claims.id);
        if (sessionIsCurrent(account, claims)) return account;
    }
    return null;
}

function authenticate(...models) {
    return async (req, res, next) => {
        const account = await findSessionAccount(req, models);
        if (!account) return res.status(401).json({ message: 'Sign in again to access this resource' });
        if (account instanceof Student) req.student = account;
        else req.user = account;
        next();
    };
}

const protect = authenticate(User);
const protectStudent = authenticate(Student);
const protectBoth = authenticate(User, Student);

// Authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { findSessionAccount, protect, protectStudent, protectBoth, authorize, generateToken, generateRefreshToken, sessionIsCurrent };
