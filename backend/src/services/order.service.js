const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

async function list(storeId, { page = 1, limit = 20, status }) {
  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(name, slug))', { count: 'exact' })
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw ApiError.internal('Failed to fetch orders');
  return { data, count };
}

async function getById(storeId, orderId) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(name, slug, product_images(url)))')
    .eq('id', orderId)
    .eq('store_id', storeId)
    .single();

  if (error || !data) throw ApiError.notFound('Order not found');
  return data;
}

async function create(storeId, orderData) {
  const { customer_name, customer_phone, customer_address, notes, items } = orderData;

  if (!customer_name || !customer_phone || !items || items.length === 0) {
    throw ApiError.badRequest('Customer name, phone, and at least one item are required');
  }

  // Verify all products belong to this store and get prices
  const productIds = items.map(i => i.product_id);
  const { data: products, error: prodError } = await supabaseAdmin
    .from('products')
    .select('id, price, stock, name')
    .eq('store_id', storeId)
    .eq('status', 'active')
    .in('id', productIds);

  if (prodError) throw ApiError.internal('Failed to verify products');

  const productMap = new Map(products.map(p => [p.id, p]));

  // Validate items
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      throw ApiError.badRequest(`Product not found or not available`);
    }
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    const itemTotal = product.price * quantity;
    total += itemTotal;
    orderItems.push({
      product_id: item.product_id,
      quantity,
      price: product.price,
      total: itemTotal
    });
  }

  // Find or create customer
  let customerId = null;
  const { data: existingCustomer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('store_id', storeId)
    .eq('phone', customer_phone)
    .single();

  if (existingCustomer) {
    customerId = existingCustomer.id;
    // Update customer info
    await supabaseAdmin
      .from('customers')
      .update({ name: customer_name, address: customer_address || '' })
      .eq('id', customerId);
  } else {
    const { data: newCustomer } = await supabaseAdmin
      .from('customers')
      .insert({
        store_id: storeId,
        name: customer_name,
        phone: customer_phone,
        address: customer_address || ''
      })
      .select()
      .single();
    if (newCustomer) customerId = newCustomer.id;
  }

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      store_id: storeId,
      customer_id: customerId,
      order_number: generateOrderNumber(),
      status: 'pending',
      total,
      customer_name,
      customer_phone,
      customer_address: customer_address || '',
      notes: notes || ''
    })
    .select()
    .single();

  if (orderError) throw ApiError.internal('Failed to create order');

  // Create order items
  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id
  }));

  await supabaseAdmin.from('order_items').insert(itemsWithOrderId);

  return order;
}

async function updateStatus(storeId, orderId, status) {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest('Invalid order status');
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('store_id', storeId)
    .select()
    .single();

  if (error || !data) throw ApiError.notFound('Order not found');
  return data;
}

module.exports = { list, getById, create, updateStatus };
