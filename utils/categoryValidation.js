/**
 * Category Validation Utilities
 * Helper functions for validating categories and subcategories
 */

const { 
  isValidCategory, 
  isValidSubcategory, 
  getCategoryInfo, 
  getSubcategories,
  getCategoryKeys,
  mapFrontendToBackend,
  mapBackendToFrontend
} = require('../config/categories');

/**
 * Validate a product's category and subcategory
 * @param {string} category - The category to validate
 * @param {string} subcategory - The subcategory to validate (optional)
 * @returns {Object} Validation result with isValid and errors
 */
function validateProductCategory(category, subcategory = null) {
  const errors = [];
  
  if (!category) {
    errors.push('Category is required');
    return { isValid: false, errors };
  }
  
  if (!isValidCategory(category)) {
    errors.push(`Invalid category: ${category}. Valid categories are: ${getCategoryKeys().join(', ')}`);
  }
  
  if (subcategory && !isValidSubcategory(category, subcategory)) {
    const validSubcategories = getSubcategories(category);
    if (validSubcategories.length > 0) {
      errors.push(`Invalid subcategory: ${subcategory} for category: ${category}. Valid subcategories are: ${validSubcategories.join(', ')}`);
    } else {
      errors.push(`Category ${category} does not have any subcategories`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize and normalize category input
 * @param {string} category - The category input
 * @returns {string|null} Normalized category or null if invalid
 */
function sanitizeCategory(category) {
  if (!category || typeof category !== 'string') {
    return null;
  }
  
  // Convert to lowercase and trim
  const normalized = category.toLowerCase().trim();
  
  // Check if it's a valid category
  if (isValidCategory(normalized)) {
    return normalized;
  }
  
  // Try to map from frontend display name
  const mapped = mapFrontendToBackend(category);
  return mapped;
}

/**
 * Sanitize and normalize subcategory input
 * @param {string} category - The parent category
 * @param {string} subcategory - The subcategory input
 * @returns {string|null} Normalized subcategory or null if invalid
 */
function sanitizeSubcategory(category, subcategory) {
  if (!subcategory || typeof subcategory !== 'string') {
    return null;
  }
  
  // Convert to lowercase and trim
  const normalized = subcategory.toLowerCase().trim();
  
  // Check if it's a valid subcategory for the given category
  if (isValidSubcategory(category, normalized)) {
    return normalized;
  }
  
  return null;
}

/**
 * Get category statistics for analytics
 * @param {Array} products - Array of products
 * @returns {Object} Category statistics
 */
function getCategoryStatistics(products) {
  const stats = {};
  const categoryKeys = getCategoryKeys();
  
  // Initialize stats for all categories
  categoryKeys.forEach(key => {
    stats[key] = {
      name: mapBackendToFrontend(key),
      count: 0,
      totalValue: 0,
      averagePrice: 0,
      subcategories: {}
    };
  });
  
  // Calculate statistics
  products.forEach(product => {
    const category = product.category;
    if (isValidCategory(category)) {
      stats[category].count++;
      stats[category].totalValue += product.price || 0;
      
      // Track subcategories
      if (product.subcategory) {
        if (!stats[category].subcategories[product.subcategory]) {
          stats[category].subcategories[product.subcategory] = 0;
        }
        stats[category].subcategories[product.subcategory]++;
      }
    }
  });
  
  // Calculate averages
  Object.keys(stats).forEach(key => {
    const stat = stats[key];
    if (stat.count > 0) {
      stat.averagePrice = stat.totalValue / stat.count;
    }
  });
  
  return stats;
}

/**
 * Format category for display in UI
 * @param {string} category - The category key
 * @returns {Object} Formatted category info
 */
function formatCategoryForDisplay(category) {
  const info = getCategoryInfo(category);
  if (!info) {
    return {
      key: 'other',
      name: 'Other',
      description: 'Miscellaneous items',
      icon: 'more-horizontal',
      color: '#718096'
    };
  }
  
  return {
    key: category,
    name: info.name,
    description: info.description,
    subcategories: info.subcategories
  };
}

/**
 * Get categories with product counts
 * @param {Array} products - Array of products
 * @returns {Array} Categories with product counts
 */
function getCategoriesWithCounts(products) {
  const categoryKeys = getCategoryKeys();
  const counts = {};
  
  // Count products per category
  products.forEach(product => {
    const category = product.category;
    if (isValidCategory(category)) {
      counts[category] = (counts[category] || 0) + 1;
    }
  });
  
  // Build result array
  return categoryKeys.map(key => ({
    key,
    name: mapBackendToFrontend(key),
    count: counts[key] || 0,
    info: getCategoryInfo(key)
  })).filter(cat => cat.count > 0); // Only return categories with products
}

/**
 * Middleware for validating category in API requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validateCategoryMiddleware(req, res, next) {
  const { category, subcategory } = req.body;
  
  const validation = validateProductCategory(category, subcategory);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category data',
      errors: validation.errors
    });
  }
  
  // Sanitize the inputs
  if (category) {
    req.body.category = sanitizeCategory(category);
  }
  
  if (subcategory) {
    req.body.subcategory = sanitizeSubcategory(req.body.category, subcategory);
  }
  
  next();
}

module.exports = {
  validateProductCategory,
  sanitizeCategory,
  sanitizeSubcategory,
  getCategoryStatistics,
  formatCategoryForDisplay,
  getCategoriesWithCounts,
  validateCategoryMiddleware
};
