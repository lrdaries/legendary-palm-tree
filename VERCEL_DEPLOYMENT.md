# Vercel Deployment Guide

## 🚀 Ready for Vercel Deployment

Your application is now configured for Vercel deployment with PostgreSQL support!

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Push your code to GitHub
3. **Vercel PostgreSQL** - Free database available in Vercel dashboard

## 🗂️ Files Added/Modified

✅ `vercel.json` - Vercel configuration  
✅ `database-postgres.js` - PostgreSQL adapter  
✅ `migrate-to-postgres.js` - Data migration script  
✅ Updated `server.js` - Environment-based database selection  
✅ Updated `package.json` - Build and migration scripts  

## 🚀 Deployment Steps

### 1. Connect GitHub to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Node.js project

### 2. Set Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=your_supabase_connection_string
RESEND_API_KEY=your_resend_api_key  
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### 3. Configure Supabase Database
1. In Vercel dashboard, go to "Storage" → "Supabase"
2. Create a new Supabase project
3. Copy the connection string from Supabase dashboard
4. Add it as `DATABASE_URL` environment variable

### 4. Deploy
1. Vercel will automatically build and deploy
2. Build command: `npm run vercel-build`
3. Your app will be live at `https://your-app.vercel.app`

## 🌐 Supabase Integration (Recommended)

**Why Supabase is Better:**
- ✅ **Managed PostgreSQL** - No database maintenance required
- ✅ **Auto-backups** - Built-in backup and recovery
- ✅ **Connection Pooling** - Better performance out of the box
- ✅ **Real-time Subscriptions** - WebSocket support available
- ✅ **Built-in Auth** - Optional Supabase Auth integration
- ✅ **Edge Functions** - Serverless compute at database edge
- ✅ **Free Tier** - Generous free plan with good limits

**Before deploying to production:**

```bash
# Run this locally to migrate your SQLite data to PostgreSQL
npm run migrate-to-postgres
```

This will migrate:
- ✅ Users table
- ✅ Products table  
- ✅ Orders table
- ✅ OTPs table
- ✅ Email tokens table

## 🧪 Testing Locally (Vercel Simulation)

```bash
# Test with PostgreSQL locally
NODE_ENV=production npm start

# Or set Vercel env var manually
VERCEL=true npm start
```

## 🌐 Live Deployment Features

- ✅ **Automatic HTTPS** - Vercel provides SSL certificates
- ✅ **Global CDN** - Fast content delivery worldwide
- ✅ **Auto-scaling** - Handles traffic spikes automatically  
- ✅ **PostgreSQL Database** - Persistent, scalable storage
- ✅ **Serverless Functions** - Pay-per-use pricing
- ✅ **GitHub Integration** - Auto-deploy on push

## 🔧 Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `RESEND_API_KEY` | Email service | `re_xxxxxxxxxxxx` |
| `JWT_SECRET` | JWT signing | `your-secret-key` |
| `NODE_ENV` | Environment mode | `production` |

## 📊 Monitoring

- **Vercel Analytics** - Built-in performance monitoring
- **Vercel Logs** - Real-time error tracking
- **PostgreSQL Dashboard** - Database performance metrics

## 🚨 Important Notes

1. **File Uploads**: Product images need cloud storage (AWS S3, Cloudinary)
2. **Database Limits**: Free PostgreSQL has 512MB limit
3. **Function Timeout**: Serverless functions timeout after 30 seconds
4. **Cold Starts**: First request may be slower (serverless nature)

## 🆘 Troubleshooting

**Deployment Issues:**
- Check Vercel logs in dashboard
- Verify all environment variables are set
- Ensure build completes successfully

**Database Issues:**
- Test connection string format
- Check PostgreSQL database is created
- Run migration script if needed

**Performance Issues:**
- Enable Vercel Analytics
- Check function execution time
- Optimize database queries

## 🎉 Success!

Once deployed, your e-commerce platform will be:
- 🌍 **Globally accessible** via custom domain
- 🔒 **HTTPS secured** automatically  
- ⚡ **Blazing fast** with CDN
- 📈 **Auto-scaling** with traffic
- 💾 **Data persistent** in PostgreSQL
- 🔄 **Auto-deploying** from GitHub

**Your Vercel URL**: `https://your-app-name.vercel.app`
