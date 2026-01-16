require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('../database');

// Create Express app for this function
const app = express();
app.use(cors());
app.use(express.json());

// Import auth routes
const authRouter = require('../routes/api');
app.use('/', authRouter);

// Export as serverless function
module.exports = (req, res) => {
  app(req, res);
};
