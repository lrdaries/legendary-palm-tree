require('dotenv').config();

module.exports = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    database: process.env.DATABASE_URL ? 'configured' : 'missing',
    email: process.env.RESEND_API_KEY ? 'configured' : 'missing'
  });
};
