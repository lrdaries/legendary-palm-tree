const express = require('express');
const router = express.Router();
const { addStructuredData } = require('../middleware/seo');

// Apply SEO middleware to all routes
router.use(addStructuredData);

// Serve structured data endpoint
router.get('/structured-data.json', (req, res) => {
  res.json(res.locals.structuredData || []);
});

module.exports = router;
