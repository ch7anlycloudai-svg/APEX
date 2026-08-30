const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

async function getStore(storeId) {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();

  if (error || !data) throw ApiError.notFound('Store not found');
  return data;
}

async function getStoreSettings(storeId) {
  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .select('*')
    .eq('store_id', storeId)
    .single();

  if (error || !data) {
    // Return defaults if no settings exist
    return {
      store_id: storeId,
      store_name: '',
      delivery_text: 'التوصيل متوفر في انوكشوط و لجميع الولايات',
      currency: 'MRU',
      default_language: 'ar'
    };
  }
  return data;
}

async function updateStoreSettings(storeId, settings) {
  const updateData = { updated_at: new Date().toISOString() };
  const allowedFields = [
    'store_name', 'logo', 'description', 'phone', 'whatsapp',
    'address', 'delivery_text', 'currency', 'default_language',
    'seo_title', 'seo_description', 'social_links'
  ];

  for (const field of allowedFields) {
    if (settings[field] !== undefined) {
      updateData[field] = settings[field];
    }
  }

  // Try update first, insert if not exists
  const { data: existing } = await supabaseAdmin
    .from('store_settings')
    .select('id')
    .eq('store_id', storeId)
    .single();

  let data;
  if (existing) {
    const result = await supabaseAdmin
      .from('store_settings')
      .update(updateData)
      .eq('store_id', storeId)
      .select()
      .single();
    data = result.data;
  } else {
    const result = await supabaseAdmin
      .from('store_settings')
      .insert({ store_id: storeId, ...updateData })
      .select()
      .single();
    data = result.data;
  }

  return data;
}

async function getStoreTheme(storeId) {
  const { data } = await supabaseAdmin
    .from('store_themes')
    .select('*')
    .eq('store_id', storeId)
    .single();

  return data || {
    store_id: storeId,
    primary_color: '#2563eb',
    secondary_color: '#1e40af'
  };
}

async function updateStoreTheme(storeId, theme) {
  const updateData = { updated_at: new Date().toISOString() };
  if (theme.primary_color) updateData.primary_color = theme.primary_color;
  if (theme.secondary_color) updateData.secondary_color = theme.secondary_color;
  if (theme.font) updateData.font = theme.font;
  if (theme.layout) updateData.layout = theme.layout;
  if (theme.hero_image) updateData.hero_image = theme.hero_image;

  const { data: existing } = await supabaseAdmin
    .from('store_themes')
    .select('id')
    .eq('store_id', storeId)
    .single();

  if (existing) {
    const { data } = await supabaseAdmin
      .from('store_themes')
      .update(updateData)
      .eq('store_id', storeId)
      .select()
      .single();
    return data;
  } else {
    const { data } = await supabaseAdmin
      .from('store_themes')
      .insert({ store_id: storeId, ...updateData })
      .select()
      .single();
    return data;
  }
}

async function getDashboardStats(storeId) {
  const [products, orders, pendingOrders, customers] = await Promise.all([
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId).eq('status', 'pending'),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }).eq('store_id', storeId)
  ]);

  return {
    totalProducts: products.count || 0,
    totalOrders: orders.count || 0,
    pendingOrders: pendingOrders.count || 0,
    totalCustomers: customers.count || 0
  };
}

// Get full store info for storefront
async function getStorefrontInfo(storeId) {
  const [store, settings, theme] = await Promise.all([
    getStore(storeId),
    getStoreSettings(storeId),
    getStoreTheme(storeId)
  ]);

  return { store, settings, theme };
}

module.exports = {
  getStore, getStoreSettings, updateStoreSettings,
  getStoreTheme, updateStoreTheme, getDashboardStats,
  getStorefrontInfo
};
