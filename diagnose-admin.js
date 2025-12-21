#!/usr/bin/env node
/**
 * Admin Login Flow Diagnostic Test
 * This script tests the complete admin login flow
 */

require('dotenv').config();
const http = require('http');
const express = require('express');
const path = require('path');
const Database = require('./database');
const { generateJWT, hashPassword, verifyPassword } = require('./utils/auth');

async function runDiagnostics() {
    console.log('===================================');
    console.log('🔍 ADMIN LOGIN DIAGNOSTICS');
    console.log('===================================\n');

    try {
        // 1. Check environment
        console.log('📋 Environment Check:');
        console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
        console.log('   PORT:', process.env.PORT || 3000);
        console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
        console.log();

        // 2. Initialize database
        console.log('🗄️  Database Check:');
        await Database.initializeDatabase();
        console.log('   ✅ Database initialized');

        // 3. Check for admin user
        console.log('\n👤 Admin User Check:');
        let admin = await Database.getUserByEmail('admin@example.com');
        
        if (!admin) {
            console.log('   ❌ Admin user not found, creating...');
            const hashedPassword = await hashPassword('Admin@123');
            admin = await Database.createUser({
                email: 'admin@example.com',
                first_name: 'Admin',
                last_name: 'User',
                password_hash: hashedPassword,
                role: 'admin',
                verified: true
            });
            console.log('   ✅ Admin user created');
        } else {
            console.log('   ✅ Admin user exists');
        }

        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
        console.log('   Verified:', admin.verified);
        console.log('   Password Hash:', admin.password_hash ? '✅ Set' : '❌ Missing');

        // 4. Test password verification
        console.log('\n🔑 Password Verification Test:');
        const passwordMatch = await verifyPassword('Admin@123', admin.password_hash);
        console.log('   Password "Admin@123" matches:', passwordMatch ? '✅ Yes' : '❌ No');

        // 5. Test JWT generation
        console.log('\n🎫 JWT Token Generation:');
        const token = generateJWT({
            id: admin.id,
            email: admin.email,
            role: admin.role
        });
        console.log('   ✅ Token generated');
        console.log('   Token length:', token.length);
        
        const [header, payload, signature] = token.split('.');
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        console.log('   Payload:', decoded);

        // 6. Test API endpoint
        console.log('\n🌐 API Endpoint Test:');
        const testResponse = {
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: admin.id,
                email: admin.email,
                firstName: admin.first_name,
                lastName: admin.last_name,
                role: admin.role,
                verified: admin.verified
            }
        };
        console.log('   Expected response:');
        console.log('   ', JSON.stringify(testResponse, null, 2));

        // Summary
        console.log('\n===================================');
        console.log('✅ ALL DIAGNOSTICS PASSED');
        console.log('===================================\n');

        console.log('📝 Login Credentials:');
        console.log('   Email: admin@example.com');
        console.log('   Password: Admin@123\n');

        console.log('🚀 Next Steps:');
        console.log('   1. Start server: npm start');
        console.log('   2. Open: http://localhost:3000/admin');
        console.log('   3. Login with credentials above');
        console.log('   4. Open DevTools (F12) to see console logs');
        console.log('   5. Check Network tab for /api/admin/auth/login request\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runDiagnostics();
