# Excalidraw-ready Diagrams

This document provides Excalidraw-ready scene guidance and importable Mermaid blocks. Excalidraw can import Mermaid diagrams directly through **Insert > Mermaid to Excalidraw** in supported versions.

## Diagram Style Guide

Use a professional software architecture style:

- Background: `#ffffff`
- Primary blue: `#0ea5e9`
- Dark text: `#0f172a`
- Surface: `#f8fafc`
- Border: `#cbd5e1`
- Success green: `#10b981`
- Warning amber: `#f59e0b`
- Error red: `#ef4444`
- Font: clean sans-serif
- Shape style: rounded rectangles for services, cylinders for databases, arrows for flow

## 1. High-Level Architecture

Paste this into Mermaid-to-Excalidraw:

```mermaid
flowchart TB
  Browser[Browser]
  Admin[Admin Dashboard]
  Seller[Seller Dashboard]
  Proxy[Role Guard Proxy]
  Auth[NextAuth/Auth.js]
  API[Next.js API Routes]
  Unit[Unit Conversion Engine]
  Math[Decimal.js Pricing]
  DB[(Neon PostgreSQL)]
  Deploy[Vercel Deployment]

  Browser --> Admin
  Browser --> Seller
  Admin --> Proxy
  Seller --> Proxy
  Proxy --> Auth
  Proxy --> API
  API --> Unit
  Unit --> Math
  Math --> DB
  API --> DB
  Deploy --> API
```

## 2. Authentication Flow

```mermaid
sequenceDiagram
  actor User
  participant Login
  participant Auth as NextAuth
  participant DB as Neon PostgreSQL
  participant Proxy as src/proxy.js
  participant App as Dashboard

  User->>Login: Email + password
  Login->>Auth: signIn(credentials)
  Auth->>DB: Query user by email
  DB-->>Auth: User + password_hash + role
  Auth->>Auth: bcrypt compare
  Auth-->>Login: JWT session
  User->>Proxy: Open protected route
  Proxy->>Proxy: Check role claim
  Proxy-->>App: Allow or redirect
```

## 3. Product Management Flow

```mermaid
flowchart LR
  Admin[Admin] --> Form[Product Form]
  Form --> Validate[Validate fields]
  Validate --> Units[Base Unit + Available Units]
  Units --> API[/Admin Products API/]
  API --> Products[(products)]
  API --> PAU[(product_available_units)]
  Products --> Catalog[Seller Catalog if active]
```

## 4. Order Lifecycle

```mermaid
stateDiagram-v2
  [*] --> Browsing
  Browsing --> Selected
  Selected --> UnitChosen
  UnitChosen --> Converted
  Converted --> Submitted
  Submitted --> AdminReview
  AdminReview --> Approved
  AdminReview --> Rejected
  Approved --> Fulfilled
  Fulfilled --> [*]
  Rejected --> [*]
```

## 5. Unit Conversion

```mermaid
flowchart TD
  A[Quantity + Unit] --> B[Find unit factor]
  B --> C{Compatible with product base?}
  C -- No --> D[Reject]
  C -- Yes --> E[base_quantity = quantity * factor]
  E --> F[Calculate subtotal]
  F --> G[Save quotation item]
```

## 6. Database ERD

```mermaid
erDiagram
  USERS ||--o{ QUOTATIONS : creates
  QUOTATIONS ||--o{ QUOTATION_ITEMS : contains
  PRODUCTS ||--o{ QUOTATION_ITEMS : quoted
  UNITS ||--o{ QUOTATION_ITEMS : requested_unit
  UNITS ||--o{ PRODUCTS : base_unit
  PRODUCTS ||--o{ PRODUCT_AVAILABLE_UNITS : supports
  UNITS ||--o{ PRODUCT_AVAILABLE_UNITS : selectable
  USERS ||--o{ ORDERS : places
  ORDERS ||--o{ ORDER_ITEMS : contains
  PRODUCTS ||--o{ ORDER_ITEMS : ordered
```

## 7. Minimal Excalidraw Scene JSON

Use this as a starter `.excalidraw` file. It creates the main architecture blocks. Excalidraw can then be used to polish colors, icons, and spacing.

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "seller",
      "type": "rectangle",
      "x": 40,
      "y": 100,
      "width": 170,
      "height": 70,
      "angle": 0,
      "strokeColor": "#0ea5e9",
      "backgroundColor": "#f0f9ff",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "roundness": { "type": 3 },
      "seed": 1,
      "versionNonce": 1,
      "isDeleted": false,
      "boundElements": [],
      "updated": 1,
      "link": null,
      "locked": false
    },
    {
      "id": "app",
      "type": "rectangle",
      "x": 310,
      "y": 70,
      "width": 240,
      "height": 130,
      "angle": 0,
      "strokeColor": "#334155",
      "backgroundColor": "#f8fafc",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "roundness": { "type": 3 },
      "seed": 2,
      "versionNonce": 2,
      "isDeleted": false,
      "boundElements": [],
      "updated": 1,
      "link": null,
      "locked": false
    },
    {
      "id": "db",
      "type": "ellipse",
      "x": 680,
      "y": 85,
      "width": 190,
      "height": 100,
      "angle": 0,
      "strokeColor": "#10b981",
      "backgroundColor": "#ecfdf5",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "roundness": null,
      "seed": 3,
      "versionNonce": 3,
      "isDeleted": false,
      "boundElements": [],
      "updated": 1,
      "link": null,
      "locked": false
    },
    {
      "id": "sellerText",
      "type": "text",
      "x": 78,
      "y": 124,
      "width": 90,
      "height": 25,
      "angle": 0,
      "strokeColor": "#0f172a",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 1,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "roundness": null,
      "seed": 4,
      "versionNonce": 4,
      "isDeleted": false,
      "boundElements": [],
      "updated": 1,
      "link": null,
      "locked": false,
      "text": "Seller/User",
      "fontSize": 20,
      "fontFamily": 1,
      "textAlign": "center",
      "verticalAlign": "top",
      "containerId": null,
      "originalText": "Seller/User",
      "lineHeight": 1.25
    },
    {
      "id": "appText",
      "type": "text",
      "x": 348,
      "y": 105,
      "width": 165,
      "height": 50,
      "angle": 0,
      "strokeColor": "#0f172a",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 1,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "roundness": null,
      "seed": 5,
      "versionNonce": 5,
      "isDeleted": false,
      "boundElements": [],
      "updated": 1,
      "link": null,
      "locked": false,
      "text": "Next.js App\\nAuth + APIs",
      "fontSize": 20,
      "fontFamily": 1,
      "textAlign": "center",
      "verticalAlign": "top",
      "containerId": null,
      "originalText": "Next.js App\\nAuth + APIs",
      "lineHeight": 1.25
    },
    {
      "id": "dbText",
      "type": "text",
      "x": 716,
      "y": 120,
      "width": 120,
      "height": 25,
      "angle": 0,
      "strokeColor": "#0f172a",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 1,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "roundness": null,
      "seed": 6,
      "versionNonce": 6,
      "isDeleted": false,
      "boundElements": [],
      "updated": 1,
      "link": null,
      "locked": false,
      "text": "Neon PostgreSQL",
      "fontSize": 20,
      "fontFamily": 1,
      "textAlign": "center",
      "verticalAlign": "top",
      "containerId": null,
      "originalText": "Neon PostgreSQL",
      "lineHeight": 1.25
    }
  ],
  "appState": {
    "gridSize": null,
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```

## Recommended Excalidraw Export List

Create and export these as PNG/SVG for the final submission:

1. High-level architecture.
2. Authentication flow.
3. Product management flow.
4. Order lifecycle.
5. Unit conversion.
6. Database ERD.
7. Place-order sequence diagram.
