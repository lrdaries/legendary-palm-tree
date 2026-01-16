// Debug script for Vercel environment
console.log('=== Vercel Environment Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Test database connection
try {
  const isVercel = process.env.NODE_ENV === 'production' && process.env.VERCEL;
  console.log('isVercel:', isVercel);
  
  if (isVercel) {
    console.log('Loading database-postgres...');
    const Database = require('./database-postgres');
    console.log('PostgreSQL module loaded successfully');
  } else {
    console.log('Loading database (SQLite)...');
    const Database = require('./database');
    console.log('SQLite module loaded successfully');
  }
} catch (error) {
  console.error('Database loading error:', error.message);
}

console.log('=== End Debug ===');
