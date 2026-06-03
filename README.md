# AasaMedChem Inventory, Quotation, and Order Platform

AasaMedChem is a role-based chemical inventory and quotation system built for a hackathon assignment. Admins manage product inventory and review seller requests. Sellers browse products, search and filter the catalog, create quotations, and place order-ready requests using familiar units such as `kg`, `g`, `L`, `mL`, and `items`.

The system normalizes quantities before saving business data:

- weight is stored internally in grams;
- volume is stored internally in milliliters;
- count is stored as items;
- money and quantity values use high-precision PostgreSQL `NUMERIC` columns.

> Assignment target: `NUMERIC(20,8)`. Current implementation uses `NUMERIC(30,12)` for extra safety with chemical quantities and financial precision.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js App Router, React, Tailwind CSS, Shadcn UI-ready styling |
| Auth | NextAuth/Auth.js Credentials Provider with JWT sessions |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM plus Neon serverless SQL client |
| Precision math | Decimal.js |
| Deployment | Vercel |

## Roles

| Role | Capabilities |
| --- | --- |
| Admin | Create, edit, delete products; view inventory; view orders/quotations; update order status |
| User/Seller | Browse products; search/filter catalog; create quotations; place orders |

## Main Flow

1. Seller searches the product catalog.
2. Seller selects a product.
3. Seller enters quantity and chooses an allowed unit.
4. System converts the quantity into a canonical base unit.
5. System calculates line total and quotation total.
6. Seller submits the quotation/order request.
7. Admin reviews the request and status.

## Repository Guide

| Path | Purpose |
| --- | --- |
| `src/app` | Next.js App Router pages, layouts, and route handlers |
| `src/components/admin` | Admin dashboard, sidebar, charts, and product form components |
| `src/components/seller` | Seller catalog, cart, quotation, and product components |
| `src/db/schema.js` | Drizzle schema and table relationships |
| `src/lib/schema.sql` | SQL bootstrap schema for Neon |
| `src/lib/units.js` | Unit conversion engine |
| `src/lib/quotationMath.js` | Server-side quotation math |
| `src/proxy.js` | Route protection and role-based access control |
| `docs` | Architecture, diagrams, implementation plan, and technical documentation |

## Documentation

- [Complete Architecture and Diagrams](docs/architecture.md)
- [Implementation Plan](docs/implementation-plan.md)
- [API Endpoint Documentation](docs/api-endpoints.md)
- [Database Schema Documentation](docs/database-schema.md)
- [Technical Decisions](docs/technical-decisions.md)
- [Assumptions](docs/assumptions.md)
- [Notion Documentation Page](docs/notion-page.md)
- [Excalidraw-ready Diagrams](docs/excalidraw-diagrams.md)

## Local Setup

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env.local
```

Required values:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXTAUTH_SECRET=generate-a-random-secret
NEXTAUTH_URL=http://localhost:3000
```

Initialize and seed the database:

```bash
node scripts/db-init.js
node scripts/seed-users.js
```

Run development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Verification

Run unit conversion tests:

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

## Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@aasamedchem.com` | `admin123` |
| Seller | `seller@aasamedchem.com` | `seller123` |

## Architecture Preview

Static image assets:

- `public/architecture-diagram.svg`
- `public/professional-architecture.svg`

```mermaid
flowchart LR
  Seller[Seller] --> Catalog[Seller Catalog]
  Catalog --> Cart[Quotation Cart]
  Cart --> API[/Seller Quotation API/]
  API --> Math[Unit Conversion and Decimal Math]
  Math --> DB[(Neon PostgreSQL)]
  Admin[Admin] --> Orders[Admin Orders Review]
  Orders --> DB
```

See [docs/architecture.md](docs/architecture.md) for the full architecture diagrams, ERD, flowcharts, sequence diagrams, and Excalidraw-ready diagram content.
