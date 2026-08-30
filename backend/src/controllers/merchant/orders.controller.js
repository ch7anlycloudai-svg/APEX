const catchAsync = require('../../utils/catchAsync');
const orderService = require('../../services/order.service');
const { getPagination, paginatedResponse } = require('../../utils/pagination');

const list = catchAsync(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { status } = req.query;
  const { data, count } = await orderService.list(req.storeId, { page, limit, status });
  res.json({ success: true, ...paginatedResponse(data, count, { page, limit }) });
});

const getById = catchAsync(async (req, res) => {
  const data = await orderService.getById(req.storeId, req.params.id);
  res.json({ success: true, data });
});

const updateStatus = catchAsync(async (req, res) => {
  const data = await orderService.updateStatus(req.storeId, req.params.id, req.body.status);
  res.json({ success: true, data });
});

module.exports = { list, getById, updateStatus };
