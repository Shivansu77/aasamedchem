const { sql } = require("drizzle-orm");
const search = "foo";
const searchCondition = search ? sql`(p.name ILIKE ${'%' + search + '%'})` : sql`1=1`;
const finalQuery = sql`SELECT * FROM products WHERE ${searchCondition}`;
console.log(finalQuery);
