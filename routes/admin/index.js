// routes/admin/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const productsRouter = require('./products');

// Mount routes
router.use('/products', productsRouter);

module.exports = router;