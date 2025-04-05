import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  try {
    // Send email using Resend
    await resend.emails.send({
      from: 'Reemind <onboarding@resend.dev>',
      to: [email],
      subject: "Your Reemind verification code",
      text: `Your verification code is: ${code}`,
    });

    console.log("✅ Email 'sent' to:", email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return NextResponse.json({ success: false, error: "Failed to send code" }, { status: 500 });
  }
}
