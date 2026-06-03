import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getToken } from "next-auth/jwt";
import Decimal from "decimal.js";
import { calculateQuotationLine } from "@/lib/quotationMath";
import { convertToBase } from "@/lib/units";

export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quotationsResult = await db.execute(sql`
      SELECT q.*, 
        (SELECT count(*) FROM quotation_items qi WHERE qi.quotation_id = q.id) as item_count
      FROM quotations q
      WHERE q.user_id = ${token.id}
      ORDER BY q.created_at DESC
    `);

    return NextResponse.json({ quotations: quotationsResult.rows });
  } catch (error) {
    console.error("Failed to fetch quotations:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const calculatedItems = [];
    let totalAmount = new Decimal(0);

    for (const item of items) {
      const productId = Number.parseInt(item.product_id, 10);
      const unitId = Number.parseInt(item.unit_id, 10);

      if (!Number.isInteger(productId) || !Number.isInteger(unitId)) {
        return NextResponse.json({ error: "Invalid product or unit." }, { status: 400 });
      }

      const productResult = await db.execute(sql`
        SELECT
          p.id,
          p.price,
          p.stock_qty,
          p.is_active,
          base_unit.abbreviation AS base_unit_abbr,
          order_unit.abbreviation AS order_unit_abbr,
          (
            p.unit_id = ${unitId}
            OR EXISTS (
              SELECT 1
              FROM product_available_units pau
              WHERE pau.product_id = p.id AND pau.unit_id = ${unitId}
            )
          ) AS unit_allowed
        FROM products p
        JOIN units base_unit ON base_unit.id = p.unit_id
        JOIN units order_unit ON order_unit.id = ${unitId}
        WHERE p.id = ${productId}
        LIMIT 1
      `);

      const product = productResult.rows[0];

      if (!product || !product.is_active) {
        return NextResponse.json({ error: "Product is unavailable." }, { status: 400 });
      }

      if (!product.unit_allowed) {
        return NextResponse.json({ error: "Selected unit is not enabled for this product." }, { status: 400 });
      }

      let line;
      try {
        line = calculateQuotationLine({
          basePrice: product.price,
          quantity: item.quantity,
          orderUnit: product.order_unit_abbr,
          productBaseUnit: product.base_unit_abbr,
        });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const stockInCanonicalBase = convertToBase(product.stock_qty, product.base_unit_abbr);
      if (new Decimal(line.baseQuantity).greaterThan(stockInCanonicalBase)) {
        return NextResponse.json({ error: "Requested quantity exceeds available stock." }, { status: 400 });
      }

      calculatedItems.push({
        productId,
        unitId,
        ...line,
      });
      totalAmount = totalAmount.plus(line.subtotal);
    }

    // Generate a unique quotation number
    const quotationNumber = `QT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Insert quotation
    const newQuoteResult = await db.execute(sql`
      INSERT INTO quotations (user_id, quotation_number, status, total_amount, notes)
      VALUES (${token.id}, ${quotationNumber}, 'submitted', ${totalAmount.toFixed(12)}, ${notes || null})
      RETURNING *
    `);
    
    const quotationId = newQuoteResult.rows[0].id;

    // Insert items
    for (const item of calculatedItems) {
      await db.execute(sql`
        INSERT INTO quotation_items (
          quotation_id,
          product_id,
          quantity,
          unit_id,
          base_quantity,
          base_unit_abbr,
          unit_price,
          subtotal
        )
        VALUES (
          ${quotationId},
          ${item.productId},
          ${item.quantity},
          ${item.unitId},
          ${item.baseQuantity},
          ${item.baseUnitAbbr},
          ${item.unitPrice},
          ${item.subtotal}
        )
      `);
    }

    return NextResponse.json({ quotation: newQuoteResult.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to create quotation:", error);
    return NextResponse.json({ error: "Failed to create quotation", details: error.message }, { status: 500 });
  }
}
