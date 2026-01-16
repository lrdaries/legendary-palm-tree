require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('../database');

// Create Express app for this function
const app = express();
app.use(cors());
app.use(express.json());

// Import products routes
const productsRouter = require('../routes/products');
app.use('/products', productsRouter);

// Export as serverless function
module.exports = (req, res) => {
  app(req, res);
};
