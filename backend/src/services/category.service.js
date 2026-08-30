const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function list(storeId) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('name');

  if (error) throw ApiError.internal('Failed to fetch categories');
  return data;
}

async function getById(storeId, categoryId) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .eq('store_id', storeId)
    .single();

  if (error || !data) throw ApiError.notFound('Category not found');
  return data;
}

async function create(storeId, { name, description, image, status }) {
  const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now().toString(36);

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      store_id: storeId,
      name,
      slug,
      description: description || '',
      image: image || null,
      status: status || 'active'
    })
    .select()
    .single();

  if (error) throw ApiError.internal('Failed to create category');
  return data;
}

async function update(storeId, categoryId, updates) {
  await getById(storeId, categoryId);

  const updateData = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.status !== undefined) updateData.status = updates.status;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(updateData)
    .eq('id', categoryId)
    .eq('store_id', storeId)
    .select()
    .single();

  if (error) throw ApiError.internal('Failed to update category');
  return data;
}

async function remove(storeId, categoryId) {
  await getById(storeId, categoryId);

  // Set products in this category to null category
  await supabaseAdmin
    .from('products')
    .update({ category_id: null })
    .eq('category_id', categoryId)
    .eq('store_id', storeId);

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('store_id', storeId);

  if (error) throw ApiError.internal('Failed to delete category');
}

async function listPublic(storeId) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, slug, image')
    .eq('store_id', storeId)
    .eq('status', 'active')
    .order('name');

  if (error) throw ApiError.internal('Failed to fetch categories');
  return data;
}

module.exports = { list, getById, create, update, remove, listPublic };
