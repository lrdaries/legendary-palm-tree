# 🚀 Quick Deployment Guide - Diva's Kloset

## 5-Minute Quick Start

### 1. Local Development
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit: Change JWT_SECRET, ADMIN credentials

# Test database
node test-db.js

# Start server
npm start
# Visit: http://localhost:3000/admin/index.html
```

### 2. Docker Deployment (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### 3. PM2 Production (Linux/Mac)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
npm run pm2

# Monitor
pm2 monit

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

---

## ☁️ Cloud Deployment Options

### **Heroku (Easiest)**
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create divas-kloset

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set ADMIN_PASSWORD=secure-password

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### **AWS EC2 + RDS**
```bash
# 1. Launch EC2 Ubuntu instance
# 2. SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# 3. Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql-client git nginx

# 4. Clone repository
git clone https://github.com/your-repo/legendary-palm-tree.git
cd legendary-palm-tree
npm install

# 5. Configure environment
nano .env
# Set DATABASE_URL to RDS endpoint, etc.

# 6. Install PM2
npm install -g pm2
npm run pm2

# 7. Configure Nginx reverse proxy
# See SECURITY.md for Nginx config

# 8. Set up SSL with Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com
```

### **DigitalOcean**
```bash
# 1. Create App Platform app
doctl apps create --spec app.yaml

# 2. Or use Droplet + App Platform
# - Create Ubuntu 20.04 Droplet
# - Connect via SSH
# - Follow AWS EC2 steps above
```

### **Railway.app (Simplest)**
```bash
# Login at https://railway.app
# 1. Connect GitHub repo
# 2. Add variables: JWT_SECRET, ADMIN_PASSWORD, DATABASE_URL
# 3. Select PostgreSQL add-on
# 4. Deploy (automatic on push)
```

---

## 📊 Performance Optimization

### Enable Compression
```javascript
// In server.js
const zlib = require('zlib');

res.setHeader('Content-Encoding', 'gzip');
res.pipe(zlib.createGzip()).pipe(res);
```

### Database Indexing
```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_otp_codes_email ON otp_codes(email);
```

### Caching Strategy
```javascript
// Cache user data for 1 hour
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'max-age=3600, public');
    next();
});
```

---

## 🔐 Post-Deployment Security

### 1. Configure SSL/HTTPS
```bash
# Let's Encrypt certificate (1 month to expiry)
0 0 1 * * sudo certbot renew
```

### 2. Set Up Firewall
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # Block direct access
```

### 3. Backup Database
```bash
# Automated daily backups
0 2 * * * pg_dump divas_closet | gzip > /backups/db-$(date +\%Y-\%m-\%d).sql.gz
```

### 4. Monitor Application
```bash
# PM2 monitoring dashboard
pm2 web  # Visit http://localhost:9615

# System monitoring
top  # Or use htop
```

---

## 🧪 Testing Before Launch

### Smoke Tests
```bash
# Test endpoints are working
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Load Testing
```bash
npm install -g artillery

# Create artillery.yml
cat > artillery.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: 'OTP Request'
    requests:
      - post:
          url: '/api/auth/request-otp'
          json:
            email: 'test@example.com'
EOF

artillery run artillery.yml
```

### Security Scan
```bash
npm install -g snyk
snyk test
snyk monitor
```

---

## 📈 Monitoring & Alerts

### Application Monitoring
```bash
# Install PM2 Plus (free tier available)
pm2 install pm2-auto-pull

# Set alerts
pm2 install pm2-server-monit

# View on dashboard
pm2 plus
```

### Log Monitoring
```bash
# Real-time logs
tail -f /var/log/divas-closet/app.log

# Error logs
tail -f /var/log/divas-closet/error.log

# Search logs
grep "ERROR" /var/log/divas-closet/app.log
```

### Database Monitoring
```bash
# PostgreSQL queries
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

# Slow queries
ALTER SYSTEM SET log_min_duration_statement = 1000;  # Log queries > 1s
```

---

## 🆘 Troubleshooting

### Server Won't Start
```bash
# Check port availability
lsof -i :3000
netstat -tuln | grep 3000

# Free up port
kill -9 $(lsof -t -i:3000)

# Check logs for errors
pm2 logs app
```

### Database Connection Failed
```bash
# Test connection string
psql "postgresql://user:pass@host:5432/db"

# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### High Memory Usage
```bash
# Check process memory
ps aux | grep node

# Increase Node.js memory limit
NODE_OPTIONS=--max_old_space_size=2048 npm start

# Or in PM2
pm2 start server.js --max-memory-restart 1G
```

### 502 Bad Gateway (Nginx)
```bash
# Check upstream (Node.js) is running
curl http://localhost:3000

# Check Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
tail -f /var/log/nginx/error.log
```

---

## 📋 Pre-Launch Checklist

**Configuration:**
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Admin credentials changed
- [ ] JWT_SECRET configured

**Security:**
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] Rate limiting active
- [ ] CORS origins restricted

**Operations:**
- [ ] Backups automated
- [ ] Monitoring active
- [ ] Logging configured
- [ ] Error tracking enabled

**Testing:**
- [ ] Smoke tests passed
- [ ] Load tests passed
- [ ] Security scan passed
- [ ] User acceptance testing done

---

## 📞 Support

- **Documentation**: See PRODUCTION_REVIEW.md
- **Security**: See SECURITY.md
- **Issues**: Check logs and error messages
- **Community**: Node.js Discord, Stack Overflow

---

**Last Updated:** December 19, 2025  
**Version:** 1.0.0
