import { NextResponse } from "next/server";
import { serialize } from "cookie"; // <-- Add this
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json(
      { success: false, error: "Email and code are required" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("reemind");

  const loginCode = await db.collection("login_codes").findOne({
    email,
    code,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!loginCode) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired code" },
      { status: 401 }
    );
  }

  // Mark code as used
  await db.collection("login_codes").updateOne(
    { _id: loginCode._id },
    { $set: { used: true } }
  );

  // Create or update user
  await db.collection("users").updateOne(
    { email },
    {
      $setOnInsert: {
        email,
        verified: true,
        createdAt: new Date(),
      },
      $set: {
        lastLogin: new Date(),
      },
    },
    { upsert: true }
  );

  // Set client-accessible cookie (not httpOnly so JS can read it)
  const cookieHeader = serialize("reemind_user", email, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });

  return new NextResponse(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        "Set-Cookie": cookieHeader,
        "Content-Type": "application/json",
      },
    }
  );
}
