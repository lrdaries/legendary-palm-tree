const Database = require('./database-sqlite');

async function migrateImageUrlsColumn() {
    try {
        console.log('🔄 Starting image_urls column migration (SQLite)...');
        
        await Database.init();
        
        // Check if image_urls column exists
        const tableInfo = await Database.query(`PRAGMA table_info(products)`);
        const hasImageUrlsColumn = tableInfo.some(col => col.name === 'image_urls');
        
        if (!hasImageUrlsColumn) {
            console.log('➕ Adding image_urls column to products table...');
            
            // Add the image_urls column
            await Database.run(`ALTER TABLE products ADD COLUMN image_urls TEXT`);
            console.log('✅ image_urls column added successfully');
            
            // Migrate existing data from image_url to image_urls
            console.log('🔄 Migrating existing image_url data to image_urls...');
            
            // Get products with image_url
            const products = await Database.query('SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND image_url != ""');
            
            for (const product of products) {
                const imageUrlsJson = JSON.stringify([product.image_url]);
                await Database.run(
                    'UPDATE products SET image_urls = ? WHERE id = ?',
                    [imageUrlsJson, product.id]
                );
            }
            
            console.log(`✅ Migrated ${products.length} products`);
            
        } else {
            console.log('✅ image_urls column already exists');
        }
        
        // Test the migration
        console.log('🧪 Testing migration...');
        const testProducts = await Database.getAllProducts(5, 0);
        
        console.log('📊 Sample products after migration:');
        testProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name}:`);
            console.log(`     image_url: ${product.image_url || 'null'}`);
            console.log(`     image_urls: ${product.image_urls || 'null'}`);
            console.log(`     images: ${JSON.stringify(product.images || [])}`);
        });
        
        console.log('🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

migrateImageUrlsColumn();
