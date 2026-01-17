// Check database image storage format
require('dotenv').config();
const Database = require('./database-sqlite.js');

async function checkDatabaseImages() {
  console.log('🔍 Checking Database Image Storage...\n');
  
  try {
    await Database.init();
    
    // Get recent products with image data
    const products = await Database.getAllProducts(); // Use correct method name
    
    console.log('📊 Products in database:');
    products.slice(0, 3).forEach((product, index) => {
      console.log(`\n${index + 1}. Product ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   image_urls type: ${typeof product.image_urls}`);
      console.log(`   image_urls value: ${JSON.stringify(product.image_urls, null, 2)}`);
      console.log(`   image_url fallback: ${product.image_url || 'undefined'}`);
      
      // Test transformation like frontend does
      let images = [];
      if (product.image_urls) {
        if (Array.isArray(product.image_urls)) {
          images = product.image_urls.filter(url => url && typeof url === 'string');
        } else if (typeof product.image_urls === 'string') {
          try {
            const parsed = JSON.parse(product.image_urls);
            if (Array.isArray(parsed)) {
              images = parsed.filter(url => url && typeof url === 'string');
            }
          } catch (e) {
            console.log(`   ❌ JSON parse error: ${e.message}`);
          }
        }
      } else if (product.image_url) {
        images = [product.image_url];
      }
      
      console.log(`   ✨ Transformed images: ${images.length} items`);
      if (images.length > 0) {
        console.log(`   🖼️  First image: ${images[0]}`);
      } else {
        console.log(`   ❌ No images found after transformation`);
      }
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    if (Database.db) {
      Database.db.close();
    }
  }
}

checkDatabaseImages();
