import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 Testing database connection...");
    
    // Check if MONGODB_URI exists and log a sanitized version
    const uri = process.env.MONGODB_URI || '';
    const sanitizedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log("📝 MongoDB URI (sanitized):", sanitizedUri);
    
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("🔄 Attempting to connect to MongoDB...");
    const client = await clientPromise;
    console.log("✅ Successfully connected to MongoDB");

    const adminDb = client.db().admin();
    const serverInfo = await adminDb.serverStatus();
    console.log("📊 MongoDB Version:", serverInfo.version);
    
    const db = client.db("reemind");
    console.log("📁 Accessing reemind database");
    
    const collections = await db.listCollections().toArray();
    console.log("📋 Available collections:", collections.map(c => c.name));
    
    // Test write permission by attempting to create a test collection
    if (!collections.find(c => c.name === 'test_collection')) {
      await db.createCollection("test_collection");
      console.log("✅ Successfully created test collection");
      await db.collection("test_collection").drop();
      console.log("🧹 Cleaned up test collection");
    }

    return NextResponse.json({
      success: true,
      message: "Database connection and permissions verified",
      version: serverInfo.version,
      database: "reemind",
      collections: collections.map(c => c.name),
      uri_configured: true
    });
  } catch (err) {
    console.error("❌ Database connection error:", err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      uri_configured: !!process.env.MONGODB_URI,
      details: process.env.NODE_ENV === 'development' ? {
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : 'Unknown',
        stack: err instanceof Error ? err.stack : undefined
      } : undefined
    }, { status: 500 });
  }
} 