# aasamedchem

Pharmaceutical order management system built with Next.js 16, Tailwind CSS v4, and Neon PostgreSQL.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Copy env template and add your DATABASE_URL
cp .env.example .env.local
# Edit .env.local with your Neon connection string

# Run the schema SQL in Neon SQL Editor
# (copy contents of src/lib/schema.sql)

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### API Endpoints

| Endpoint        | Method | Description              |
| --------------- | ------ | ------------------------ |
| `/api/health`   | GET    | Database health check    |

## Database Schema

5 tables with `NUMERIC(20,8)` precision for prices and quantities:

- **users** — authentication and profile data
- **units** — measurement units (kg, g, mL, etc.)
- **products** — chemical/pharma products with CAS numbers
- **orders** — order headers with status tracking
- **order_items** — line items linked to orders and products

See [`src/lib/schema.sql`](src/lib/schema.sql) for the full DDL.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Neon PostgreSQL (serverless driver)
- **Language**: JavaScript
