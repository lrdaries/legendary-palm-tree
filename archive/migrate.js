const Database = require('./database');
const fs = require('fs');
const path = require('path');

// Migration script to set up SQLite database
async function migrateToSQLite() {
    console.log('🚀 Starting SQLite database migration...\n');

    try {
        // Check if database file exists
        const dbPath = path.join(__dirname, 'app.db');
        const dbExists = fs.existsSync(dbPath);

        if (dbExists) {
            console.log('📁 Database file exists:', dbPath);
        } else {
            console.log('📁 Database file will be created at:', dbPath);
        }

        // Test database operations
        console.log('🧪 Testing database operations...');

        // Test cleanup (should work even with empty database)
        await Database.cleanupExpiredRecords();
        console.log('✅ Cleanup function works');

        // Test getting products (should return empty array initially)
        const products = await Database.getAllProducts();
        console.log('✅ Products query works, found', products.length, 'products');

        console.log('\n✅ SQLite database migration successful!');
        console.log('📊 Database file location:', dbPath);
        console.log('📝 Next steps:');
        console.log('   1. Run database tests: node test-db.js');
        console.log('   2. Start your server: npm start');
        console.log('   3. Test user registration and login');
        console.log('   4. Verify data persists after server restart');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check file permissions in project directory');
        console.log('   2. Ensure sqlite3 is installed: npm install');
        console.log('   3. Try deleting app.db and running again');
        console.log('   4. Check available disk space');
        process.exit(1);
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateToSQLite();
}

module.exports = migrateToSQLite;