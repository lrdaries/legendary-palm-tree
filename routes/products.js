const express = require('express');
const router = express.Router();
const Database = require('../database');

// Get all products (public endpoint)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const category = req.query.category;
    const sort = req.query.sort || 'featured';
    
    let products = await Database.getAllProducts(limit, offset);
    const total = await Database.countProducts();
    
    // Filter by category if specified
    if (category && category !== 'All') {
      products = products.filter(p => 
        p.category && p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply sorting
    switch (sort) {
      case 'price-low':
        products.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        products.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default: // featured
        // Keep original order (assumed to be featured order)
        break;
    }
    
    res.json({
      success: true,
      data: products,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters' 
      });
    }
    
    const products = await Database.getAllProducts(100, 0); // Get more for search
    const searchResults = products.filter(p => 
      (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
    );
    
    res.json({
      success: true,
      data: searchResults,
      query: query
    });
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ success: false, message: 'Failed to search products' });
  }
});

// Get single product (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    
    const product = await Database.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

module.exports = router;
