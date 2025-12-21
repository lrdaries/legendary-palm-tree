const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'app.db');

let db;
let isInitialized = false;

const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                console.log('Connected to SQLite database');
                initializeTables().then(resolve).catch(reject);
            }
        });
    });
};

function initializeTables() {
    return new Promise((resolve, reject) => {
        const createUsers = () => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                password_hash TEXT,
                role TEXT DEFAULT 'user',
                verified INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                    reject(err);
                } else {
                    // Check if role column exists, if not add it
                    db.all("PRAGMA table_info(users)", (err, columns) => {
                        if (err) {
                            console.error('Error checking users table:', err);
                            createOTPCodes();
                        } else {
                            const hasRole = columns.some(col => col.name === 'role');
                            if (!hasRole) {
                                db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
                                    if (err) console.error('Error adding role column:', err);
                                    createOTPCodes();
                                });
                            } else {
                                createOTPCodes();
                            }
                        }
                    });
                }
            });
        };

        const createOTPCodes = () => {
            db.run(`CREATE TABLE IF NOT EXISTS otp_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                code TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                attempts INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating otp_codes table:', err.message);
                    reject(err);
                } else {
                    createEmailTokens();
                }
            });
        };

        const createEmailTokens = () => {
            db.run(`CREATE TABLE IF NOT EXISTS email_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT UNIQUE NOT NULL,
                email TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating email_tokens table:', err.message);
                    reject(err);
                } else {
                    createProducts();
                }
            });
        };

        const createProducts = () => {
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL,
                image_url TEXT,
                image_urls TEXT,
                category TEXT,
                in_stock INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating products table:', err.message);
                    reject(err);
                } else {
                    // Migrate existing DBs that don't have image_urls
                    db.all("PRAGMA table_info(products)", (err, columns) => {
                        if (err) {
                            console.error('Error checking products table:', err);
                            createIndexes();
                        } else {
                            const hasImageUrls = columns.some(col => col.name === 'image_urls');
                            const hasSku = columns.some(col => col.name === 'sku');

                            const migrations = [];
                            if (!hasImageUrls) migrations.push({ name: 'image_urls', sql: 'ALTER TABLE products ADD COLUMN image_urls TEXT' });
                            if (!hasSku) migrations.push({ name: 'sku', sql: 'ALTER TABLE products ADD COLUMN sku TEXT' });

                            const runMigrations = (idx = 0) => {
                                if (idx >= migrations.length) return createIndexes();
                                const mig = migrations[idx];
                                db.run(mig.sql, (err) => {
                                    if (err) console.error(`Error adding ${mig.name} column:`, err);
                                    runMigrations(idx + 1);
                                });
                            };

                            runMigrations();
                        }
                    });
                }
            });
        };

        const createIndexes = () => {
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
                'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
                'CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email)',
                'CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_tokens(token)',
                'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
                'CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku)'
            ];

            let completed = 0;
            indexes.forEach(sql => {
                db.run(sql, (err) => {
                    if (err) {
                        console.error('Error creating index:', err.message);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === indexes.length) {
                            isInitialized = true;
                            resolve();
                        }
                    }
                });
            });
        };

        createUsers();
    });
}

async function ensureInitialized() {
    if (!isInitialized) {
        await initializeDatabase();
    }
}

function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

function getRow(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function getAllRows(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

class Database {
    static async initializeDatabase() {
        if (!isInitialized) {
            await initializeDatabase();
        }
    }

    static async createUser(userData) {
        await ensureInitialized();
        const sql = `INSERT INTO users (email, first_name, last_name, password_hash, role, verified)
                     VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await runQuery(sql, [
            userData.email,
            userData.first_name,
            userData.last_name,
            userData.password_hash,
            userData.role || 'user',
            userData.verified ? 1 : 0
        ]);

        return await this.getUserById(result.id);
    }

    static async getUserById(id) {
        await ensureInitialized();
        const sql = `SELECT id, email, first_name, last_name, password_hash, role, verified,
                            created_at, updated_at FROM users WHERE id = ?`;
        return await getRow(sql, [id]);
    }

    static async getUserByEmail(email) {
        await ensureInitialized();
        const sql = `SELECT id, email, first_name, last_name, password_hash, role, verified,
                            created_at, updated_at FROM users WHERE email = ?`;
        return await getRow(sql, [email.toLowerCase()]);
    }

    static async updateUser(email, updates) {
        await ensureInitialized();
        const fields = [];
        const values = [];

        if (updates.first_name !== undefined) {
            fields.push('first_name = ?');
            values.push(updates.first_name);
        }
        if (updates.last_name !== undefined) {
            fields.push('last_name = ?');
            values.push(updates.last_name);
        }
        if (updates.password_hash !== undefined) {
            fields.push('password_hash = ?');
            values.push(updates.password_hash);
        }
        if (updates.role !== undefined) {
            fields.push('role = ?');
            values.push(updates.role);
        }
        if (updates.verified !== undefined) {
            fields.push('verified = ?');
            values.push(updates.verified ? 1 : 0);
        }

        if (fields.length === 0) return null;

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(email.toLowerCase());

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE email = ?`;
        await runQuery(sql, values);

        return await this.getUserByEmail(email);
    }

    static async createOTP(email, code, expiresAt) {
        await ensureInitialized();
        await runQuery('DELETE FROM otp_codes WHERE email = ?', [email.toLowerCase()]);

        const sql = `INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)`;
        const result = await runQuery(sql, [email.toLowerCase(), code, expiresAt.toISOString()]);

        return await this.getOTPById(result.id);
    }

    static async getOTPById(id) {
        await ensureInitialized();
        const sql = `SELECT id, email, code, expires_at, attempts, created_at
                     FROM otp_codes WHERE id = ?`;
        return await getRow(sql, [id]);
    }

    static async getOTP(email) {
        await ensureInitialized();
        const sql = `SELECT id, email, code, expires_at, attempts, created_at
                     FROM otp_codes WHERE email = ?`;
        return await getRow(sql, [email.toLowerCase()]);
    }

    static async updateOTPAttempts(email, attempts) {
        await ensureInitialized();
        const sql = `UPDATE otp_codes SET attempts = ? WHERE email = ?`;
        await runQuery(sql, [attempts, email.toLowerCase()]);

        return await this.getOTP(email);
    }

    static async deleteOTP(email) {
        await ensureInitialized();
        const sql = `DELETE FROM otp_codes WHERE email = ?`;
        await runQuery(sql, [email.toLowerCase()]);
    }

    static async createEmailToken(token, email, expiresAt) {
        await ensureInitialized();
        const sql = `INSERT INTO email_tokens (token, email, expires_at) VALUES (?, ?, ?)`;
        const result = await runQuery(sql, [token, email.toLowerCase(), expiresAt.toISOString()]);

        return await this.getEmailTokenById(result.id);
    }

    static async getEmailTokenById(id) {
        await ensureInitialized();
        const sql = `SELECT id, token, email, expires_at, created_at
                     FROM email_tokens WHERE id = ?`;
        return await getRow(sql, [id]);
    }

    static async getEmailToken(token) {
        await ensureInitialized();
        const sql = `SELECT id, token, email, expires_at, created_at
                     FROM email_tokens WHERE token = ?`;
        return await getRow(sql, [token]);
    }

    static async deleteEmailToken(token) {
        await ensureInitialized();
        const sql = `DELETE FROM email_tokens WHERE token = ?`;
        await runQuery(sql, [token]);
    }

    static async getAllProducts(limit = 50, offset = 0) {
        await ensureInitialized();
        const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.min(200, limit)) : 50;
        const safeOffset = Number.isFinite(offset) ? Math.max(0, offset) : 0;

        const sql = `SELECT id, sku, name, description, price, image_url, image_urls, category, in_stock,
                           created_at, updated_at FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const rows = await getAllRows(sql, [safeLimit, safeOffset]);
        return rows.map((row) => {
            let imageUrls = [];
            try {
                imageUrls = row.image_urls ? JSON.parse(row.image_urls) : [];
            } catch {
                imageUrls = [];
            }

            const primaryImage = row.image_url || imageUrls[0] || null;
            return {
                ...row,
                image_url: primaryImage,
                image_urls: Array.isArray(imageUrls) ? imageUrls : []
            };
        });
    }

    static async createProduct(productData) {
        await ensureInitialized();

        const imageUrls = Array.isArray(productData.image_urls)
            ? productData.image_urls
            : (productData.image_url ? [productData.image_url] : []);

        const primaryImage = productData.image_url || imageUrls[0] || null;

        const sql = `INSERT INTO products (sku, name, description, price, image_url, image_urls, category, in_stock)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await runQuery(sql, [
            productData.sku || null,
            productData.name,
            productData.description || null,
            productData.price || null,
            primaryImage,
            JSON.stringify(imageUrls),
            productData.category || null,
            productData.in_stock !== undefined ? Number(productData.in_stock) : 0
        ]);

        return await this.getProductById(result.id);
    }

    static async getProductById(id) {
        await ensureInitialized();
        const sql = `SELECT id, sku, name, description, price, image_url, image_urls, category, in_stock,
                            created_at, updated_at FROM products WHERE id = ?`;
        const row = await getRow(sql, [id]);
        if (!row) return null;

        let imageUrls = [];
        try {
            imageUrls = row.image_urls ? JSON.parse(row.image_urls) : [];
        } catch {
            imageUrls = [];
        }

        const primaryImage = row.image_url || imageUrls[0] || null;
        return {
            ...row,
            image_url: primaryImage,
            image_urls: Array.isArray(imageUrls) ? imageUrls : []
        };
    }

    static async updateProduct(id, updates) {
        await ensureInitialized();
        const fields = [];
        const values = [];

        // If caller provided image_urls, also keep image_url in sync (first image)
        if (updates.image_urls !== undefined) {
            const imageUrls = Array.isArray(updates.image_urls) ? updates.image_urls : [];
            fields.push('image_urls = ?');
            values.push(JSON.stringify(imageUrls));

            if (updates.image_url === undefined) {
                updates.image_url = imageUrls[0] || null;
            }
        }

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.sku !== undefined) {
            fields.push('sku = ?');
            values.push(updates.sku || null);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.price !== undefined) {
            fields.push('price = ?');
            values.push(updates.price);
        }
        if (updates.image_url !== undefined) {
            fields.push('image_url = ?');
            values.push(updates.image_url);
        }

        if (updates.category !== undefined) {
            fields.push('category = ?');
            values.push(updates.category);
        }
        if (updates.in_stock !== undefined) {
            fields.push('in_stock = ?');
            values.push(Number(updates.in_stock));
        }

        if (fields.length === 0) return null;

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
        await runQuery(sql, values);

        return await this.getProductById(id);
    }

    static async skuExists(sku, excludeProductId = null) {
        await ensureInitialized();
        const normalized = (sku || '').trim();
        if (!normalized) return false;

        if (excludeProductId !== null && excludeProductId !== undefined) {
            const row = await getRow('SELECT id FROM products WHERE sku = ? AND id != ? LIMIT 1', [normalized, excludeProductId]);
            return !!row;
        }

        const row = await getRow('SELECT id FROM products WHERE sku = ? LIMIT 1', [normalized]);
        return !!row;
    }

    static async deleteProduct(id) {
        await ensureInitialized();
        const sql = `DELETE FROM products WHERE id = ?`;
        await runQuery(sql, [id]);
    }

    static async cleanupExpiredRecords() {
        await ensureInitialized();
        const now = new Date().toISOString();

        try {
            await runQuery('DELETE FROM otp_codes WHERE expires_at < ?', [now]);
            await runQuery('DELETE FROM email_tokens WHERE expires_at < ?', [now]);
        } catch (error) {
            console.error('Error cleaning expired records:', error);
        }
    }

    static async countProducts() {
        await ensureInitialized();
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
                if (err) {
                    console.error('Error counting products:', err);
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    static close() {
        return new Promise((resolve, reject) => {
            if (db) {
                db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = Database;