const Database = require('./database');

async function checkAdmin() {
  try {
    const db = new Database();
    // First, ensure the database is initialized
    await db.init();
    
    // Use the query method instead of get
    const admin = await db.query('SELECT * FROM users WHERE role = ?', ['admin']);
    console.log('Admin user:', admin);
    
    // Get all users
    const allUsers = await db.query('SELECT * FROM users');
    console.log('All users:', allUsers);
    
    // Close the database connection
    await db.close();
  } catch (error) {
    console.error('Error checking admin:', error);
  }
}

checkAdmin();
