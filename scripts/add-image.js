import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    await sql`ALTER TABLE products ADD COLUMN image_url TEXT;`;
    console.log("Successfully added image_url to products table.");
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("Column image_url already exists.");
    } else {
      console.error("Failed:", error);
    }
  }
}

main();
