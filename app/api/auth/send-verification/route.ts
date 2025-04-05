import { NextResponse } from "next/server";
import { VerificationEmail } from "@/components/email/VerificationEmail";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create email content using the template
    const html = VerificationEmail({ code, email });

    // Send email using Resend
    await resend.emails.send({
      from: 'Reemind <onboarding@resend.dev>',
      to: [email],
      subject: "Your Reemind verification code",
      html: html,
      text: `Your verification code is: ${code}`,
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