const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required to use Postgres database');
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

let isInitialized = false;

async function q(text, params = []) {
    return pool.query(text, params);
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function safeJsonParseArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

class Database {
    static async initializeDatabase() {
        if (isInitialized) return;

        await q(`CREATE TABLE IF NOT EXISTS users (
            id BIGSERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            password_hash TEXT,
            role TEXT DEFAULT 'user',
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`);

        await q(`CREATE TABLE IF NOT EXISTS otp_codes (
            id BIGSERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            attempts INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`);

        await q(`CREATE TABLE IF NOT EXISTS email_tokens (
            id BIGSERIAL PRIMARY KEY,
            token TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`);

        await q(`CREATE TABLE IF NOT EXISTS products (
            id BIGSERIAL PRIMARY KEY,
            sku TEXT UNIQUE,
            name TEXT NOT NULL,
            description TEXT,
            price DOUBLE PRECISION,
            image_url TEXT,
            image_urls TEXT,
            category TEXT,
            in_stock INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`);

        await q('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await q('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
        await q('CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email)');
        await q('CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_tokens(token)');
        await q('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');

        isInitialized = true;
    }

    static async getAllUsers() {
        await this.initializeDatabase();
        const res = await q(
            `SELECT id, email, first_name, last_name, role, verified, created_at, updated_at
             FROM users ORDER BY created_at DESC`,
            []
        );
        return res.rows || [];
    }

    static async createUser(userData) {
        await this.initializeDatabase();

        const email = normalizeEmail(userData.email);
        const firstName = userData.first_name;
        const lastName = userData.last_name;
        const passwordHash = userData.password_hash !== undefined ? userData.password_hash : null;
        const role = userData.role || 'user';
        const verified = !!userData.verified;

        const res = await q(
            `INSERT INTO users (email, first_name, last_name, password_hash, role, verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [email, firstName, lastName, passwordHash, role, verified]
        );

        return await this.getUserById(res.rows[0].id);
    }

    static async getUserById(id) {
        await this.initializeDatabase();
        const res = await q(
            `SELECT id, email, first_name, last_name, password_hash, role, verified, created_at, updated_at
             FROM users WHERE id = $1`,
            [id]
        );
        return res.rows && res.rows[0] ? res.rows[0] : null;
    }

    static async getUserByEmail(email) {
        await this.initializeDatabase();
        const e = normalizeEmail(email);
        const res = await q(
            `SELECT id, email, first_name, last_name, password_hash, role, verified, created_at, updated_at
             FROM users WHERE email = $1`,
            [e]
        );
        return res.rows && res.rows[0] ? res.rows[0] : null;
    }

    static async updateUser(email, updates) {
        await this.initializeDatabase();
        const e = normalizeEmail(email);

        const sets = [];
        const values = [];
        let idx = 1;

        if (updates.first_name !== undefined) {
            sets.push(`first_name = $${idx++}`);
            values.push(updates.first_name);
        }
        if (updates.last_name !== undefined) {
            sets.push(`last_name = $${idx++}`);
            values.push(updates.last_name);
        }
        if (updates.password_hash !== undefined) {
            sets.push(`password_hash = $${idx++}`);
            values.push(updates.password_hash);
        }
        if (updates.role !== undefined) {
            sets.push(`role = $${idx++}`);
            values.push(updates.role);
        }
        if (updates.verified !== undefined) {
            sets.push(`verified = $${idx++}`);
            values.push(!!updates.verified);
        }

        if (sets.length === 0) return null;

        sets.push('updated_at = NOW()');
        values.push(e);

        await q(`UPDATE users SET ${sets.join(', ')} WHERE email = $${idx}`, values);
        return await this.getUserByEmail(e);
    }

    static async createOTP(email, code, expiresAt) {
        await this.initializeDatabase();
        const e = normalizeEmail(email);

        await q('DELETE FROM otp_codes WHERE email = $1', [e]);

        const res = await q(
            `INSERT INTO otp_codes (email, code, expires_at)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [e, code, expiresAt.toISOString()]
        );

        return await this.getOTPById(res.rows[0].id);
    }

    static async getOTPById(id) {
        await this.initializeDatabase();
        const res = await q(
            `SELECT id, email, code, expires_at, attempts, created_at
             FROM otp_codes WHERE id = $1`,
            [id]
        );
        return res.rows && res.rows[0] ? res.rows[0] : null;
    }

    static async getOTP(email) {
        await this.initializeDatabase();
        const e = normalizeEmail(email);
        const res = await q(
            `SELECT id, email, code, expires_at, attempts, created_at
             FROM otp_codes WHERE email = $1`,
            [e]
        );
        return res.rows && res.rows[0] ? res.rows[0] : null;
    }

    static async updateOTPAttempts(email, attempts) {
        await this.initializeDatabase();
        const e = normalizeEmail(email);
        await q('UPDATE otp_codes SET attempts = $1 WHERE email = $2', [attempts, e]);
        return await this.getOTP(e);
    }

    static async deleteOTP(email) {
        await this.initializeDatabase();
        const e = normalizeEmail(email);
        await q('DELETE FROM otp_codes WHERE email = $1', [e]);
    }

    static async createEmailToken(token, email, expiresAt) {
        await this.initializeDatabase();
        const e = normalizeEmail(email);
        const res = await q(
            `INSERT INTO email_tokens (token, email, expires_at)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [token, e, expiresAt.toISOString()]
        );
        return await this.getEmailTokenById(res.rows[0].id);
    }

    static async getEmailTokenById(id) {
        await this.initializeDatabase();
        const res = await q(
            `SELECT id, token, email, expires_at, created_at
             FROM email_tokens WHERE id = $1`,
            [id]
        );
        return res.rows && res.rows[0] ? res.rows[0] : null;
    }

    static async getEmailToken(token) {
        await this.initializeDatabase();
        const res = await q(
            `SELECT id, token, email, expires_at, created_at
             FROM email_tokens WHERE token = $1`,
            [token]
        );
        return res.rows && res.rows[0] ? res.rows[0] : null;
    }

    static async deleteEmailToken(token) {
        await this.initializeDatabase();
        await q('DELETE FROM email_tokens WHERE token = $1', [token]);
    }

    static async getAllProducts(limit = 50, offset = 0) {
        await this.initializeDatabase();
        const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, Math.min(200, Number(limit))) : 50;
        const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, Number(offset)) : 0;

        const res = await q(
            `SELECT id, sku, name, description, price, image_url, image_urls, category, in_stock, created_at, updated_at
             FROM products
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
            [safeLimit, safeOffset]
        );

        return (res.rows || []).map((row) => {
            const imageUrls = safeJsonParseArray(row.image_urls);
            const primaryImage = row.image_url || imageUrls[0] || null;
            return {
                ...row,
                image_url: primaryImage,
                image_urls: imageUrls
            };
        });
    }

    static async countProducts() {
        await this.initializeDatabase();
        const res = await q('SELECT COUNT(*)::int as count FROM products', []);
        return res.rows && res.rows[0] ? Number(res.rows[0].count) : 0;
    }

    static async createProduct(productData) {
        await this.initializeDatabase();

        const imageUrls = Array.isArray(productData.image_urls)
            ? productData.image_urls
            : (productData.image_url ? [productData.image_url] : []);

        const primaryImage = productData.image_url || imageUrls[0] || null;

        const res = await q(
            `INSERT INTO products (sku, name, description, price, image_url, image_urls, category, in_stock)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
                productData.sku || null,
                productData.name,
                productData.description || null,
                productData.price || null,
                primaryImage,
                JSON.stringify(imageUrls),
                productData.category || null,
                productData.in_stock !== undefined ? Number(productData.in_stock) : 0
            ]
        );

        return await this.getProductById(res.rows[0].id);
    }

    static async getProductById(id) {
        await this.initializeDatabase();
        const res = await q(
            `SELECT id, sku, name, description, price, image_url, image_urls, category, in_stock, created_at, updated_at
             FROM products WHERE id = $1`,
            [id]
        );

        const row = res.rows && res.rows[0] ? res.rows[0] : null;
        if (!row) return null;

        const imageUrls = safeJsonParseArray(row.image_urls);
        const primaryImage = row.image_url || imageUrls[0] || null;

        return {
            ...row,
            image_url: primaryImage,
            image_urls: imageUrls
        };
    }

    static async getProductBySku(sku) {
        await this.initializeDatabase();
        const normalized = String(sku || '').trim();
        if (!normalized) return null;

        const res = await q(
            `SELECT id, sku, name, description, price, image_url, image_urls, category, in_stock, created_at, updated_at
             FROM products WHERE sku = $1`,
            [normalized]
        );

        const row = res.rows && res.rows[0] ? res.rows[0] : null;
        if (!row) return null;

        const imageUrls = safeJsonParseArray(row.image_urls);
        const primaryImage = row.image_url || imageUrls[0] || null;

        return {
            ...row,
            image_url: primaryImage,
            image_urls: imageUrls
        };
    }

    static async skuExists(sku, excludeProductId = null) {
        await this.initializeDatabase();
        const normalized = String(sku || '').trim();
        if (!normalized) return false;

        if (excludeProductId !== null && excludeProductId !== undefined) {
            const res = await q(
                'SELECT id FROM products WHERE sku = $1 AND id != $2 LIMIT 1',
                [normalized, excludeProductId]
            );
            return !!(res.rows && res.rows[0]);
        }

        const res = await q('SELECT id FROM products WHERE sku = $1 LIMIT 1', [normalized]);
        return !!(res.rows && res.rows[0]);
    }

    static async updateProduct(id, updates) {
        await this.initializeDatabase();

        const sets = [];
        const values = [];
        let idx = 1;

        let imageUrlsToPersist;
        if (updates.image_urls !== undefined) {
            imageUrlsToPersist = Array.isArray(updates.image_urls) ? updates.image_urls : [];
            if (updates.image_url === undefined) {
                updates.image_url = imageUrlsToPersist[0] || null;
            }
        }

        if (updates.name !== undefined) {
            sets.push(`name = $${idx++}`);
            values.push(updates.name);
        }
        if (updates.sku !== undefined) {
            sets.push(`sku = $${idx++}`);
            values.push(updates.sku || null);
        }
        if (updates.description !== undefined) {
            sets.push(`description = $${idx++}`);
            values.push(updates.description);
        }
        if (updates.price !== undefined) {
            sets.push(`price = $${idx++}`);
            values.push(updates.price);
        }
        if (updates.image_url !== undefined) {
            sets.push(`image_url = $${idx++}`);
            values.push(updates.image_url);
        }
        if (updates.image_urls !== undefined) {
            sets.push(`image_urls = $${idx++}`);
            values.push(JSON.stringify(imageUrlsToPersist || []));
        }
        if (updates.category !== undefined) {
            sets.push(`category = $${idx++}`);
            values.push(updates.category);
        }
        if (updates.in_stock !== undefined) {
            sets.push(`in_stock = $${idx++}`);
            values.push(Number(updates.in_stock));
        }

        if (sets.length === 0) return null;

        sets.push('updated_at = NOW()');
        values.push(id);

        await q(`UPDATE products SET ${sets.join(', ')} WHERE id = $${idx}`, values);
        return await this.getProductById(id);
    }

    static async deleteProduct(id) {
        await this.initializeDatabase();
        await q('DELETE FROM products WHERE id = $1', [id]);
    }

    static async cleanupExpiredRecords() {
        await this.initializeDatabase();
        const now = new Date().toISOString();
        try {
            await q('DELETE FROM otp_codes WHERE expires_at < $1', [now]);
            await q('DELETE FROM email_tokens WHERE expires_at < $1', [now]);
        } catch (error) {
            console.error('Error cleaning expired records:', error);
        }
    }

    static async close() {
        try {
            await pool.end();
        } catch {
            // ignore
        }
    }
}

module.exports = Database;
