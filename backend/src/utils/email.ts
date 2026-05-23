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

export async function sendWinnerEmail(params: {
  toEmail: string;
  bidderName: string;
  tenderTitle: string;
  rank: number;
  combinedScore: number;
  bidAmount: number;
  totalBidders: number;
  allBids: {
    rank: number | null;
    bidderName: string;
    bidAmount: number;
    avgTechnicalScore: number | null;
    financialScore: number | null;
    combinedScore: number | null;
    status: string;
    isWinner: boolean;
  }[];
  pdfBuffer: Buffer;
  resultsUrl: string;
}): Promise<void> {
  const {
    toEmail,
    bidderName,
    tenderTitle,
    combinedScore,
    bidAmount,
    totalBidders,
    allBids,
    pdfBuffer,
    resultsUrl,
  } = params;

  const formatScore = (score: number | null): string =>
    score !== null ? score.toFixed(2) : "—";

  const formatAmount = (amount: number): string =>
    amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rankingRows = allBids
    .map((bid, index) => {
      const isWinnerRow = bid.isWinner;
      const bgColor = isWinnerRow
        ? "#f0fdf4"
        : index % 2 === 0
          ? "#ffffff"
          : "#f8fafc";
      const borderLeft = isWinnerRow ? "3px solid #16a34a" : "3px solid transparent";
      return `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; border-left: ${borderLeft}; font-size: 13px; color: #334155; text-align: center; font-weight: ${isWinnerRow ? "700" : "400"};">${bid.rank !== null ? `#${bid.rank}` : "—"}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; font-weight: ${isWinnerRow ? "700" : "400"};">${bid.bidderName}${isWinnerRow ? ' <span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 6px;">WINNER</span>' : ""}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: right;">${formatAmount(bid.bidAmount)} ETB</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: center;">${formatScore(bid.avgTechnicalScore)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: center;">${formatScore(bid.financialScore)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: center; font-weight: 600;">${formatScore(bid.combinedScore)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;"><span style="background: ${bid.status === "QUALIFIED" || bid.status === "WINNER" ? "#dcfce7" : "#fef2f2"}; color: ${bid.status === "QUALIFIED" || bid.status === "WINNER" ? "#15803d" : "#dc2626"}; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">${bid.status}</span></td>
        </tr>`;
    })
    .join("");

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
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 700px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%); padding: 40px 40px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 12px;">🏆</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Congratulations!</h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">Your Bid Has Been Selected</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">Dear <strong>${bidderName}</strong>,</p>
                  <p style="margin: 0 0 28px 0; color: #64748b; font-size: 15px; line-height: 1.7;">
                    We are pleased to inform you that your bid for <strong style="color: #334155;">${tenderTitle}</strong> has been selected as the winning bid.
                  </p>

                  <!-- Your Result Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; border: 2px solid #16a34a; border-radius: 10px; overflow: hidden;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px 24px;">
                        <p style="margin: 0 0 16px 0; color: #15803d; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">🏅 Your Result</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="25%" style="text-align: center; padding: 8px;">
                              <p style="margin: 0; color: #15803d; font-size: 24px; font-weight: 800;">🥇 #1</p>
                              <p style="margin: 4px 0 0 0; color: #16a34a; font-size: 11px; font-weight: 600; text-transform: uppercase;">Rank</p>
                            </td>
                            <td width="25%" style="text-align: center; padding: 8px; border-left: 1px solid #bbf7d0;">
                              <p style="margin: 0; color: #15803d; font-size: 24px; font-weight: 800;">${combinedScore.toFixed(2)}</p>
                              <p style="margin: 4px 0 0 0; color: #16a34a; font-size: 11px; font-weight: 600; text-transform: uppercase;">Combined Score</p>
                            </td>
                            <td width="25%" style="text-align: center; padding: 8px; border-left: 1px solid #bbf7d0;">
                              <p style="margin: 0; color: #15803d; font-size: 20px; font-weight: 800;">${formatAmount(bidAmount)}</p>
                              <p style="margin: 4px 0 0 0; color: #16a34a; font-size: 11px; font-weight: 600; text-transform: uppercase;">Bid Amount (ETB)</p>
                            </td>
                            <td width="25%" style="text-align: center; padding: 8px; border-left: 1px solid #bbf7d0;">
                              <p style="margin: 0; color: #15803d; font-size: 24px; font-weight: 800;">${totalBidders}</p>
                              <p style="margin: 4px 0 0 0; color: #16a34a; font-size: 11px; font-weight: 600; text-transform: uppercase;">Participants</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Full Ranking Table -->
                  <p style="margin: 0 0 12px 0; color: #334155; font-size: 15px; font-weight: 700;">📋 Full Ranking</p>
                  <div style="overflow-x: auto; margin-bottom: 32px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; min-width: 600px;">
                      <thead>
                        <tr style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Rank</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Bidder</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Bid Amount</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Tech Score</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Financial</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Combined</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rankingRows}
                      </tbody>
                    </table>
                  </div>

                  <!-- Next Steps -->
                  <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 20px 24px; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 700;">📌 Next Steps</p>
                    <p style="margin: 0; color: #a16207; font-size: 14px; line-height: 1.6;">
                      Please log in to the system to view full details and prepare for contract proceedings.
                    </p>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 8px 0 16px 0;">
                        <a href="${resultsUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                          View Full Results
                        </a>
                      </td>
                    </tr>
                  </table>
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
    subject: `🏆 Congratulations — Your Bid Won! — ${tenderTitle}`,
    html: htmlContent,
    attachments: [
      {
        filename: `Tender_Results_${tenderTitle.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`📧 Winner notification email sent to ${toEmail}`);
}

export async function sendNonSelectedEmail(params: {
  toEmail: string;
  bidderName: string;
  tenderTitle: string;
  yourRank: number | null;
  yourScore: number | null;
  totalBidders: number;
  allBids: {
    rank: number | null;
    bidderName: string;
    bidAmount: number;
    avgTechnicalScore: number | null;
    financialScore: number | null;
    combinedScore: number | null;
    status: string;
    isWinner: boolean;
  }[];
  pdfBuffer: Buffer;
  resultsUrl: string;
  debriefingUrl: string;
}): Promise<void> {
  const {
    toEmail,
    bidderName,
    tenderTitle,
    yourRank,
    yourScore,
    totalBidders,
    allBids,
    pdfBuffer,
    resultsUrl,
    debriefingUrl,
  } = params;

  const formatScore = (score: number | null): string =>
    score !== null ? score.toFixed(2) : "—";

  const formatAmount = (amount: number): string =>
    amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rankingRows = allBids
    .map((bid, index) => {
      const isCurrentBidder = bid.bidderName === bidderName;
      const isWinnerRow = bid.isWinner;
      let bgColor: string;
      let borderLeft: string;
      if (isCurrentBidder) {
        bgColor = "#eff6ff";
        borderLeft = "3px solid #2563eb";
      } else if (isWinnerRow) {
        bgColor = "#f0fdf4";
        borderLeft = "3px solid #16a34a";
      } else {
        bgColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
        borderLeft = "3px solid transparent";
      }
      return `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; border-left: ${borderLeft}; font-size: 13px; color: #334155; text-align: center; font-weight: ${isCurrentBidder || isWinnerRow ? "700" : "400"};">${bid.rank !== null ? `#${bid.rank}` : "—"}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; font-weight: ${isCurrentBidder || isWinnerRow ? "700" : "400"};">${bid.bidderName}${isWinnerRow ? ' <span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 6px;">WINNER</span>' : ""}${isCurrentBidder && !isWinnerRow ? ' <span style="background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 6px;">YOU</span>' : ""}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: right;">${formatAmount(bid.bidAmount)} ETB</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: center;">${formatScore(bid.avgTechnicalScore)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: center;">${formatScore(bid.financialScore)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: center; font-weight: 600;">${formatScore(bid.combinedScore)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;"><span style="background: ${bid.status === "QUALIFIED" || bid.status === "WINNER" ? "#dcfce7" : "#fef2f2"}; color: ${bid.status === "QUALIFIED" || bid.status === "WINNER" ? "#15803d" : "#dc2626"}; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">${bid.status}</span></td>
        </tr>`;
    })
    .join("");

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
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 700px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 40px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Tender Evaluation Results</h1>
                  <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 15px; font-weight: 500;">${tenderTitle}</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">Dear <strong>${bidderName}</strong>,</p>
                  <p style="margin: 0 0 28px 0; color: #64748b; font-size: 15px; line-height: 1.7;">
                    The evaluation for <strong style="color: #334155;">${tenderTitle}</strong> has been completed. Below are the detailed results.
                  </p>

                  <!-- Your Position Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; border: 2px solid #2563eb; border-radius: 10px; overflow: hidden;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px 24px;">
                        <p style="margin: 0 0 16px 0; color: #1d4ed8; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">📌 Your Position</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="33%" style="text-align: center; padding: 8px;">
                              <p style="margin: 0; color: #1e40af; font-size: 24px; font-weight: 800;">${yourRank !== null ? `#${yourRank}` : "—"}</p>
                              <p style="margin: 4px 0 0 0; color: #2563eb; font-size: 11px; font-weight: 600; text-transform: uppercase;">Your Rank</p>
                            </td>
                            <td width="33%" style="text-align: center; padding: 8px; border-left: 1px solid #bfdbfe;">
                              <p style="margin: 0; color: #1e40af; font-size: 24px; font-weight: 800;">${yourScore !== null ? yourScore.toFixed(2) : "—"}</p>
                              <p style="margin: 4px 0 0 0; color: #2563eb; font-size: 11px; font-weight: 600; text-transform: uppercase;">Your Combined Score</p>
                            </td>
                            <td width="33%" style="text-align: center; padding: 8px; border-left: 1px solid #bfdbfe;">
                              <p style="margin: 0; color: #1e40af; font-size: 24px; font-weight: 800;">${totalBidders}</p>
                              <p style="margin: 4px 0 0 0; color: #2563eb; font-size: 11px; font-weight: 600; text-transform: uppercase;">Total Participants</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Full Ranking Table -->
                  <p style="margin: 0 0 12px 0; color: #334155; font-size: 15px; font-weight: 700;">📋 Full Ranking</p>
                  <div style="overflow-x: auto; margin-bottom: 32px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; min-width: 600px;">
                      <thead>
                        <tr style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Rank</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Bidder</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Bid Amount</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Tech Score</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Financial</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Combined</th>
                          <th style="padding: 12px; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rankingRows}
                      </tbody>
                    </table>
                  </div>

                  <!-- Debriefing Section -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px; font-weight: 700;">💬 Request a Debriefing</p>
                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                      You have the right to request a detailed debriefing on the evaluation of your bid.
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <a href="${debriefingUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                            Request Debriefing
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 8px 0 16px 0;">
                        <a href="${resultsUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                          View Full Results
                        </a>
                      </td>
                    </tr>
                  </table>
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
    subject: `📊 Tender Evaluation Results — ${tenderTitle}`,
    html: htmlContent,
    attachments: [
      {
        filename: `Tender_Results_${tenderTitle.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`📧 Non-selected notification email sent to ${toEmail}`);
}

export async function sendEmailVerificationEmail(
  toEmail: string,
  fullName: string,
  verificationUrl: string
): Promise<void> {
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
                <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 40px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 12px;">✉️</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Verify Your Email</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${fullName}</strong>,</p>
                  <p style="margin: 0 0 24px 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                    Thank you for registering with TenderETH. Please verify your email address to complete your registration and activate your account.
                  </p>
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 8px 0 32px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 24px 0; padding: 12px 16px; background-color: #f1f5f9; border-radius: 8px; word-break: break-all;">
                    <a href="${verificationUrl}" style="color: #2563eb; text-decoration: none; font-size: 13px;">${verificationUrl}</a>
                  </p>
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                      ⏰ This link expires in <strong style="color: #64748b;">24 hours</strong>.<br>
                      🔒 If you didn't create an account, you can safely ignore this email.
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
    subject: "✉️ Verify Your Email — TenderETH",
    html: htmlContent,
  });

  console.log(`📧 Verification email sent to ${toEmail}`);
}

export async function sendInvitationEmail(params: {
  toEmail: string;
  fullName: string;
  role: string;
  invitedByName: string;
  invitationUrl: string;
}): Promise<void> {
  const { toEmail, fullName, role, invitedByName, invitationUrl } = params;

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
                <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 40px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">You're Invited!</h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">Join TenderETH as ${role}</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${fullName}</strong>,</p>
                  <p style="margin: 0 0 28px 0; color: #64748b; font-size: 15px; line-height: 1.7;">
                    You've been invited by <strong style="color: #334155;">${invitedByName}</strong> to join TenderETH as <strong style="color: #334155;">${role}</strong>. Set up your password to get started.
                  </p>

                  <!-- Invitation Details Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; border: 2px solid #7c3aed; border-radius: 10px; overflow: hidden;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); padding: 20px 24px;">
                        <p style="margin: 0 0 16px 0; color: #6d28d9; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">📋 Invitation Details</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="50%" style="text-align: center; padding: 8px;">
                              <p style="margin: 0; color: #6d28d9; font-size: 20px; font-weight: 800;">${role}</p>
                              <p style="margin: 4px 0 0 0; color: #7c3aed; font-size: 11px; font-weight: 600; text-transform: uppercase;">Role Assigned</p>
                            </td>
                            <td width="50%" style="text-align: center; padding: 8px; border-left: 1px solid #c4b5fd;">
                              <p style="margin: 0; color: #6d28d9; font-size: 20px; font-weight: 800;">${invitedByName}</p>
                              <p style="margin: 4px 0 0 0; color: #7c3aed; font-size: 11px; font-weight: 600; text-transform: uppercase;">Invited By</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 8px 0 32px 0;">
                        <a href="${invitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(109, 40, 217, 0.3);">
                          Accept Invitation & Set Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 24px 0; padding: 12px 16px; background-color: #f1f5f9; border-radius: 8px; word-break: break-all;">
                    <a href="${invitationUrl}" style="color: #7c3aed; text-decoration: none; font-size: 13px;">${invitationUrl}</a>
                  </p>
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                      ⏰ This invitation expires in <strong style="color: #64748b;">48 hours</strong>.<br>
                      🔒 If you weren't expecting this invitation, please contact the administrator.
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
    subject: "🎉 You've Been Invited to TenderETH",
    html: htmlContent,
  });

  console.log(`📧 Invitation email sent to ${toEmail}`);
}
