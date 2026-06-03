# AasaMedChem

AasaMedChem is a role-based chemical inventory and quotation platform built with Next.js, NextAuth, Drizzle ORM, Neon PostgreSQL, and Vercel.

The app has two main users:

- `Admin`: manages products, sees quotations/orders, and now sees registered users.
- `Seller`: browses chemicals, selects quantities and units, creates quotations, and reviews their submitted requests.

Production deployment:

```text
https://aasamedchem-eight.vercel.app
```

## Current Documentation Status

The old `docs/` folder has been deleted, so this README is now the main documentation file.

I also checked for an implementation markdown file:

- `implementation.md` does not currently exist in this repository.
- `implementation.png` exists at the project root and at `public/implementation.png`.
- `explain.md` also exists and explains the recent admin user-list fix.

Because the docs folder is gone, this README avoids links to missing documentation files and explains the project directly here.

## Implementation Image

<img src="./public/implementation.png" alt="AasaMedChem implementation diagram" width="100%" />

## First-Principles Explanation

The project is based on a simple chain of needs:

1. A chemical seller needs to request products.
2. Chemicals can be ordered in different units such as `kg`, `g`, `L`, `mL`, and `unit`.
3. Different units must not corrupt pricing or quantity storage.
4. The system therefore converts quantities into canonical base units before saving or calculating totals.
5. Sellers submit quotations.
6. Admins need to manage products, inspect quotations, and understand which users submitted what.

So the core design is:

```text
User action -> protected route -> server-side validation -> unit conversion -> database write -> admin review
```

The important principle is that business data should be consistent even when users enter different units. That is why the app uses Decimal.js for math and PostgreSQL `NUMERIC` columns for precision.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js App Router, React |
| Styling | Tailwind CSS |
| Authentication | NextAuth Credentials Provider |
| Authorization | Role checks in `src/proxy.js` |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Precision Math | Decimal.js |
| Deployment | Vercel |

## Roles And Permissions

| Role | What They Can Do |
| --- | --- |
| Admin | Manage products, view quotations/orders, view registered users, inspect user quotation history |
| Seller | Browse catalog, view products, create quotations, view own quotations |

Protected route logic lives in:

```text
src/proxy.js
```

Admin routes require `role = admin`.

Seller routes require `role = seller`.

Unauthenticated users are redirected to login with a callback URL.

## Main App Flow

1. Seller logs in.
2. Seller opens the catalog.
3. Seller chooses a product.
4. Seller enters quantity and unit.
5. The app converts the quantity into a base unit.
6. The app calculates line subtotal and quotation total.
7. Seller submits the quotation.
8. Admin reviews quotation data.
9. Admin can now open the user list and click a user to inspect their details.

## Unit And Price Logic

The unit engine lives in:

```text
src/lib/units.js
```

Canonical storage rules:

| Unit Family | User Units | Base Unit |
| --- | --- | --- |
| Weight | `kg`, `g` | `g` |
| Volume | `L`, `mL` | `mL` |
| Count | `unit`, `pcs` | `unit` |

Example:

```text
2 kg -> 2000 g
3 L -> 3000 mL
5 pcs -> 5 unit
```

Quotation math lives in:

```text
src/lib/quotationMath.js
```

This keeps pricing stable by using Decimal.js instead of normal floating-point JavaScript math.

## Database Design

The Drizzle schema lives in:

```text
src/db/schema.js
```

Main tables:

| Table | Purpose |
| --- | --- |
| `users` | Admin and seller accounts |
| `products` | Chemical product catalog |
| `units` | Supported measurement units |
| `product_available_units` | Units allowed for each product |
| `quotations` | Seller quotation headers |
| `quotation_items` | Products and quantities inside quotations |
| `orders` | Order-ready records |
| `order_items` | Products inside orders |

The SQL bootstrap file lives in:

```text
src/lib/schema.sql
```

## Admin User List Problem And Solution

### Problem

The admin dashboard had a `Total Accounts` card, but clicking it only sent the admin back to `/admin`. There was no real page where an admin could see registered users or inspect one user.

### First-Principles Reasoning

An admin cannot manage a quotation system properly without knowing:

1. Who the users are.
2. Which role each user has.
3. How many quotations a user submitted.
4. When the user was last active.
5. What quotation history belongs to that user.

So the missing feature was not just a button problem. The real problem was missing visibility into the `users` table and its relationship with `quotations`.

### Implementation

I solved it by adding a real admin user flow:

| File | Change |
| --- | --- |
| `src/app/admin/page.js` | Changed `Total Accounts` card link from `/admin` to `/admin/users` |
| `src/components/admin/AdminSidebar.js` | Added `Users` navigation item |
| `src/app/admin/users/page.js` | Added admin user list page |
| `src/app/admin/users/[id]/page.js` | Added user detail page |
| `explain.md` | Added a short explanation of the fix |

The new list page queries:

```text
users left joined with quotations
```

That gives the admin:

- user name
- email
- phone
- role
- joined date
- quotation count
- last quotation activity

Each row links to:

```text
/admin/users/[id]
```

The detail page shows:

- user profile information
- role
- phone
- joined date
- total quotation value
- quotation history
- quotation status
- product names inside quotations

## Important Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/login` | Login page |
| `/register` | Seller registration |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Admin quotation/order review |
| `/admin/users` | Admin user list |
| `/admin/users/[id]` | Admin user detail |
| `/seller` | Seller dashboard |
| `/seller/catalog` | Seller catalog |
| `/seller/quotations` | Seller quotation history |
| `/profile` | Current user profile |

## API Routes

| Route | Purpose |
| --- | --- |
| `/api/auth/[...nextauth]` | NextAuth login/session handling |
| `/api/auth/register` | Register seller account |
| `/api/admin/products` | Admin product CRUD |
| `/api/admin/products/[id]` | Admin product detail/update/delete |
| `/api/admin/units` | Admin unit data |
| `/api/admin/upload` | Admin product image upload |
| `/api/seller/products` | Seller product catalog data |
| `/api/seller/quotations` | Seller quotation create/list |
| `/api/health` | Health check |

## Repository Guide

| Path | Purpose |
| --- | --- |
| `src/app` | Next.js App Router pages and route handlers |
| `src/components/admin` | Admin UI components |
| `src/components/seller` | Seller UI components |
| `src/db` | Drizzle schema and database client |
| `src/lib/units.js` | Unit conversion engine |
| `src/lib/quotationMath.js` | Quotation calculation logic |
| `src/lib/schema.sql` | SQL schema bootstrap |
| `src/proxy.js` | Route protection and role authorization |
| `scripts/db-init.js` | Database initialization script |
| `scripts/seed-users.js` | Demo user seed script |
| `tests/units.test.js` | Unit conversion tests |
| `implementation.png` | Existing implementation image at the project root |
| `public/implementation.png` | Public copy of the implementation image used by this README |
| `explain.md` | Explanation of the admin user-list fix |

## Local Setup

Install dependencies:

```bash
npm install
```

Create local environment file:

```bash
cp .env.example .env.local
```

Required variables:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXTAUTH_SECRET=generate-a-random-secret
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_URL=cloudinary://...
```

Initialize and seed the database:

```bash
node scripts/db-init.js
node scripts/seed-users.js
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@aasamedchem.com` | `admin123` |
| Seller | `seller@aasamedchem.com` | `seller123` |

## Verification Commands

Run unit tests:

```bash
node tests/units.test.js
```

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

## Latest Verification

The latest verification after adding the admin user-list flow:

- `npm run lint` passed.
- `npm run build` passed.
- Vercel production deployment succeeded.
- Production alias is live at `https://aasamedchem-eight.vercel.app`.
- `/admin/users` correctly redirects unauthenticated visitors to `/login?callbackUrl=%2Fadmin%2Fusers`.

Lint currently shows only existing warnings about using `<img>` instead of Next.js `<Image />` in older product-related components. Those warnings are not caused by the admin user-list change.

## Deployment

Deploy production with:

```bash
vercel --prod
```

The latest deployed production domain is:

```text
https://aasamedchem-eight.vercel.app
```

## Summary

This app manages chemical inventory and quotation workflows with role-based access control. Sellers create quotation requests, the system converts quantities safely, and admins review business activity.

The recent admin issue was solved by turning the dashboard account count into a complete user-inspection flow. Admins can now click `Total Accounts`, see all users, and open a specific user to review profile and quotation history.

