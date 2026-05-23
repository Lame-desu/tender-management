import PDFDocument from "pdfkit";

interface EvaluationCriterion {
  name: string;
  weight: number;
}

interface CommitteeMember {
  name: string;
}

interface BidEntry {
  rank: number | null;
  bidderName: string;
  bidAmount: number;
  avgTechnicalScore: number | null;
  financialScore: number | null;
  combinedScore: number | null;
  status: string;
  isWinner: boolean;
}

interface TenderResultsData {
  tenderTitle: string;
  category: string;
  technicalWeight: number;
  financialWeight: number;
  minimumTechnicalScore: number;
  evaluationCriteria: EvaluationCriterion[];
  committee: CommitteeMember[];
  bids: BidEntry[];
}

const COLORS = {
  headerBg: "#1e293b",
  tableHeader: "#334155",
  bodyText: "#334155",
  mutedText: "#64748b",
  lightBorder: "#cbd5e1",
  winnerBg: "#dcfce7",
  white: "#ffffff",
  pageBg: "#f8fafc",
} as const;

function formatETB(amount: number): string {
  return `ETB ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatScore(value: number | null): string {
  return value !== null ? value.toFixed(2) : "—";
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.substring(0, maxLen - 1) + "…" : text;
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  widths: number[],
  height: number,
  values: string[],
  options: {
    isHeader?: boolean;
    isWinner?: boolean;
    fontSize?: number;
    align?: ("left" | "center" | "right")[];
  } = {}
) {
  const { isHeader = false, isWinner = false, fontSize = 9 } = options;
  const aligns = options.align || values.map(() => "left" as const);

  const bgColor = isHeader
    ? COLORS.tableHeader
    : isWinner
      ? COLORS.winnerBg
      : COLORS.white;
  const textColor = isHeader ? COLORS.white : COLORS.bodyText;

  let cx = x;
  for (let i = 0; i < widths.length; i++) {
    doc
      .rect(cx, y, widths[i], height)
      .fillAndStroke(bgColor, COLORS.lightBorder);

    const padding = 6;
    const textX = cx + padding;
    const textW = widths[i] - padding * 2;
    const textY = y + (height - fontSize) / 2;

    doc
      .fillColor(textColor)
      .font(isHeader ? "Helvetica-Bold" : "Helvetica")
      .fontSize(fontSize)
      .text(values[i] || "", textX, textY, {
        width: textW,
        align: aligns[i],
        lineBreak: false,
      });

    cx += widths[i];
  }
}

function drawSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  y: number,
  pageWidth: number,
  margin: number
): number {
  doc
    .fillColor(COLORS.headerBg)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(title, margin, y);

  const lineY = y + 18;
  doc
    .strokeColor(COLORS.headerBg)
    .lineWidth(1.5)
    .moveTo(margin, lineY)
    .lineTo(pageWidth - margin, lineY)
    .stroke();

  return lineY + 10;
}

function checkPageBreak(
  doc: PDFKit.PDFDocument,
  y: number,
  requiredSpace: number,
  pageHeight: number,
  margin: number
): number {
  if (y + requiredSpace > pageHeight - margin - 30) {
    doc.addPage();
    return margin;
  }
  return y;
}

export async function generateTenderResultsPDF(
  data: TenderResultsData
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let totalPages = 1;

  doc.on("pageAdded", () => {
    totalPages++;
    y = margin;
  });

  // ── Header ──────────────────────────────────────────────────
  const headerHeight = 70;
  doc.rect(0, 0, pageWidth, headerHeight).fill(COLORS.headerBg);

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("TenderETH — Bid Evaluation Results Report", margin, 20, {
      width: contentWidth,
    });

  doc
    .fillColor("#94a3b8")
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      margin,
      48,
      { width: contentWidth }
    );

  y = headerHeight + 25;

  // ── Tender Information ──────────────────────────────────────
  y = drawSectionTitle(doc, "Tender Information", y, pageWidth, margin);

  const infoItems = [
    ["Title", data.tenderTitle],
    ["Category", data.category],
    ["Technical Weight", `${data.technicalWeight}%`],
    ["Financial Weight", `${data.financialWeight}%`],
    ["Minimum Technical Score", `${data.minimumTechnicalScore}%`],
  ];

  for (const [label, value] of infoItems) {
    doc
      .fillColor(COLORS.mutedText)
      .font("Helvetica")
      .fontSize(9)
      .text(`${label}:`, margin + 5, y, { continued: true, width: 160 });

    doc
      .fillColor(COLORS.bodyText)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(`  ${value}`, { width: contentWidth - 170 });

    y += 18;
  }

  y += 10;

  // ── Evaluation Criteria ─────────────────────────────────────
  y = checkPageBreak(
    doc,
    y,
    60 + data.evaluationCriteria.length * 26,
    pageHeight,
    margin
  );
  y = drawSectionTitle(doc, "Evaluation Criteria", y, pageWidth, margin);

  const criteriaWidths = [contentWidth * 0.7, contentWidth * 0.3];
  const criteriaRowH = 26;

  drawTableRow(doc, margin, y, criteriaWidths, criteriaRowH, ["Criterion Name", "Weight (%)"], {
    isHeader: true,
    align: ["left", "center"],
  });
  y += criteriaRowH;

  for (const criterion of data.evaluationCriteria) {
    y = checkPageBreak(doc, y, criteriaRowH, pageHeight, margin);
    drawTableRow(
      doc,
      margin,
      y,
      criteriaWidths,
      criteriaRowH,
      [criterion.name, `${criterion.weight}%`],
      { align: ["left", "center"] }
    );
    y += criteriaRowH;
  }

  y += 15;

  // ── Committee Members ───────────────────────────────────────
  y = checkPageBreak(
    doc,
    y,
    40 + data.committee.length * 16,
    pageHeight,
    margin
  );
  y = drawSectionTitle(doc, "Evaluation Committee", y, pageWidth, margin);

  for (let i = 0; i < data.committee.length; i++) {
    y = checkPageBreak(doc, y, 16, pageHeight, margin);
    doc
      .fillColor(COLORS.bodyText)
      .font("Helvetica")
      .fontSize(9)
      .text(`${i + 1}. ${data.committee[i].name}`, margin + 10, y);
    y += 16;
  }

  y += 15;

  // ── Final Ranking Table ─────────────────────────────────────
  y = checkPageBreak(doc, y, 80, pageHeight, margin);
  y = drawSectionTitle(doc, "Final Ranking", y, pageWidth, margin);

  const colWidths = [
    contentWidth * 0.06,  // Rank
    contentWidth * 0.22,  // Bidder
    contentWidth * 0.18,  // Bid Amount
    contentWidth * 0.13,  // Avg Tech
    contentWidth * 0.13,  // Financial
    contentWidth * 0.14,  // Combined
    contentWidth * 0.14,  // Status
  ];
  const rowH = 28;

  drawTableRow(
    doc,
    margin,
    y,
    colWidths,
    rowH,
    ["#", "Bidder", "Bid Amount", "Tech Score", "Fin. Score", "Combined", "Status"],
    {
      isHeader: true,
      fontSize: 8,
      align: ["center", "left", "right", "center", "center", "center", "center"],
    }
  );
  y += rowH;

  const sortedBids = [...data.bids].sort((a, b) => {
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
    if (a.rank !== null) return -1;
    if (b.rank !== null) return 1;
    return 0;
  });

  for (const bid of sortedBids) {
    y = checkPageBreak(doc, y, rowH, pageHeight, margin);

    const bidderDisplay = bid.isWinner
      ? `★ ${truncate(bid.bidderName, 22)}`
      : truncate(bid.bidderName, 24);

    drawTableRow(
      doc,
      margin,
      y,
      colWidths,
      rowH,
      [
        bid.rank !== null ? String(bid.rank) : "—",
        bidderDisplay,
        formatETB(bid.bidAmount),
        formatScore(bid.avgTechnicalScore),
        formatScore(bid.financialScore),
        formatScore(bid.combinedScore),
        bid.status,
      ],
      {
        isWinner: bid.isWinner,
        fontSize: 8,
        align: ["center", "left", "right", "center", "center", "center", "center"],
      }
    );
    y += rowH;
  }

  // Add footers to all pages at the end
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fillColor(COLORS.mutedText)
      .font("Helvetica")
      .fontSize(8)
      .text(
        "TenderETH — Online Tender Management System",
        margin,
        pageHeight - 35,
        { width: contentWidth, align: "center", lineBreak: false }
      )
      .text(`Page ${i + 1} of ${range.count}`, margin, pageHeight - 35, {
        width: contentWidth,
        align: "right",
        lineBreak: false,
      });
    // Reset cursor to top to prevent PDFKit from auto-creating new pages
    doc.y = margin;
  }

  // Ensure we end on the last content page
  doc.switchToPage(range.start + range.count - 1);
  doc.flushPages();
  doc.end();
  return pdfPromise;
}
