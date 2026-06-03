import { notFound } from "next/navigation";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import ProductDetail from "@/components/seller/ProductDetail";

export const dynamic = "force-dynamic";

export default async function SellerProductDetailPage({ params }) {
  const resolvedParams = await params;
  const productId = Number(resolvedParams?.id);
  if (!Number.isFinite(productId)) {
    notFound();
  }

  const productResult = await db.execute(sql`
    SELECT p.*, u.abbreviation as base_unit_abbr, u.name as base_unit_name
    FROM products p
    LEFT JOIN units u ON p.unit_id = u.id
    WHERE p.id = ${productId}
  `);

  const product = productResult.rows[0];
  if (!product) {
    notFound();
  }

  const unitsResult = await db.execute(sql`
    SELECT pau.*, u.abbreviation, u.name
    FROM product_available_units pau
    JOIN units u ON pau.unit_id = u.id
    WHERE pau.product_id = ${productId}
  `);

  product.available_units = unitsResult.rows;

  return <ProductDetail product={product} />;
}
