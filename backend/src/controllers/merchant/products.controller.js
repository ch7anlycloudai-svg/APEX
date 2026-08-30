const catchAsync = require('../../utils/catchAsync');
const productService = require('../../services/product.service');
const { getPagination, paginatedResponse } = require('../../utils/pagination');

const list = catchAsync(async (req, res) => {
  const storeId = req.storeId;
  const { page, limit } = getPagination(req.query);
  const { category, status, search } = req.query;
  const { data, count } = await productService.list(storeId, { page, limit, category, status, search });
  res.json({ success: true, ...paginatedResponse(data, count, { page, limit }) });
});

const getById = catchAsync(async (req, res) => {
  const data = await productService.getById(req.storeId, req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await productService.create(req.storeId, req.body);
  res.status(201).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await productService.update(req.storeId, req.params.id, req.body);
  res.json({ success: true, data });
});

const remove = catchAsync(async (req, res) => {
  await productService.remove(req.storeId, req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = { list, getById, create, update, remove };
