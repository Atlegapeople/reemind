import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/mongodb";
import { sendReminderEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    // Validate required fields
    const { name, email, month, day, reminder } = body;
    if (!name || !email || !month || !day || !reminder) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert and validate data types
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    const reminderNum = parseInt(reminder, 10);

    if (
      isNaN(monthNum) ||
      isNaN(dayNum) ||
      isNaN(reminderNum) ||
      monthNum < 1 ||
      monthNum > 12 ||
      dayNum < 1 ||
      dayNum > 31 ||
      reminderNum < 1 ||
      reminderNum > 30
    ) {
      console.error("Validation failed:", {
        month: monthNum,
        day: dayNum,
        reminder: reminderNum,
        original: { month, day, reminder }
      });
      return NextResponse.json(
        { error: "Invalid data format. Please check your inputs." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("reemind");
    console.log("Connected to database");

    const result = await db.collection("reminders").insertOne({
      name,
      email,
      month: monthNum,
      day: dayNum,
      reminder: reminderNum,
      createdAt: new Date(),
    });

    console.log("Inserted reminder:", result.insertedId);

    // Send confirmation email
    const emailResult = await sendReminderEmail({
      to: email,
      name,
      reminder: `Reminder ${reminderNum}`,
      month: monthNum,
      day: dayNum,
    });

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        reminder: {
          name,
          email,
          month: monthNum,
          day: dayNum,
          reminder: reminderNum,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all reminders
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("reemind");
    
    const reminders = await db.collection("reminders").find({}).toArray();
    console.log("📋 Found reminders:", reminders.length);
    
    return NextResponse.json({
      success: true,
      reminders
    });
  } catch (err) {
    console.error("🔥 Error fetching reminders:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
