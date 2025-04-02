import { NextResponse } from "next/server";
import { VerificationEmail } from "@/components/email/VerificationEmail";
import nodemailer from "nodemailer";

// Create a transporter for MailDev
const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create email content using the template
    const html = VerificationEmail({ code, email });

    // Send email
    await transporter.sendMail({
      from: '"Reemind" <noreply@reemind.app>',
      to: email,
      subject: "Your Reemind verification code",
      html: html,
      text: `Your verification code is: ${code}`,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'MIME-Version': '1.0'
      }
    });

    // Store the code in memory (in production, you'd want to use a database)
    // For now, we'll just return it
    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
} 