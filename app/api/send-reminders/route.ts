import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";

// Helper function to calculate the target date for reminders
function getTargetDate(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return {
    month: date.getMonth() + 1, // MongoDB months are 1-based
    day: date.getDate()
  };
}

export async function GET(request: Request) {
  try {
    // Verify API key for security
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_SECRET;
    
    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("reemind");
    
    // Get today's date
    const today = getTargetDate(0);
    
    // Initialize results
    const results = {
      success: true,
      remindersSent: 0,
      errors: [] as string[],
    };

    // Check for reminders at different intervals (1, 3, 7, 14, 30 days before)
    const reminderDays = [1, 3, 7, 14, 30];
    
    for (const daysAhead of reminderDays) {
      const targetDate = getTargetDate(daysAhead);
      
      // Find reminders for this date
      const reminders = await db.collection("reminders").find({
        month: targetDate.month,
        day: targetDate.day,
        reminder: daysAhead.toString() // Match the reminder preference
      }).toArray();

      console.log(`Found ${reminders.length} reminders for ${daysAhead} days ahead (${targetDate.month}/${targetDate.day})`);

      // Send emails for each reminder
      for (const reminder of reminders) {
        try {
          await sendReminderEmail({
            to: reminder.email,
            name: reminder.name,
            reminder: reminder.reminder,
            month: reminder.month,
            day: reminder.day,
          });
          
          results.remindersSent++;
          
          // Log successful reminder
          await db.collection("reminder_logs").insertOne({
            reminderId: reminder._id,
            sentAt: new Date(),
            success: true,
            daysAhead,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          results.errors.push(`Failed to send reminder to ${reminder.email}: ${errorMessage}`);
          
          // Log failed reminder
          await db.collection("reminder_logs").insertOne({
            reminderId: reminder._id,
            sentAt: new Date(),
            success: false,
            error: errorMessage,
            daysAhead,
          });
        }
      }
    }

    // Return summary
    return NextResponse.json({
      ...results,
      message: `Successfully sent ${results.remindersSent} reminders`,
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error processing reminders:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 