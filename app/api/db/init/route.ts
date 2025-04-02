import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db/init";

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully" 
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to initialize database" 
    }, { status: 500 });
  }
} 