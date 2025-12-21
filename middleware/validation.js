const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category max 100 characters'),
  
  body('in_stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  
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
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category max 100 characters'),
  
  body('in_stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  
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