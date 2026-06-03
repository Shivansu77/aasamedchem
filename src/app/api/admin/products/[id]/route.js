import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL);
    const products = await sql`
      SELECT p.*, u.abbreviation as base_unit_abbr, u.name as base_unit_name
      FROM products p
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE p.id = ${id}
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const available_units = await sql`
      SELECT pau.*, u.abbreviation, u.name
      FROM product_available_units pau
      JOIN units u ON pau.unit_id = u.id
      WHERE pau.product_id = ${id}
    `;

    return NextResponse.json({ product: products[0], available_units });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const { name, description, cas_number, sku, unit_id, price, stock_qty, category, is_active, available_units, image_url } = body;

    const sql = neon(process.env.DATABASE_URL);

    // Update product
    const updatedProduct = await sql`
      UPDATE products
      SET 
        name = ${name}, 
        description = ${description}, 
        cas_number = ${cas_number || null}, 
        sku = ${sku}, 
        unit_id = ${unit_id}, 
        price = ${price}, 
        stock_qty = ${stock_qty}, 
        category = ${category || null}, 
        is_active = ${is_active},
        image_url = ${image_url || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update available units (delete all existing and re-insert)
    await sql`DELETE FROM product_available_units WHERE product_id = ${id}`;

    if (available_units && Array.isArray(available_units) && available_units.length > 0) {
      for (const unit of available_units) {
        await sql`
          INSERT INTO product_available_units (product_id, unit_id, price)
          VALUES (${id}, ${unit.unit_id}, ${unit.price || 0})
        `;
      }
    }

    return NextResponse.json({ product: updatedProduct[0] });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product", details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL);
    const deletedProduct = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;

    if (deletedProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
