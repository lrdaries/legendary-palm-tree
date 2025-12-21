# 🚀 Production Deployment Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (recommended for production)
- PM2 process manager: `npm install -g pm2`
- SSL certificate (Let's Encrypt recommended)

## Quick Start with Docker (Recommended)

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your production values
```

### 2. Database Setup
```bash
# For PostgreSQL, create database and user
createdb divas_closet
createuser divas_user
# Set password and grant permissions
```

### 3. Deploy with Docker Compose
```bash
docker-compose up -d
```

## Manual Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration
```bash
# Convert SQLite to PostgreSQL if needed
npm run migrate
```

### 3. Start with PM2
```bash
npm run pm2
```

### 4. Setup Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Cloud Deployment Options

### AWS
```bash
# EC2 + RDS PostgreSQL
# Use AWS Elastic Beanstalk or ECS
```

### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql
git push heroku main
```

### DigitalOcean
```bash
# App Platform or Droplet + Managed Database
```

### Vercel/Netlify (Frontend Only)
- Deploy static files to CDN
- Use serverless functions for API

## Security Checklist
- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set secure cookies
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Use environment variables
- [ ] Regular security updates
- [ ] Database backups

## Monitoring
```bash
# PM2 monitoring
pm2 monit

# Logs
pm2 logs
tail -f logs/combined.log
```

## Backup Strategy
```bash
# Database backup script
pg_dump divas_closet > backup.sql

# File backup
tar -czf backup.tar.gz app.db logs/
```