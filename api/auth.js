require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Database selection based on environment
const isVercel = process.env.NODE_ENV === 'production' && process.env.VERCEL;
const Database = isVercel ? require('../database-postgres') : require('../database');

// Create Express app for this function
const app = express();
app.use(cors());
app.use(express.json());

// Simple auth endpoints
app.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    res.json({ success: true, message: 'OTP endpoint working' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    res.json({ success: true, message: 'Verify OTP endpoint working' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export as serverless function
module.exports = (req, res) => {
  app(req, res);
};
