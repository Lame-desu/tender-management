import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Online Tender Management System", 14, 20);
  doc.setFontSize(13);
  doc.text(title, 14, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const genDate = `Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}`;
  doc.text(genDate, 14, 37);
  if (subtitle) doc.text(subtitle, 14, 43);
  doc.setTextColor(0);
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  }
}

function dateName() {
  return format(new Date(), "yyyy-MM-dd");
}

export function exportTenderSummaryPDF(
  data: {
    summary: { totalTenders: number; byStatus: Record<string, number>; byCategory: Record<string, number> };
    tenders: { title: string; category: string; status: string; totalBids: number; winnerName: string | null; winnerAmount: number | null; createdByName: string }[];
  },
  filters: { status?: string; category?: string; startDate?: string; endDate?: string }
) {
  const doc = new jsPDF();
  const filterParts = [];
  if (filters.status) filterParts.push(`Status: ${filters.status}`);
  if (filters.category) filterParts.push(`Category: ${filters.category}`);
  if (filters.startDate) filterParts.push(`From: ${filters.startDate}`);
  if (filters.endDate) filterParts.push(`To: ${filters.endDate}`);

  addHeader(doc, "Tender Summary Report", filterParts.length ? filterParts.join(" | ") : undefined);

  let y = filterParts.length ? 50 : 44;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Tenders: ${data.summary.totalTenders}`, 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`By Status: ${Object.entries(data.summary.byStatus).map(([k, v]) => `${k}: ${v}`).join(", ")}`, 14, y);
  y += 6;
  doc.text(`By Category: ${Object.entries(data.summary.byCategory).map(([k, v]) => `${k}: ${v}`).join(", ")}`, 14, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Title", "Category", "Status", "Bids", "Winner", "Amount"]],
    body: data.tenders.map((t) => [
      t.title, t.category, t.status, String(t.totalBids),
      t.winnerName || "—", t.winnerAmount ? `ETB ${t.winnerAmount.toLocaleString()}` : "—",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  addFooter(doc);
  doc.save(`Tender_Summary_Report_${dateName()}.pdf`);
}

export function exportBidEvaluationPDF(data: {
  tender: { title: string; category: string; evaluationCriteria: { name: string; weight: number }[]; technicalWeight: number; financialWeight: number; minimumTechnicalScore: number };
  committee: { name: string; email: string }[];
  bids: {
    bidderName: string; bidAmount: number; status: string;
    technicalScores: { evaluatorName: string; criteriaScores: { criteriaName: string; score: number }[]; totalScore: number; remarks: string | null }[];
    avgTechnicalScore: number | null; isQualified: boolean | null; financialScore: number | null; combinedScore: number | null; rank: number | null; isWinner: boolean;
  }[];
}) {
  const doc = new jsPDF();
  addHeader(doc, "Bid Evaluation Report", `Tender: ${data.tender.title}`);

  let y = 50;
  doc.setFontSize(9);
  doc.text(`Category: ${data.tender.category} | Tech Weight: ${data.tender.technicalWeight}% | Financial Weight: ${data.tender.financialWeight}% | Min Tech Score: ${data.tender.minimumTechnicalScore}`, 14, y);
  y += 7;
  doc.text(`Committee: ${data.committee.map((c) => c.name).join(", ")}`, 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Evaluation Criteria", 14, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    head: [["Criterion", "Weight"]],
    body: data.tender.evaluationCriteria.map((c) => [c.name, `${c.weight}`]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [52, 73, 94] },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Final Ranking", 14, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    head: [["Rank", "Bidder", "Bid Amount", "Avg Tech Score", "Financial Score", "Combined Score", "Status"]],
    body: data.bids
      .filter((b) => b.rank !== null)
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
      .map((b) => [
        b.rank ? `#${b.rank}` : "—",
        b.bidderName + (b.isWinner ? " ★" : ""),
        `ETB ${b.bidAmount.toLocaleString()}`,
        b.avgTechnicalScore?.toFixed(1) ?? "—",
        b.financialScore?.toFixed(1) ?? "—",
        b.combinedScore?.toFixed(1) ?? "—",
        b.status.replace(/_/g, " "),
      ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  addFooter(doc);
  doc.save(`Bid_Evaluation_Report_${data.tender.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)}_${dateName()}.pdf`);
}

export function exportProcurementActivityPDF(data: {
  period: { startDate: string; endDate: string };
  tendersCreated: number; tendersPublished: number; tendersAwarded: number; tendersCancelled: number;
  totalBidsReceived: number; averageBidsPerTender: number;
  tenders: { title: string; category: string; status: string; bidsCount: number; awardedTo: string | null; awardAmount: number | null }[];
}) {
  const doc = new jsPDF();
  addHeader(doc, "Procurement Activity Report", `Period: ${data.period.startDate} to ${data.period.endDate}`);

  let y = 50;
  doc.setFontSize(9);
  const stats = [
    `Created: ${data.tendersCreated}`, `Published: ${data.tendersPublished}`,
    `Awarded: ${data.tendersAwarded}`, `Cancelled: ${data.tendersCancelled}`,
    `Total Bids: ${data.totalBidsReceived}`, `Avg Bids/Tender: ${data.averageBidsPerTender}`,
  ];
  doc.text(stats.join(" | "), 14, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Title", "Category", "Status", "Bids", "Awarded To", "Amount"]],
    body: data.tenders.map((t) => [
      t.title, t.category, t.status, String(t.bidsCount),
      t.awardedTo || "—", t.awardAmount ? `ETB ${t.awardAmount.toLocaleString()}` : "—",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  addFooter(doc);
  doc.save(`Procurement_Activity_Report_${dateName()}.pdf`);
}

export function exportBidderParticipationPDF(data: {
  bidders: { bidderName: string; bidderType: string; totalBids: number; wonBids: number; tenders: { tenderTitle: string; bidAmount: number; status: string }[] }[];
}) {
  const doc = new jsPDF();
  addHeader(doc, "Bidder Participation Report");

  autoTable(doc, {
    startY: 44,
    head: [["Bidder", "Type", "Total Bids", "Won", "Win Rate"]],
    body: data.bidders.map((b) => [
      b.bidderName, b.bidderType, String(b.totalBids), String(b.wonBids),
      b.totalBids > 0 ? `${((b.wonBids / b.totalBids) * 100).toFixed(0)}%` : "0%",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  addFooter(doc);
  doc.save(`Bidder_Participation_Report_${dateName()}.pdf`);
}

export function exportBidOpeningRecordPDF(data: {
  tenderTitle: string; openingDate: string | null; totalBids: number;
  bids: { bidderName: string; bidAmount: number; bidSecurityProvided: boolean; submissionDate: string; documentCount: number }[];
}) {
  const doc = new jsPDF();
  addHeader(doc, "Bid Opening Record", `Tender: ${data.tenderTitle}`);

  let y = 50;
  doc.setFontSize(9);
  doc.text(`Opening Date: ${data.openingDate ? format(new Date(data.openingDate), "MMM d, yyyy HH:mm") : "N/A"} | Total Bids: ${data.totalBids}`, 14, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Bidder", "Bid Amount", "Bid Security", "Submitted", "Documents"]],
    body: data.bids.map((b) => [
      b.bidderName, `ETB ${b.bidAmount.toLocaleString()}`,
      b.bidSecurityProvided ? "Provided" : "Not provided",
      format(new Date(b.submissionDate), "MMM d, yyyy HH:mm"),
      String(b.documentCount),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  addFooter(doc);
  doc.save(`Bid_Opening_Record_${data.tenderTitle.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)}_${dateName()}.pdf`);
}

export function exportAuditTrailPDF(data: {
  logs: { timestamp: string; userName: string; action: string; entityType: string | null; entityId: number | null; ipAddress: string | null }[];
}, dateRange?: { startDate: string; endDate: string }) {
  const doc = new jsPDF();
  addHeader(doc, "Audit Trail Report", dateRange ? `Period: ${dateRange.startDate} to ${dateRange.endDate}` : undefined);

  autoTable(doc, {
    startY: dateRange ? 50 : 44,
    head: [["Timestamp", "User", "Action", "Entity", "IP Address"]],
    body: data.logs.map((l) => [
      format(new Date(l.timestamp), "MMM d, yyyy HH:mm"),
      l.userName, l.action,
      l.entityType ? `${l.entityType} #${l.entityId}` : "—",
      l.ipAddress || "—",
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  addFooter(doc);
  doc.save(`Audit_Trail_Report_${dateName()}.pdf`);
}
