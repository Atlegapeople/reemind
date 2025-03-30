import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { email } = await req.json();
  console.log("📨 Received request to send code to:", email);

  if (!email) {
    return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const client = await clientPromise;
  const db = client.db("reemind");

  console.log("💾 Saving code to DB...");
  await db.collection("login_codes").insertOne({ email, code, expiresAt, used: false });
  console.log("✅ Code saved:", code);

  // 🛠 Local MailDev SMTP config
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: "noreply@reemind.local",
    to: email,
    subject: "Your Reemind verification code",
    text: `Your verification code is: ${code}`,
  };

  try {
    console.log("📤 Sending email using MailDev...");
    await transporter.sendMail(mailOptions);
    console.log("✅ Email 'sent' to:", email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return NextResponse.json({ success: false, error: "Failed to send code" }, { status: 500 });
  }
}
