/**
 * Centralized Category Configuration
 * This file defines all product categories for Diva's Kloset
 * Both backend and frontend should import from this file
 */

// Main categories with their display names and descriptions
const CATEGORIES = {
  clothing: {
    name: 'Clothing',
    description: 'Apparel and garments',
    subcategories: ['dresses', 'tops', 'bottoms', 'outerwear', 'sets', 'activewear', 'loungewear', 'intimates']
  },
  shoes: {
    name: 'Shoes',
    description: 'Footwear for all occasions',
    subcategories: ['heels', 'flats', 'sneakers', 'boots', 'sandals', 'athletic', 'formal']
  },
  accessories: {
    name: 'Accessories',
    description: 'Fashion accessories and complements',
    subcategories: ['belts', 'scarves', 'hats', 'gloves', 'sunglasses', 'watches', 'tech-accessories']
  },
  jewelry: {
    name: 'Jewelry',
    description: 'Fine and fashion jewelry',
    subcategories: ['necklaces', 'earrings', 'bracelets', 'rings', 'brooches', 'fine-jewelry', 'costume-jewelry']
  },
  bags: {
    name: 'Bags',
    description: 'Handbags and carrying accessories',
    subcategories: ['handbags', 'totes', 'clutches', 'backpacks', 'crossbody', 'luggage', 'wallets']
  },
  beauty: {
    name: 'Beauty',
    description: 'Cosmetics and skincare',
    subcategories: ['makeup', 'skincare', 'fragrance', 'haircare', 'bodycare', 'tools', 'men-grooming']
  },
  home: {
    name: 'Home & Living',
    description: 'Home decor and lifestyle products',
    subcategories: ['decor', 'bedding', 'bath', 'kitchen', 'lighting', 'textiles', 'furniture']
  },
  electronics: {
    name: 'Electronics',
    description: 'Tech gadgets and accessories',
    subcategories: ['phones', 'tablets', 'laptops', 'audio', 'wearables', 'gaming', 'accessories']
  },
  sports: {
    name: 'Sports & Fitness',
    description: 'Athletic wear and equipment',
    subcategories: ['activewear', 'equipment', 'accessories', 'outdoor', 'yoga', 'running', 'team-sports']
  },
  kids: {
    name: 'Kids',
    description: "Children's clothing and accessories",
    subcategories: ['boys-clothing', 'girls-clothing', 'baby', 'shoes', 'accessories', 'toys']
  },
  mens: {
    name: "Men's",
    description: "Men's fashion and accessories",
    subcategories: ['clothing', 'shoes', 'accessories', 'grooming', 'underwear', 'formal-wear']
  },
  sale: {
    name: 'Sale',
    description: 'Discounted items and special offers',
    subcategories: ['clearance', 'last-chance', 'seasonal-sale', 'flash-sale']
  },
  other: {
    name: 'Other',
    description: 'Miscellaneous items',
    subcategories: []
  }
};

// Get all category keys (for backend validation)
const getCategoryKeys = () => Object.keys(CATEGORIES);

// Get all category display names (for frontend dropdowns)
const getCategoryNames = () => Object.values(CATEGORIES).map(cat => cat.name);

// Get category info by key
const getCategoryInfo = (categoryKey) => CATEGORIES[categoryKey] || null;

// Get all subcategories for a category
const getSubcategories = (categoryKey) => {
  const category = CATEGORIES[categoryKey];
  return category ? category.subcategories : [];
};

// Validate if a category exists
const isValidCategory = (categoryKey) => Object.keys(CATEGORIES).includes(categoryKey);

// Validate if a subcategory exists within a category
const isValidSubcategory = (categoryKey, subcategoryKey) => {
  const subcategories = getSubcategories(categoryKey);
  return subcategories.includes(subcategoryKey);
};

// Get formatted categories for frontend display (includes 'All' option)
const getFrontendCategories = () => ['All', ...getCategoryNames()];

// Map frontend display names to backend keys
const mapFrontendToBackend = (displayName) => {
  if (displayName === 'All') return null;
  
  for (const [key, info] of Object.entries(CATEGORIES)) {
    if (info.name === displayName) return key;
  }
  return null;
};

// Map backend keys to frontend display names
const mapBackendToFrontend = (backendKey) => {
  const category = CATEGORIES[backendKey];
  return category ? category.name : 'Other';
};

// Category hierarchy for navigation/breadcrumbs
const getCategoryHierarchy = () => {
  const hierarchy = {};
  for (const [key, info] of Object.entries(CATEGORIES)) {
    hierarchy[key] = {
      name: info.name,
      subcategories: info.subcategories
    };
  }
  return hierarchy;
};

// Categories with their icons for UI
const CATEGORIES_WITH_ICONS = {
  clothing: { icon: 'shirt', color: '#722F37' },
  shoes: { icon: 'shoe-prints', color: '#1A1A1A' },
  accessories: { icon: 'watch', color: '#4A5568' },
  jewelry: { icon: 'gem', color: '#D69E2E' },
  bags: { icon: 'shopping-bag', color: '#805AD5' },
  beauty: { icon: 'sparkles', color: '#ED64A6' },
  home: { icon: 'home', color: '#38B2AC' },
  electronics: { icon: 'smartphone', color: '#3182CE' },
  sports: { icon: 'dumbbell', color: '#48BB78' },
  kids: { icon: 'baby', color: '#F6AD55' },
  mens: { icon: 'user', color: '#2D3748' },
  sale: { icon: 'tag', color: '#E53E3E' },
  other: { icon: 'more-horizontal', color: '#718096' }
};

module.exports = {
  CATEGORIES,
  CATEGORIES_WITH_ICONS,
  getCategoryKeys,
  getCategoryNames,
  getCategoryInfo,
  getSubcategories,
  isValidCategory,
  isValidSubcategory,
  getFrontendCategories,
  mapFrontendToBackend,
  mapBackendToFrontend,
  getCategoryHierarchy
};
