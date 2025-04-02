import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 Incoming data:", body);

    let { name, email, month, day, reminder } = body;

    // Validate presence
    if (!name || !email || !month || !day || !reminder) {
      console.warn("🚫 Missing fields", { name, email, month, day, reminder });
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    // Convert strings to integers
    const parsedMonth = parseInt(month);
    const parsedDay = parseInt(day);
    const parsedReminder = parseInt(reminder);

    if (isNaN(parsedMonth) || isNaN(parsedDay) || isNaN(parsedReminder)) {
      console.warn("🚫 Invalid number conversion");
      return NextResponse.json(
        { success: false, error: "Invalid date or reminder value" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("reemind");
    const collection = db.collection("reminders");

    const result = await collection.insertOne({
      name,
      email,
      month: parsedMonth,
      day: parsedDay,
      reminder: parsedReminder,
      createdAt: new Date(),
    });

    console.log("✅ Reminder saved:", result.insertedId);

    // Send confirmation email (for local dev with MailDev or similar)
    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025, // MailDev or mailhog default
      secure: false,
    });

    const mailOptions = {
      from: "Reemind <no-reply@reemind.app>",
      to: email,
      subject: "🎉 You're all set — Reeminder saved!",
      text: `Hi there!

You've successfully set a reminder for ${name}'s birthday on ${parsedMonth}/${parsedDay}.
We'll send you a heads-up ${parsedReminder} day(s) before.

Want to manage your reminders? Visit https://reemind.com/dashboard

— The Reemind Team`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Confirmation email sent to:", email);
    } catch (emailErr) {
      console.error("❌ Failed to send email:", emailErr);
    }

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error("🔥 Error saving reminder:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
