# Admin Login Troubleshooting Report

## 🔴 Issue Identified & Fixed

**Problem:** Admin login was not working - page would reload without navigating to dashboard.

**Root Cause:** The admin login form was calling the wrong API endpoint.
- **Incorrect Endpoint:** `/api/admin/login`  
- **Correct Endpoint:** `/api/admin/auth/login`

## ✅ Fixes Applied

### 1. Fixed Login Endpoint URL
**File:** [admin/index.html](admin/index.html#L769)
- Changed from: `${CONFIG.API_BASE_URL}/admin/login`
- Changed to: `${CONFIG.API_BASE_URL}/admin/auth/login`

### 2. Enhanced Debugging
Added comprehensive console logging to help track issues:
- Login attempt logging with email and API URL
- Server response status logging
- Session storage logging
- Redirect verification

## 📋 Admin Login Flow

### Client-Side (admin/index.html)
1. User enters email and password
2. Form submits to: `POST /api/admin/auth/login`
3. Server validates credentials
4. On success, stores session data to localStorage/sessionStorage:
   ```javascript
   {
       email: string,
       role: string,
       token: string,
       timestamp: number
   }
   ```
5. Redirects to `dashboard.html`

### Server-Side Flow
1. **Route:** [routes/admin-auth.js](routes/admin-auth.js) - `POST /login` (mounted at `/api/admin/auth`)
2. **Validation:**
   - Email and password required
   - User must exist in database
   - User must have `role = 'admin'`
   - Password hash must match
3. **Response:** Includes token and user data

### Dashboard Verification (admin/dashboard.html)
1. Checks for adminSession in localStorage or sessionStorage
2. Verifies session hasn't expired (24-hour limit)
3. Redirects to index.html if no valid session

## 🔑 Required Credentials

### Create Admin User
To create an admin account:

```bash
node scripts/setup-admin.js
```

Or manually insert into database:
```sql
INSERT INTO users (email, first_name, last_name, password_hash, role, verified)
VALUES ('admin@example.com', 'Admin', 'User', 'bcrypt_hash', 'admin', 1);
```

## 🐛 Debugging Checklist

### 1. Check Console Logs
Open browser DevTools (F12) and check console for:
- ✅ `🔐 Login attempt for: admin@example.com` - Login started
- ✅ `📍 API URL: http://localhost:3000/api/admin/auth/login` - Correct endpoint
- ✅ `📬 Server response status: 200` - Success response
- ✅ `✅ Login successful, session data:` - Session saved
- ✅ `🔄 Redirecting to dashboard...` - Redirect in progress

### 2. Check Session Storage
In DevTools Console, run:
```javascript
// Check localStorage
console.log(JSON.parse(localStorage.getItem('adminSession')));

// Check sessionStorage
console.log(JSON.parse(sessionStorage.getItem('adminSession')));
```

Should show:
```javascript
{
    email: "admin@example.com",
    role: "admin",
    token: "jwt_token_here",
    timestamp: 1702988400000
}
```

### 3. Test Server Endpoint
Use curl or Postman:
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

Expected response:
```json
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "admin",
        "verified": 1
    }
}
```

### 4. Verify Admin User Exists
Check database:
```bash
node -e "const Database = require('./database'); Database.getUserByEmail('admin@example.com').then(u => console.log(u))"
```

Should show user with `role = 'admin'` and a valid `password_hash`.

## 🔒 Security Checklist

- [ ] Admin user password is hashed (bcrypt)
- [ ] JWT token in .env is strong
- [ ] CORS allows localhost:3000
- [ ] API endpoints require valid token for protected routes
- [ ] Session expires after 24 hours
- [ ] Password fields use type="password"

## 📝 Common Issues & Solutions

### Issue: "Invalid credentials" message
**Solution:**
1. Verify admin user exists: `node scripts/setup-admin.js`
2. Check password is correct
3. Ensure email is lowercase in database

### Issue: CORS error in console
**Solution:**
1. Check .env has ALLOWED_ORIGINS set
2. Default allowed origins: localhost:3000, localhost:8000, 127.0.0.1:3000

### Issue: "Network error" message
**Solution:**
1. Verify server is running: `npm start`
2. Check API URL in [admin/config.js](admin/config.js)
3. Verify port 3000 is accessible

### Issue: Page reloads after login but doesn't navigate
**Solution:**
1. Check browser console for JavaScript errors
2. Verify session data is being saved (see debugging step 2)
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Hard refresh: `Ctrl+Shift+R`

## 🚀 Files Modified

1. [admin/index.html](admin/index.html)
   - Fixed login endpoint from `/admin/login` to `/admin/auth/login`
   - Added debugging console logs

2. [routes/admin-auth.js](routes/admin-auth.js)
   - Verified endpoint is `/login` (mounted at `/api/admin/auth`)
   - Response includes full user object

3. [utils/admin-auth.js](utils/admin-auth.js)
   - Middleware to verify JWT tokens for protected routes

4. [admin/config.js](admin/config.js)
   - API_BASE_URL: `http://localhost:3000/api`

## 📞 Testing Steps

1. **Start Server:**
   ```bash
   npm start
   ```

2. **Setup Admin (if needed):**
   ```bash
   node scripts/setup-admin.js
   ```

3. **Open Admin Portal:**
   ```
   http://localhost:3000/admin
   ```

4. **Login with credentials:**
   - Email: (from setup or database)
   - Password: (as set)
   - Remember me: Optional

5. **Verify Dashboard:**
   - Should redirect to dashboard.html
   - Should show admin stats and products section

## 📚 Related Documentation

- [routes/admin-auth.js](routes/admin-auth.js) - Authentication endpoints
- [utils/admin-auth.js](utils/admin-auth.js) - JWT verification middleware
- [admin/dashboard.html](admin/dashboard.html) - Admin dashboard
- [admin/config.js](admin/config.js) - Client-side configuration

---

**Last Updated:** December 19, 2025
**Status:** ✅ RESOLVED
