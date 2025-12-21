// utils/admin-auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'admin_auth';

// Middleware to verify admin token from HTTP-only cookie
const verifyAdminToken = (req, res, next) => {
    const token = req.cookies[COOKIE_NAME];
    
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