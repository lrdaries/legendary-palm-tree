// routes/admin/index.js
const express = require('express');
const router = express.Router();

const Database = require('../../database');

// Import route modules
const productsRouter = require('./products');

// Mount routes
router.use('/products', productsRouter);

// Export users (admin only - already protected by verifyAdminToken at mount)
router.get('/users', async (req, res) => {
  try {
    const users = await Database.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Error exporting users:', err);
    res.status(500).json({ success: false, message: 'Failed to export users' });
  }
});

// Bulk import users + products
router.post('/import', async (req, res) => {
  try {
    const payload = req.body;

    let products = [];
    let users = [];

    if (Array.isArray(payload)) {
      products = payload;
    } else if (payload && typeof payload === 'object') {
      products = Array.isArray(payload.products) ? payload.products : [];
      users = Array.isArray(payload.users) ? payload.users : [];
    } else {
      return res.status(400).json({ success: false, message: 'Invalid import payload' });
    }

    const summary = {
      users: { created: 0, updated: 0, skipped: 0 },
      products: { created: 0, updated: 0, skipped: 0 }
    };

    for (const u of users) {
      const email = String((u && u.email) || '').trim().toLowerCase();
      if (!email) { summary.users.skipped++; continue; }

      const existing = await Database.getUserByEmail(email);
      const updates = {
        first_name: u.first_name !== undefined ? String(u.first_name || '').trim() : undefined,
        last_name: u.last_name !== undefined ? String(u.last_name || '').trim() : undefined,
        role: u.role !== undefined ? String(u.role || 'user') : undefined,
        verified: u.verified !== undefined ? !!u.verified : undefined,
        password_hash: u.password_hash !== undefined ? (u.password_hash || null) : undefined
      };

      if (existing) {
        await Database.updateUser(email, updates);
        summary.users.updated++;
      } else {
        await Database.createUser({
          email,
          first_name: (updates.first_name || 'User'),
          last_name: (updates.last_name || ''),
          password_hash: updates.password_hash || null,
          role: updates.role || 'user',
          verified: updates.verified !== undefined ? updates.verified : false
        });
        summary.users.created++;
      }
    }

    for (const p of products) {
      const sku = String((p && p.sku) || '').trim();
      const normalized = {
        sku: sku || null,
        name: p && p.name !== undefined ? String(p.name || '').trim() : '',
        description: p && p.description !== undefined ? String(p.description || '').trim() : null,
        price: p && p.price !== undefined && p.price !== null && p.price !== '' ? Number(p.price) : null,
        category: p && p.category !== undefined ? String(p.category || '').trim() : null,
        in_stock: p && (p.in_stock !== undefined || p.stock !== undefined)
          ? Number(p.in_stock !== undefined ? p.in_stock : p.stock)
          : 0,
        image_urls: Array.isArray(p && p.image_urls)
          ? p.image_urls
          : (p && p.image_url ? [p.image_url] : [])
      };

      if (!normalized.name) { summary.products.skipped++; continue; }

      if (sku) {
        const existingProduct = await Database.getProductBySku(sku);
        if (existingProduct) {
          await Database.updateProduct(existingProduct.id, {
            sku: normalized.sku,
            name: normalized.name,
            description: normalized.description,
            price: normalized.price,
            category: normalized.category,
            in_stock: Number.isFinite(normalized.in_stock) ? normalized.in_stock : 0,
            image_urls: normalized.image_urls
          });
          summary.products.updated++;
          continue;
        }
      }

      await Database.createProduct(normalized);
      summary.products.created++;
    }

    res.json({ success: true, summary });
  } catch (err) {
    console.error('Error importing data:', err);
    res.status(500).json({ success: false, message: 'Import failed' });
  }
});

module.exports = router;