const Database = require('./database');

// Simple test script to verify SQLite database operations
async function testDatabase() {
    console.log('🧪 Testing SQLite database operations...\n');

    try {
        // Test user creation
        console.log('1. Testing user creation...');
        const testUser = await Database.createUser({
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            password_hash: 'hashedpassword',
            verified: false
        });
        console.log('✅ User created:', testUser.email, '(ID:', testUser.id + ')');

        // Test user retrieval
        console.log('\n2. Testing user retrieval...');
        const retrievedUser = await Database.getUserByEmail('test@example.com');
        console.log('✅ User retrieved:', retrievedUser.email, '(ID:', retrievedUser.id + ')');

        // Test OTP creation
        console.log('\n3. Testing OTP creation...');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const otpData = await Database.createOTP('test@example.com', '123456', expiresAt);
        console.log('✅ OTP created for:', otpData.email, '(ID:', otpData.id + ')');

        // Test OTP retrieval
        console.log('\n4. Testing OTP retrieval...');
        const retrievedOTP = await Database.getOTP('test@example.com');
        console.log('✅ OTP retrieved:', retrievedOTP.code, '(ID:', retrievedOTP.id + ')');

        // Test email token creation
        console.log('\n5. Testing email token creation...');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const tokenData = await Database.createEmailToken('testtoken123', 'test@example.com', tokenExpiresAt);
        console.log('✅ Email token created:', tokenData.token, '(ID:', tokenData.id + ')');

        // Test email token retrieval
        console.log('\n6. Testing email token retrieval...');
        const retrievedToken = await Database.getEmailToken('testtoken123');
        console.log('✅ Email token retrieved:', retrievedToken.token, '(ID:', retrievedToken.id + ')');

        // Test product creation
        console.log('\n7. Testing product creation...');
        const testProduct = await Database.createProduct({
            name: 'Test Product',
            description: 'A test product for database testing',
            price: 29.99,
            category: 'Test Category',
            in_stock: true
        });
        console.log('✅ Product created:', testProduct.name, '(ID:', testProduct.id + ')');

        // Test product retrieval
        console.log('\n8. Testing product retrieval...');
        const products = await Database.getAllProducts();
        console.log('✅ Products retrieved:', products.length, 'total products');

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await Database.deleteOTP('test@example.com');
        await Database.deleteEmailToken('testtoken123');
        await Database.deleteProduct(testProduct.id);

        // Note: In a real scenario, you might want to delete the test user too
        // await Database.deleteUser('test@example.com');

        console.log('✅ All SQLite tests passed! Database migration successful.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Check:');
        console.log('   - SQLite installation: npm install');
        console.log('   - File permissions in project directory');
        console.log('   - Available disk space');
        console.log('   - Try deleting app.db and running tests again');
    } finally {
        // Close database connection
        await Database.close();
    }
}

// Run tests if executed directly
if (require.main === module) {
    testDatabase();
}

module.exports = testDatabase;