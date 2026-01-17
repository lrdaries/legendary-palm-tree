const express = require('express');
const router = express.Router();
const Database = require('../database');

// Search suggestions endpoint (must come before /:id route)
router.get('/search/suggestions', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.json({ success: true, suggestions: [] });
    }
    
    const products = await Database.getAllProducts(50, 0);
    const searchTerm = query.toLowerCase().trim();
    
    const suggestions = new Set();
    
    products.forEach(p => {
      // Add product names that match
      if (p.name && p.name.toLowerCase().includes(searchTerm)) {
        suggestions.add(p.name);
      }
      
      // Add categories that match
      if (p.category && p.category.toLowerCase().includes(searchTerm)) {
        suggestions.add(p.category);
      }
      
      // Add words from descriptions that match
      if (p.description) {
        const words = p.description.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.includes(searchTerm) && word.length > 2) {
            suggestions.add(word.charAt(0).toUpperCase() + word.slice(1));
          }
        });
      }
    });
    
    res.json({
      success: true,
      suggestions: Array.from(suggestions).slice(0, 8)
    });
  } catch (err) {
    console.error('Error getting search suggestions:', err);
    res.status(500).json({ success: false, message: 'Failed to get suggestions' });
  }
});

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
    const category = req.query.category;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;
    const sortBy = req.query.sortBy || 'relevance';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters' 
      });
    }
    
    const products = await Database.getAllProducts(200, 0); // Get more for search
    
    // Enhanced search with fuzzy matching and relevance scoring
    const searchResults = products
      .filter(p => {
        // Basic filters
        if (category && category !== 'All' && p.category !== category) return false;
        if (p.price < minPrice || p.price > maxPrice) return false;
        
        // Search relevance scoring
        const searchTerm = query.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const description = (p.description || '').toLowerCase();
        const categoryField = (p.category || '').toLowerCase();
        
        let score = 0;
        
        // Exact name match (highest score)
        if (name === searchTerm) score += 100;
        // Name starts with query
        else if (name.startsWith(searchTerm)) score += 80;
        // Name contains query
        else if (name.includes(searchTerm)) score += 60;
        // Description contains query
        else if (description.includes(searchTerm)) score += 40;
        // Category matches
        else if (categoryField.includes(searchTerm)) score += 20;
        // Partial word matching in name
        else if (searchTerm.split(' ').some(word => name.includes(word))) score += 30;
        // Partial word matching in description
        else if (searchTerm.split(' ').some(word => description.includes(word))) score += 15;
        
        // Only include products with some relevance
        return score > 0;
      })
      .map(p => {
        // Calculate relevance score
        const searchTerm = query.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const description = (p.description || '').toLowerCase();
        const categoryField = (p.category || '').toLowerCase();
        
        let score = 0;
        
        if (name === searchTerm) score += 100;
        else if (name.startsWith(searchTerm)) score += 80;
        else if (name.includes(searchTerm)) score += 60;
        else if (description.includes(searchTerm)) score += 40;
        else if (categoryField.includes(searchTerm)) score += 20;
        else if (searchTerm.split(' ').some(word => name.includes(word))) score += 30;
        else if (searchTerm.split(' ').some(word => description.includes(word))) score += 15;
        
        return { ...p, _relevanceScore: score };
      })
      .sort((a, b) => {
        // Sort by relevance score first, then by other criteria
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'relevance':
          default:
            return b._relevanceScore - a._relevanceScore;
        }
      })
      .slice(offset, offset + limit);
    
    // Get total count for pagination
    const totalResults = products.filter(p => {
      if (category && category !== 'All' && p.category !== category) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      
      const searchTerm = query.toLowerCase().trim();
      const name = (p.name || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      const categoryField = (p.category || '').toLowerCase();
      
      return name.includes(searchTerm) || 
             description.includes(searchTerm) || 
             categoryField.includes(searchTerm);
    }).length;
    
    // Generate search suggestions based on popular terms
    const suggestions = new Set();
    products.forEach(p => {
      const name = p.name || '';
      const category = p.category || '';
      
      if (name.toLowerCase().includes(query.toLowerCase()) && name !== query) {
        suggestions.add(name);
      }
      if (category.toLowerCase().includes(query.toLowerCase()) && category !== query) {
        suggestions.add(category);
      }
    });
    
    res.json({
      success: true,
      data: searchResults,
      query: query,
      pagination: {
        page: page,
        limit: limit,
        total: totalResults,
        totalPages: Math.ceil(totalResults / limit),
        hasMore: offset + limit < totalResults
      },
      suggestions: Array.from(suggestions).slice(0, 5),
      filters: {
        category: category || 'All',
        minPrice: minPrice,
        maxPrice: maxPrice === Infinity ? null : maxPrice,
        sortBy: sortBy
      }
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
