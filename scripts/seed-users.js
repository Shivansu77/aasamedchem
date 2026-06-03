import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

// Load environment variables manually from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env.local");

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*DATABASE_URL=['"]?([^'"]+)['"]?\s*$/);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

async function seed() {
  console.log("Seeding test users...");

  const adminEmail = "admin@aasamedchem.com";
  const sellerEmail = "seller@aasamedchem.com";

  // Create hashed passwords
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const sellerPasswordHash = bcrypt.hashSync("seller123", 10);

  try {
    // Upsert Admin
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail));
    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        name: "Admin User",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
      });
      console.log("Seeded Admin user (admin@aasamedchem.com / admin123)");
    } else {
      await db.update(users).set({ passwordHash: adminPasswordHash, role: "admin" }).where(eq(users.email, adminEmail));
      console.log("Updated existing Admin user");
    }

    // Upsert Seller
    const existingSeller = await db.select().from(users).where(eq(users.email, sellerEmail));
    if (existingSeller.length === 0) {
      await db.insert(users).values({
        name: "Seller User",
        email: sellerEmail,
        passwordHash: sellerPasswordHash,
        role: "seller",
      });
      console.log("Seeded Seller user (seller@aasamedchem.com / seller123)");
    } else {
      await db.update(users).set({ passwordHash: sellerPasswordHash, role: "seller" }).where(eq(users.email, sellerEmail));
      console.log("Updated existing Seller user");
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
