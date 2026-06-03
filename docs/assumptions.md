# Assumptions Document

## Product and Inventory Assumptions

- Each product has one base unit stored in `products.unit_id`.
- Product stock is recorded in the product's base unit.
- Product price is interpreted as price per one product base unit.
- A product may expose additional seller-selectable units through `product_available_units`.
- Sellers can quote only active products.
- Products may have optional CAS numbers, categories, descriptions, and images.

## Unit Conversion Assumptions

- Weight units are convertible only within weight:
  - `kg` to `g`;
  - `g` to `kg`.
- Volume units are convertible only within volume:
  - `L` to `mL`;
  - `mL` to `L`.
- Count units are convertible only within count:
  - `unit`;
  - `pcs`;
  - `item` as a business concept.
- Cross-family conversions are invalid. Example: `kg` cannot be converted to `mL`.
- Base quantities are stored for audit and future stock deduction.

## Authentication Assumptions

- Users sign in with email and password.
- Passwords are stored as bcrypt hashes.
- Roles are `admin` and `seller`.
- JWT sessions include user id and role.
- Admin routes and APIs are not available to sellers.
- Seller routes and APIs are not available to admins unless business rules are changed.

## Order and Quotation Assumptions

- Seller submissions are represented as quotations in the current implementation.
- A quotation may later become a finalized order.
- Admin review is required before fulfillment.
- Status values are strings to keep workflow extensible.
- Quotation totals are calculated on the server.
- Client-side price previews are convenience-only.

## Pricing Assumptions

- Prices are stored in INR-compatible numeric values.
- Database values are stored as `NUMERIC`.
- Human display uses INR formatting.
- The assignment asks for `NUMERIC(20,8)`; current implementation uses `NUMERIC(30,12)`.

## Deployment Assumptions

- Vercel hosts the Next.js app.
- Neon PostgreSQL is reachable from Vercel serverless functions.
- `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are set in Vercel environment variables.
- Optional product image uploads use Cloudinary when configured.

## Hackathon Scope Assumptions

- The focus is correctness of inventory, unit conversion, and role-based workflows.
- Payment processing is out of scope.
- Email notifications are out of scope.
- Full warehouse stock deduction after admin approval is a future enhancement.
- Admin status update can be implemented on top of the existing `quotations.status` or `orders.status` fields.
