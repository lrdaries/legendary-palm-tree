#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Vercel Environment Setup Helper');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
    console.log('✅ .env file exists');
    
    // Read current .env
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    // Check for DATABASE_URL
    const hasDatabaseUrl = lines.some(line => line.includes('DATABASE_URL'));
    
    if (!hasDatabaseUrl) {
        console.log('❌ DATABASE_URL not found in .env');
        console.log('\n📝 Add this to your .env file:');
        console.log('DATABASE_URL=postgresql://username:password@host:5432/database_name');
        console.log('\n📋 Get PostgreSQL connection from Vercel dashboard');
        console.log('   Vercel → Storage → PostgreSQL → Copy connection string');
    } else {
        console.log('✅ DATABASE_URL found in .env');
    }
    
    // Check for other required vars
    const hasResendKey = lines.some(line => line.includes('RESEND_API_KEY'));
    const hasJwtSecret = lines.some(line => line.includes('JWT_SECRET'));
    
    console.log('\n🔍 Environment Variables Check:');
    console.log(`   RESEND_API_KEY: ${hasResendKey ? '✅' : '❌'}`);
    console.log(`   JWT_SECRET: ${hasJwtSecret ? '✅' : '❌'}`);
    
} else {
    console.log('❌ .env file not found');
    console.log('📝 Creating .env file with template...');
    
    const template = `# Vercel Environment Variables
# Get these from your Vercel dashboard: https://vercel.com/dashboard

# PostgreSQL Database (Required)
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Email Service (Required)
RESEND_API_KEY=re_xxxxxxxxxxxx

# JWT Secret (Required)
JWT_SECRET=your-secret-key-here

# Environment
NODE_ENV=production
`;
    
    fs.writeFileSync(envPath, template);
    console.log('✅ .env file created with template');
    console.log('📝 Please update with your actual values from Vercel dashboard');
}

console.log('\n🚀 Next Steps:');
console.log('1. Go to Vercel dashboard → Storage → PostgreSQL');
console.log('2. Create database and copy connection string');
console.log('3. Update your local .env file with DATABASE_URL');
console.log('4. Run: npm run migrate-to-postgres');
console.log('5. Deploy to Vercel');

console.log('\n📖 For testing locally:');
console.log('   Set DATABASE_URL in .env and run migration');
console.log('   Or test with: VERCEL=true npm start');
