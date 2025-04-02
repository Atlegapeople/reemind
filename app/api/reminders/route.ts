import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/mongodb";
import { sendReminderEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    console.log("📥 Received data:", body);

    // Validate required fields
    const { name, email, month, day, reminder } = body;
    if (!name || !email || !month || !day || !reminder) {
      console.error("❌ Missing required fields:", { name, email, month, day, reminder });
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
        received: { name, email, month, day, reminder }
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
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
      console.error("❌ Invalid data format:", {
        month: monthNum,
        day: dayNum,
        reminder: reminderNum,
        original: { month, day, reminder }
      });
      return NextResponse.json({
        success: false,
        error: "Invalid data format",
        details: "Please check your inputs"
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Connect to MongoDB
    console.log("🔄 Connecting to database...");
    const client = await clientPromise;
    const db = client.db("reemind");

    // Create the reminder document
    const reminderDoc = {
      name: String(name),
      email: String(email).toLowerCase(),
      month: monthNum,
      day: dayNum,
      reminder: reminderNum,
      createdAt: new Date()
    };

    // Insert the reminder
    console.log("📝 Inserting reminder:", reminderDoc);
    const result = await db.collection("reminders").insertOne(reminderDoc);
    console.log("✅ Reminder inserted successfully:", result.insertedId);

    // Send confirmation email
    try {
      const emailResult = await sendReminderEmail({
        to: reminderDoc.email,
        name: reminderDoc.name,
        reminder: reminderDoc.reminder.toString(),
        month: reminderDoc.month,
        day: reminderDoc.day,
      });

      if (!emailResult.success) {
        console.warn("⚠️ Email sending failed:", emailResult.error);
      }
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      reminder: {
        id: result.insertedId,
        ...reminderDoc
      }
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error("🔥 Server error:", error);
    return NextResponse.json({
      success: false,
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
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
