-- ============================================================
-- APEX Commerce — Database Schema (Migration 1 of 3)
-- Platform: apexmr.store
-- Store URLs: {slug}.apexmr.store (wildcard subdomain)
-- Languages: Arabic (ar) + French (fr)
-- No custom domains — subdomain only
-- ============================================================
-- Run in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS store_themes CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS store_domains CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. STORES
-- slug is the subdomain: {slug}.apexmr.store
-- ============================================
CREATE TABLE stores (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  description   TEXT DEFAULT '',
  logo          TEXT,
  status        VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_status   ON stores(status);

-- ============================================
-- 2. USERS
-- ============================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id      UUID REFERENCES stores(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL
                  CHECK (role IN ('admin', 'merchant', 'customer')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email_role ON users(email, role);
CREATE INDEX idx_users_store_id          ON users(store_id);
CREATE INDEX idx_users_role              ON users(role);

-- FK: stores.owner_id → users.id
ALTER TABLE stores
  ADD CONSTRAINT stores_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- 3. STORE SETTINGS
-- ============================================
CREATE TABLE store_settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id         UUID UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  store_name       VARCHAR(255) DEFAULT '',
  logo             TEXT,
  description      TEXT DEFAULT '',
  phone            VARCHAR(50),
  whatsapp         VARCHAR(50),
  address          TEXT DEFAULT '',
  delivery_text    TEXT DEFAULT 'التوصيل متوفر في انوكشوط و لجميع الولايات',
  currency         VARCHAR(10) DEFAULT 'MRU',
  default_language VARCHAR(5) DEFAULT 'ar'
                     CHECK (default_language IN ('ar', 'fr')),
  seo_title        VARCHAR(255),
  seo_description  TEXT,
  social_links     JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. STORE THEMES
-- ============================================
CREATE TABLE store_themes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id        UUID UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  primary_color   VARCHAR(20) DEFAULT '#2563eb',
  secondary_color VARCHAR(20) DEFAULT '#1e40af',
  font            VARCHAR(100),
  layout          VARCHAR(50),
  hero_image      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. CATEGORIES
-- ============================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  image       TEXT,
  status      VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, slug)
);

CREATE INDEX idx_categories_store_id ON categories(store_id);

-- ============================================
-- 6. PRODUCTS
-- ============================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL,
  description   TEXT DEFAULT '',
  price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  compare_price DECIMAL(12,2),
  stock         INTEGER DEFAULT 0,
  sku           VARCHAR(100),
  status        VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active', 'draft', 'inactive')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, slug)
);

CREATE INDEX idx_products_store_id    ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status      ON products(status);
CREATE INDEX idx_products_created_at  ON products(created_at);

-- ============================================
-- 7. PRODUCT IMAGES
-- ============================================
CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  position   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ============================================
-- 8. CUSTOMERS
-- ============================================
CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(50),
  email      VARCHAR(255),
  address    TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, phone)
);

CREATE INDEX idx_customers_store_id ON customers(store_id);

-- ============================================
-- 9. ORDERS
-- ============================================
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id         UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_number     VARCHAR(50) UNIQUE NOT NULL,
  status           VARCHAR(20) DEFAULT 'pending'
                     CHECK (status IN ('pending', 'confirmed', 'preparing',
                                       'shipped', 'delivered', 'cancelled')),
  total            DECIMAL(12,2) DEFAULT 0,
  customer_name    VARCHAR(255),
  customer_phone   VARCHAR(50),
  customer_address TEXT DEFAULT '',
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_store_id   ON orders(store_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================
-- 10. ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity   INTEGER NOT NULL DEFAULT 1,
  price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  total      DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
