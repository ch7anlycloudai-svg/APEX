-- ============================================================
-- APEX Commerce — Storage Bucket (Migration 3 of 3)
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- Create bucket for product images, logos, banners
-- Files organized as: stores/{store_id}/products/filename.jpg
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view uploaded images
CREATE POLICY "public_read_store_assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-assets');

-- Upload/update/delete handled by backend via service_role (bypasses RLS)
-- These policies allow anon/authenticated as fallback
CREATE POLICY "allow_upload_store_assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-assets');

CREATE POLICY "allow_update_store_assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-assets');

CREATE POLICY "allow_delete_store_assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-assets');
