"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText, ClipboardCheck, BarChart3, Users, Loader2, Download, ArrowLeft,
} from "lucide-react";
import api from "@/lib/api";
import { Tender } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  exportTenderSummaryPDF,
  exportBidEvaluationPDF,
  exportProcurementActivityPDF,
  exportBidderParticipationPDF,
} from "@/lib/pdf-export";

type ReportType = null | "tender-summary" | "bid-evaluation" | "procurement-activity" | "bidder-participation";

export default function ReportsPage() {
  const [active, setActive] = useState<ReportType>(null);

  if (active) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Reports
        </Button>
        {active === "tender-summary" && <TenderSummaryReport />}
        {active === "bid-evaluation" && <BidEvaluationReport />}
        {active === "procurement-activity" && <ProcurementActivityReport />}
        {active === "bidder-participation" && <BidderParticipationReport />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: "tender-summary" as const, icon: FileText, title: "Tender Summary", desc: "Overview of all tenders with status and outcomes" },
          { key: "bid-evaluation" as const, icon: ClipboardCheck, title: "Bid Evaluation", desc: "Detailed evaluation breakdown for a specific tender" },
          { key: "procurement-activity" as const, icon: BarChart3, title: "Procurement Activity", desc: "Activity summary for a specific date range" },
          { key: "bidder-participation" as const, icon: Users, title: "Bidder Participation", desc: "Bidder engagement and win rates" },
        ].map((r) => (
          <Card key={r.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActive(r.key)}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <r.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{r.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TenderSummaryReport() {
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generate, setGenerate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["report-tender-summary", status, category, startDate, endDate],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (status !== "ALL") p.set("status", status);
      if (category !== "ALL") p.set("category", category);
      if (startDate) p.set("startDate", startDate);
      if (endDate) p.set("endDate", endDate);
      return (await api.get(`/reports/tender-summary?${p}`)).data.data as {
        summary: { totalTenders: number; byStatus: Record<string, number>; byCategory: Record<string, number> };
        tenders: { id: number; title: string; category: string; status: string; publishDate: string | null; submissionDeadline: string; totalBids: number; winnerName: string | null; winnerAmount: number | null; createdByName: string }[];
      };
    },
    enabled: generate,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Tender Summary Report</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1"><Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="ALL">All</SelectItem><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="UNDER_EVALUATION">Under Evaluation</SelectItem><SelectItem value="AWARDED">Awarded</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent></Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="ALL">All</SelectItem><SelectItem value="GOODS">Goods</SelectItem><SelectItem value="WORKS">Works</SelectItem><SelectItem value="CONSULTING">Consulting</SelectItem>
          </SelectContent></Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">From</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[150px]" /></div>
        <div className="space-y-1"><Label className="text-xs">To</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[150px]" /></div>
        <Button onClick={() => setGenerate(true)}>Generate Report</Button>
      </div>

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{data.summary.totalTenders}</p></CardContent></Card>
            {Object.entries(data.summary.byStatus).map(([k, v]) => (
              <Card key={k}><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{k.replace(/_/g, " ")}</p><p className="text-2xl font-bold">{v}</p></CardContent></Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportTenderSummaryPDF(data, { status: status !== "ALL" ? status : undefined, category: category !== "ALL" ? category : undefined, startDate: startDate || undefined, endDate: endDate || undefined })}>
              <Download className="mr-2 h-4 w-4" />Export PDF
            </Button>
          </div>
          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Bids</TableHead><TableHead>Winner</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.tenders.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{t.title}</TableCell>
                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{t.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{t.totalBids}</TableCell>
                    <TableCell>{t.winnerName || "—"}</TableCell>
                    <TableCell>{t.winnerAmount ? `ETB ${t.winnerAmount.toLocaleString()}` : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function BidEvaluationReport() {
  const [tenderId, setTenderId] = useState("");
  const [generate, setGenerate] = useState(false);

  const { data: tenders } = useQuery({
    queryKey: ["awarded-tenders"],
    queryFn: async () => (await api.get("/tenders?status=AWARDED&limit=100")).data.data.tenders as Tender[],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["report-bid-eval", tenderId],
    queryFn: async () => (await api.get(`/reports/bid-evaluation/${tenderId}`)).data.data,
    enabled: generate && !!tenderId,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Bid Evaluation Report</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1 flex-1 min-w-[250px]"><Label className="text-xs">Select Tender</Label>
          <Select value={tenderId} onValueChange={setTenderId}><SelectTrigger><SelectValue placeholder="Choose a tender..." /></SelectTrigger><SelectContent>
            {tenders?.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.title}</SelectItem>)}
          </SelectContent></Select>
        </div>
        <Button onClick={() => setGenerate(true)} disabled={!tenderId}>Generate Report</Button>
      </div>
      {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {data && (
        <>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportBidEvaluationPDF(data)}>
              <Download className="mr-2 h-4 w-4" />Export PDF
            </Button>
          </div>
          <Card><CardContent className="pt-6 text-sm space-y-2">
            <p><strong>Tender:</strong> {data.tender.title}</p>
            <p><strong>Committee:</strong> {data.committee.map((c: { name: string }) => c.name).join(", ")}</p>
            <p><strong>Weights:</strong> Technical {data.tender.technicalWeight}% | Financial {data.tender.financialWeight}% | Min Score: {data.tender.minimumTechnicalScore}</p>
          </CardContent></Card>
          <div className="border rounded-lg bg-white overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Rank</TableHead><TableHead>Bidder</TableHead><TableHead>Amount</TableHead>
                <TableHead className="text-center">Tech Score</TableHead><TableHead className="text-center">Financial</TableHead>
                <TableHead className="text-center">Combined</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {[...data.bids].sort((a: { rank: number | null }, b: { rank: number | null }) => (a.rank ?? 999) - (b.rank ?? 999)).map((b: { bidId: number; bidderName: string; bidAmount: number; avgTechnicalScore: number | null; financialScore: number | null; combinedScore: number | null; rank: number | null; isWinner: boolean; status: string }) => (
                  <TableRow key={b.bidId} className={b.isWinner ? "bg-green-50" : ""}>
                    <TableCell className="font-bold">{b.rank ? `#${b.rank}` : "—"}</TableCell>
                    <TableCell className="font-medium">{b.bidderName}{b.isWinner ? " ★" : ""}</TableCell>
                    <TableCell>ETB {b.bidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{b.avgTechnicalScore?.toFixed(1) ?? "—"}</TableCell>
                    <TableCell className="text-center">{b.financialScore?.toFixed(1) ?? "—"}</TableCell>
                    <TableCell className="text-center font-semibold">{b.combinedScore?.toFixed(1) ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline">{b.status.replace(/_/g, " ")}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function ProcurementActivityReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generate, setGenerate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["report-activity", startDate, endDate],
    queryFn: async () => (await api.get(`/reports/procurement-activity?startDate=${startDate}&endDate=${endDate}`)).data.data,
    enabled: generate && !!startDate && !!endDate,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Procurement Activity Report</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1"><Label className="text-xs">From *</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[160px]" /></div>
        <div className="space-y-1"><Label className="text-xs">To *</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[160px]" /></div>
        <Button onClick={() => setGenerate(true)} disabled={!startDate || !endDate}>Generate Report</Button>
      </div>
      {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Created", value: data.tendersCreated },
              { label: "Published", value: data.tendersPublished },
              { label: "Awarded", value: data.tendersAwarded },
              { label: "Cancelled", value: data.tendersCancelled },
              { label: "Total Bids", value: data.totalBidsReceived },
              { label: "Avg Bids/Tender", value: data.averageBidsPerTender },
            ].map((s) => (
              <Card key={s.label}><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></CardContent></Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportProcurementActivityPDF(data)}>
              <Download className="mr-2 h-4 w-4" />Export PDF
            </Button>
          </div>
          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Bids</TableHead><TableHead>Awarded To</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.tenders.map((t: { title: string; category: string; status: string; bidsCount: number; awardedTo: string | null; awardAmount: number | null }, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium max-w-[200px] truncate">{t.title}</TableCell>
                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{t.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{t.bidsCount}</TableCell>
                    <TableCell>{t.awardedTo || "—"}</TableCell>
                    <TableCell>{t.awardAmount ? `ETB ${t.awardAmount.toLocaleString()}` : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function BidderParticipationReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generate, setGenerate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["report-bidder-part", startDate, endDate],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (startDate) p.set("startDate", startDate);
      if (endDate) p.set("endDate", endDate);
      return (await api.get(`/reports/bidder-participation?${p}`)).data.data as {
        bidders: { bidderName: string; bidderType: string; totalBids: number; wonBids: number; tenders: { tenderTitle: string; bidAmount: number; status: string }[] }[];
      };
    },
    enabled: generate,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Bidder Participation Report</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1"><Label className="text-xs">From</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[160px]" /></div>
        <div className="space-y-1"><Label className="text-xs">To</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[160px]" /></div>
        <Button onClick={() => setGenerate(true)}>Generate Report</Button>
      </div>
      {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {data && (
        <>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportBidderParticipationPDF(data)}>
              <Download className="mr-2 h-4 w-4" />Export PDF
            </Button>
          </div>
          <div className="border rounded-lg bg-white">
            <Table>
              <TableHeader><TableRow><TableHead>Bidder</TableHead><TableHead>Type</TableHead><TableHead>Total Bids</TableHead><TableHead>Won</TableHead><TableHead>Win Rate</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.bidders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No bidder data found.</TableCell></TableRow>
                ) : data.bidders.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{b.bidderName}</TableCell>
                    <TableCell><Badge variant="outline">{b.bidderType}</Badge></TableCell>
                    <TableCell>{b.totalBids}</TableCell>
                    <TableCell>{b.wonBids}</TableCell>
                    <TableCell>{b.totalBids > 0 ? `${((b.wonBids / b.totalBids) * 100).toFixed(0)}%` : "0%"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
