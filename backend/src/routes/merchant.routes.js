const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const { authorize, requireStoreOwnership } = require('../middleware/authorize');
const productsCtrl = require('../controllers/merchant/products.controller');
const categoriesCtrl = require('../controllers/merchant/categories.controller');
const ordersCtrl = require('../controllers/merchant/orders.controller');
const settingsCtrl = require('../controllers/merchant/settings.controller');
const customersCtrl = require('../controllers/merchant/customers.controller');

const router = Router();

// All merchant routes require authentication + merchant role + store ownership
router.use(authenticate, authorize('merchant', 'admin'), requireStoreOwnership);

// Dashboard
router.get('/dashboard', settingsCtrl.getDashboard);

// Products
router.get('/products', productsCtrl.list);
router.post('/products', productsCtrl.create);
router.get('/products/:id', productsCtrl.getById);
router.put('/products/:id', productsCtrl.update);
router.delete('/products/:id', productsCtrl.remove);

// Categories
router.get('/categories', categoriesCtrl.list);
router.post('/categories', categoriesCtrl.create);
router.get('/categories/:id', categoriesCtrl.getById);
router.put('/categories/:id', categoriesCtrl.update);
router.delete('/categories/:id', categoriesCtrl.remove);

// Orders
router.get('/orders', ordersCtrl.list);
router.get('/orders/:id', ordersCtrl.getById);
router.put('/orders/:id/status', ordersCtrl.updateStatus);

// Customers
router.get('/customers', customersCtrl.list);

// Store Settings
router.get('/settings', settingsCtrl.getSettings);
router.put('/settings', settingsCtrl.updateSettings);

// Appearance / Theme
router.get('/theme', settingsCtrl.getTheme);
router.put('/theme', settingsCtrl.updateTheme);

module.exports = router;
