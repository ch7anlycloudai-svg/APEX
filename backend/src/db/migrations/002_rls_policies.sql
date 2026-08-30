-- ============================================================
-- APEX Commerce — Row Level Security (Migration 2 of 3)
-- Run AFTER 001_schema.sql
-- ============================================================

ALTER TABLE stores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_themes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;

-- Public SELECT (storefront reads)
CREATE POLICY "anon_select_active_stores" ON stores
  FOR SELECT USING (status = 'active');

CREATE POLICY "anon_select_store_settings" ON store_settings
  FOR SELECT USING (true);

CREATE POLICY "anon_select_store_themes" ON store_themes
  FOR SELECT USING (true);

CREATE POLICY "anon_select_active_products" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "anon_select_product_images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "anon_select_active_categories" ON categories
  FOR SELECT USING (status = 'active');

-- Public INSERT (storefront order placement)
CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_insert_order_items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_insert_customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update_customers" ON customers
  FOR UPDATE USING (true);
