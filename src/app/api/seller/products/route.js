import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    // Build the query
    let query = `
      SELECT p.*, u.abbreviation as base_unit_abbr, u.name as base_unit_name
      FROM products p
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE p.is_active = true
    `;
    
    // Using string concatenation for building queries with drizzle sql template tag can be tricky.
    // It's safer to use parameterized queries if we were doing this manually.
    // Drizzle's `sql` template literal helper can handle dynamic parts using `sql.raw`.
    // Let's do it cleanly:
    
    let conditions = [];
    let values = [];

    if (search) {
      conditions.push(`(p.name ILIKE $${values.length + 1} OR p.sku ILIKE $${values.length + 1})`);
      values.push(`%${search}%`);
    }
    if (category) {
      conditions.push(`p.category = $${values.length + 1}`);
      values.push(category);
    }
    
    // Instead of messing with drizzle raw strings, let's use the neon client directly for dynamic queries.
    // Drizzle can handle it but direct neon is simpler for this specific raw query if we don't have the full schema mapped nicely for this join.
    // Wait, the project has Drizzle schema set up in `src/db/schema.js`.
    // Let's use the raw sql tag from drizzle, or just use the neon client.
    
    // Actually, `drizzle-orm` allows composing sql:
    const searchCondition = search ? sql`(p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})` : sql`1=1`;
    const categoryCondition = category ? sql`p.category = ${category}` : sql`1=1`;

    const productsResult = await db.execute(sql`
      SELECT p.*, u.abbreviation as base_unit_abbr, u.name as base_unit_name
      FROM products p
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE p.is_active = true 
      AND ${searchCondition}
      AND ${categoryCondition}
      ORDER BY p.name ASC
    `);
    
    const products = productsResult.rows;

    // Now fetch available units for these products
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      
      const productIdsList = sql.raw(productIds.join(', '));
      const unitsResult = await db.execute(sql`
        SELECT pau.*, u.abbreviation, u.name
        FROM product_available_units pau
        JOIN units u ON pau.unit_id = u.id
        WHERE pau.product_id IN (${productIdsList})
      `);
      
      const availableUnitsByProduct = {};
      for (const row of unitsResult.rows) {
        if (!availableUnitsByProduct[row.product_id]) {
          availableUnitsByProduct[row.product_id] = [];
        }
        availableUnitsByProduct[row.product_id].push(row);
      }
      
      for (const p of products) {
        p.available_units = availableUnitsByProduct[p.id] || [];
      }
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch seller products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
