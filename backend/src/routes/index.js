const { Router } = require('express');
const authRoutes = require('./auth.routes');
const merchantRoutes = require('./merchant.routes');
const storefrontRoutes = require('./storefront.routes');
const adminRoutes = require('./admin.routes');
const uploadRoutes = require('./upload.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/merchant', merchantRoutes);
router.use('/storefront', storefrontRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'APEX Commerce API is running' });
});

module.exports = router;
