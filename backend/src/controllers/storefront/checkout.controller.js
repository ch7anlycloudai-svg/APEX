const catchAsync = require('../../utils/catchAsync');
const orderService = require('../../services/order.service');
const ApiError = require('../../utils/ApiError');

const placeOrder = catchAsync(async (req, res) => {
  if (!req.store) throw ApiError.notFound('Store not found');
  const data = await orderService.create(req.store.id, req.body);
  res.status(201).json({ success: true, data });
});

module.exports = { placeOrder };
