// Clean up and fix image data in database
require('dotenv').config();
const Database = require('./database-sqlite.js');

async function cleanDatabaseImages() {
  console.log('🧹 Cleaning Database Image Data...\n');

  try {
    await Database.init();
    
    const products = await Database.getAllProducts();
    console.log(`📊 Found ${products.length} products\n`);
    
    let cleanedCount = 0;
    let fixedCount = 0;
    
    for (const product of products) {
      console.log(`\n🔍 Product ${product.id}: ${product.name}`);
      console.log(`   image_urls type: ${typeof product.image_urls}`);
      console.log(`   image_urls value: ${JSON.stringify(product.image_urls, null, 2)}`);
      console.log(`   image_url fallback: ${product.image_url || 'undefined'}`);
      
      if (product.image_urls && typeof product.image_urls === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(product.image_urls);
          if (Array.isArray(parsed)) {
            console.log('   ✅ Valid JSON array - no change needed');
          } else {
            console.log('   ❌ Invalid JSON - fixing...');
            // Fix invalid JSON
            const fixedArray = [product.image_url].filter(url => url);
            await Database.run(
              'UPDATE products SET image_urls = ? WHERE id = ?',
              [JSON.stringify(fixedArray), product.id]
            );
            fixedCount++;
          }
        } catch (e) {
          console.log(`   ❌ JSON parse error: ${e.message}`);
          console.log('   🔧 Converting image_url to array...');
          // Convert image_url to array
          if (product.image_url) {
            const imageUrls = JSON.stringify([product.image_url]);
            await Database.run(
              'UPDATE products SET image_urls = ? WHERE id = ?',
              [imageUrls, product.id]
            );
            fixedCount++;
          }
        }
      } else if (Array.isArray(product.image_urls)) {
        console.log('   ✅ Already an array - no change needed');
      } else if (product.image_urls === null && product.image_url) {
        console.log('   🔧 Converting image_url to array...');
        const imageUrls = JSON.stringify([product.image_url]);
        await Database.run(
          'UPDATE products SET image_urls = ? WHERE id = ?',
          [imageUrls, product.id]
        );
        fixedCount++;
      } else {
        console.log('   ✅ No image data - no change needed');
      }
      
      cleanedCount++;
    }
    
    console.log(`\n📋 Summary:`);
    console.log(`   Total products checked: ${cleanedCount}`);
    console.log(`   Products fixed: ${fixedCount}`);
    console.log(`   Products already correct: ${cleanedCount - fixedCount}`);
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const updatedProducts = await Database.getAllProducts();
    const sampleProducts = updatedProducts.slice(0, 3);
    
    sampleProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. Product ID: ${product.id}`);
      console.log(`   image_urls type: ${typeof product.image_urls}`);
      console.log(`   image_urls value: ${JSON.stringify(product.image_urls, null, 2)}`);
      
      // Test transformation like frontend would do
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
            console.log(`   ❌ Frontend transformation would fail: ${e.message}`);
          }
        }
      }
      
      console.log(`   ✨ Frontend would get: ${images.length} images`);
      if (images.length > 0) {
        console.log(`   🖼️  First image: ${images[0]}`);
      }
    });
    
    console.log('\n🎉 Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  } finally {
    if (Database.db) {
      Database.db.close();
    }
  }
}

cleanDatabaseImages();
