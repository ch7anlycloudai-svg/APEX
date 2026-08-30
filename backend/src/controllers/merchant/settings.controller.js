const catchAsync = require('../../utils/catchAsync');
const storeService = require('../../services/store.service');

const getSettings = catchAsync(async (req, res) => {
  const data = await storeService.getStoreSettings(req.storeId);
  res.json({ success: true, data });
});

const updateSettings = catchAsync(async (req, res) => {
  const data = await storeService.updateStoreSettings(req.storeId, req.body);
  res.json({ success: true, data });
});

const getTheme = catchAsync(async (req, res) => {
  const data = await storeService.getStoreTheme(req.storeId);
  res.json({ success: true, data });
});

const updateTheme = catchAsync(async (req, res) => {
  const data = await storeService.updateStoreTheme(req.storeId, req.body);
  res.json({ success: true, data });
});

const getDashboard = catchAsync(async (req, res) => {
  const stats = await storeService.getDashboardStats(req.storeId);
  const store = await storeService.getStore(req.storeId);
  res.json({ success: true, data: { stats, store } });
});

module.exports = { getSettings, updateSettings, getTheme, updateTheme, getDashboard };
