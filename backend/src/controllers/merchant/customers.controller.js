const catchAsync = require('../../utils/catchAsync');
const { supabaseAdmin } = require('../../config/supabase');
const { getPagination, paginatedResponse } = require('../../utils/pagination');

const list = catchAsync(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('store_id', req.storeId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }

  res.json({ success: true, ...paginatedResponse(data, count, { page, limit }) });
});

module.exports = { list };
