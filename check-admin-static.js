const Database = require('./database');

async function checkAdmin() {
  try {
    // Use static methods directly
    const admin = await Database.getUserByEmail('admin@example.com');
    console.log('Admin user:', admin);
    
    // Get all users (we'll need to find a way to list all users)
    // Let's try to find a user with admin role
    const adminUsers = await Database.getUserByEmail('admin@example.com');
    console.log('Admin users:', adminUsers);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin();
