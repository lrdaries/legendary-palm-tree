require('dotenv').config();
const db = require('../database');
const bcrypt = require('bcryptjs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter admin email: ', async (email) => {
    readline.question('Enter admin password: ', async (password) => {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.run(`
                INSERT INTO users (email, password_hash, role, is_admin, created_at)
                VALUES (?, ?, 'admin', 1, datetime('now'))
            `, [email, hashedPassword]);
            
            console.log('✅ Admin user created successfully!');
        } catch (error) {
            console.error('Error creating admin user:', error);
        } finally {
            readline.close();
        }
    });
});