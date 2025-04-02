import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    let body;
    try {
      body = await request.json();
      console.log("📥 Received data:", body);
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json({
        success: false,
        error: "Invalid request format"
      }, { status: 400 });
    }

    // Validate required fields
    const { name, email, month, day, reminder } = body;
    if (!name || !email || !month || !day || !reminder) {
      console.error("❌ Missing required fields:", { name, email, month, day, reminder });
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
        received: { name, email, month, day, reminder }
      }, { status: 400 });
    }

    // Convert and validate data types
    const reminderData = {
      name: String(name),
      email: String(email).toLowerCase(),
      month: parseInt(month),
      day: parseInt(day),
      reminder: parseInt(reminder),
      createdAt: new Date()
    };

    // Validate numeric values
    if (isNaN(reminderData.month) || reminderData.month < 1 || reminderData.month > 12) {
      return NextResponse.json({
        success: false,
        error: "Invalid month value"
      }, { status: 400 });
    }

    if (isNaN(reminderData.day) || reminderData.day < 1 || reminderData.day > 31) {
      return NextResponse.json({
        success: false,
        error: "Invalid day value"
      }, { status: 400 });
    }

    if (isNaN(reminderData.reminder) || reminderData.reminder < 1) {
      return NextResponse.json({
        success: false,
        error: "Invalid reminder value"
      }, { status: 400 });
    }

    // Connect to MongoDB
    console.log("🔄 Connecting to database...");
    const client = await clientPromise;
    const db = client.db("reemind");

    // Insert the reminder
    console.log("📝 Inserting reminder:", reminderData);
    const result = await db.collection("reminders").insertOne(reminderData);
    console.log("✅ Reminder inserted successfully:", result.insertedId);

    return NextResponse.json({
      success: true,
      reminder: {
        _id: result.insertedId,
        ...reminderData
      }
    });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return NextResponse.json({
      success: false,
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
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
