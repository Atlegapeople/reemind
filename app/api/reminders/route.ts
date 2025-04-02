import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting POST request to /api/reminders");
    
    const body = await request.json();
    console.log("📥 Received reminder data:", body);

    // Validate required fields
    const { name, email, month, day, reminder } = body;
    if (!name || !email || !month || !day || !reminder) {
      console.log("❌ Missing required fields:", { name, email, month, day, reminder });
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Convert string values to integers
    const reminderData = {
      name: String(name),
      email: String(email),
      month: parseInt(month),
      day: parseInt(day),
      reminder: parseInt(reminder),
      createdAt: new Date()
    };
    console.log("📝 Converted data:", reminderData);

    // Validate converted values
    if (isNaN(reminderData.month) || reminderData.month < 1 || reminderData.month > 12) {
      console.log("❌ Invalid month value:", reminderData.month);
      return NextResponse.json({ 
        success: false, 
        error: "Invalid month value" 
      }, { status: 400 });
    }

    if (isNaN(reminderData.day) || reminderData.day < 1 || reminderData.day > 31) {
      console.log("❌ Invalid day value:", reminderData.day);
      return NextResponse.json({ 
        success: false, 
        error: "Invalid day value" 
      }, { status: 400 });
    }

    if (isNaN(reminderData.reminder) || reminderData.reminder < 1) {
      console.log("❌ Invalid reminder value:", reminderData.reminder);
      return NextResponse.json({ 
        success: false, 
        error: "Invalid reminder value" 
      }, { status: 400 });
    }
    
    console.log("✅ Data validation passed");
    
    // Verify MongoDB URI
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is not defined in environment variables");
      return NextResponse.json({ 
        success: false, 
        error: "Database configuration error" 
      }, { status: 500 });
    }
    console.log("✅ MongoDB URI found in environment");
    
    // Connect to the reemind database
    console.log("🔄 Attempting to connect to MongoDB...");
    const client = await clientPromise;
    console.log("🔌 Connected to MongoDB client");
    
    const db = client.db("reemind");
    console.log("📁 Accessed database: reemind");
    
    // Explicitly create collection if it doesn't exist
    try {
      const collections = await db.listCollections().toArray();
      if (!collections.find(c => c.name === 'reminders')) {
        console.log("🆕 Creating reminders collection...");
        await db.createCollection("reminders");
        console.log("📝 Created reminders collection");
      } else {
        console.log("✅ Reminders collection already exists");
      }
    } catch (collectionErr) {
      console.error("❌ Error checking/creating collection:", collectionErr);
      throw collectionErr;
    }
    
    // Insert the document
    console.log("🔄 Attempting to insert reminder...");
    const result = await db.collection("reminders").insertOne(reminderData);
    console.log("✅ Inserted reminder with ID:", result.insertedId);
    console.log("📄 Inserted data:", reminderData);
    
    return NextResponse.json({
      success: true,
      reminder: { _id: result.insertedId, ...reminderData }
    });
  } catch (err) {
    console.error("🔥 Error creating reminder:", err);
    console.error("Error name:", err instanceof Error ? err.name : "Unknown error type");
    console.error("Error message:", err instanceof Error ? err.message : String(err));
    console.error("Error stack:", err instanceof Error ? err.stack : "No stack trace");
    
    // Check for specific MongoDB errors
    if (err instanceof Error) {
      if (err.name === 'MongoServerError') {
        return NextResponse.json({ 
          success: false, 
          error: "Database error: " + err.message 
        }, { status: 500 });
      }
      if (err.message.includes('connect')) {
        return NextResponse.json({ 
          success: false, 
          error: "Could not connect to database" 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Server error",
      details: process.env.NODE_ENV === 'development' ? String(err) : undefined
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
