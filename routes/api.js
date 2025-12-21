const express = require('express');
const router = express.Router();
const Database = require('../database');
const { sendOTP, sendVerificationEmail } = require('../email');
const { generateOTP, generateToken, generateJWT, verifyJWT, hashPassword, verifyPassword } = require('../utils/auth');

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Request OTP for login
router.post('/auth/request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Valid email is required' });
        }

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + (10 * 60 * 1000)); // 10 minutes

        await Database.createOTP(email, otpCode, expiresAt);
        const emailSent = await sendOTP(email, otpCode);
        
        if (!emailSent) {
            throw new Error('Failed to send OTP email');
        }

        console.log(`📧 OTP sent to ${email} (expires in 10 minutes)`);

        res.json({
            success: true,
            message: 'OTP sent to your email',
            ...(process.env.NODE_ENV !== 'production' && { otp: otpCode })
        });
    } catch (error) {
        console.error('Error requesting OTP:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});

// Verify OTP and login
router.post('/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const emailLower = email.toLowerCase();
        const otpData = await Database.getOTP(emailLower);

        if (!otpData) {
            return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new one.' });
        }

        if (new Date(otpData.expires_at) < new Date()) {
            await Database.deleteOTP(emailLower);
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (otpData.attempts >= 5) {
            await Database.deleteOTP(emailLower);
            return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
        }

        if (otpData.code !== otp) {
            await Database.updateOTPAttempts(emailLower, otpData.attempts + 1);
            return res.status(400).json({ success: false, message: 'Invalid OTP code' });
        }

        // OTP is valid, create or get user
        await Database.deleteOTP(emailLower);

        let user = await Database.getUserByEmail(emailLower);
        const isNewUser = !user;

        if (isNewUser) {
            // Create a new user with default values
            user = await Database.createUser({
                email: emailLower,
                first_name: email.split('@')[0],
                last_name: '',
                role: 'user',
                verified: true
            });
        }

        // Generate JWT token
        const token = generateJWT({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name
        });

        res.json({
            success: true,
            message: isNewUser ? 'Account created and logged in successfully' : 'Logged in successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                verified: user.verified
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});

// Protected route example
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const token = authHeader.substring(7);
        const payload = verifyJWT(token);

        if (!payload) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        const user = await Database.getUserById(payload.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Don't send sensitive data
        const { password_hash, ...userData } = user;
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});

// Admin routes
const adminRouter = express.Router();

// Middleware to check if user is admin
adminRouter.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token);

    if (!payload || payload.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.user = payload;
    next();
});

// Get all users (admin only)
adminRouter.get('/users', async (req, res) => {
    try {
        // In a real app, you'd want pagination here
        const users = await Database.getAllRows('SELECT id, email, first_name, last_name, role, verified, created_at FROM users');
        res.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Mount admin routes under /api/admin
router.use('/admin', adminRouter);

// Export the router
module.exports = router;