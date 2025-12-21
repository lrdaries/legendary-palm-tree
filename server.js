require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const Database = require('./database');
const { generateJWT, hashPassword, verifyPassword } = require('./utils/auth');
const { initializeResend, sendOTPEmail, sendLoginLinkEmail, sendWelcomeEmail, sendEmailVerificationEmail, generateOTP } = require('./services/email');
const path = require('path');
const winston = require('winston');
const crypto = require('crypto'); // Added for token generation

// Initialize email service (Resend) once on server startup
initializeResend();

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.Console()
    ]
});

// Import routes
const adminAuthRouter = require('./routes/admin-auth');
const adminRouter = require('./routes/admin');
const productsRouter = require('./routes/products');

// Import middleware
const { verifyAdminToken } = require('./utils/admin-auth');

// Initialize Express app
const app = express();

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const EMAIL_TOKEN_EXPIRY_HOURS = 24;

// Helper functions for email/OTP
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Middleware - order matters!
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://cdn.tailwindcss.com",
                "'unsafe-inline'" // Needed for Tailwind
            ],
            styleSrc: [
                "'self'",
                "https://cdn.tailwindcss.com",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com",
                "'unsafe-inline'" // Needed for Tailwind and Font Awesome
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://images.pexels.com" // Specific domain for your images
            ],
            connectSrc: [
                "'self'",
                "http://localhost:*",
                "http://127.0.0.1:*",
                "https://open.er-api.com"
            ],
            fontSrc: [
                "'self'",
                "data:",
                "https://cdnjs.cloudflare.com",
                "https://fonts.gstatic.com"
            ],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Trust first proxy if behind a reverse proxy (e.g., Nginx)
app.set('trust proxy', 1);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : [];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600 // 10 minutes
};
app.use(cors(corsOptions));

// Security middleware
app.use(compression());
app.use(xss());
app.use(mongoSanitize());

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});
app.use('/uploads', express.static('uploads'));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Request logging
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('RESEND_API_KEY');
}

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
}

// Log environment info
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ============================================
// DATABASE INITIALIZATION
// ============================================

// Initialize database on startup
async function ensureAdminUser() {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const lastName = process.env.ADMIN_LAST_NAME || 'User';

    if (!email || !password) return;

    try {
        const existing = await Database.getUserByEmail(email);
        const passwordHash = await hashPassword(password);

        if (existing) {
            if (existing.role === 'admin' && existing.password_hash) return;
            await Database.updateUser(email, {
                role: 'admin',
                password_hash: passwordHash,
                verified: true
            });
            return;
        }

        await Database.createUser({
            email,
            first_name: firstName,
            last_name: lastName,
            password_hash: passwordHash,
            role: 'admin',
            verified: true
        });
    } catch (err) {
        console.error('Failed to ensure admin user:', err);
    }
}

Database.initializeDatabase()
    .then(() => ensureAdminUser())
    .catch((error) => {
        console.error('Failed to initialize database:', error);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });

// ============================================
// API ROUTES
// ============================================

// Admin authentication routes (public)
app.use('/api/admin/auth', adminAuthRouter);

// Protected admin API routes
app.use('/api/admin', verifyAdminToken, adminRouter);

// Public products API routes
app.use('/api/products', productsRouter);

// ============================================
// PUBLIC USER AUTHENTICATION ROUTES
// ============================================

// Request OTP for login
app.post('/api/auth/request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Valid email is required' });
        }

        const otpCode = generateOTP(); // Fixed: Use imported function
        const expiresAt = new Date(Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000));

        await Database.createOTP(email, otpCode, expiresAt);

        const emailSent = await sendOTPEmail(email, otpCode); // Fixed: Use imported function
        
        if (!emailSent) {
            throw new Error('Failed to send OTP email');
        }

        console.log(`📧 OTP sent to ${email} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);

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
app.post('/api/auth/verify-otp', async (req, res) => {
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

        const expiresAt = new Date(otpData.expires_at);
        if (expiresAt < new Date()) {
            await Database.deleteOTP(emailLower);
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (otpData.attempts >= OTP_MAX_ATTEMPTS) {
            await Database.deleteOTP(emailLower);
            return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
        }

        if (otpData.code !== otp) {
            await Database.updateOTPAttempts(emailLower, otpData.attempts + 1);
            return res.status(400).json({ success: false, message: 'Invalid OTP code' });
        }

        await Database.deleteOTP(emailLower);

        let user = await Database.getUserByEmail(emailLower);
        if (!user) {
            user = await Database.createUser({
                email: emailLower,
                first_name: 'User',
                last_name: '',
                verified: true
            });
        }

        const token = generateJWT({
            email: emailLower,
            firstName: user.first_name,
            role: user.role || 'user'
        });

        res.json({
            success: true,
            message: 'OTP verified successfully',
            token,
            data: {
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const emailLower = email.toLowerCase();

        const existingUser = await Database.getUserByEmail(emailLower);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const passwordHash = await hashPassword(password);
        const user = await Database.createUser({
            email: emailLower,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            password_hash: passwordHash,
            verified: false
        });

        const verificationToken = generateToken(); // Fixed: Use defined function
        const expiresAt = new Date(Date.now() + (EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000));
        await Database.createEmailToken(verificationToken, emailLower, expiresAt);

        const verificationUrl = `${process.env.BASE_URL || `http://${HOST}:${PORT}`}/verify-email?token=${verificationToken}`;

        const nameForEmail = firstName.trim();

        // Welcome email (non-blocking for signup success)
        try {
            const welcomeRes = await sendWelcomeEmail(emailLower, nameForEmail);
            if (!welcomeRes || !welcomeRes.success) {
                console.error('Failed to send welcome email to:', emailLower);
            }
        } catch (e) {
            console.error('Failed to send welcome email to:', emailLower, e);
        }

        // Verification email with link (non-blocking for signup success)
        try {
            const verifyRes = await sendEmailVerificationEmail(emailLower, verificationUrl, nameForEmail);
            if (!verifyRes || !verifyRes.success) {
                console.error('Failed to send verification email to:', emailLower);
            }
        } catch (e) {
            console.error('Failed to send verification email to:', emailLower, e);
        }

        res.status(201).json({
            success: true,
            message: 'Account created successfully. Please check your email to verify your account.',
            ...(process.env.NODE_ENV !== 'production' && { verificationUrl })
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});

// Verify email
app.get('/api/auth/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Verification token is required' });
        }

        const tokenData = await Database.getEmailToken(token);

        if (!tokenData) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }

        const expiresAt = new Date(tokenData.expires_at);
        if (expiresAt < new Date()) {
            await Database.deleteEmailToken(token);
            return res.status(400).json({ success: false, message: 'Verification token has expired' });
        }

        const user = await Database.getUserByEmail(tokenData.email);
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        await Database.updateUser(tokenData.email, { verified: true });
        await Database.deleteEmailToken(token);

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});

// ============================================
// STATIC FILE SERVING
// ============================================

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client'), {
    setHeaders: (res, path) => {
        // Set proper MIME types
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
        // Add CSP headers for static files
        res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com 'unsafe-inline'; img-src 'self' data: blob: https://images.pexels.com; font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://open.er-api.com");
    }
}));

// Serve pages directory for nested routes
app.use('/pages', express.static(path.join(__dirname, 'client/pages')));

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Handle SPA routing - serve index.html for all other routes
app.get('*', (req, res) => {
    // Check if it's an admin route
    if (req.path.startsWith('/admin')) {
        res.sendFile(path.join(__dirname, 'admin', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'client', 'index.html'));
    }
});

// ============================================
// ERROR HANDLING
// ============================================

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // Handle rate limit errors
    if (err.status === 429) {
        return res.status(429).json({
            status: 'error',
            message: 'Too many requests, please try again later.'
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Internal server error' 
        : err.message;

    res.status(statusCode).json({
        status: 'error',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Security Headers
app.disable('x-powered-by');

// Start server
const server = app.listen(PORT, HOST, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`);
    logger.info(`Health check available at http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
function shutdown() {
    console.log('\nShutting down gracefully...');
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);