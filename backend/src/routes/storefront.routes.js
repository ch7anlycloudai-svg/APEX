const { Router } = require('express');
const catalogCtrl = require('../controllers/storefront/catalog.controller');
const checkoutCtrl = require('../controllers/storefront/checkout.controller');

const router = Router();

// Public storefront routes - tenant resolved via middleware
router.get('/info', catalogCtrl.getStoreInfo);
router.get('/products', catalogCtrl.listProducts);
router.get('/products/:slug', catalogCtrl.getProduct);
router.get('/categories', catalogCtrl.listCategories);
router.post('/orders', checkoutCtrl.placeOrder);

module.exports = router;
