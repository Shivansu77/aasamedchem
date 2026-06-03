# AasaMedChem Inventory & Quotation System

AasaMedChem is a small inventory and quotation/order management system built for the hackathon assignment. It lets admins manage chemical products, stock, units, and INR pricing while sellers browse the catalog, enter quantities in flexible units, and submit quotations for admin review.

## Live URL

Production URL: _update after Vercel deployment_

## Features

- Credentials authentication with role-based access for `admin` and `seller`.
- Admin product CRUD with SKU, CAS number, category, image URL, stock, base unit, base price, and active/draft status.
- Seller catalog with search, category filter, product cards, quantity input, unit selection, and live INR price preview.
- Quotation cart for one or more products.
- Server-side quotation calculation using database product prices and `Decimal.js`.
- Admin orders/quotations page showing ordered quantity, ordered unit, converted base quantity, unit price, subtotal, total, seller, notes, and status.

## Tech Stack

- **Frontend/backend:** Next.js 16 App Router
- **Auth:** NextAuth credentials provider
- **Database:** Neon PostgreSQL
- **Database access:** `@neondatabase/serverless` and Drizzle ORM
- **Precision math:** `decimal.js`
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel

Next.js route handlers and server components talk directly to Neon through lazy database helpers in `src/db/index.js` and `src/lib/db.js`. The seller UI calculates previews for responsiveness, but quotation submission is recalculated on the server before saving.

## Database Schema

Core tables are defined in `src/lib/schema.sql` and mirrored in `src/db/schema.js`.

| Table | Purpose | Key fields |
| --- | --- | --- |
| `users` | Login and role data | `email VARCHAR(255)`, `password_hash VARCHAR(255)`, `role VARCHAR(50)` |
| `units` | Supported units | `name VARCHAR(100)`, `abbreviation VARCHAR(20)` |
| `products` | Inventory and pricing | `unit_id INTEGER`, `price NUMERIC(30,12)`, `stock_qty NUMERIC(30,12)`, `sku`, `cas_number`, `is_active` |
| `product_available_units` | Extra order units enabled per product | `product_id`, `unit_id`, `price NUMERIC(30,12)` |
| `quotations` | Submitted seller quotations | `quotation_number`, `user_id`, `status`, `total_amount NUMERIC(30,12)`, `notes` |
| `quotation_items` | Auditable quotation lines | `quantity NUMERIC(30,12)`, `unit_id`, `base_quantity NUMERIC(30,12)`, `base_unit_abbr`, `unit_price NUMERIC(30,12)`, `subtotal NUMERIC(30,12)` |

`orders` and `order_items` are also present as an extension point, but the completed assignment flow treats submitted quotations as the order/quotation workflow.

## Unit Storage and Conversion Strategy

Products are configured with a canonical base unit:

| Dimension | Internal base unit | Seller input units | Conversion |
| --- | --- | --- | --- |
| Weight | `g` | `g`, `kg` | `1 kg = 1000 g` |
| Volume | `mL` | `mL`, `L` | `1 L = 1000 mL` |
| Count | `unit` | `unit` | `1 unit = 1 unit` |

Product `price` is stored as INR per product base unit. Product `stock_qty` is stored in the same base unit. All quantity and price fields use `NUMERIC(30,12)` to support large values and high decimal precision without floating-point loss.

Conversions are implemented in `src/lib/units.js`. Quotation line math is implemented in `src/lib/quotationMath.js`. The seller product card uses the same conversion rules for preview, and `/api/seller/quotations` recalculates every line before insert.

Example:

- Product base price: `0.500000000000` INR per `g`
- Seller orders: `1 kg`
- Server stores: `quantity = 1`, ordered unit `kg`, `base_quantity = 1000`, `base_unit_abbr = g`
- Server total: `1000 g * 0.5 INR = 500 INR`

INR values are displayed with 2 decimals in the UI, but the database preserves 12 decimal places.

## Local Setup

```bash
npm install
cp .env.example .env.local
```

Add your Neon connection string and auth values:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generate-a-random-32-byte-secret
NEXTAUTH_URL=http://localhost:3000
```

Apply schema and seed demo users:

```bash
node scripts/db-init.js
node scripts/seed-users.js
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Test Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@aasamedchem.com` | `admin123` |
| Seller | `seller@aasamedchem.com` | `seller123` |

## How to Use

Admin:

- Sign in as admin.
- Go to `/admin/products` to create, edit, delete, and review products.
- Use base units `g`, `mL`, or `unit`; choose compatible order units such as `kg` or `L`.
- Go to `/admin/orders` to review incoming quotations and verify conversion details.

Seller:

- Sign in as seller.
- Go to `/seller/catalog`.
- Search or filter products.
- Enter a quantity, choose an enabled unit, and review the INR preview.
- Add one or more items to the quotation cart and submit.
- Go to `/seller/quotations` to see submitted quotations.

## Vercel Deployment

1. Create or link the Vercel project:

```bash
vercel link
```

2. Add production environment variables in Vercel:

```bash
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

3. Deploy:

```bash
vercel --prod
```

4. Set `NEXTAUTH_URL` to the production URL and redeploy if needed.

Do not commit `.env.local` or any secrets.

## Verification

```bash
node tests/units.test.js
npm run lint
npm run build
```

The unit test suite covers conversion math, high precision values, large values, and quotation-line calculations across weight, volume, and count units.

## Fix for Decimal Problem
When users typed incomplete or invalid numbers (like a plain `.` or `-`) in the product quantity input, the `decimal.js` constructor threw an `[Error: [DecimalError] Invalid argument:]` error, causing the React component to crash. This happened because the browser's `<input type="number">` evaluates such temporary inputs as an empty string (`""`), which we were converting with `quantity || 0`, but if a user explicitly typed a dot, they could trigger the error in some environments.

We solved this by introducing a `safeDecimal` helper function. This function uses a `try/catch` block and explicitly checks for common invalid states (like `""`, `"."`, `"-"`, `"+"`) before attempting to initialize `new Decimal()`. If an error occurs or the string is invalid, it safely falls back to `new Decimal(0)`, preventing the app from crashing and keeping the computed totals at 0 until a valid number is entered.
