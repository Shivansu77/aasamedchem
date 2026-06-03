require("dotenv").config({ path: ".env.local" });
const { getDb } = require("./src/db/index.js");
const { products, units } = require("./src/db/schema.js");

async function seed() {
  const db = getDb();
  await db.insert(units).values({ name: "Gram", abbreviation: "g" }).onConflictDoNothing();
  const u = await db.query.units.findFirst();
  await db.insert(products).values([
    { name: "Aspirin", sku: "ASP01", unitId: u.id, price: "10.00", stockQty: "100", category: "Analgesics" },
    { name: "Paracetamol", sku: "PAR01", unitId: u.id, price: "5.00", stockQty: "50", category: "Analgesics" },
    { name: "Amoxicillin", sku: "AMX01", unitId: u.id, price: "20.00", stockQty: "200", category: "Antibiotics" }
  ]).onConflictDoNothing();
  console.log("Seeded");
  process.exit(0);
}
seed();
