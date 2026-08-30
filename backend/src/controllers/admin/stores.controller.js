const catchAsync = require('../../utils/catchAsync');
const { supabaseAdmin } = require('../../config/supabase');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const ApiError = require('../../utils/ApiError');
const { clearStoreCache } = require('../../middleware/tenantResolver');
const env = require('../../config/env');

const list = catchAsync(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { search, status } = req.query;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('stores')
    .select('*, users!stores_owner_id_fkey(name, email)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) query = query.ilike('name', `%${search}%`);
  if (status) query = query.eq('status', status);

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw ApiError.internal('Failed to fetch stores');

  // Add store URL to each store
  const storesWithUrl = (data || []).map(s => ({
    ...s,
    store_url: `${s.slug}.${env.BASE_STORE_DOMAIN}`
  }));

  res.json({ success: true, ...paginatedResponse(storesWithUrl, count, { page, limit }) });
});

const getById = catchAsync(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*, users!stores_owner_id_fkey(name, email), store_settings(*)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) throw ApiError.notFound('Store not found');

  data.store_url = `${data.slug}.${env.BASE_STORE_DOMAIN}`;
  res.json({ success: true, data });
});

const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended', 'inactive'].includes(status)) {
    throw ApiError.badRequest('Invalid status');
  }

  const { data: store } = await supabaseAdmin
    .from('stores')
    .select('slug')
    .eq('id', req.params.id)
    .single();

  const { data, error } = await supabaseAdmin
    .from('stores')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) throw ApiError.notFound('Store not found');

  if (store) clearStoreCache(store.slug);

  res.json({ success: true, data });
});

const getStats = catchAsync(async (req, res) => {
  const [stores, activeStores, users, orders] = await Promise.all([
    supabaseAdmin.from('stores').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant'),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true })
  ]);

  res.json({
    success: true,
    data: {
      totalStores: stores.count || 0,
      activeStores: activeStores.count || 0,
      totalMerchants: users.count || 0,
      totalOrders: orders.count || 0
    }
  });
});

module.exports = { list, getById, updateStatus, getStats };
