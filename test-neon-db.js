// Test Neon PostgreSQL connection
require('dotenv').config();
const Database = require('./database-postgres.js');

async function testNeonConnection() {
  console.log('🔌 Testing Neon PostgreSQL Connection...\n');

  try {
    await Database.init();
    console.log('✅ Neon PostgreSQL connection successful!');
    
    // Test basic query
    const result = await Database.query('SELECT version() as version');
    console.log('📊 PostgreSQL Version:', result[0].version);
    
    // Test tables
    const tables = await Database.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Tables found:', tables.map(t => t.table_name));
    
    await Database.close();
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testNeonConnection();
