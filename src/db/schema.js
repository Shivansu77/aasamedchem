import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).default("user"),
    phone: varchar("phone", { length: 20 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_users_email").on(table.email)]
);

// 2. Units Table
export const units = pgTable(
  "units",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).unique().notNull(),
    abbreviation: varchar("abbreviation", { length: 20 }).unique().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  }
);

// 3. Products Table
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    casNumber: varchar("cas_number", { length: 50 }),
    sku: varchar("sku", { length: 100 }).unique(),
    unitId: integer("unit_id").references(() => units.id),
    imageUrl: text("image_url"),
    price: numeric("price", { precision: 30, scale: 12 }).default("0").notNull(),
    stockQty: numeric("stock_qty", { precision: 30, scale: 12 }).default("0").notNull(),
    category: varchar("category", { length: 100 }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_products_sku").on(table.sku),
    index("idx_products_cas").on(table.casNumber),
    index("idx_products_category").on(table.category),
    index("idx_products_active").on(table.isActive),
  ]
);

// 4. Orders Table
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
    status: varchar("status", { length: 50 }).default("pending"),
    totalAmount: numeric("total_amount", { precision: 30, scale: 12 }).default("0").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_orders_user").on(table.userId),
    index("idx_orders_status").on(table.status),
    index("idx_orders_number").on(table.orderNumber),
  ]
);

// 5. Order Items Table
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id),
    quantity: numeric("quantity", { precision: 30, scale: 12 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 30, scale: 12 }).notNull(),
    subtotal: numeric("subtotal", { precision: 30, scale: 12 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_order_items_order").on(table.orderId),
    index("idx_order_items_product").on(table.productId),
  ]
);

// 6. Product Available Units Table
export const productAvailableUnits = pgTable(
  "product_available_units",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
    unitId: integer("unit_id").references(() => units.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 30, scale: 12 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_pau_product").on(table.productId),
  ]
);

// 7. Quotations Table
export const quotations = pgTable(
  "quotations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    quotationNumber: varchar("quotation_number", { length: 50 }).unique().notNull(),
    status: varchar("status", { length: 50 }).default("draft"),
    totalAmount: numeric("total_amount", { precision: 30, scale: 12 }).default("0").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_quotations_user").on(table.userId),
    index("idx_quotations_status").on(table.status),
  ]
);

// 8. Quotation Items Table
export const quotationItems = pgTable(
  "quotation_items",
  {
    id: serial("id").primaryKey(),
    quotationId: integer("quotation_id").references(() => quotations.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id),
    quantity: numeric("quantity", { precision: 30, scale: 12 }).notNull(),
    unitId: integer("unit_id").references(() => units.id),
    baseQuantity: numeric("base_quantity", { precision: 30, scale: 12 }).default("0").notNull(),
    baseUnitAbbr: varchar("base_unit_abbr", { length: 20 }).default("unit").notNull(),
    unitPrice: numeric("unit_price", { precision: 30, scale: 12 }).notNull(),
    subtotal: numeric("subtotal", { precision: 30, scale: 12 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_qi_quotation").on(table.quotationId),
    index("idx_qi_product").on(table.productId),
  ]
);

// ============================================================
// Drizzle Relations Configurations
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  quotations: many(quotations),
}));

export const unitsRelations = relations(units, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  unit: one(units, {
    fields: [products.unitId],
    references: [units.id],
  }),
  orderItems: many(orderItems),
  productAvailableUnits: many(productAvailableUnits),
  quotationItems: many(quotationItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productAvailableUnitsRelations = relations(productAvailableUnits, ({ one }) => ({
  product: one(products, {
    fields: [productAvailableUnits.productId],
    references: [products.id],
  }),
  unit: one(units, {
    fields: [productAvailableUnits.unitId],
    references: [units.id],
  }),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  user: one(users, {
    fields: [quotations.userId],
    references: [users.id],
  }),
  items: many(quotationItems),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationItems.quotationId],
    references: [quotations.id],
  }),
  product: one(products, {
    fields: [quotationItems.productId],
    references: [products.id],
  }),
  unit: one(units, {
    fields: [quotationItems.unitId],
    references: [units.id],
  }),
}));
