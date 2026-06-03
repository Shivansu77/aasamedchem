-- ============================================================
-- aasamedchem — Database Schema
-- Run this SQL in the Neon SQL Editor to bootstrap the database.
-- ============================================================

-- 1. Users (authentication + profile)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50) DEFAULT 'user',
  phone         VARCHAR(20),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Units (measurement units: kg, g, L, mL, pcs, etc.)
CREATE TABLE IF NOT EXISTS units (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  abbreviation  VARCHAR(20) NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products (chemical / pharma products)
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  cas_number    VARCHAR(50),
  sku           VARCHAR(100) UNIQUE,
  unit_id       INTEGER REFERENCES units(id),
  price         NUMERIC(20,8) NOT NULL DEFAULT 0,
  stock_qty     NUMERIC(20,8) NOT NULL DEFAULT 0,
  category      VARCHAR(100),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  order_number  VARCHAR(50) UNIQUE NOT NULL,
  status        VARCHAR(50) DEFAULT 'pending',
  total_amount  NUMERIC(20,8) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Order Items (line items in an order)
CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER REFERENCES products(id),
  quantity      NUMERIC(20,8) NOT NULL,
  unit_price    NUMERIC(20,8) NOT NULL,
  subtotal      NUMERIC(20,8) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_sku      ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_cas      ON products(cas_number);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number     ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================================
-- Seed data: common measurement units
-- ============================================================

INSERT INTO units (name, abbreviation) VALUES
  ('Kilogram',    'kg'),
  ('Gram',        'g'),
  ('Milligram',   'mg'),
  ('Litre',       'L'),
  ('Millilitre',  'mL'),
  ('Piece',       'pcs'),
  ('Box',         'box'),
  ('Bottle',      'btl'),
  ('Pack',        'pack')
ON CONFLICT (abbreviation) DO NOTHING;
