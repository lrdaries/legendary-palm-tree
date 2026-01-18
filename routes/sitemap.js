const express = require('express');
const router = express.Router();
const Database = require('../database-postgres');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const db = new Database();
    
    // Get base URL from environment or use default
    const baseUrl = process.env.BASE_URL || 'https://divaskloset.com';
    
    // Get all active products
    const products = await db.query(
      'SELECT id, slug, updated_at FROM products WHERE is_active = true ORDER BY updated_at DESC'
    );
    
    // Static pages
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/products', changefreq: 'daily', priority: 0.9 },
      { url: '/about', changefreq: 'monthly', priority: 0.7 },
      { url: '/contact', changefreq: 'monthly', priority: 0.6 },
      { url: '/login', changefreq: 'monthly', priority: 0.5 },
      { url: '/register', changefreq: 'monthly', priority: 0.5 }
    ];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    
    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });
    
    // Add product pages
    products.forEach(product => {
      sitemap += `
  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${product.updated_at || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
    
    sitemap += `
</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
