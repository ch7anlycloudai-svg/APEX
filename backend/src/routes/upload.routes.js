const { Router } = require('express');
const multer = require('multer');
const authenticate = require('../middleware/authenticate');
const { authorize, requireStoreOwnership } = require('../middleware/authorize');
const catchAsync = require('../utils/catchAsync');
const uploadService = require('../services/upload.service');

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post(
  '/image',
  authenticate,
  authorize('merchant', 'admin'),
  requireStoreOwnership,
  upload.single('image'),
  catchAsync(async (req, res) => {
    const folder = req.query.folder || 'products';
    const url = await uploadService.uploadImage(req.storeId, req.file, folder);
    res.json({ success: true, data: { url } });
  })
);

module.exports = router;
