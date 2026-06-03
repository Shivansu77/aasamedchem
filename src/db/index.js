import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local — see .env.example for the format."
    );
  }
  if (!_db) {
    const client = neon(process.env.DATABASE_URL);
    _db = drizzle(client, { schema });
  }
  return _db;
}

// Proxy-based exporter so imports can do:
//   import { db } from "@/db";
//   await db.select().from(users);
export const db = new Proxy({}, {
  get(target, prop) {
    return getDb()[prop];
  }
});
