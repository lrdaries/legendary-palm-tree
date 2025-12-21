require('dotenv').config();
const bcrypt = require('bcrypt');
const Database = require('./database');

async function createAdmin() {
    try {
        const email = process.argv[2];
        const password = process.argv[3];
        const firstName = process.argv[4] || 'Admin';
        const lastName = process.argv[5] || 'User';

        if (!email || !password) {
            console.error('Usage: node create-admin.js <email> <password> [firstName] [lastName]');
            console.error('Example: node create-admin.js admin@example.com MySecurePass123 Admin User');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await Database.getUserByEmail(email);
        if (existingUser) {
            console.log('User already exists. Updating to admin role...');
            
            const passwordHash = await bcrypt.hash(password, 12);
            await Database.updateUser(email, {
                role: 'admin',
                password_hash: passwordHash,
                verified: true
            });

            console.log('\n✅ User updated to admin successfully!');
            console.log(`Email: ${email}`);
            console.log(`Role: admin`);
        } else {
            console.log('Creating new admin user...');
            
            const passwordHash = await bcrypt.hash(password, 12);
            const user = await Database.createUser({
                email: email.toLowerCase(),
                first_name: firstName,
                last_name: lastName,
                password_hash: passwordHash,
                role: 'admin',
                verified: true
            });

            console.log('\n✅ Admin user created successfully!');
            console.log(`Email: ${user.email}`);
            console.log(`Name: ${user.first_name} ${user.last_name}`);
            console.log(`Role: ${user.role}`);
        }

        console.log('\nYou can now login at: http://localhost:3000/admin');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();