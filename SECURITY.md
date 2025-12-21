# 🔒 Security Best Practices Guide

## Overview
This guide covers the security improvements implemented and best practices for production deployment of Diva's Kloset.

---

## 🔐 Authentication & Passwords

### ✅ Implemented
- **Bcrypt Password Hashing**: All passwords hashed with 12 rounds
- **JWT Authentication**: Tokens with 7-day expiration
- **Admin Role Validation**: All admin endpoints protected
- **OTP Verification**: Email-based verification for users

### 🚀 Recommended Actions
1. **Enable HTTPS Only**: All traffic must be encrypted
2. **Implement Refresh Tokens**: Short-lived access tokens with refresh mechanism
3. **Add Password Reset**: Secure password reset flow via email
4. **Implement 2FA**: Two-factor authentication for admin accounts

---

## 🛡️ API Security

### ✅ Implemented
- **Request Size Limits**: Maximum 1MB request body
- **Request Timeout**: 5-second timeout on all requests
- **CORS Configuration**: Restricted to allowed origins
- **Parameterized Queries**: All database queries use prepared statements

### ⚠️ In Development
- **Rate Limiting**: Need to implement per-endpoint
- **Request Validation**: Input sanitization on all endpoints
- **API Key Authentication**: For programmatic access

### Configuration Example
```javascript
// Allow only specific origins
const ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
];
```

---

## 🔑 Environment Variables

### Critical Variables (MUST SET IN PRODUCTION)
```env
# Authentication
JWT_SECRET=your-32-char-minimum-random-string-here
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change-this-secure-password

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/divas_closet

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### ❌ Never Commit to Git
- `.env` file
- Hardcoded credentials
- API keys or tokens
- Passwords

---

## 📝 Secrets Management

### Development
```bash
# Create .env file locally
cp .env.example .env
# Edit with local values
nano .env
```

### Production
**Use AWS Secrets Manager, Google Secret Manager, or similar:**

```bash
# Example: AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id divas-closet-prod
```

Or with Node.js:
```javascript
const aws = require('aws-sdk');
const secretsManager = new aws.SecretsManager();

const secret = await secretsManager.getSecretValue({
    SecretId: 'divas-closet-prod'
}).promise();

const credentials = JSON.parse(secret.SecretString);
```

---

## 🚀 HTTPS/SSL Configuration

### Self-Signed Certificate (Development)
```bash
# Generate certificate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### Production with Let's Encrypt
```bash
# Using Certbot
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### Nginx Reverse Proxy (Recommended)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔒 CORS Security

### Current Implementation
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000'];
```

### Usage
```bash
# In production
export ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com
```

---

## 📧 Email Security

### Configuration with Nodemailer
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Send OTP
await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your OTP Code',
    html: `<p>Your OTP is: <strong>${otp}</strong></p>
           <p>Valid for ${OTP_EXPIRY_MINUTES} minutes</p>`
});
```

### Alternative Providers
- **SendGrid**: High deliverability, good API
- **Mailgun**: Developer-friendly, affordable
- **AWS SES**: Enterprise option
- **Postmark**: For transactional emails

---

## 🔐 Database Security

### Connection String Format
```
postgresql://username:password@host:5432/database_name

# Never expose credentials in URLs
# Always use environment variables
```

### Connection Pooling
```javascript
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

### Backup Strategy
```bash
# Daily backup
pg_dump divas_closet > backup-$(date +%Y-%m-%d).sql

# Automate with cron
0 2 * * * pg_dump divas_closet | gzip > /backups/divas-closet-$(date +\%Y-\%m-\%d).sql.gz
```

---

## 🚨 Rate Limiting

### Implementation with express-rate-limit
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

// Login attempts: 5 per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// OTP requests: 3 per hour
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many OTP requests, please try again later.'
});

// Apply to endpoints
app.post('/api/admin/login', loginLimiter, handleAdminLogin);
app.post('/api/auth/request-otp', otpLimiter, handleOTP);
```

---

## 📝 Logging & Monitoring

### Production Logging with Winston
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ 
            filename: process.env.LOG_FILE || 'logs/app.log' 
        }),
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
```

---

## 🔍 Security Headers

### Recommended Headers
```javascript
// Add security headers middleware
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
res.setHeader('Content-Security-Policy', "default-src 'self'");
```

---

## 🧪 Security Testing

### OWASP ZAP (Free)
```bash
# Scan your application
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000
```

### Dependency Vulnerability Scanning
```bash
npm install -g snyk
snyk auth
snyk test
```

### SQL Injection Testing
```bash
# Already protected with parameterized queries
# But test with tools like SQLmap
sqlmap -u "http://localhost:3000/api/endpoint" --batch
```

---

## 📋 Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] HTTPS certificate installed
- [ ] Database backups automated
- [ ] Rate limiting enabled
- [ ] Email service configured
- [ ] Admin credentials changed
- [ ] CORS origins restricted
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Error tracking enabled (Sentry)
- [ ] Security audit completed
- [ ] Load testing passed
- [ ] Database migration tested
- [ ] Disaster recovery plan documented
- [ ] Incident response plan defined

---

## 🆘 Emergency Response

### If Database Compromised
1. Take application offline
2. Revoke all JWT tokens
3. Force password reset for all users
4. Review access logs
5. Restore from clean backup
6. Investigate root cause

### If Admin Credentials Exposed
1. Change admin password immediately
2. Revoke all existing tokens
3. Review admin action logs
4. Audit all changes made
5. Enable 2FA for admin account

### If DDoS Attack
1. Activate rate limiting
2. Add WAF (CloudFlare, AWS WAF)
3. Scale infrastructure
4. Block malicious IPs
5. Monitor recovery metrics

---

## 📚 References

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **NIST Guidelines**: https://csrc.nist.gov/
- **CWE Top 25**: https://cwe.mitre.org/top25/

---

**Last Updated:** December 19, 2025
