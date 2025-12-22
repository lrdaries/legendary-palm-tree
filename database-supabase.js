const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function safeJsonParseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return Array.isArray(value) ? value : [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function singleOrNull(queryPromise) {
  const { data, error } = await queryPromise;
  if (error) throw new Error(error.message);
  return data || null;
}

async function many(queryPromise) {
  const { data, error } = await queryPromise;
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data : [];
}

class Database {
  static async initializeDatabase() {
    // No-op: tables should be managed via Supabase migrations / SQL editor.
    return;
  }

  static async close() {
    return;
  }

  // =====================
  // USERS
  // =====================
  static async getAllUsers() {
    return await many(
      supabase
        .from('users')
        .select('id, email, first_name, last_name, role, verified, created_at, updated_at')
        .order('created_at', { ascending: false })
    );
  }

  static async createUser(userData) {
    const email = normalizeEmail(userData.email);

    const payload = {
      email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      password_hash: userData.password_hash !== undefined ? userData.password_hash : null,
      role: userData.role || 'user',
      verified: !!userData.verified
    };

    const inserted = await singleOrNull(
      supabase.from('users').insert(payload).select('*').single()
    );

    return inserted;
  }

  static async getUserById(id) {
    const userId = toNullableNumber(id);
    if (userId === null) return null;

    return await singleOrNull(
      supabase
        .from('users')
        .select('id, email, first_name, last_name, password_hash, role, verified, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle()
    );
  }

  static async getUserByEmail(email) {
    const e = normalizeEmail(email);
    if (!e) return null;

    return await singleOrNull(
      supabase
        .from('users')
        .select('id, email, first_name, last_name, password_hash, role, verified, created_at, updated_at')
        .eq('email', e)
        .maybeSingle()
    );
  }

  static async updateUser(email, updates) {
    const e = normalizeEmail(email);
    if (!e) return null;

    const patch = {};
    if (updates.first_name !== undefined) patch.first_name = updates.first_name;
    if (updates.last_name !== undefined) patch.last_name = updates.last_name;
    if (updates.password_hash !== undefined) patch.password_hash = updates.password_hash;
    if (updates.role !== undefined) patch.role = updates.role;
    if (updates.verified !== undefined) patch.verified = !!updates.verified;

    if (Object.keys(patch).length === 0) return await this.getUserByEmail(e);

    const updated = await singleOrNull(
      supabase
        .from('users')
        .update(patch)
        .eq('email', e)
        .select('id, email, first_name, last_name, password_hash, role, verified, created_at, updated_at')
        .single()
    );

    return updated;
  }

  // =====================
  // OTP CODES
  // =====================
  static async createOTP(email, code, expiresAt) {
    const e = normalizeEmail(email);
    if (!e) throw new Error('Email is required');

    await many(supabase.from('otp_codes').delete().eq('email', e));

    const inserted = await singleOrNull(
      supabase
        .from('otp_codes')
        .insert({
          email: e,
          code: String(code || ''),
          expires_at: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
          attempts: 0
        })
        .select('*')
        .single()
    );

    return inserted;
  }

  static async getOTP(email) {
    const e = normalizeEmail(email);
    if (!e) return null;

    return await singleOrNull(
      supabase
        .from('otp_codes')
        .select('id, email, code, expires_at, attempts, created_at')
        .eq('email', e)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    );
  }

  static async updateOTPAttempts(email, attempts) {
    const e = normalizeEmail(email);
    if (!e) return null;

    const updated = await singleOrNull(
      supabase
        .from('otp_codes')
        .update({ attempts: Number(attempts) || 0 })
        .eq('email', e)
        .select('id, email, code, expires_at, attempts, created_at')
        .single()
    );

    return updated;
  }

  static async deleteOTP(email) {
    const e = normalizeEmail(email);
    if (!e) return;

    await many(supabase.from('otp_codes').delete().eq('email', e));
  }

  // =====================
  // EMAIL TOKENS
  // =====================
  static async createEmailToken(token, email, expiresAt) {
    const e = normalizeEmail(email);
    if (!e) throw new Error('Email is required');

    const inserted = await singleOrNull(
      supabase
        .from('email_tokens')
        .insert({
          token: String(token || ''),
          email: e,
          expires_at: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt
        })
        .select('id, token, email, expires_at, created_at')
        .single()
    );

    return inserted;
  }

  static async getEmailToken(token) {
    const t = String(token || '').trim();
    if (!t) return null;

    return await singleOrNull(
      supabase
        .from('email_tokens')
        .select('id, token, email, expires_at, created_at')
        .eq('token', t)
        .maybeSingle()
    );
  }

  static async deleteEmailToken(token) {
    const t = String(token || '').trim();
    if (!t) return;

    await many(supabase.from('email_tokens').delete().eq('token', t));
  }

  // =====================
  // PRODUCTS
  // =====================
  static async getAllProducts(limit = 50, offset = 0) {
    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, Math.min(200, Number(limit))) : 50;
    const safeOffset = Number.isFinite(Number(offset)) ? Math.max(0, Number(offset)) : 0;

    const rows = await many(
      supabase
        .from('products')
        .select('id, sku, name, description, price, image_url, image_urls, category, in_stock, created_at, updated_at')
        .order('created_at', { ascending: false })
        .range(safeOffset, Math.max(safeOffset, safeOffset + safeLimit - 1))
    );

    return rows.map((row) => {
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
    const { count, error } = await supabase.from('products').select('id', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return Number(count || 0);
  }

  static async createProduct(productData) {
    const imageUrls = Array.isArray(productData.image_urls)
      ? productData.image_urls
      : (productData.image_url ? [productData.image_url] : []);

    const primaryImage = productData.image_url || imageUrls[0] || null;

    const payload = {
      sku: productData.sku || null,
      name: productData.name,
      description: productData.description || null,
      price: productData.price !== undefined ? Number(productData.price) : null,
      image_url: primaryImage,
      image_urls: imageUrls,
      category: productData.category || null,
      in_stock: productData.in_stock !== undefined ? Number(productData.in_stock) : 0
    };

    const inserted = await singleOrNull(
      supabase.from('products').insert(payload).select('*').single()
    );

    return {
      ...inserted,
      image_urls: safeJsonParseArray(inserted.image_urls),
      image_url: inserted.image_url || safeJsonParseArray(inserted.image_urls)[0] || null
    };
  }

  static async getProductById(id) {
    const productId = toNullableNumber(id);
    if (productId === null) return null;

    const row = await singleOrNull(
      supabase
        .from('products')
        .select('id, sku, name, description, price, image_url, image_urls, category, in_stock, created_at, updated_at')
        .eq('id', productId)
        .maybeSingle()
    );

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
    const normalized = String(sku || '').trim();
    if (!normalized) return null;

    const row = await singleOrNull(
      supabase
        .from('products')
        .select('id, sku, name, description, price, image_url, image_urls, category, in_stock, created_at, updated_at')
        .eq('sku', normalized)
        .maybeSingle()
    );

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
    const normalized = String(sku || '').trim();
    if (!normalized) return false;

    let query = supabase.from('products').select('id').eq('sku', normalized).limit(1);

    const excludeId = toNullableNumber(excludeProductId);
    if (excludeId !== null) {
      query = query.neq('id', excludeId);
    }

    const rows = await many(query);
    return !!rows[0];
  }

  static async updateProduct(id, updates) {
    const productId = toNullableNumber(id);
    if (productId === null) return null;

    const patch = {};

    let imageUrlsToPersist;
    if (updates.image_urls !== undefined) {
      imageUrlsToPersist = Array.isArray(updates.image_urls) ? updates.image_urls : [];
      patch.image_urls = imageUrlsToPersist;
      if (updates.image_url === undefined) {
        patch.image_url = imageUrlsToPersist[0] || null;
      }
    }

    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.sku !== undefined) patch.sku = updates.sku || null;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.price !== undefined) patch.price = Number(updates.price);
    if (updates.image_url !== undefined) patch.image_url = updates.image_url;
    if (updates.category !== undefined) patch.category = updates.category;
    if (updates.in_stock !== undefined) patch.in_stock = Number(updates.in_stock);

    if (Object.keys(patch).length === 0) return await this.getProductById(productId);

    const updated = await singleOrNull(
      supabase
        .from('products')
        .update(patch)
        .eq('id', productId)
        .select('id, sku, name, description, price, image_url, image_urls, category, in_stock, created_at, updated_at')
        .single()
    );

    const imageUrls = safeJsonParseArray(updated.image_urls);
    const primaryImage = updated.image_url || imageUrls[0] || null;

    return {
      ...updated,
      image_url: primaryImage,
      image_urls: imageUrls
    };
  }

  static async deleteProduct(id) {
    const productId = toNullableNumber(id);
    if (productId === null) return;

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(error.message);
  }

  static async cleanupExpiredRecords() {
    const nowIso = new Date().toISOString();

    try {
      await many(supabase.from('otp_codes').delete().lt('expires_at', nowIso));
    } catch (error) {
      console.error('Error cleaning expired OTP records:', error);
    }

    try {
      await many(supabase.from('email_tokens').delete().lt('expires_at', nowIso));
    } catch (error) {
      console.error('Error cleaning expired email token records:', error);
    }
  }
}

module.exports = Database;
