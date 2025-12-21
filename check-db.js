const Database = require('./database');

async function checkDb() {
  try {
    // Check if users table exists by trying to query it
    try {
      const users = await Database.getUserByEmail('test@example.com');
      console.log('Users table exists');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('no such table')) {
        console.log('Users table does not exist');
      } else {
        throw error;
      }
    }

    // Try to get database version
    try {
      const version = await Database.get('SELECT sqlite_version() as version');
      console.log('SQLite version:', version);
    } catch (error) {
      console.log('Could not get SQLite version:', error.message);
    }

    // Try to get all tables (using a raw query if possible)
    try {
      const tables = await Database.get('SELECT name FROM sqlite_master WHERE type="table"');
      console.log('Tables in database:', tables);
    } catch (error) {
      console.log('Could not list tables:', error.message);
    }

  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDb();
