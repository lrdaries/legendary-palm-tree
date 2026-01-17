// Debug raw database output
require('dotenv').config();
const Database = require('./database-postgres.js');

async function debugDbRaw() {
  console.log('🔍 Debugging Raw Database Output...\n');

  try {
    await Database.init();
    
    // Get raw products data
    const products = await Database.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 3');
    
    console.log('📊 Raw Database Results:');
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Product ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   image_urls type: ${typeof product.image_urls}`);
      console.log(`   image_urls constructor: ${product.image_urls?.constructor?.name}`);
      console.log(`   image_urls value: ${product.image_urls}`);
      console.log(`   image_url fallback: ${product.image_url || 'undefined'}`);
      
      // Check if it's a string that looks like JSON
      if (typeof product.image_urls === 'string') {
        try {
          const parsed = JSON.parse(product.image_urls);
          console.log(`   ✅ JSON parse successful: ${Array.isArray(parsed) ? 'Array' : 'Not Array'}`);
          console.log(`   ✅ Parsed result:`, parsed);
        } catch (e) {
          console.log(`   ❌ JSON parse failed: ${e.message}`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (Database.pool) {
      await Database.close();
    }
  }
}

debugDbRaw();
