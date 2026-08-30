const catchAsync = require('../utils/catchAsync');
const { setTokenCookie, clearTokenCookie } = require('../utils/cookies');
const authService = require('../services/auth.service');

const register = catchAsync(async (req, res) => {
  const { name, email, password, storeName, storeSlug } = req.body;
  const { user, token } = await authService.register({ name, email, password, storeName, storeSlug });
  setTokenCookie(res, token);
  res.status(201).json({ success: true, data: { user } });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });
  setTokenCookie(res, token);
  res.json({ success: true, data: { user } });
});

const logout = catchAsync(async (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

const getMe = catchAsync(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

const checkSlug = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const result = await authService.checkSlugAvailability(slug);
  res.json({ success: true, data: result });
});

module.exports = { register, login, logout, getMe, checkSlug };
