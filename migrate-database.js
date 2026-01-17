// Migration script to update database schema
require('dotenv').config();
const Database = require('./database-sqlite.js');

async function migrateDatabase() {
  console.log('🔄 Starting Database Migration...\n');

  try {
    await Database.init();
    
    // Check if image_urls column exists
    const tableInfo = await Database.query("PRAGMA table_info(products)");
    const hasImageUrlsColumn = tableInfo.some(column => column.name === 'image_urls');
    const hasImageUrlColumn = tableInfo.some(column => column.name === 'image_url');
    
    console.log('📊 Current columns:', tableInfo.map(col => col.name));
    console.log('✅ Has image_urls column:', hasImageUrlsColumn);
    console.log('⚠️  Has image_url column:', hasImageUrlColumn);
    
    if (hasImageUrlColumn && !hasImageUrlsColumn) {
      console.log('🔧 Adding image_urls column...');
      
      // Add new image_urls column
      await Database.run('ALTER TABLE products ADD COLUMN image_urls TEXT');
      
      // Migrate data from image_url to image_urls
      console.log('📦 Migrating existing data...');
      const products = await Database.getAllProducts();
      
      let migratedCount = 0;
      for (const product of products) {
        if (product.image_url && !product.image_urls) {
          // Convert single image_url to JSON array
          const imageUrls = JSON.stringify([product.image_url]);
          await Database.run(
            'UPDATE products SET image_urls = ? WHERE id = ?',
            [imageUrls, product.id]
          );
          migratedCount++;
        }
      }
      
      console.log(`✅ Migrated ${migratedCount} products from image_url to image_urls`);
      
      // Optionally drop old column (comment out if you want to keep it)
      // await Database.run('ALTER TABLE products DROP COLUMN image_url');
      // console.log('🗑️  Dropped old image_url column');
      
    } else if (hasImageUrlsColumn) {
      console.log('✅ image_urls column already exists - no migration needed');
    } else {
      console.log('❌ Neither image_url nor image_urls columns found');
    }
    
    // Verify migration
    const updatedTableInfo = await Database.query("PRAGMA table_info(products)");
    console.log('\n📋 Updated table columns:', updatedTableInfo.map(col => col.name));
    
    console.log('\n🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    if (Database.db) {
      Database.db.close();
    }
  }
}

migrateDatabase();
