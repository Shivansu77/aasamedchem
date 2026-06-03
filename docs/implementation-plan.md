# Implementation Plan

## Objective

Build a production-ready hackathon prototype for AasaMedChem: a role-based inventory, quotation, and order platform for chemical products with precise unit conversion and admin review workflows.

## Phase 1: Foundation

### Tasks

- Initialize Next.js App Router project.
- Configure Tailwind CSS and Shadcn UI-compatible design conventions.
- Configure Neon PostgreSQL.
- Add Drizzle ORM schema.
- Add environment configuration.
- Add deployment target for Vercel.

### Deliverables

- Running Next.js app.
- `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` configured.
- Database bootstrap SQL in `src/lib/schema.sql`.
- Drizzle schema in `src/db/schema.js`.

## Phase 2: Authentication and Role-Based Access

### Tasks

- Implement registration.
- Implement credentials login with NextAuth/Auth.js.
- Store password hashes with bcrypt.
- Use JWT session strategy.
- Add role claims to JWT and session.
- Protect routes in `src/proxy.js`.

### Deliverables

- Admin and seller login.
- `/admin/*` available only to admins.
- `/seller/*` available only to sellers.
- `/profile/*` available to authenticated users.
- API routes return `401` or `403` when unauthorized.

## Phase 3: Inventory Management

### Tasks

- Create product table with base unit, stock, price, category, SKU, CAS number, and image URL.
- Create units table.
- Create product available units mapping.
- Build admin product list.
- Build product create/edit forms.
- Build product delete action.
- Add product image upload route.

### Deliverables

- Admin product management screens.
- Admin product CRUD APIs.
- Units API.
- Product visibility through `is_active`.

## Phase 4: Seller Catalog

### Tasks

- Build seller dashboard.
- Build product catalog.
- Add search by name/SKU.
- Add category filter.
- Expose only active products.
- Show base unit, stock, price, and available units.

### Deliverables

- `/seller/catalog` listing.
- `/api/seller/products` search/filter endpoint.
- Product cards and product detail page.

## Phase 5: Unit Conversion and Pricing

### Tasks

- Implement canonical unit strategy:
  - grams for weight;
  - milliliters for volume;
  - items/units for count.
- Implement conversion engine in `src/lib/units.js`.
- Implement Decimal.js quotation math in `src/lib/quotationMath.js`.
- Add unit tests.

### Deliverables

- Conversion support for `kg`, `g`, `L`, `mL`, `unit`, and `pcs`.
- Rejection of incompatible conversions.
- Server-side line subtotal and total calculation.
- Unit tests in `tests/units.test.js`.

## Phase 6: Quotation and Order Flow

### Tasks

- Build seller quotation cart.
- Allow product, quantity, unit, and notes.
- Submit quotation to server.
- Server validates authentication, product availability, allowed unit, conversion, stock, and totals.
- Store quotation and quotation items.

### Deliverables

- `/api/seller/quotations` GET and POST.
- Seller quotation history.
- Seller quotation detail page.
- Stored audit fields:
  - requested quantity;
  - requested unit;
  - base quantity;
  - base unit;
  - unit price;
  - subtotal.

## Phase 7: Admin Review

### Tasks

- Build admin dashboard.
- Build admin orders/quotations view.
- Show seller identity, quotation number, status, notes, item details, and converted quantities.
- Provide status update extension point.

### Deliverables

- `/admin` dashboard.
- `/admin/orders` review page.
- Dashboard charts and recent activity.

## Phase 8: Documentation and Submission

### Tasks

- Write README.
- Add architecture diagrams.
- Add ER diagram.
- Add API documentation.
- Add database schema documentation.
- Add assumptions and technical decisions.
- Add Notion-ready documentation.
- Add Excalidraw-ready diagram specs.

### Deliverables

- `README.md`
- `docs/architecture.md`
- `docs/api-endpoints.md`
- `docs/database-schema.md`
- `docs/technical-decisions.md`
- `docs/assumptions.md`
- `docs/notion-page.md`
- `docs/excalidraw-diagrams.md`

## Future Enhancements

- Convert quotations into finalized orders.
- Add admin order status update API.
- Add email notifications.
- Add CSV import/export for products.
- Add product-level low-stock alerts.
- Add audit logs for admin changes.
- Add payment integration.
- Add server-side pagination for very large catalogs.
- Add formal Shadcn UI component registry setup.
