const catchAsync = require('../../utils/catchAsync');
const productService = require('../../services/product.service');
const categoryService = require('../../services/category.service');
const storeService = require('../../services/store.service');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const ApiError = require('../../utils/ApiError');

const getStoreInfo = catchAsync(async (req, res) => {
  if (!req.store) throw ApiError.notFound('Store not found');
  const data = await storeService.getStorefrontInfo(req.store.id);
  res.json({ success: true, data });
});

const listProducts = catchAsync(async (req, res) => {
  if (!req.store) throw ApiError.notFound('Store not found');
  const { page, limit } = getPagination(req.query);
  const { category, search } = req.query;
  const { data, count } = await productService.listPublic(req.store.id, { page, limit, category, search });
  res.json({ success: true, ...paginatedResponse(data, count, { page, limit }) });
});

const getProduct = catchAsync(async (req, res) => {
  if (!req.store) throw ApiError.notFound('Store not found');
  const data = await productService.getBySlug(req.store.id, req.params.slug);
  res.json({ success: true, data });
});

const listCategories = catchAsync(async (req, res) => {
  if (!req.store) throw ApiError.notFound('Store not found');
  const data = await categoryService.listPublic(req.store.id);
  res.json({ success: true, data });
});

module.exports = { getStoreInfo, listProducts, getProduct, listCategories };
