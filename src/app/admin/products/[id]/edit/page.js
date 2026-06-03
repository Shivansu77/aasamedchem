import ProductForm from "@/components/admin/ProductForm";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Product | Admin",
};

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) notFound();

  let product = null;
  let available_units = [];

  try {
    const productResult = await db.execute(sql`SELECT * FROM products WHERE id = ${productId}`);
    if (productResult.rows.length === 0) notFound();
    product = productResult.rows[0];

    const unitsResult = await db.execute(sql`
      SELECT * FROM product_available_units WHERE product_id = ${productId}
    `);
    available_units = unitsResult.rows.map(au => ({
      unit_id: au.unit_id,
      price: au.price,
    }));
  } catch (err) {
    console.error("Failed to fetch product:", err);
    notFound();
  }

  const initialData = {
    ...product,
    available_units,
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Product</h1>
        <p className="text-sm text-white/50 mt-1">Modify details for SKU: <span className="text-cyan-400 font-mono">{product.sku}</span></p>
      </div>
      <ProductForm initialData={initialData} />
    </div>
  );
}
