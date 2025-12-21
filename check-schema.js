const Database = require('./database');

async function checkSchema() {
  try {
    // Get list of all tables
    const tables = await Database.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables in database:', tables);

    // Check structure of users table if it exists
    const usersTable = tables.find(t => t.name === 'users');
    if (usersTable) {
      const usersSchema = await Database.all("PRAGMA table_info(users)");
      console.log('Users table schema:', usersSchema);
    } else {
      console.log('Users table does not exist');
    }
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();
