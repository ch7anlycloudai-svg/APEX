const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');
const path = require('path');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET_NAME = 'store-assets';

async function uploadImage(storeId, file, folder = 'products') {
  if (!file) throw ApiError.badRequest('No file provided');

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw ApiError.badRequest('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw ApiError.badRequest('File size exceeds 5MB limit');
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${crypto.randomBytes(12).toString('hex')}${ext}`;
  const filePath = `stores/${storeId}/${folder}/${filename}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600'
    });

  if (error) throw ApiError.internal('Failed to upload file');

  const { data: publicUrl } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}

async function deleteImage(url) {
  if (!url) return;

  try {
    // Extract file path from URL
    const bucketPath = url.split(`/storage/v1/object/public/${BUCKET_NAME}/`)[1];
    if (bucketPath) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([bucketPath]);
    }
  } catch (err) {
    // Non-critical, log but don't throw
    console.error('Failed to delete image:', err.message);
  }
}

module.exports = { uploadImage, deleteImage };
