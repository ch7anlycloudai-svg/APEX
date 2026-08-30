const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function list(storeId, { page = 1, limit = 20, category, status, search }) {
  let query = supabaseAdmin
    .from('products')
    .select('*, categories(name), product_images(id, url, position)', { count: 'exact' })
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category_id', category);
  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('name', `%${search}%`);

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw ApiError.internal('Failed to fetch products');
  return { data, count };
}

async function getById(storeId, productId) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name), product_images(id, url, position)')
    .eq('id', productId)
    .eq('store_id', storeId)
    .single();

  if (error || !data) throw ApiError.notFound('Product not found');
  return data;
}

async function getBySlug(storeId, slug) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(name), product_images(id, url, position)')
    .eq('slug', slug)
    .eq('store_id', storeId)
    .eq('status', 'active')
    .single();

  if (error || !data) throw ApiError.notFound('Product not found');
  return data;
}

async function create(storeId, productData) {
  const slug = generateSlug(productData.name) + '-' + Date.now().toString(36);

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      store_id: storeId,
      category_id: productData.category_id || null,
      name: productData.name,
      slug,
      description: productData.description || '',
      price: productData.price,
      compare_price: productData.compare_price || null,
      stock: productData.stock || 0,
      sku: productData.sku || null,
      status: productData.status || 'active'
    })
    .select()
    .single();

  if (error) throw ApiError.internal('Failed to create product');

  // Handle images
  if (productData.images && productData.images.length > 0) {
    const imageRecords = productData.images.map((url, i) => ({
      product_id: data.id,
      url,
      position: i
    }));
    await supabaseAdmin.from('product_images').insert(imageRecords);
  }

  return data;
}

async function update(storeId, productId, productData) {
  // Verify product belongs to store
  const existing = await getById(storeId, productId);

  const updates = {};
  if (productData.name !== undefined) {
    updates.name = productData.name;
    updates.slug = generateSlug(productData.name) + '-' + Date.now().toString(36);
  }
  if (productData.description !== undefined) updates.description = productData.description;
  if (productData.price !== undefined) updates.price = productData.price;
  if (productData.compare_price !== undefined) updates.compare_price = productData.compare_price;
  if (productData.stock !== undefined) updates.stock = productData.stock;
  if (productData.sku !== undefined) updates.sku = productData.sku;
  if (productData.status !== undefined) updates.status = productData.status;
  if (productData.category_id !== undefined) updates.category_id = productData.category_id;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', productId)
    .eq('store_id', storeId)
    .select()
    .single();

  if (error) throw ApiError.internal('Failed to update product');

  // Update images if provided
  if (productData.images !== undefined) {
    await supabaseAdmin.from('product_images').delete().eq('product_id', productId);
    if (productData.images.length > 0) {
      const imageRecords = productData.images.map((url, i) => ({
        product_id: productId,
        url,
        position: i
      }));
      await supabaseAdmin.from('product_images').insert(imageRecords);
    }
  }

  return data;
}

async function remove(storeId, productId) {
  // Verify product belongs to store
  await getById(storeId, productId);

  await supabaseAdmin.from('product_images').delete().eq('product_id', productId);
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('store_id', storeId);

  if (error) throw ApiError.internal('Failed to delete product');
}

// Public storefront: list active products
async function listPublic(storeId, { page = 1, limit = 20, category, search }) {
  let query = supabaseAdmin
    .from('products')
    .select('id, name, slug, price, compare_price, product_images(url, position)', { count: 'exact' })
    .eq('store_id', storeId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category_id', category);
  if (search) query = query.ilike('name', `%${search}%`);

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw ApiError.internal('Failed to fetch products');
  return { data, count };
}

module.exports = { list, getById, getBySlug, create, update, remove, listPublic };
