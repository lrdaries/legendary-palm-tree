// Comprehensive database health check
require('dotenv').config();
const Database = require('./database-sqlite.js');

async function checkDatabaseHealth() {
  console.log('🏥 Database Health Check\n');
  console.log('=====================================\n');

  try {
    // Test database connection
    console.log('1. 🔌 Testing Database Connection...');
    await Database.init();
    console.log('   ✅ Database connected successfully');
    
    // Test table structure
    console.log('\n2. 📊 Checking Table Structure...');
    const tables = await Database.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    console.log('   Tables found:', tables.map(t => t.name));
    
    // Check products table specifically
    console.log('\n3. 🛍️  Products Table Analysis...');
    const productsTableInfo = await Database.query("PRAGMA table_info(products)");
    console.log('   Columns:');
    productsTableInfo.forEach(col => {
      console.log(`     - ${col.name} (${col.type})`);
    });
    
    // Test CRUD operations
    console.log('\n4. 🧪 Testing CRUD Operations...');
    
    // Test CREATE
    console.log('   📝 Testing CREATE...');
    const testProduct = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'test',
      image_urls: JSON.stringify(['https://example.com/test1.jpg', 'https://example.com/test2.jpg']),
      in_stock: true,
      sku: 'TEST-SKU-001'
    };
    
    const created = await Database.createProduct(testProduct);
    console.log(`     ✅ CREATE: Product ID ${created.id} created`);
    
    // Test READ
    console.log('   📖 Testing READ...');
    const read = await Database.getProductById(created.id);
    console.log(`     ✅ READ: ${read ? 'Product found' : 'Product not found'}`);
    
    // Test UPDATE
    console.log('   ✏️ Testing UPDATE...');
    await Database.updateProduct(created.id, {
      name: 'Updated Test Product',
      description: 'Updated Description'
    });
    const updated = await Database.getProductById(created.id);
    console.log(`     ✅ UPDATE: ${updated.name === 'Updated Test Product' ? 'Success' : 'Failed'}`);
    
    // Test DELETE
    console.log('   🗑️ Testing DELETE...');
    await Database.deleteProduct(created.id);
    const deleted = await Database.getProductById(created.id);
    console.log(`     ✅ DELETE: ${deleted ? 'Failed' : 'Success'}`);
    
    // Test data integrity
    console.log('\n5. 🔍 Data Integrity Check...');
    const allProducts = await Database.getAllProducts(5, 0);
    console.log(`   Total products: ${allProducts.length}`);
    
    let validImageUrls = 0;
    let invalidImageUrls = 0;
    
    allProducts.forEach(product => {
      if (product.image_urls) {
        try {
          if (typeof product.image_urls === 'string') {
            const parsed = JSON.parse(product.image_urls);
            if (Array.isArray(parsed) && parsed.length > 0) {
              validImageUrls++;
            } else {
              invalidImageUrls++;
            }
          } else if (Array.isArray(product.image_urls)) {
            if (product.image_urls.length > 0) {
              validImageUrls++;
            } else {
              invalidImageUrls++;
            }
          }
        } catch (e) {
          invalidImageUrls++;
        }
      }
    });
    
    console.log(`   Products with valid image_urls: ${validImageUrls}`);
    console.log(`   Products with invalid image_urls: ${invalidImageUrls}`);
    
    // Clean up test data
    await Database.deleteProduct(created.id);
    
    console.log('\n🎉 Database Health Check Complete!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
  } finally {
    if (Database.db) {
      Database.db.close();
    }
  }
}

checkDatabaseHealth();
