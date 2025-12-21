const Database = require('./database');

async function checkAdmin() {
  try {
    const db = new Database();
    // Try to get admin user
    const admin = await db.getUserByEmail('admin@example.com');
    console.log('Admin user:', admin);
    
    // List all users
    const allUsers = await db.getAllRows('SELECT * FROM users');
    console.log('All users:', allUsers);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin();
