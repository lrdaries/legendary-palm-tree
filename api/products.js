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

// Import products routes
const productsRouter = require('../routes/products');
app.use('/', productsRouter);

// Export as serverless function
module.exports = (req, res) => {
  app(req, res);
};
