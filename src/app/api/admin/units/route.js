import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const units = await sql`SELECT * FROM units ORDER BY name ASC`;
    return NextResponse.json({ units });
  } catch (error) {
    console.error("Failed to fetch units:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}
