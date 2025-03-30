// app/api/reminders/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 Incoming data:", body);

    const { name, email, month, day, reminder } = body;

    // Validate inputs
    if (!name || !email || !month || !day || !reminder) {
      console.warn("🚫 Missing fields", { name, email, month, day, reminder });
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("reemind");
    const collection = db.collection("reminders");

    const result = await collection.insertOne({
      name,
      email,
      month,
      day,
      reminder,
      createdAt: new Date(),
    });

    console.log("✅ Saved reminder:", result.insertedId);

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025, // MailDev default
      secure: false,
    });

    const mailOptions = {
      from: "Reemind <no-reply@reemind.app>",
      to: email,
      subject: "🎉 You're all set — Reeminder saved!",
      text: `Hi there!\n\nYou've successfully set a reminder for ${name}'s birthday on ${month}/${day}.\nWe'll send you a heads-up ${reminder} day(s) before.\n\nWant to manage your reminders? Visit https://reemind.com/dashboard\n\n— The Reemind Team`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Confirmation email sent to:", email);
    } catch (emailErr) {
      console.error("❌ Failed to send confirmation email:", emailErr);
    }

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error("🔥 Error saving reminder:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
