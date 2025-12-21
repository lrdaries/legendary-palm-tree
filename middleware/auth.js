const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: { success: false, message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        if (payload.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// IP whitelist middleware
const ipWhitelist = (req, res, next) => {
    // In production, you might want to implement IP whitelisting
    // For development, we'll allow all IPs
    const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(req.ip)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    next();
};

// Validate login input
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }
    
    next();
};

module.exports = {
    loginLimiter,
    requireAdmin,
    ipWhitelist,
    validateLogin
};