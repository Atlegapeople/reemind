export const VerificationEmail = ({ code, email }: { code: string; email: string }) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Verify Your Email - Reemind</title>
        <style type="text/css">
          /* Base styles */
          body {
            margin: 0;
            padding: 0;
            min-width: 100%;
            background-color: #f4f4f4;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #333333;
          }
          table {
            border-spacing: 0;
            border-collapse: collapse;
          }
          td {
            padding: 0;
          }
          .content {
            width: 100%;
            max-width: 600px;
          }
          .header {
            padding: 20px 0;
            text-align: center;
          }
          .logo {
            color: #227C9D;
            font-size: 24px;
            font-weight: bold;
            text-decoration: none;
          }
          .card {
            background: #ffffff;
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .code {
            background: #F0F9FF;
            color: #227C9D;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666666;
            font-size: 14px;
            margin-top: 30px;
          }
          .divider {
            border-top: 1px solid #eeeeee;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table align="center" cellpadding="0" cellspacing="0" border="0" class="content">
                <tr>
                  <td class="header">
                    <a href="https://reemind.app" class="logo">Reemind</a>
                  </td>
                </tr>
                <tr>
                  <td class="card">
                    <h1 style="color: #227C9D; margin: 0 0 20px 0;">Verify Your Email</h1>
                    
                    <p>Hello,</p>
                    
                    <p>Thank you for signing up with Reemind! To complete your registration, please use the following verification code:</p>
                    
                    <div class="code">${code}</div>
                    
                    <p>This code will expire in 10 minutes. If you didn't request this verification, you can safely ignore this email.</p>
                    
                    <div class="divider"></div>
                    
                    <p style="margin: 0;">Best regards,<br>The Reemind Team</p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    <p>© ${new Date().getFullYear()} Reemind. All rights reserved.</p>
                    <p>This email was sent to ${email}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}; 