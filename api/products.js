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

// Simple products endpoint
app.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const category = req.query.category;
    
    let products = await Database.getAllProducts(limit, offset);
    
    // Filter by category if specified
    if (category && category !== 'All') {
      products = products.filter(p => 
        p.category && p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    res.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Export as serverless function
module.exports = (req, res) => {
  app(req, res);
};
