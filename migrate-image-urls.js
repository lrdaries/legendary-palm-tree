require('dotenv').config();
const Database = require('./database-postgres');

async function migrateImageUrlsColumn() {
    try {
        console.log('🔄 Starting image_urls column migration...');
        
        await Database.init();
        
        // Check if image_urls column exists
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            AND column_name = 'image_urls'
        `;
        
        const result = await Database.query(checkColumnQuery);
        
        if (result.length === 0) {
            console.log('➕ Adding image_urls column to products table...');
            
            // Add the image_urls column
            const addColumnQuery = `
                ALTER TABLE products 
                ADD COLUMN image_urls TEXT
            `;
            
            await Database.run(addColumnQuery);
            console.log('✅ image_urls column added successfully');
            
            // Migrate existing data from image_url to image_urls
            console.log('🔄 Migrating existing image_url data to image_urls...');
            
            const migrateDataQuery = `
                UPDATE products 
                SET image_urls = CASE 
                    WHEN image_url IS NOT NULL AND image_url != '' 
                    THEN JSON_ARRAY(image_url)
                    ELSE JSON_ARRAY()
                END
                WHERE image_urls IS NULL
            `;
            
            await Database.run(migrateDataQuery);
            console.log('✅ Existing data migrated successfully');
            
        } else {
            console.log('✅ image_urls column already exists');
        }
        
        // Test the migration
        console.log('🧪 Testing migration...');
        const products = await Database.getAllProducts(5, 0);
        
        console.log('📊 Sample products after migration:');
        products.forEach((product, index) => {
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
