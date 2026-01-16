const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, 'app.db');

class Database {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                password_hash TEXT,
                role TEXT DEFAULT 'user',
                verified BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createProductsTable = `
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                category TEXT,
                image_url TEXT,
                in_stock BOOLEAN DEFAULT 1,
                sku TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createOrdersTable = `
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_number TEXT UNIQUE NOT NULL,
                customer_email TEXT NOT NULL,
                customer_name TEXT,
                total REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createOTPsTable = `
            CREATE TABLE IF NOT EXISTS otps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                otp_code TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT 0,
                attempts INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createEmailTokensTable = `
            CREATE TABLE IF NOT EXISTS email_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT NOT NULL,
                email TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(createUsersTable);
                this.db.run(createProductsTable);
                this.db.run(createOrdersTable);
                this.db.run(createOTPsTable);
                this.db.run(createEmailTokensTable, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    async query(sql, params = []) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async run(sql, params = []) {
        if (!this.db) {
            await this.init();
        }
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    async getUserByEmail(email) {
        const users = await this.query('SELECT * FROM users WHERE email = ?', [email]);
        return users.length > 0 ? users[0] : null;
    }

    async createUser(userData) {
        const { email, first_name, last_name, password_hash, role = 'user', verified = false } = userData;
        const result = await this.run(
            'INSERT INTO users (email, first_name, last_name, password_hash, role, verified) VALUES (?, ?, ?, ?, ?, ?)',
            [email, first_name, last_name, password_hash, role, verified]
        );
        return { id: result.id, email, first_name, last_name, role, verified };
    }

    async updateUser(email, updateData) {
        const fields = [];
        const params = [];
        
        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            params.push(value);
        }
        params.push(email);
        
        await this.run(
            `UPDATE users SET ${fields.join(', ')} WHERE email = ?`,
            params
        );
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else {
                resolve();
            }
        });
    }

    // Product methods
    async getAllProducts(limit = 50, offset = 0) {
        return await this.query('SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    }

    async countProducts() {
        const result = await this.query('SELECT COUNT(*) as count FROM products');
        return result[0].count;
    }

    async getProductById(id) {
        const products = await this.query('SELECT * FROM products WHERE id = ?', [id]);
        return products.length > 0 ? products[0] : null;
    }

    async createProduct(productData) {
        const { name, description, price, category, image_url, in_stock = true, sku } = productData;
        const result = await this.run(
            'INSERT INTO products (name, description, price, category, image_url, in_stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, category, image_url, in_stock, sku]
        );
        return { id: result.id, ...productData };
    }

    async updateProduct(id, updateData) {
        const fields = [];
        const params = [];
        
        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            params.push(value);
        }
        params.push(id);
        
        await this.run(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
    }

    async deleteProduct(id) {
        await this.run('DELETE FROM products WHERE id = ?', [id]);
    }

    // Order methods
    async getAllOrders(limit = 50, offset = 0) {
        return await this.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    }

    async createOrder(orderData) {
        const { order_number, customer_email, customer_name, total, status = 'pending' } = orderData;
        const result = await this.run(
            'INSERT INTO orders (order_number, customer_email, customer_name, total, status) VALUES (?, ?, ?, ?, ?)',
            [order_number, customer_email, customer_name, total, status]
        );
        return { id: result.id, ...orderData };
    }

    async updateOrder(id, updateData) {
        const fields = [];
        const params = [];
        
        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            params.push(value);
        }
        params.push(id);
        
        await this.run(
            `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
    }

    async getAllUsers(limit = 50, offset = 0) {
        return await this.query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    }

    async countUsers() {
        const result = await this.query('SELECT COUNT(*) as count FROM users');
        return result[0].count;
    }

    // OTP methods
    async createOTP(email, otpCode, expiresAt) {
        const result = await this.run(
            'INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
            [email, otpCode, expiresAt]
        );
        return { id: result.id, email, otpCode, expiresAt };
    }

    async getValidOTP(email, otpCode) {
        const otps = await this.query(
            'SELECT * FROM otps WHERE email = ? AND otp_code = ? AND used = 0 AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
            [email, otpCode]
        );
        return otps.length > 0 ? otps[0] : null;
    }

    async markOTPAsUsed(email, otpCode) {
        await this.run(
            'UPDATE otps SET used = 1 WHERE email = ? AND otp_code = ?',
            [email, otpCode]
        );
    }

    async cleanupExpiredOTPs() {
        await this.run(
            'DELETE FROM otps WHERE expires_at < datetime("now") OR used = 1'
        );
    }

    async getOTP(email) {
        const otps = await this.query(
            'SELECT *, datetime("now") as current_time FROM otps WHERE email = ? ORDER BY created_at DESC LIMIT 1',
            [email]
        );
        if (otps.length === 0) return null;
        
        const otp = otps[0];
        return {
            ...otp,
            code: otp.otp_code, // Map otp_code to code for server compatibility
            expires_at: otp.expires_at
        };
    }

    async deleteOTP(email) {
        await this.run(
            'DELETE FROM otps WHERE email = ?',
            [email]
        );
    }

    async updateOTPAttempts(email, attempts) {
        await this.run(
            'UPDATE otps SET attempts = ? WHERE email = ?',
            [attempts, email]
        );
    }

    async createEmailToken(token, email, expiresAt) {
        const result = await this.run(
            'INSERT INTO email_tokens (token, email, expires_at) VALUES (?, ?, ?)',
            [token, email, expiresAt]
        );
        return { id: result.id, token, email, expiresAt };
    }

    async getEmailToken(token) {
        const tokens = await this.query(
            'SELECT *, datetime("now") as current_time FROM email_tokens WHERE token = ? LIMIT 1',
            [token]
        );
        return tokens.length > 0 ? tokens[0] : null;
    }

    async deleteEmailToken(tokenOrEmail) {
        if (tokenOrEmail.includes('@')) {
            // Delete by email
            await this.run(
                'DELETE FROM email_tokens WHERE email = ?',
                [tokenOrEmail]
            );
        } else {
            // Delete by token
            await this.run(
                'DELETE FROM email_tokens WHERE token = ?',
                [tokenOrEmail]
            );
        }
    }
}

module.exports = new Database();
