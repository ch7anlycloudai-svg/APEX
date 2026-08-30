const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const storesCtrl = require('../controllers/admin/stores.controller');
const usersCtrl = require('../controllers/admin/users.controller');

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// Dashboard stats
router.get('/stats', storesCtrl.getStats);

// Stores
router.get('/stores', storesCtrl.list);
router.get('/stores/:id', storesCtrl.getById);
router.put('/stores/:id/status', storesCtrl.updateStatus);

// Users
router.get('/users', usersCtrl.list);

module.exports = router;
