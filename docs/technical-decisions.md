# Technical Decisions Document

## 1. Next.js App Router

### Decision

Use Next.js App Router for pages, layouts, and API route handlers.

### Rationale

- Supports colocated frontend and backend routes.
- Server Components are useful for role dashboards and database-backed pages.
- Vercel deployment path is straightforward.
- Route handlers are enough for hackathon API requirements.

## 2. Neon PostgreSQL

### Decision

Use Neon PostgreSQL as the transactional database.

### Rationale

- PostgreSQL supports reliable relational modeling.
- `NUMERIC` types support precise monetary and quantity storage.
- Neon works well with serverless Vercel deployments.

## 3. Drizzle ORM

### Decision

Use Drizzle ORM for schema definition and typed query patterns, with selective direct Neon SQL usage for simple route queries.

### Rationale

- Drizzle schema keeps relationships explicit.
- SQL remains readable for joins and dashboard aggregations.
- Avoids heavyweight ORM runtime behavior.

## 4. NextAuth/Auth.js Credentials Provider

### Decision

Use credentials-based login with JWT sessions.

### Rationale

- Hackathon assignment needs admin and seller roles without third-party OAuth dependency.
- JWT can carry `id` and `role` claims.
- Middleware/proxy can make role decisions without a database lookup on every request.

## 5. Role-Based Proxy Protection

### Decision

Use `src/proxy.js` to protect admin, seller, profile, and role-specific API routes.

### Rationale

- Centralizes route access logic.
- Prevents unauthorized users from loading role dashboards.
- API requests receive JSON `401` or `403` responses.

## 6. Canonical Unit Storage

### Decision

Normalize units by dimension:

- grams for weight;
- milliliters for volume;
- units/items for count.

### Rationale

- Prevents inconsistent inventory math.
- Makes stock validation reliable.
- Keeps conversions predictable and auditable.

## 7. Decimal.js for Calculations

### Decision

Use Decimal.js for unit conversion and quotation totals.

### Rationale

- JavaScript floating-point math can introduce rounding errors.
- Chemical quantities and financial totals require precision.
- Decimal.js keeps calculations deterministic.

## 8. PostgreSQL NUMERIC for Prices

### Decision

Use PostgreSQL `NUMERIC` for price and quantity fields.

### Rationale

- Avoids floating-point precision loss.
- Supports large and small chemical quantities.
- Aligns with the assignment requirement of `NUMERIC(20,8)`.

### Current Implementation Note

The implementation uses `NUMERIC(30,12)` rather than `NUMERIC(20,8)`. This is a conservative precision extension and can be reduced to `NUMERIC(20,8)` if strict assignment matching is required.

## 9. Server-Side Recalculation

### Decision

Never trust client-submitted totals.

### Rationale

- Users could tamper with browser-side values.
- The server has trusted product prices and unit data.
- Saved quotations should always be reproducible from database state.

## 10. Product Visibility with `is_active`

### Decision

Admin can keep products inactive; seller catalog returns only active products.

### Rationale

- Supports draft inventory setup.
- Prevents incomplete or discontinued products from being quoted.

## 11. Quotation First, Order Later

### Decision

Model seller submissions as quotations and keep orders as a future/finalized extension.

### Rationale

- Chemical procurement often requires review before fulfillment.
- Admin review can approve, reject, or clarify.
- The schema already includes `orders` and `order_items` for conversion into final orders.

## 12. Tailwind CSS and Shadcn UI

### Decision

Use Tailwind CSS with Shadcn UI-compatible design patterns.

### Rationale

- Fast hackathon delivery.
- Consistent spacing, typography, cards, forms, and dashboard layout.
- Easy migration to formal Shadcn primitives if needed.
