const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation Errors:', errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    })));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Product Validations
const validateProductCreate = [
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 64 }).withMessage('SKU must be 1-64 characters'),

  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 255 }).withMessage('Name must be 3-255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description max 5000 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('compare_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Compare price must be a positive number'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category max 100 characters'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brand max 100 characters'),
  
  body('in_stock')
    .optional()
    .custom((value) => {
      // Accept various formats and convert to boolean
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string') {
        return value === 'true' || value === 'false';
      }
      if (typeof value === 'number') {
        return value === 0 || value === 1;
      }
      return false;
    }).withMessage('Stock status must be true or false'),

  body('stock_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),

  body('low_stock_alert')
    .optional()
    .isInt({ min: 0 }).withMessage('Low stock alert must be a positive integer'),

  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Barcode max 100 characters'),

  body('tags')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Tags max 500 characters'),

  body('sizes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Sizes max 500 characters'),

  body('colors')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Colors max 500 characters'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft']).withMessage('Status must be active, inactive, or draft'),

  body('meta_title')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Meta title max 255 characters'),

  body('meta_description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Meta description max 500 characters'),

  body('url_slug')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('URL slug max 255 characters'),
  
  body('image_urls')
    .optional()
    .isArray().withMessage('Images must be an array')
    .custom((arr) => {
      if (arr && arr.length > 10) throw new Error('Max 10 images allowed');
      return true;
    }),
  
  handleValidationErrors
];

const validateProductUpdate = [
  param('id')
    .isInt().withMessage('Invalid product ID')
    .toInt(),
  
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 64 }).withMessage('SKU must be 1-64 characters'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Name must be 3-255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description max 5000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('compare_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Compare price must be a positive number'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category max 100 characters'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brand max 100 characters'),
  
  body('in_stock')
    .optional()
    .custom((value) => {
      // Accept various formats and convert to boolean
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string') {
        return value === 'true' || value === 'false';
      }
      if (typeof value === 'number') {
        return value === 0 || value === 1;
      }
      return false;
    }).withMessage('Stock status must be true or false'),

  body('stock_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),

  body('low_stock_alert')
    .optional()
    .isInt({ min: 0 }).withMessage('Low stock alert must be a positive integer'),

  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Barcode max 100 characters'),

  body('tags')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Tags max 500 characters'),

  body('sizes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Sizes max 500 characters'),

  body('colors')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Colors max 500 characters'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft']).withMessage('Status must be active, inactive, or draft'),

  body('meta_title')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Meta title max 255 characters'),

  body('meta_description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Meta description max 500 characters'),

  body('url_slug')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('URL slug max 255 characters'),
  
  body('image_urls')
    .optional()
    .isArray().withMessage('Images must be an array')
    .custom((arr) => {
      if (arr && arr.length > 10) throw new Error('Max 10 images allowed');
      return true;
    }),
  
  handleValidationErrors
];

const validateProductDelete = [
  param('id')
    .isInt().withMessage('Invalid product ID')
    .toInt(),
  
  handleValidationErrors
];

const validateProductGet = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
    .toInt(),
  
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be >= 0')
    .toInt(),
  
  handleValidationErrors
];

// User/Auth Validations
const validateUserRegistration = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

module.exports = {
  validateProductCreate,
  validateProductUpdate,
  validateProductDelete,
  validateProductGet,
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors
};