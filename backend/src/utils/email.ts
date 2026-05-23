import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string
): Promise<null> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">TenderETH</h1>
                  <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">Password Reset Request</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">Hello,</p>
                  <p style="margin: 0 0 24px 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                    We received a request to reset the password for your account. Click the button below to set a new password:
                  </p>
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 8px 0 32px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 24px 0; padding: 12px 16px; background-color: #f1f5f9; border-radius: 8px; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #2563eb; text-decoration: none; font-size: 13px;">${resetUrl}</a>
                  </p>
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                      ⏰ This link expires in <strong style="color: #64748b;">1 hour</strong>.<br>
                      🔒 If you didn't request this, you can safely ignore this email.
                    </p>
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} TenderETH — Online Tender Management System
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"TenderETH System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Password Reset — TenderETH",
    html: htmlContent,
  });

  console.log(`📧 Password reset email sent to ${toEmail}`);

  // Return null — the user will find the link in their real inbox
  return null;
}
