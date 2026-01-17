const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const Database = require('../../database');
const { verifyAdminToken } = require('../../utils/admin-auth');
const {
  validateProductCreate,
  validateProductUpdate,
  validateProductDelete,
  validateProductGet
} = require('../../middleware/validation');

// Configure multer for image uploads
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const memoryStorage = multer.memoryStorage();

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

function isSupabaseStorageConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_STORAGE_BUCKET);
}

function getUploadMiddleware() {
  return multer({
    storage: isSupabaseStorageConfigured() ? memoryStorage : diskStorage,
    limits: {
      fileSize: 10 * 1024 * 1024 // Increased to 10MB
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  });
}

const upload = getUploadMiddleware();

// Upload images (admin only)
router.post('/upload-images', verifyAdminToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    if (isSupabaseStorageConfigured()) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const bucket = process.env.SUPABASE_STORAGE_BUCKET;

      const uploaded = [];

      for (const file of req.files) {
        const ext = path.extname(file.originalname || '') || '';
        const objectPath = `products/${uuidv4()}${ext}`;

        // eslint-disable-next-line no-await-in-loop
        const { error } = await supabase.storage
          .from(bucket)
          .upload(objectPath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) {
          return res.status(500).json({ success: false, message: `Upload failed: ${error.message}` });
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
        uploaded.push(data.publicUrl);
      }

      return res.json({
        success: true,
        message: `${uploaded.length} images uploaded successfully`,
        imageUrls: uploaded
      });
    }

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      imageUrls: req.files.map(file => `/uploads/${file.filename}`)
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
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { 
      sku, 
      name, 
      description, 
      price, 
      compare_price,
      category, 
      brand,
      in_stock, 
      stock_quantity,
      low_stock_alert,
      barcode,
      tags,
      sizes,
      colors,
      status,
      meta_title,
      meta_description,
      url_slug
    } = req.body;
    
    // Debug incoming request
    console.log('🛠 Create Product Request:');
    console.log('  Full req.body:', JSON.stringify(req.body, null, 2));
    console.log('  req.body keys:', Object.keys(req.body));
    console.log('  req.body.imageUrls type:', typeof req.body.imageUrls);
    console.log('  req.body.imageUrls value:', req.body.imageUrls);
    console.log('  req.body.image_urls type:', typeof req.body.image_urls);
    console.log('  req.body.image_urls value:', req.body.image_urls);
    console.log('  req.body.in_stock type:', typeof req.body.in_stock);
    console.log('  req.body.in_stock value:', req.body.in_stock);
    console.log('  req.body.stock_quantity type:', typeof req.body.stock_quantity);
    console.log('  req.body.stock_quantity value:', req.body.stock_quantity);
    
    // Handle both imageUrls (from upload) and image_urls (from manual entry)
    let image_urls = req.body.imageUrls || req.body.image_urls || [];
    
    // Ensure image_urls is always an array
    if (req.body.imageUrls && !Array.isArray(req.body.imageUrls)) {
      console.log('❌ imageUrls is not an array:', typeof req.body.imageUrls, req.body.imageUrls);
      console.log('❌ Converting imageUrls to string:', JSON.stringify(req.body.imageUrls));
      image_urls = []; // Reset to empty array if invalid
    }

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
      compare_price: compare_price ? parseFloat(compare_price) : null,
      category,
      brand,
      in_stock: true, // Default to true since product has stock
      stock_quantity: parseInt(in_stock) || 0, // Use in_stock field as stock_quantity
      low_stock_alert: parseInt(low_stock_alert) || 5,
      barcode,
      tags,
      sizes,
      colors,
      status: status || 'active',
      meta_title,
      meta_description,
      url_slug,
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
    const { sku, name, description, price, category, in_stock } = req.body;
    
    // Handle both imageUrls (from upload) and image_urls (from manual entry)
    let image_urls = req.body.imageUrls || req.body.image_urls;
    
    // Ensure image_urls is always an array
    if (req.body.imageUrls && !Array.isArray(req.body.imageUrls)) {
      console.log('❌ Update: imageUrls is not an array:', typeof req.body.imageUrls, req.body.imageUrls);
      image_urls = []; // Reset to empty array if invalid
    }
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
    if (in_stock !== undefined) updateData.in_stock = in_stock === 'true' || in_stock === true || parseInt(in_stock) > 0;
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
