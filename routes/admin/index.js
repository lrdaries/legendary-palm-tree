// routes/admin/index.js
const express = require('express');
const router = express.Router();

const Database = require('../../database');

// Import route modules
const productsRouter = require('./products');

// Mount routes
router.use('/products', productsRouter);

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    const role = req.query.role || 'all';
    
    let users = await Database.getAllUsers(limit, offset);
    
    // Apply filters
    if (search) {
      users = users.filter(user => 
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(search.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (role !== 'all') {
      users = users.filter(user => user.role === role);
    }
    
    const total = await Database.countUsers();
    
    res.json({ 
      success: true, 
      data: users,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Get all orders with pagination and filtering
router.get('/orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    
    let orders = await Database.getAllOrders(limit, offset);
    
    // Apply filters
    if (search) {
      orders = orders.filter(order => 
        order.order_number.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(search.toLowerCase()) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (status !== 'all') {
      orders = orders.filter(order => order.status === status);
    }
    
    const total = await Database.countOrders();
    
    res.json({ 
      success: true, 
      data: orders,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const updated = await Database.updateOrderStatus(orderId, status);
    
    if (updated) {
      res.json({ 
        success: true, 
        message: 'Order status updated successfully',
        data: updated
      });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    
    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const updated = await Database.updateUserRole(userId, role);
    
    if (updated) {
      res.json({ 
        success: true, 
        message: 'User role updated successfully',
        data: updated
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const deleted = await Database.deleteUser(userId);
    
    if (deleted) {
      res.json({ 
        success: true, 
        message: 'User deleted successfully'
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [ordersCount, usersCount, productsCount] = await Promise.all([
      Database.countOrders(),
      Database.countUsers(),
      Database.countProducts()
    ]);
    
    const recentOrders = await Database.getRecentOrders(5);
    const pendingOrders = await Database.getOrdersByStatus('pending');
    
    res.json({
      success: true,
      data: {
        totalOrders: ordersCount,
        totalUsers: usersCount,
        totalProducts: productsCount,
        pendingOrders: pendingOrders.length,
        recentOrders,
        totalRevenue: 284750 // Mock data - would calculate from actual orders
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Legacy: Export users (admin only - already protected by verifyAdminToken at mount)
router.get('/export-users', async (req, res) => {
  try {
    const users = await Database.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Error exporting users:', err);
    res.status(500).json({ success: false, message: 'Failed to export users' });
  }
});

// Legacy: Bulk import users + products
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