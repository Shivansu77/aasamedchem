import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    // Fetch products along with their base unit abbreviation
    const products = await sql`
      SELECT p.*, u.abbreviation as base_unit_abbr, u.name as base_unit_name
      FROM products p
      LEFT JOIN units u ON p.unit_id = u.id
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, cas_number, sku, unit_id, price, stock_qty, category, is_active, available_units, image_url } = body;

    const sql = neon(process.env.DATABASE_URL);
    
    // Insert product
    const newProduct = await sql`
      INSERT INTO products (name, description, cas_number, sku, unit_id, price, stock_qty, category, is_active, image_url)
      VALUES (${name}, ${description}, ${cas_number || null}, ${sku}, ${unit_id}, ${price || 0}, ${stock_qty || 0}, ${category || null}, ${is_active !== undefined ? is_active : true}, ${image_url || null})
      RETURNING *
    `;

    const productId = newProduct[0].id;

    if (available_units && Array.isArray(available_units) && available_units.length > 0) {
      for (const unit of available_units) {
        await sql`
          INSERT INTO product_available_units (product_id, unit_id, price)
          VALUES (${productId}, ${unit.unit_id}, ${unit.price || 0})
        `;
      }
    }

    return NextResponse.json({ product: newProduct[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product", details: error.message }, { status: 500 });
  }
}
