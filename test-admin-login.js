#!/usr/bin/env node
// Test admin login flow

const Database = require('./database');
const { generateJWT, hashPassword } = require('./utils/auth');

async function testAdminLogin() {
    console.log('🧪 Testing Admin Login Flow...\n');

    try {
        // Initialize database
        await Database.initializeDatabase();
        console.log('✅ Database initialized');

        // Check if admin user exists
        const adminUser = await Database.getUserByEmail('admin@example.com');
        
        if (!adminUser) {
            console.log('❌ No admin user found at admin@example.com');
            console.log('📝 Creating admin user...');
            
            const hashedPassword = await hashPassword('Admin@123');
            const newAdmin = await Database.createUser({
                email: 'admin@example.com',
                first_name: 'Admin',
                last_name: 'User',
                password_hash: hashedPassword,
                role: 'admin',
                verified: true
            });
            
            console.log('✅ Admin user created:', newAdmin);
        } else {
            console.log('✅ Admin user found:', {
                id: adminUser.id,
                email: adminUser.email,
                role: adminUser.role,
                verified: adminUser.verified,
                has_password: !!adminUser.password_hash
            });
        }

        // Test JWT generation
        const token = generateJWT({
            id: 1,
            email: 'admin@example.com',
            role: 'admin'
        });

        console.log('\n✅ JWT Token generated successfully');
        console.log('📋 Token preview:', token.substring(0, 50) + '...');

        // Decode and show payload
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('📊 Token payload:', payload);

        console.log('\n✅ All tests passed!');
        console.log('\n📝 Login Credentials:');
        console.log('   Email: admin@example.com');
        console.log('   Password: Admin@123');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        process.exit(0);
    }
}

testAdminLogin();
