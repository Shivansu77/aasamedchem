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
  image_url     TEXT,
  price         NUMERIC(30,12) NOT NULL DEFAULT 0,
  stock_qty     NUMERIC(30,12) NOT NULL DEFAULT 0,
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
  total_amount  NUMERIC(30,12) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Order Items (line items in an order)
CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER REFERENCES products(id),
  quantity      NUMERIC(30,12) NOT NULL,
  unit_price    NUMERIC(30,12) NOT NULL,
  subtotal      NUMERIC(30,12) NOT NULL,
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
  ('Litre',       'L'),
  ('Millilitre',  'mL'),
  ('Unit',        'unit')
ON CONFLICT (abbreviation) DO NOTHING;

-- ============================================================
-- 6. Product Available Units (mapping for multiple units per product)
-- ============================================================

CREATE TABLE IF NOT EXISTS product_available_units (
  id            SERIAL PRIMARY KEY,
  product_id    INTEGER REFERENCES products(id) ON DELETE CASCADE,
  unit_id       INTEGER REFERENCES units(id) ON DELETE CASCADE,
  price         NUMERIC(30,12) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, unit_id)
);

CREATE INDEX IF NOT EXISTS idx_pau_product ON product_available_units(product_id);

-- ============================================================
-- 7. Quotations (seller-created price quotes)
-- ============================================================

CREATE TABLE IF NOT EXISTS quotations (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER REFERENCES users(id),
  quotation_number  VARCHAR(50) UNIQUE NOT NULL,
  status            VARCHAR(50) DEFAULT 'draft',
  total_amount      NUMERIC(30,12) NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotations_user   ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- 8. Quotation Items (line items in a quotation)

CREATE TABLE IF NOT EXISTS quotation_items (
  id              SERIAL PRIMARY KEY,
  quotation_id    INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
  product_id      INTEGER REFERENCES products(id),
  quantity        NUMERIC(30,12) NOT NULL,
  unit_id         INTEGER REFERENCES units(id),
  base_quantity   NUMERIC(30,12) NOT NULL DEFAULT 0,
  base_unit_abbr  VARCHAR(20) NOT NULL DEFAULT 'unit',
  unit_price      NUMERIC(30,12) NOT NULL,
  subtotal        NUMERIC(30,12) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qi_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_qi_product   ON quotation_items(product_id);

-- Precision and audit-column upgrades for databases bootstrapped from older versions.
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(30,12);
ALTER TABLE products ALTER COLUMN stock_qty TYPE NUMERIC(30,12);
ALTER TABLE orders ALTER COLUMN total_amount TYPE NUMERIC(30,12);
ALTER TABLE order_items ALTER COLUMN quantity TYPE NUMERIC(30,12);
ALTER TABLE order_items ALTER COLUMN unit_price TYPE NUMERIC(30,12);
ALTER TABLE order_items ALTER COLUMN subtotal TYPE NUMERIC(30,12);
ALTER TABLE product_available_units ALTER COLUMN price TYPE NUMERIC(30,12);
ALTER TABLE quotations ALTER COLUMN total_amount TYPE NUMERIC(30,12);
ALTER TABLE quotation_items ALTER COLUMN quantity TYPE NUMERIC(30,12);
ALTER TABLE quotation_items ALTER COLUMN unit_price TYPE NUMERIC(30,12);
ALTER TABLE quotation_items ALTER COLUMN subtotal TYPE NUMERIC(30,12);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS base_quantity NUMERIC(30,12) NOT NULL DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS base_unit_abbr VARCHAR(20) NOT NULL DEFAULT 'unit';
