import { neon } from "@neondatabase/serverless";

/**
 * Creates a Neon SQL client bound to the DATABASE_URL env var.
 *
 * Usage:
 *   import { sql } from "@/lib/db";
 *   const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
 */
export function getSQL() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local — see .env.example for the format."
    );
  }
  return neon(process.env.DATABASE_URL);
}

/**
 * Default sql client — import this for convenience.
 * Lazily initialised on first use to avoid errors at import time
 * when DATABASE_URL is not yet configured.
 */
let _sql;

export function sql(strings, ...values) {
  if (!_sql) {
    _sql = getSQL();
  }
  return _sql(strings, ...values);
}
