# API Endpoint Documentation

Base URL:

```text
http://localhost:3000
```

Production URL:

```text
https://<vercel-project>.vercel.app
```

## Authentication

The app uses NextAuth/Auth.js with the Credentials Provider. Session strategy is JWT. `src/proxy.js` protects role-based route groups.

### `POST /api/auth/register`

Registers an admin or seller.

#### Request

```json
{
  "name": "Seller User",
  "email": "seller@aasamedchem.com",
  "password": "seller123",
  "role": "seller"
}
```

#### Validation

- `name`, `email`, `password`, and `role` are required.
- `role` must be `admin` or `seller`.
- Email must be unique.

#### Responses

| Status | Meaning |
| --- | --- |
| `201` | User registered |
| `400` | Missing or invalid fields |
| `409` | Email already exists |
| `500` | Server error |

### `GET/POST /api/auth/[...nextauth]`

Handled by NextAuth/Auth.js.

Responsibilities:

- credential login;
- password hash verification;
- JWT creation;
- session enrichment with `id` and `role`.

## Health

### `GET /api/health`

Checks application/database health.

#### Response

```json
{
  "status": "ok",
  "database": "connected",
  "orm": "drizzle",
  "server_time": "2026-06-03T07:00:00.000Z",
  "total_units": 5
}
```

## Admin APIs

All admin APIs require an authenticated `admin` user.

### `GET /api/admin/products`

Returns all products for inventory management.

#### Response

```json
{
  "products": [
    {
      "id": 1,
      "name": "Acetone",
      "sku": "CHEM-ACETONE",
      "base_unit_abbr": "mL",
      "price": "0.500000000000",
      "stock_qty": "10000.000000000000",
      "is_active": true
    }
  ]
}
```

### `POST /api/admin/products`

Creates a product.

#### Request

```json
{
  "name": "Sodium Chloride",
  "description": "Analytical grade reagent",
  "cas_number": "7647-14-5",
  "sku": "CHEM-NACL-001",
  "unit_id": 2,
  "price": "2.50000000",
  "stock_qty": "5000",
  "category": "Reagent",
  "is_active": true,
  "image_url": "https://example.com/image.webp",
  "available_units": [
    { "unit_id": 1, "price": "2500" },
    { "unit_id": 2, "price": "2.5" }
  ]
}
```

#### Responses

| Status | Meaning |
| --- | --- |
| `201` | Product created |
| `500` | Product creation failed |

### `GET /api/admin/products/:id`

Returns one product and its available units.

### `PUT /api/admin/products/:id`

Updates product data and replaces available unit mappings.

### `DELETE /api/admin/products/:id`

Deletes a product.

#### Response

```json
{
  "message": "Product deleted successfully"
}
```

### `GET /api/admin/units`

Returns supported measurement units.

#### Response

```json
{
  "units": [
    { "id": 1, "name": "Kilogram", "abbreviation": "kg" },
    { "id": 2, "name": "Gram", "abbreviation": "g" },
    { "id": 3, "name": "Litre", "abbreviation": "L" },
    { "id": 4, "name": "Millilitre", "abbreviation": "mL" },
    { "id": 5, "name": "Unit", "abbreviation": "unit" }
  ]
}
```

### `POST /api/admin/upload`

Uploads a product image to Cloudinary.

#### Request

`multipart/form-data`

| Field | Type | Required |
| --- | --- | --- |
| `file` | File | yes |

#### Response

```json
{
  "url": "https://res.cloudinary.com/.../product.webp",
  "public_id": "aasamedchem/products/example"
}
```

## Seller APIs

All seller APIs require an authenticated `seller` user.

### `GET /api/seller/products`

Returns active products for the seller catalog.

#### Query Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `search` | string | Searches product name or SKU |
| `category` | string | Filters by exact category |

#### Example

```text
GET /api/seller/products?search=sodium&category=Reagent
```

#### Response

```json
{
  "products": [
    {
      "id": 1,
      "name": "Sodium Chloride",
      "sku": "CHEM-NACL-001",
      "base_unit_abbr": "g",
      "price": "2.500000000000",
      "stock_qty": "5000.000000000000",
      "available_units": [
        { "unit_id": 1, "abbreviation": "kg", "name": "Kilogram" },
        { "unit_id": 2, "abbreviation": "g", "name": "Gram" }
      ]
    }
  ]
}
```

### `GET /api/seller/quotations`

Returns quotations for the authenticated seller.

#### Response

```json
{
  "quotations": [
    {
      "id": 1,
      "quotation_number": "QT-1710000000000-123",
      "status": "submitted",
      "total_amount": "2500.000000000000",
      "item_count": 2
    }
  ]
}
```

### `POST /api/seller/quotations`

Creates a quotation/order request.

#### Request

```json
{
  "items": [
    {
      "product_id": 1,
      "unit_id": 1,
      "quantity": "1"
    }
  ],
  "notes": "Urgent requirement"
}
```

#### Server-Side Checks

- JWT token exists.
- Product exists and is active.
- Selected unit is enabled for product.
- Selected unit is compatible with product base unit.
- Quantity is greater than zero.
- Converted base quantity does not exceed stock.
- Totals are recalculated from database price.

#### Response

```json
{
  "quotation": {
    "id": 1,
    "quotation_number": "QT-1710000000000-123",
    "status": "submitted",
    "total_amount": "2500.000000000000"
  }
}
```

#### Error Responses

| Status | Meaning |
| --- | --- |
| `400` | Invalid quantity, product, unit, stock, or conversion |
| `401` | Unauthenticated |
| `500` | Server error |

## Route Protection Summary

| Route Pattern | Protection |
| --- | --- |
| `/admin/:path*` | admin only |
| `/api/admin/:path*` | admin only |
| `/seller/:path*` | seller only |
| `/api/seller/:path*` | seller only |
| `/profile/:path*` | authenticated user |
