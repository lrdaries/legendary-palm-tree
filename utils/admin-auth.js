// utils/admin-auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'admin_auth';

const getBearerToken = (req) => {
    const header = req && req.headers ? req.headers.authorization : null;
    if (!header) return null;
    const m = String(header).match(/^Bearer\s+(.+)$/i);
    return m && m[1] ? m[1].trim() : null;
};

// Middleware to verify admin token from HTTP-only cookie
const verifyAdminToken = (req, res, next) => {
    const cookieToken = req.cookies ? req.cookies[COOKIE_NAME] : null;
    const bearerToken = getBearerToken(req);
    const token = cookieToken || bearerToken;
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};

// Set HTTP-only cookie with JWT token
const setAuthCookie = (res, userData) => {
    const token = jwt.sign(
        {
            id: userData.id,
            email: userData.email,
            role: userData.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return token;
};

// Clear authentication cookie
const clearAuthCookie = (res) => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};

module.exports = {
    verifyAdminToken,
    setAuthCookie,
    clearAuthCookie
};