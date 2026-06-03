import { db } from "@/db";
import { units } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const timeResult = await db.execute(sql`SELECT NOW() AS server_time`);
    const countResult = await db.select({ count: sql`count(*)` }).from(units);

    return Response.json({
      status: "ok",
      database: "connected",
      orm: "drizzle",
      server_time: timeResult.rows[0]?.server_time,
      total_units: Number(countResult[0]?.count || 0),
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        database: "disconnected",
        message: error.message,
      },
      { status: 503 }
    );
  }
}
