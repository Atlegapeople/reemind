import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("reemind"); // Replace with your actual DB name if different

    const reminders = await db
      .collection("reminders")
      .find({ email })
      .toArray();

    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
