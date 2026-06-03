import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`SELECT NOW() AS server_time`;
    return Response.json({
      status: "ok",
      database: "connected",
      server_time: result[0].server_time,
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
