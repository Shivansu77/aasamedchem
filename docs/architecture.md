# AasaMedChem Architecture and Diagram Pack

This document contains the high-level architecture, role flows, database ERD, sequence diagrams, folder structure, and diagram definitions for the AasaMedChem hackathon assignment.

## 1. High-Level Architecture Diagram

```mermaid
flowchart TB
  subgraph Client["Client Layer"]
    Browser["Browser"]
    AdminUI["Admin Dashboard"]
    SellerUI["Seller Dashboard"]
  end

  subgraph App["Next.js App Router on Vercel"]
    Pages["Server Components and Client Components"]
    Proxy["src/proxy.js Role Guard"]
    Auth["NextAuth/Auth.js"]
    AdminAPI["Admin API Routes"]
    SellerAPI["Seller API Routes"]
    UnitEngine["Unit Conversion Engine"]
    QuoteMath["Quotation Math"]
  end

  subgraph Data["Data and Storage"]
    Neon[("Neon PostgreSQL")]
    Drizzle["Drizzle ORM"]
    Cloudinary["Cloudinary Product Images"]
  end

  Browser --> AdminUI
  Browser --> SellerUI
  AdminUI --> Proxy
  SellerUI --> Proxy
  Proxy --> Auth
  Proxy --> Pages
  Pages --> AdminAPI
  Pages --> SellerAPI
  AdminAPI --> Drizzle
  SellerAPI --> UnitEngine
  UnitEngine --> QuoteMath
  QuoteMath --> Drizzle
  Drizzle --> Neon
  AdminAPI --> Cloudinary
```

### Explanation

- Vercel hosts the Next.js application.
- `src/proxy.js` protects admin, seller, profile, and role-specific API routes.
- NextAuth/Auth.js handles credential login and JWT sessions.
- Admin APIs manage inventory, units, uploads, and product records.
- Seller APIs expose active products and create quotations.
- Unit conversion and quotation totals are recalculated on the server before persistence.
- Neon PostgreSQL is the system of record.

## 2. Authentication Flow Diagram

```mermaid
sequenceDiagram
  actor User
  participant Login as Login Page
  participant NextAuth as NextAuth Credentials Provider
  participant DB as Neon PostgreSQL
  participant JWT as JWT Session
  participant Proxy as Route Proxy
  participant Dashboard as Role Dashboard

  User->>Login: Submit email and password
  Login->>NextAuth: signIn(credentials)
  NextAuth->>DB: Find user by email
  DB-->>NextAuth: User + password_hash + role
  NextAuth->>NextAuth: bcrypt.compare(password)
  NextAuth->>JWT: Store id and role claims
  JWT-->>Login: Authenticated session
  User->>Proxy: Request /admin or /seller
  Proxy->>JWT: Read token
  Proxy->>Proxy: Validate role
  Proxy-->>Dashboard: Allow matching role
```

### Role Rules

| Route | Required Role |
| --- | --- |
| `/admin/*` | `admin` |
| `/api/admin/*` | `admin` |
| `/seller/*` | `seller` |
| `/api/seller/*` | `seller` |
| `/profile/*` | authenticated user |

## 3. Product Management Flow Diagram

```mermaid
flowchart TD
  Start([Admin opens product area])
  Choice{Action}
  Create[Create product]
  Edit[Edit product]
  Delete[Delete product]
  Form[Product form]
  Validate[Validate product fields]
  Units[Assign base unit and available units]
  Save[/Admin Product API/]
  DB[(products and product_available_units)]
  Visible{is_active?}
  Catalog[Seller catalog]

  Start --> Choice
  Choice --> Create
  Choice --> Edit
  Choice --> Delete
  Create --> Form
  Edit --> Form
  Form --> Validate
  Validate --> Units
  Units --> Save
  Delete --> Save
  Save --> DB
  DB --> Visible
  Visible -- yes --> Catalog
  Visible -- no --> Hidden[Hidden from sellers]
```

## 4. Order Lifecycle Flow Diagram

```mermaid
stateDiagram-v2
  [*] --> Browsing
  Browsing --> ProductSelected
  ProductSelected --> QuantityEntered
  QuantityEntered --> Converted
  Converted --> Calculated
  Calculated --> Submitted
  Submitted --> AdminReview
  AdminReview --> Approved
  AdminReview --> Rejected
  AdminReview --> NeedsClarification
  Approved --> Fulfilled
  Rejected --> [*]
  Fulfilled --> [*]

  Browsing: Seller searches/filters products
  Converted: Quantity converted to g, mL, or item
  Calculated: Decimal subtotal and total calculated
  Submitted: Quotation/order request saved
  AdminReview: Admin validates request and status
```

## 5. Unit Conversion Flow Diagram

```mermaid
flowchart TD
  Input[Seller enters quantity and unit]
  Lookup[Load product base unit and selected order unit]
  Family{Same unit family?}
  Reject[Reject invalid conversion]
  Convert[Convert to canonical base]
  Price[Calculate subtotal using Decimal.js]
  Stock{Base quantity <= stock in base?}
  Save[Save quotation item]

  Input --> Lookup
  Lookup --> Family
  Family -- no --> Reject
  Family -- yes --> Convert
  Convert --> Price
  Price --> Stock
  Stock -- no --> Reject
  Stock -- yes --> Save
```

### Conversion Rules

| Input Unit | Base Unit | Factor |
| --- | --- | ---: |
| `kg` | `g` | `1000` |
| `g` | `g` | `1` |
| `L` | `mL` | `1000` |
| `mL` | `mL` | `1` |
| `item`, `unit`, `pcs` | `unit` | `1` |

Formula:

```text
base_quantity = ordered_quantity * unit_factor
subtotal = base_price * quantity_in_product_base_unit
```

## 6. Database ER Diagram

```mermaid
erDiagram
  USERS ||--o{ ORDERS : places
  USERS ||--o{ QUOTATIONS : creates
  UNITS ||--o{ PRODUCTS : base_unit
  PRODUCTS ||--o{ PRODUCT_AVAILABLE_UNITS : supports
  UNITS ||--o{ PRODUCT_AVAILABLE_UNITS : selectable_unit
  ORDERS ||--o{ ORDER_ITEMS : contains
  PRODUCTS ||--o{ ORDER_ITEMS : ordered
  QUOTATIONS ||--o{ QUOTATION_ITEMS : contains
  PRODUCTS ||--o{ QUOTATION_ITEMS : quoted
  UNITS ||--o{ QUOTATION_ITEMS : requested_unit

  USERS {
    serial id PK
    varchar name
    varchar email UK
    varchar password_hash
    varchar role
    varchar phone
    timestamptz created_at
    timestamptz updated_at
  }

  UNITS {
    serial id PK
    varchar name UK
    varchar abbreviation UK
    timestamptz created_at
  }

  PRODUCTS {
    serial id PK
    varchar name
    text description
    varchar cas_number
    varchar sku UK
    int unit_id FK
    text image_url
    numeric price
    numeric stock_qty
    varchar category
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }

  PRODUCT_AVAILABLE_UNITS {
    serial id PK
    int product_id FK
    int unit_id FK
    numeric price
    timestamptz created_at
  }

  QUOTATIONS {
    serial id PK
    int user_id FK
    varchar quotation_number UK
    varchar status
    numeric total_amount
    text notes
    timestamptz created_at
    timestamptz updated_at
  }

  QUOTATION_ITEMS {
    serial id PK
    int quotation_id FK
    int product_id FK
    numeric quantity
    int unit_id FK
    numeric base_quantity
    varchar base_unit_abbr
    numeric unit_price
    numeric subtotal
    timestamptz created_at
  }

  ORDERS {
    serial id PK
    int user_id FK
    varchar order_number UK
    varchar status
    numeric total_amount
    text notes
    timestamptz created_at
    timestamptz updated_at
  }

  ORDER_ITEMS {
    serial id PK
    int order_id FK
    int product_id FK
    numeric quantity
    numeric unit_price
    numeric subtotal
    timestamptz created_at
  }
```

## 7. Sequence Diagram for Placing Orders

```mermaid
sequenceDiagram
  actor Seller
  participant Catalog as Product Catalog
  participant Cart as Quotation Cart
  participant API as POST /api/seller/quotations
  participant Auth as NextAuth JWT
  participant DB as Neon PostgreSQL
  participant Units as Unit Engine
  participant Math as Quotation Math
  participant Admin as Admin Orders Page

  Seller->>Catalog: Search/filter products
  Catalog->>DB: Fetch active products
  DB-->>Catalog: Product list and allowed units
  Seller->>Cart: Add product, quantity, unit
  Seller->>Cart: Submit quotation/order request
  Cart->>API: items[{product_id, unit_id, quantity}], notes
  API->>Auth: Validate JWT token
  Auth-->>API: user id and role
  API->>DB: Load product, stock, base unit, selected unit
  DB-->>API: Trusted product data
  API->>Units: Validate compatible units and convert
  Units-->>API: base_quantity and base_unit_abbr
  API->>Math: Calculate unit_price and subtotal
  Math-->>API: Decimal-safe totals
  API->>DB: Insert quotation and quotation_items
  DB-->>API: Saved quotation
  API-->>Cart: 201 Created
  Admin->>DB: Review submitted quotation
```

## 8. Folder Structure Diagram

```text
aasamedchem/
├── docs/
│   ├── architecture.md
│   ├── api-endpoints.md
│   ├── assumptions.md
│   ├── database-schema.md
│   ├── excalidraw-diagrams.md
│   ├── implementation-plan.md
│   ├── notion-page.md
│   └── technical-decisions.md
├── public/
│   └── architecture-diagram.svg
├── scripts/
│   ├── db-init.js
│   ├── seed-users.js
│   └── add-image.js
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── login/
│   │   ├── profile/
│   │   ├── register/
│   │   └── seller/
│   ├── components/
│   │   ├── admin/
│   │   └── seller/
│   ├── db/
│   │   ├── index.js
│   │   └── schema.js
│   ├── lib/
│   │   ├── quotationMath.js
│   │   ├── schema.sql
│   │   └── units.js
│   └── proxy.js
├── tests/
│   └── units.test.js
├── README.md
├── package.json
└── next.config.mjs
```

## 9. Professional Architecture Image

The repository includes a static architecture image at:

```text
public/architecture-diagram.svg
public/professional-architecture.svg
```

Use it in slides, Notion, README sections, or hackathon submissions.

## 10. System Context

```mermaid
C4Context
  title AasaMedChem System Context
  Person(admin, "Admin", "Manages products, inventory, and orders")
  Person(seller, "Seller/User", "Browses catalog and creates quotations")
  System(app, "AasaMedChem Web App", "Next.js role-based inventory and quotation platform")
  SystemDb(db, "Neon PostgreSQL", "Users, products, units, quotations, orders")
  System_Ext(vercel, "Vercel", "Hosting and deployment")
  System_Ext(cloudinary, "Cloudinary", "Product image storage")

  Rel(admin, app, "Uses admin dashboard")
  Rel(seller, app, "Uses seller dashboard")
  Rel(app, db, "Reads/writes data")
  Rel(app, cloudinary, "Uploads product images")
  Rel(vercel, app, "Hosts")
```

If your Mermaid renderer does not support C4 syntax, use the high-level architecture flowchart above.
