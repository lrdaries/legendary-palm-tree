const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Database = require('../../database');
const { verifyAdminToken } = require('../../utils/admin-auth');
const {
  validateProductCreate,
  validateProductUpdate,
  validateProductDelete,
  validateProductGet
} = require('../../middleware/validation');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

async function generateUniqueSku(base, excludeProductId = null) {
  const raw = (base || '').toString().trim().toUpperCase();
  const cleaned = raw
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  const prefix = cleaned || 'SKU';

  // Keep trying short random suffixes until we find a free one.
  for (let i = 0; i < 50; i++) {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    const candidate = `${prefix}-${suffix}`.slice(0, 64);
    // eslint-disable-next-line no-await-in-loop
    const exists = await Database.skuExists(candidate, excludeProductId);
    if (!exists) return candidate;
  }

  throw new Error('Failed to generate unique SKU');
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Upload images (admin only)
router.post('/upload-images', verifyAdminToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      imageUrls
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Get all products with pagination
router.get('/', validateProductGet, async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;
    
    const products = await Database.getAllProducts(limit, offset);
    const total = await Database.countProducts();
    
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

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    
    const product = await Database.getProductById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// Create product (admin only)
router.post('/', verifyAdminToken, validateProductCreate, async (req, res) => {
  try {
    const { sku, name, description, price, category, in_stock, image_urls } = req.body;

    let finalSku = (sku || '').trim();
    if (!finalSku) {
      finalSku = await generateUniqueSku(name);
    } else {
      const exists = await Database.skuExists(finalSku);
      if (exists) {
        finalSku = await generateUniqueSku(finalSku);
      }
    }
    
    const product = await Database.createProduct({
      sku: finalSku,
      name,
      description,
      price: parseFloat(price),
      category,
      in_stock: parseInt(in_stock) || 0,
      image_urls: image_urls || []
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', verifyAdminToken, validateProductUpdate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sku, name, description, price, category, in_stock, image_urls } = req.body;
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    
    // Check if product exists
    const existing = await Database.getProductById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });
    
    // Update only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) {
      const desired = (sku || '').trim();
      if (!desired) {
        updateData.sku = await generateUniqueSku(name || existing.name, id);
      } else {
        const exists = await Database.skuExists(desired, id);
        updateData.sku = exists ? await generateUniqueSku(desired, id) : desired;
      }
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (in_stock !== undefined) updateData.in_stock = parseInt(in_stock);
    if (image_urls !== undefined) updateData.image_urls = image_urls;
    
    const updated = await Database.updateProduct(id, updateData);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', verifyAdminToken, validateProductDelete, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if product exists
    const existing = await Database.getProductById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });
    
    await Database.deleteProduct(id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

module.exports = router;
