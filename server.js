const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = 5500;
const HOST = '127.0.0.1';

// ============================================
// IN-MEMORY DATA STORAGE
// ============================================
const users = new Map(); // email -> { firstName, lastName, email, password, verified, createdAt }
const otps = new Map(); // email -> { code, expiresAt, attempts }
const emailTokens = new Map(); // token -> { email, expiresAt }
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// OTP Configuration
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const EMAIL_TOKEN_EXPIRY_HOURS = 24;

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate secure token for email verification
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Simple JWT-like token generation (for demo - in production use proper JWT library)
function generateJWT(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify JWT token
function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const [encodedHeader, encodedPayload, signature] = parts;
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');
        
        if (signature !== expectedSignature) return null;
        
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
        return payload;
    } catch (e) {
        return null;
    }
}

// Hash password (simple bcrypt-like for demo - in production use bcrypt)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

// Verify password
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// Send JSON response
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Parse request body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// Clean expired OTPs and tokens (run periodically)
function cleanupExpired() {
    const now = Date.now();
    
    // Clean expired OTPs
    for (const [email, otpData] of otps.entries()) {
        if (otpData.expiresAt < now) {
            otps.delete(email);
        }
    }
    
    // Clean expired email tokens
    for (const [token, tokenData] of emailTokens.entries()) {
        if (tokenData.expiresAt < now) {
            emailTokens.delete(token);
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpired, 5 * 60 * 1000);

// ============================================
// API ROUTE HANDLERS
// ============================================

async function handleAPIRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle OPTIONS for CORS
    if (method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return true;
    }

    // API Routes
    if (pathname === '/api/auth/request-otp' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { email } = body;

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                sendJSON(res, 400, { success: false, message: 'Valid email is required' });
                return true;
            }

            // Generate OTP
            const otpCode = generateOTP();
            const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);

            otps.set(email.toLowerCase(), {
                code: otpCode,
                expiresAt,
                attempts: 0
            });

            // In production, send email here
            console.log(`\n📧 OTP for ${email}: ${otpCode} (expires in ${OTP_EXPIRY_MINUTES} minutes)\n`);

            sendJSON(res, 200, {
                success: true,
                message: 'OTP sent to your email',
                // In development, include OTP in response (remove in production)
                ...(process.env.NODE_ENV !== 'production' && { otp: otpCode })
            });
            return true;
        } catch (error) {
            sendJSON(res, 500, { success: false, message: error.message || 'Internal server error' });
            return true;
        }
    }

    if (pathname === '/api/auth/verify-otp' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { email, otp } = body;

            if (!email || !otp) {
                sendJSON(res, 400, { success: false, message: 'Email and OTP are required' });
                return true;
            }

            const emailLower = email.toLowerCase();
            const otpData = otps.get(emailLower);

            if (!otpData) {
                sendJSON(res, 400, { success: false, message: 'OTP not found or expired. Please request a new one.' });
                return true;
            }

            if (otpData.expiresAt < Date.now()) {
                otps.delete(emailLower);
                sendJSON(res, 400, { success: false, message: 'OTP has expired. Please request a new one.' });
                return true;
            }

            if (otpData.attempts >= OTP_MAX_ATTEMPTS) {
                otps.delete(emailLower);
                sendJSON(res, 400, { success: false, message: 'Too many failed attempts. Please request a new OTP.' });
                return true;
            }

            if (otpData.code !== otp) {
                otpData.attempts++;
                sendJSON(res, 400, { success: false, message: 'Invalid OTP code' });
                return true;
            }

            // OTP verified successfully
            otps.delete(emailLower);

            // Check if user exists
            let user = users.get(emailLower);
            if (!user) {
                // Create user if they don't exist (first-time login)
                user = {
                    firstName: 'User',
                    lastName: '',
                    email: emailLower,
                    password: null, // No password for OTP-only users
                    verified: true,
                    createdAt: new Date().toISOString()
                };
                users.set(emailLower, user);
            }

            // Generate JWT token
            const token = generateJWT({
                email: emailLower,
                firstName: user.firstName,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
            });

            sendJSON(res, 200, {
                success: true,
                message: 'OTP verified successfully',
                token,
                data: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
            return true;
        } catch (error) {
            sendJSON(res, 500, { success: false, message: error.message || 'Internal server error' });
            return true;
        }
    }

    if (pathname === '/api/auth/register' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { firstName, lastName, email, password } = body;

            // Validation
            if (!firstName || !lastName || !email || !password) {
                sendJSON(res, 400, { success: false, message: 'All fields are required' });
                return true;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                sendJSON(res, 400, { success: false, message: 'Invalid email format' });
                return true;
            }

            if (password.length < 6) {
                sendJSON(res, 400, { success: false, message: 'Password must be at least 6 characters' });
                return true;
            }

            const emailLower = email.toLowerCase();

            // Check if user already exists
            if (users.has(emailLower)) {
                sendJSON(res, 400, { success: false, message: 'User with this email already exists' });
                return true;
            }

            // Create user
            const user = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: emailLower,
                password: hashPassword(password),
                verified: false,
                createdAt: new Date().toISOString()
            };
            users.set(emailLower, user);

            // Generate email verification token
            const verificationToken = generateToken();
            const expiresAt = Date.now() + (EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
            emailTokens.set(verificationToken, {
                email: emailLower,
                expiresAt
            });

            // In production, send verification email here
            const verificationUrl = `http://${HOST}:${PORT}/verify-email?token=${verificationToken}`;
            console.log(`\n📧 Verification link for ${email}: ${verificationUrl}\n`);

            sendJSON(res, 201, {
                success: true,
                message: 'Account created successfully. Please check your email to verify your account.',
                // In development, include verification link (remove in production)
                ...(process.env.NODE_ENV !== 'production' && { verificationUrl })
            });
            return true;
        } catch (error) {
            sendJSON(res, 500, { success: false, message: error.message || 'Internal server error' });
            return true;
        }
    }

    if (pathname === '/api/auth/verify-email' && method === 'GET') {
        try {
            const { token } = parsedUrl.query;

            if (!token) {
                sendJSON(res, 400, { success: false, message: 'Verification token is required' });
                return true;
            }

            const tokenData = emailTokens.get(token);

            if (!tokenData) {
                sendJSON(res, 400, { success: false, message: 'Invalid or expired verification token' });
                return true;
            }

            if (tokenData.expiresAt < Date.now()) {
                emailTokens.delete(token);
                sendJSON(res, 400, { success: false, message: 'Verification token has expired' });
                return true;
            }

            // Verify user's email
            const user = users.get(tokenData.email);
            if (!user) {
                sendJSON(res, 400, { success: false, message: 'User not found' });
                return true;
            }

            user.verified = true;
            emailTokens.delete(token);

            sendJSON(res, 200, {
                success: true,
                message: 'Email verified successfully'
            });
            return true;
        } catch (error) {
            sendJSON(res, 500, { success: false, message: error.message || 'Internal server error' });
            return true;
        }
    }

    return false; // Not an API route
}

// ============================================
// MAIN SERVER
// ============================================

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log('Request: ' + req.method + ' ' + pathname + (Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : ''));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.setHeader('Content-Security-Policy', "default-src 'self' http://localhost:* http://127.0.0.1:* https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://apis.google.com chrome-extension:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.googleapis.com; connect-src 'self' http://localhost:* http://127.0.0.1:* https: data:; img-src 'self' data: https: http: blob:; frame-src 'self'; object-src 'none';");

    // Handle API routes first
    const isAPIRequest = await handleAPIRequest(req, res);
    if (isAPIRequest) {
        return; // API request handled
    }

    // Handle static file serving
    if (pathname === '/verify-email' && query.token) {
        console.log('Routing /verify-email to /client/verify-email.html with token: ' + query.token);
        pathname = '/client/verify-email.html';
    }

    if (pathname === '/' || pathname === '') {
        pathname = '/client/index.html';
    }

    let filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);

    if (!ext) {
        filePath += '.html';
    }

    const realPath = path.resolve(filePath);
    const projectRoot = path.resolve(__dirname);
    
    if (!realPath.startsWith(projectRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Forbidden</h1>', 'utf-8');
        console.log('403 Forbidden: ' + realPath);
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                        h1 { color: #333; }
                        p { color: #666; }
                        a { color: #667eea; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <h1>404 - File Not Found</h1>
                    <p>The requested file does not exist: ${pathname}</p>
                    <p><a href="/client/">Go to Home</a></p>
                </body>
                </html>
            `, 'utf-8');
            console.log('404: ' + filePath);
        } else {
            const contentTypes = {
                '.html': 'text/html; charset=utf-8',
                '.js': 'text/javascript; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.webp': 'image/webp',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject'
            };

            const contentType = contentTypes[ext] || 'text/plain';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
            console.log('200: ' + filePath);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(70));
    console.log('Server is running!');
    console.log('='.repeat(70));
    console.log('\nURL: http://' + HOST + ':' + PORT);
    console.log('Root: ' + __dirname + '\n');
    console.log('Available Routes:');
    console.log('   http://' + HOST + ':' + PORT + '                                         -> /client/index.html');
    console.log('   http://' + HOST + ':' + PORT + '/client/                                 -> /client/index.html');
    console.log('   http://' + HOST + ':' + PORT + '/verify-email?token=xxx                  -> /client/verify-email.html');
    console.log('   http://' + HOST + ':' + PORT + '/client/verify-email?token=xxx           -> /client/verify-email.html');
    console.log('\nAPI Endpoints:');
    console.log('   POST   http://' + HOST + ':' + PORT + '/api/auth/request-otp            -> Request OTP for sign-in');
    console.log('   POST   http://' + HOST + ':' + PORT + '/api/auth/verify-otp              -> Verify OTP and get JWT token');
    console.log('   POST   http://' + HOST + ':' + PORT + '/api/auth/register              -> Register new user');
    console.log('   GET    http://' + HOST + ':' + PORT + '/api/auth/verify-email?token=xxx  -> Verify email from link');
    console.log('\n' + '='.repeat(70));
    console.log('\nServer ready! Open http://' + HOST + ':' + PORT + '/client/ in your browser\n');
    console.log('Note: In development mode, OTPs and verification links are logged to console.\n');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('\nError: Port ' + PORT + ' is already in use!');
        console.error('\nTry one of these solutions:');
        console.error('\n1. Kill the process using port ' + PORT + ':');
        console.error('   netstat -ano | findstr :' + PORT);
        console.error('   taskkill /PID <PID> /F');
        console.error('\n2. Use a different port by editing server.js\n');
    } else {
        console.error('\nServer error: ' + err.message + '\n');
    }
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n\nServer shutting down...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
