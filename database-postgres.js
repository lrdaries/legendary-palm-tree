const { Pool } = require('pg');

class PostgresDatabase {
    constructor() {
        this.pool = null;
    }

    async init() {
        try {
            const databaseUrl = process.env.DATABASE_URL;
            
            if (!databaseUrl) {
                console.error('DATABASE_URL environment variable is not set');
                throw new Error('DATABASE_URL environment variable is required for PostgreSQL connection');
            }

            this.pool = new Pool({
                connectionString: databaseUrl,
                ssl: {
                    rejectUnauthorized: false
                }
            });
            
            // Test the connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            console.log('Connected to PostgreSQL database');
            await this.createTables();
        } catch (error) {
            console.error('Failed to connect to PostgreSQL:', error.message);
            throw error;
        }
    }

    async createTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255),
                role VARCHAR(50) DEFAULT 'user',
                verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createProductsTable = `
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(100),
                image_url TEXT,
                image_urls TEXT,
                in_stock BOOLEAN DEFAULT true,
                sku VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createOrdersTable = `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_number VARCHAR(255) UNIQUE NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_name VARCHAR(255),
                total DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createOTPsTable = `
            CREATE TABLE IF NOT EXISTS otps (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_code VARCHAR(10) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT false,
                attempts INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createEmailTokensTable = `
            CREATE TABLE IF NOT EXISTS email_tokens (
                id SERIAL PRIMARY KEY,
                token VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {
            const client = await this.pool.connect();
            
            await client.query(createUsersTable);
            await client.query(createProductsTable);
            await client.query(createOrdersTable);
            await client.query(createOTPsTable);
            await client.query(createEmailTokensTable);
            
            client.release();
            console.log('All tables created successfully');
        } catch (error) {
            console.error('Error creating tables:', error);
            throw error;
        }
    }

    async query(sql, params = []) {
        if (!this.pool) {
            await this.init();
        }
        
        const client = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async run(sql, params = []) {
        if (!this.pool) {
            await this.init();
        }
        
        const client = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            
            // For INSERT operations, return the inserted ID
            if (result.rows.length > 0 && result.rows[0] && typeof result.rows[0].id !== 'undefined') {
                return { id: result.rows[0].id, changes: result.rowCount || 0 };
            }
            
            // For other operations, return changes
            return { id: result.rows[0]?.id, changes: result.rowCount || 0 };
        } finally {
            client.release();
        }
    }

    // User methods
    async createUser(userData) {
        const { email, first_name, last_name, password_hash, role = 'user', verified = false } = userData;
        const result = await this.run(
            'INSERT INTO users (email, first_name, last_name, password_hash, role, verified) VALUES ($1, $2, $3, $4, $5, $6)',
            [email, first_name, last_name, password_hash, role, verified]
        );
        return { id: result.id, email, first_name, last_name, role, verified };
    }

    async getUserByEmail(email) {
        const users = await this.query('SELECT * FROM users WHERE email = $1', [email]);
        return users.length > 0 ? users[0] : null;
    }

    async updateUser(email, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
        
        values.push(email);
        
        await this.run(
            `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE email = $${paramIndex}`,
            values
        );
    }

    // Product methods
    async getAllProducts(limit = 50, offset = 0) {
        const products = await this.query('SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        return products.map(product => this.transformProductData(product));
    }

    async getProductById(id) {
        const products = await this.query('SELECT * FROM products WHERE id = $1', [id]);
        const product = products.length > 0 ? products[0] : null;
        return product ? this.transformProductData(product) : null;
    }

    transformProductData(product) {
        // Handle both image_url (single) and image_urls (array) fields
        let images = [];
        
        if (product.image_urls) {
            try {
                // Try to parse as JSON array
                const parsed = JSON.parse(product.image_urls);
                images = Array.isArray(parsed) ? parsed : [product.image_urls];
            } catch (e) {
                // If parsing fails, treat as single URL or comma-separated
                if (product.image_urls.includes(',')) {
                    images = product.image_urls.split(',').map(url => url.trim()).filter(url => url);
                } else {
                    images = [product.image_urls];
                }
            }
        } else if (product.image_url) {
            images = [product.image_url];
        }
        
        return {
            ...product,
            images: images,
            // Keep backward compatibility
            image_url: product.image_url,
            image_urls: product.image_urls
        };
    }

    async createProduct(productData) {
        const { name, description, price, category, image_urls, in_stock = true, sku } = productData;
        const result = await this.run(
            'INSERT INTO products (name, description, price, category, image_urls, in_stock, sku) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [name, description, price, category, JSON.stringify(image_urls || []), in_stock, sku]
        );
        return { id: result.id, ...productData };
    }

    async updateProduct(id, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (key === 'image_urls' && Array.isArray(value)) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(JSON.stringify(value));
            } else {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
            }
            paramIndex++;
        }
        
        values.push(id);
        
        await this.run(
            `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
            values
        );
        
        // Return updated product with transformed data
        return await this.getProductById(id);
    }

    async deleteProduct(id) {
        await this.run('DELETE FROM products WHERE id = $1', [id]);
    }

    // Order methods
    async createOrder(orderData) {
        const { order_number, customer_email, customer_name, total, status = 'pending' } = orderData;
        const result = await this.run(
            'INSERT INTO orders (order_number, customer_email, customer_name, total, status) VALUES ($1, $2, $3, $4, $5)',
            [order_number, customer_email, customer_name, total, status]
        );
        return { id: result.id, ...orderData };
    }

    async getAllOrders(limit = 50, offset = 0) {
        return await this.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    }

    async getOrdersByEmail(email, limit = 50, offset = 0) {
        return await this.query('SELECT * FROM orders WHERE customer_email = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [email, limit, offset]);
    }

    async updateOrder(id, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
        
        values.push(id);
        
        await this.run(
            `UPDATE orders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
            values
        );
    }

    // OTP methods
    async createOTP(email, otpCode, expiresAt) {
        const result = await this.run(
            'INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)',
            [email, otpCode, expiresAt]
        );
        return { id: result.id, email, otpCode, expiresAt };
    }

    async getValidOTP(email, otpCode) {
        const otps = await this.query(
            'SELECT * FROM otps WHERE email = $1 AND otp_code = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otpCode]
        );
        return otps.length > 0 ? otps[0] : null;
    }

    async getOTP(email) {
        const otps = await this.query(
            'SELECT *, NOW() as current_time FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
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

    async markOTPAsUsed(email, otpCode) {
        await this.run(
            'UPDATE otps SET used = true WHERE email = $1 AND otp_code = $2',
            [email, otpCode]
        );
    }

    async deleteOTP(email) {
        await this.run('DELETE FROM otps WHERE email = $1', [email]);
    }

    async updateOTPAttempts(email, attempts) {
        await this.run(
            'UPDATE otps SET attempts = $1 WHERE email = $2',
            [attempts, email]
        );
    }

    async cleanupExpiredOTPs() {
        await this.run('DELETE FROM otps WHERE expires_at < NOW() OR used = true');
    }

    // Email token methods
    async createEmailToken(token, email, expiresAt) {
        const result = await this.run(
            'INSERT INTO email_tokens (token, email, expires_at) VALUES ($1, $2, $3)',
            [token, email, expiresAt]
        );
        return { id: result.id, token, email, expiresAt };
    }

    async getEmailToken(token) {
        const tokens = await this.query(
            'SELECT *, NOW() as current_time FROM email_tokens WHERE token = $1 LIMIT 1',
            [token]
        );
        return tokens.length > 0 ? tokens[0] : null;
    }

    async deleteEmailToken(tokenOrEmail) {
        if (tokenOrEmail.includes('@')) {
            // Delete by email
            await this.run('DELETE FROM email_tokens WHERE email = $1', [tokenOrEmail]);
        } else {
            // Delete by token
            await this.run('DELETE FROM email_tokens WHERE token = $1', [tokenOrEmail]);
        }
    }

    // Admin methods
    async getAllUsers(limit = 50, offset = 0) {
        return await this.query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    }

    async countUsers() {
        const result = await this.query('SELECT COUNT(*) as count FROM users');
        return result[0].count;
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = new PostgresDatabase();
