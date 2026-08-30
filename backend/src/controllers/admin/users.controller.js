const catchAsync = require('../../utils/catchAsync');
const { supabaseAdmin } = require('../../config/supabase');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const ApiError = require('../../utils/ApiError');

const list = catchAsync(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { role, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('users')
    .select('id, name, email, role, store_id, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (role) query = query.eq('role', role);
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw ApiError.internal('Failed to fetch users');

  res.json({ success: true, ...paginatedResponse(data, count, { page, limit }) });
});

module.exports = { list };
