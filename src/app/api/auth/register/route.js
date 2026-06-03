import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (role !== "admin" && role !== "seller") {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    // Hash the password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert new user
    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role,
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
