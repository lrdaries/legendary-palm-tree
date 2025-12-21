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
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ---------- IMAGE UPLOAD ROUTE ----------
// Add this BEFORE the existing routes
router.post('/upload-images', verifyAdminToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Generate URLs for uploaded files
    const imageUrls = req.files.map(file => {
      return `/uploads/${file.filename}`; // Adjust path as needed for your setup
    });

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      imageUrls: imageUrls
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// ---------- EXISTING PRODUCT ROUTES ----------
// ... rest of your existing routes stay the same ...

module.exports = router;