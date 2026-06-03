import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

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

const schemaPath = path.resolve(__dirname, "../src/lib/schema.sql");
const sqlContent = fs.readFileSync(schemaPath, "utf-8");

console.log("Connecting to Neon DB...");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    // Split the file by semicolons to run statements, but be careful with comments or multi-line strings
    // Neon's single client doesn't support multiple queries in one string separated by semicolons
    // So we need to execute them step by step.
    // A simple split by ';' works for standard DDL if we filter out empty ones.
    // Split statements and clean up comments/whitespace
    const statements = sqlContent
      .split(";")
      .map(stmt => {
        // Strip out single-line comments starting with --
        return stmt
          .split("\n")
          .filter(line => !line.trim().startsWith("--"))
          .join("\n")
          .trim();
      })
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);
    for (const stmt of statements) {
      console.log(`Executing: ${stmt.substring(0, 50)}...`);
      await sql.query(stmt);
    }
    console.log("Database schema applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
