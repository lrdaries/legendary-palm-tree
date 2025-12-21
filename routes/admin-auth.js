// routes/admin-auth.js
const express = require('express');
const router = express.Router();
const Database = require('../database');
const { verifyPassword } = require('../utils/auth');
const { setAuthCookie, clearAuthCookie } = require('../utils/admin-auth');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Get admin user
        const user = await Database.getUserByEmail(email);
        
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Verify password
        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Set HTTP-only cookie
        setAuthCookie(res, {
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// Admin logout
router.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ success: true, message: 'Logout successful' });
});

// Verify admin session
router.get('/verify', (req, res) => {
    // The verifyAdminToken middleware will handle the verification
    // This route is just to trigger the middleware
    res.json({ 
        success: true, 
        message: 'Session is valid',
        user: req.user
    });
});

module.exports = router;
