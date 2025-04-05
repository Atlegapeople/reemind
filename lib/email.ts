import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export async function sendReminderEmail({
  to,
  name,
  reminder,
  month,
  day,
}: {
  to: string;
  name: string;
  reminder: string;
  month: number;
  day: number;
}) {
  try {
    console.log("Attempting to send email with Resend...");
    console.log("Email details:", { to, name, reminder, month, day });
    console.log("Resend API Key present:", !!process.env.RESEND_API_KEY);

    const monthName = MONTHS[month - 1];
    // Convert reminder to number to ensure proper comparison
    const reminderNum = parseInt(reminder, 10);
    const reminderText = reminderNum === 1 ? "1 day" :
                        reminderNum === 3 ? "3 days" :
                        reminderNum === 7 ? "1 week" :
                        reminderNum === 14 ? "2 weeks" :
                        reminderNum === 30 ? "1 month" :
                        "some time"; // fallback

    console.log("Reminder value:", { original: reminder, parsed: reminderNum, text: reminderText });

    const data = await resend.emails.send({
      from: 'Reemind <support@reemind.app>',
      to: [to],
      subject: 'Your Reminder from Reemind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Dynalight&display=swap');
            .dynalight {
              font-family: 'Dynalight', cursive;
              font-size: 7rem;
              color: #227C9D;
              line-height: 1;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FFFFFF;">
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 32px;">            
            <h1 style="color: #227C9D; font-size: 48px; margin: 0 0 24px 0;">Hello ${to.split('@')[0]}! 🎉</h1>
            <p style="color: #333333; margin: 0 0 24px 0;">This is a friendly reminder from Reemind:</p>
            
            <div style="background: linear-gradient(to right, rgba(255,203,119,0.1), rgba(254,109,115,0.1)); border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #FFCB77;">
              <p style="font-size: 18px; color: #333333; margin: 0 0 12px 0;">You set a reminder for <span style="color: #FE6D73; font-weight: 600;">${name}'s birthday</span> on <span style="color: #227C9D; font-weight: 600;">${monthName} ${day}</span> 🎂</p>
              <p style="font-size: 16px; color: #666666; margin: 0;">You'll receive another reminder <span style="color: #17C3B2; font-weight: 600;">${reminderText}</span> <span style="color: #17C3B2;">before</span> the event. 🎈</p>
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(34,124,157,0.2);">
              <h1 class="dynalight">Reemind.</h1>
              <p style="color: #666666; font-size: 14px; margin: 0;">Helping you remember what matters most</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
} 