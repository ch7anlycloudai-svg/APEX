const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const { RESERVED_SLUGS } = require('../shared/roles');

function generateToken(userId) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function normalizeSlug(slug) {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function validateSlug(slug) {
  if (!slug || slug.length < 3 || slug.length > 50) {
    return 'Slug must be between 3 and 50 characters';
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return 'Slug can only contain lowercase letters, numbers, and hyphens';
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return 'This slug is reserved';
  }
  return null;
}

async function register({ name, email, password, storeName, storeSlug }) {
  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required');
  }
  if (password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  // Check if email already exists
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .eq('role', 'merchant')
    .single();

  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Create store if storeName and storeSlug provided
  let storeId = null;
  if (storeName && storeSlug) {
    const slug = normalizeSlug(storeSlug);
    const slugError = validateSlug(slug);
    if (slugError) {
      throw ApiError.badRequest(slugError);
    }

    // Check slug uniqueness
    const { data: existingStore } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingStore) {
      throw ApiError.conflict('This store slug is already taken');
    }

    // Create store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({ name: storeName, slug, status: 'active' })
      .select()
      .single();

    if (storeError) throw ApiError.internal('Failed to create store');
    storeId = store.id;

    // Create default store settings
    await supabaseAdmin.from('store_settings').insert({
      store_id: storeId,
      store_name: storeName,
      delivery_text: 'التوصيل متوفر في انوكشوط و لجميع الولايات',
      currency: 'MRU',
      default_language: 'ar'
    });

    // Create default store theme
    await supabaseAdmin.from('store_themes').insert({
      store_id: storeId,
      primary_color: '#2563eb',
      secondary_color: '#1e40af'
    });
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'merchant',
      store_id: storeId
    })
    .select('id, name, email, role, store_id')
    .single();

  if (userError) throw ApiError.internal('Failed to create user');

  // Update store owner_id
  if (storeId) {
    await supabaseAdmin
      .from('stores')
      .update({ owner_id: user.id })
      .eq('id', storeId);
  }

  const token = generateToken(user.id);
  return { user, token };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, role, store_id, password_hash')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user.id);
  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

async function checkSlugAvailability(slug) {
  const normalized = normalizeSlug(slug);
  const slugError = validateSlug(normalized);
  if (slugError) {
    return { available: false, error: slugError, slug: normalized };
  }

  const { data: existingStore } = await supabaseAdmin
    .from('stores')
    .select('id')
    .eq('slug', normalized)
    .single();

  return {
    available: !existingStore,
    slug: normalized,
    url: `${normalized}.${env.BASE_STORE_DOMAIN}`
  };
}

module.exports = { register, login, checkSlugAvailability, generateToken };
