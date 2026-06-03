import { config } from "dotenv";
config({ path: ".env.local" });
import { sql } from "drizzle-orm";
import { db } from "./src/db/index.js";

async function run() {
  const search = "sodium";
  const searchCondition = sql`(p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})`;
  const categoryCondition = sql`1=1`;
  const productsResult = await db.execute(sql`
    SELECT p.*
    FROM products p
    WHERE p.is_active = true 
    AND ${searchCondition}
    AND ${categoryCondition}
    ORDER BY p.name ASC
  `);
  console.log("Found products:", productsResult.rows.length);
  console.log(productsResult.rows.map(r => r.name));
  process.exit(0);
}

run();
