const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a secure token for email verification
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Generate JWT token
const generateJWT = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {        
        expiresIn: '24h' // Token expires in 24 hours
    });
};

// Verify JWT token
const verifyJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');     
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
};

// Hash password using bcrypt
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Verify password using bcrypt
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = {
    generateOTP,
    generateToken,
    generateJWT,
    verifyJWT,
    hashPassword,
    verifyPassword
};
