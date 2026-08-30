const catchAsync = require('../../utils/catchAsync');
const categoryService = require('../../services/category.service');

const list = catchAsync(async (req, res) => {
  const data = await categoryService.list(req.storeId);
  res.json({ success: true, data });
});

const getById = catchAsync(async (req, res) => {
  const data = await categoryService.getById(req.storeId, req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await categoryService.create(req.storeId, req.body);
  res.status(201).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await categoryService.update(req.storeId, req.params.id, req.body);
  res.json({ success: true, data });
});

const remove = catchAsync(async (req, res) => {
  await categoryService.remove(req.storeId, req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { list, getById, create, update, remove };
