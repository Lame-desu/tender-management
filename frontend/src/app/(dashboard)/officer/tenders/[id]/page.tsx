"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import Link from "next/link";
import {
  Pencil, Send, XCircle, Plus, Loader2, MessageSquare, FileText, ListChecks,
  CalendarDays, Shield, CheckCircle2, Users, BarChart3, Download, ChevronDown, ChevronUp,
  Trophy, XOctagon, Award, Megaphone, Download as DownloadIcon,
} from "lucide-react";
import api from "@/lib/api";
import { Tender, TenderAddendum, Clarification, EvaluationCriteria, Bid, BidDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { exportBidOpeningRecordPDF } from "@/lib/pdf-export";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700", PUBLISHED: "bg-blue-100 text-blue-700",
  UNDER_EVALUATION: "bg-amber-100 text-amber-700", AWARDED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const bidStatusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700", OPENED: "bg-cyan-100 text-cyan-700",
  TECHNICALLY_QUALIFIED: "bg-green-100 text-green-700", TECHNICALLY_DISQUALIFIED: "bg-red-100 text-red-700",
  EVALUATED: "bg-amber-100 text-amber-700", SELECTED: "bg-green-200 text-green-800",
  NOT_SELECTED: "bg-gray-100 text-gray-600",
};

type FullTender = Tender & {
  addenda: (TenderAddendum & { issuedUser: { fullName: string } })[];
  clarifications: (Clarification & { askedUser: { id: number; fullName: string }; answeredUser?: { fullName: string } | null })[];
  createdUser: { id: number; fullName: string };
  _count: { bids: number; addenda: number; clarifications: number };
};

type BidWithOwner = Bid & {
  bidOwner: { id: number; fullName: string; bidderProfile?: { organizationName: string | null } | null };
  documents?: BidDocument[];
  _count?: { documents: number };
};

type TechStatus = {
  totalMembers: number;
  completedMembers: number;
  isComplete: boolean;
  committeeMembers: { id: number; name: string; completed: boolean }[];
  bids: {
    bidId: number; bidderName: string; avgScore: number | null;
    evaluatorScores: { evaluatorName: string; totalScore: number }[];
    isQualified: boolean | null; status: string;
  }[];
};

type FinancialBid = {
  bidId: number; bidderName: string; avgTechnicalScore: number;
  bidAmount: number; financialScore: number; combinedScore: number; rank: number;
};

type ApiErr = { response?: { data?: { message?: string } } };

export default function TenderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const tenderId = parseInt(id as string, 10);

  const [confirmAction, setConfirmAction] = useState<"publish" | "cancel" | null>(null);
  const [addendumOpen, setAddendumOpen] = useState(false);
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const { data: tender, isLoading } = useQuery({
    queryKey: ["tender", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}`)).data.data.tender as FullTender,
    enabled: !isNaN(tenderId),
  });

  const showBidsTab = tender && ["PUBLISHED", "UNDER_EVALUATION", "AWARDED"].includes(tender.status);
  const showEvalTab = tender && ["UNDER_EVALUATION", "AWARDED"].includes(tender.status);

  const actionMut = useMutation({
    mutationFn: async (action: string) => { await api.patch(`/tenders/${tenderId}/${action}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tender", tenderId] }); toast.success(confirmAction === "publish" ? "Tender published" : "Tender cancelled"); setConfirmAction(null); },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed"),
  });

  const answerMut = useMutation({
    mutationFn: async ({ clId, answer }: { clId: number; answer: string }) => { await api.patch(`/clarifications/${clId}/answer`, { answer }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tender", tenderId] }); toast.success("Clarification answered"); setAnsweringId(null); setAnswerText(""); },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed"),
  });

  if (isLoading || !tender) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const ec = tender.evaluationCriteria as EvaluationCriteria[];
  const deadlinePassed = isPast(new Date(tender.submissionDeadline));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{tender.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={statusColors[tender.status]}>{tender.status.replace(/_/g, " ")}</Badge>
            <span className="text-sm text-muted-foreground">by {tender.createdUser.fullName}</span>
            <span className="text-sm text-muted-foreground">&middot; {tender._count.bids} bids</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {tender.status === "DRAFT" && (
            <>
              <Link href={`/officer/tenders/${tender.id}/edit`}><Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Edit</Button></Link>
              <Button onClick={() => setConfirmAction("publish")}><Send className="mr-2 h-4 w-4" />Publish</Button>
            </>
          )}
          {tender.status === "PUBLISHED" && (
            <Button variant="outline" onClick={() => setAddendumOpen(true)}><Plus className="mr-2 h-4 w-4" />Issue Addendum</Button>
          )}
          {["DRAFT", "PUBLISHED"].includes(tender.status) && (
            <Button variant="destructive" onClick={() => setConfirmAction("cancel")}><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info"><FileText className="mr-1.5 h-4 w-4" />Info</TabsTrigger>
          <TabsTrigger value="addenda"><ListChecks className="mr-1.5 h-4 w-4" />Addenda ({tender._count.addenda})</TabsTrigger>
          <TabsTrigger value="clarifications"><MessageSquare className="mr-1.5 h-4 w-4" />Clarifications ({tender._count.clarifications})</TabsTrigger>
          {showBidsTab && <TabsTrigger value="bids"><FileText className="mr-1.5 h-4 w-4" />Bids ({tender._count.bids})</TabsTrigger>}
          {showEvalTab && <TabsTrigger value="evaluation"><BarChart3 className="mr-1.5 h-4 w-4" />Evaluation</TabsTrigger>}
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tender.description}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div><h3 className="font-semibold mb-1">Category</h3><Badge variant="outline">{tender.category}</Badge></div>
                <div><h3 className="font-semibold mb-1">Eligibility Criteria</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{tender.eligibilityCriteria}</p></div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Required Documents</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {tender.requiredDocuments.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Evaluation Criteria</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr><th className="text-left p-2 font-medium">Criterion</th><th className="text-right p-2 font-medium">Weight</th></tr></thead>
                    <tbody>{ec.map((c, i) => <tr key={i} className="border-t"><td className="p-2">{c.name}</td><td className="p-2 text-right">{c.weight}%</td></tr>)}</tbody>
                  </table>
                </div>
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  <p>Technical Weight: {tender.technicalWeight}% | Financial Weight: {tender.financialWeight}%</p>
                  <p>Minimum Technical Score: {tender.minimumTechnicalScore}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Clarification Deadline</p><p className="text-sm font-medium">{format(new Date(tender.clarificationDeadline), "MMM d, yyyy HH:mm")}</p></div></div>
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Submission Deadline</p><p className="text-sm font-medium">{format(new Date(tender.submissionDeadline), "MMM d, yyyy HH:mm")}</p></div></div>
              </div>
              {tender.bidSecurityRequired && (
                <><Separator /><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /><p className="text-sm">Bid Security Required: <strong>ETB {tender.bidSecurityAmount?.toLocaleString()}</strong></p></div></>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addenda Tab */}
        <TabsContent value="addenda" className="space-y-4 mt-4">
          {tender.status === "PUBLISHED" && (
            <Button onClick={() => setAddendumOpen(true)}><Plus className="mr-2 h-4 w-4" />Issue Addendum</Button>
          )}
          {!tender.addenda.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No addenda issued yet.</CardContent></Card>
          ) : tender.addenda.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base">Addendum #{a.addendumNumber}</CardTitle><span className="text-xs text-muted-foreground">{format(new Date(a.issuedDate), "MMM d, yyyy HH:mm")}</span></div></CardHeader>
              <CardContent>
                <p className="text-sm">{a.description}</p>
                {a.newDeadline && <p className="text-sm mt-2 text-primary font-medium">New deadline: {format(new Date(a.newDeadline), "MMM d, yyyy HH:mm")}</p>}
                <p className="text-xs text-muted-foreground mt-1">Issued by {a.issuedUser?.fullName}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Clarifications Tab */}
        <TabsContent value="clarifications" className="space-y-4 mt-4">
          {!tender.clarifications.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No clarification questions yet.</CardContent></Card>
          ) : tender.clarifications.map((c) => (
            <Card key={c.id} className={!c.answer ? "border-amber-200 bg-amber-50/30" : ""}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{c.askedUser?.fullName} &middot; {format(new Date(c.askedDate), "MMM d, yyyy HH:mm")}</p>
                    <p className="text-sm font-medium mt-1">{c.question}</p>
                  </div>
                  {!c.answer && <Badge variant="outline" className="bg-amber-100 text-amber-700 flex-shrink-0">Pending</Badge>}
                  {c.answer && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                </div>
                {c.answer ? (
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">Answer by {c.answeredUser?.fullName} &middot; {c.answeredDate && format(new Date(c.answeredDate), "MMM d, yyyy HH:mm")}</p>
                    <p className="text-sm">{c.answer}</p>
                  </div>
                ) : answeringId === c.id ? (
                  <div className="space-y-2">
                    <Textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Type your answer..." rows={3} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => answerMut.mutate({ clId: c.id, answer: answerText })} disabled={!answerText || answerMut.isPending}>
                        {answerMut.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}Submit Answer
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setAnsweringId(null); setAnswerText(""); }}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setAnsweringId(c.id)}>Answer</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Bids Tab */}
        {showBidsTab && (
          <TabsContent value="bids" className="space-y-4 mt-4">
            <BidsTab tenderId={tenderId} tenderStatus={tender.status} deadlinePassed={deadlinePassed} bidCount={tender._count.bids} />
          </TabsContent>
        )}

        {/* Evaluation Tab */}
        {showEvalTab && (
          <TabsContent value="evaluation" className="space-y-6 mt-4">
            <EvaluationTab tenderId={tenderId} />
          </TabsContent>
        )}
      </Tabs>

      {/* Confirm Dialog */}
      {confirmAction && (
        <Dialog open onOpenChange={() => setConfirmAction(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{confirmAction === "publish" ? "Publish Tender" : "Cancel Tender"}</DialogTitle>
              <DialogDescription>{confirmAction === "publish" ? "All registered bidders will be notified." : "This action cannot be undone."}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Back</Button>
              <Button variant={confirmAction === "cancel" ? "destructive" : "default"} onClick={() => actionMut.mutate(confirmAction)} disabled={actionMut.isPending}>
                {actionMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {confirmAction === "publish" ? "Publish" : "Cancel Tender"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AddendumDialog open={addendumOpen} onClose={() => setAddendumOpen(false)} tenderId={tenderId} onCreated={() => { qc.invalidateQueries({ queryKey: ["tender", tenderId] }); setAddendumOpen(false); }} />
    </div>
  );
}

// ─── BIDS TAB ─────────────────────────────────────────────────────────────────

function BidsTab({ tenderId, tenderStatus, deadlinePassed, bidCount }: { tenderId: number; tenderStatus: string; deadlinePassed: boolean; bidCount: number }) {
  const qc = useQueryClient();
  const [expandedBid, setExpandedBid] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: bidsData, isLoading } = useQuery({
    queryKey: ["tender-bids", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}/bids?limit=100`)).data.data as {
      bids: BidWithOwner[]; total: number; sealed?: boolean;
    },
  });

  const openMut = useMutation({
    mutationFn: async () => { await api.patch(`/tenders/${tenderId}/open-bids`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tender", tenderId] });
      qc.invalidateQueries({ queryKey: ["tender-bids", tenderId] });
      toast.success("Bids opened successfully — all bidders have been notified");
      setConfirmOpen(false);
    },
    onError: (e: ApiErr) => { toast.error(e.response?.data?.message || "Failed to open bids"); setConfirmOpen(false); },
  });

  const isSealed = bidsData?.sealed === true;
  const bids = bidsData?.bids || [];
  const total = bidsData?.total ?? bidCount;

  // State 1: Still accepting bids (deadline not passed)
  if (!deadlinePassed && tenderStatus === "PUBLISHED") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Accepting Bids</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                This tender is currently open for bid submissions. Bid details are sealed and will remain hidden until the submission deadline passes and you choose to open them.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{total} bid{total !== 1 ? "s" : ""} received so far</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State 2: Sealed — deadline passed but bids not yet opened
  if (isSealed && deadlinePassed) {
    return (
      <div className="space-y-4">
        <Card className="border-amber-200 bg-gradient-to-b from-amber-50/50 to-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-8 space-y-5">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-amber-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center">
                  <span className="text-base">🔒</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Bids Are Sealed</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                  The submission deadline has passed. <strong>{total} bid{total !== 1 ? "s have" : " has"}</strong> been received.
                  Bid details (bidder names, amounts, and documents) are hidden until you officially open them.
                </p>
              </div>

              <div className="bg-white border border-amber-200 rounded-lg p-4 w-full max-w-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bids received</span>
                  <span className="text-2xl font-bold text-amber-700">{total}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-amber-500/20 h-12 px-8"
                onClick={() => setConfirmOpen(true)}
                disabled={total === 0}
              >
                <Shield className="mr-2 h-5 w-5" />
                Open Bids
              </Button>

              <p className="text-xs text-muted-foreground max-w-sm">
                Opening bids will reveal all bid details and notify every bidder that their submissions have been opened.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        {confirmOpen && (
          <Dialog open onOpenChange={() => setConfirmOpen(false)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Open All Bids?</DialogTitle>
                <DialogDescription>
                  This will unseal all {total} bid{total !== 1 ? "s" : ""} and reveal bidder names, amounts, and documents. All bidders will be notified that their bids have been opened. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button onClick={() => openMut.mutate()} disabled={openMut.isPending}>
                  {openMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yes, Open Bids
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // State 3: Bids opened — show full table
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : bids.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No bids submitted.</CardContent></Card>
      ) : (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bidder</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bid Security</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((b) => {
                const name = b.bidOwner?.bidderProfile?.organizationName || b.bidOwner?.fullName;
                return (
                  <TableRow key={b.id} className="cursor-pointer" onClick={() => setExpandedBid(expandedBid === b.id ? null : b.id)}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>ETB {b.bidAmount.toLocaleString()}</TableCell>
                    <TableCell>{b.bidSecurityInfo ? "Provided" : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(b.submissionDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{b._count?.documents ?? b.documents?.length ?? 0}</TableCell>
                    <TableCell><Badge variant="outline" className={bidStatusColors[b.status]}>{b.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{expandedBid === b.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {expandedBid && <BidDetailPanel bidId={expandedBid} />}

      {bids.length > 0 && bids[0]?.status !== "SUBMITTED" && (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              const res = await api.get(`/reports/bid-opening/${tenderId}`);
              exportBidOpeningRecordPDF(res.data.data);
            } catch { toast.error("Failed to generate record"); }
          }}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />Download Bid Opening Record
        </Button>
      )}
    </div>
  );
}

function BidDetailPanel({ bidId }: { bidId: number }) {
  const { data: bid, isLoading } = useQuery({
    queryKey: ["bid-detail", bidId],
    queryFn: async () => (await api.get(`/bids/${bidId}`)).data.data.bid as BidWithOwner & { documents: BidDocument[] },
  });

  if (isLoading || !bid) return <Card><CardContent className="py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></CardContent></Card>;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div><p className="text-xs text-muted-foreground">Technical Proposal</p><p className="text-sm whitespace-pre-wrap mt-1">{bid.technicalProposal}</p></div>
        <Separator />
        <div>
          <p className="text-xs text-muted-foreground mb-2">Documents ({bid.documents?.length || 0})</p>
          <div className="space-y-1">
            {bid.documents?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{doc.fileName}</span><Badge variant="outline" className="text-xs">{doc.documentCategory}</Badge></div>
                <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/files/${doc.id}`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button></a>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── EVALUATION TAB ───────────────────────────────────────────────────────────

function EvaluationTab({ tenderId }: { tenderId: number }) {
  const qc = useQueryClient();

  const { data: committee, isLoading: committeeLoading } = useQuery({
    queryKey: ["committee", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}/committee`)).data.data.committee as {
      id: number; userId: number; user: { id: number; fullName: string; email: string };
      hasCompletedEvaluation: boolean;
    }[],
  });

  const { data: techStatus, isLoading: techLoading } = useQuery({
    queryKey: ["tech-status", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}/evaluation/technical/status`)).data.data as TechStatus,
    enabled: (committee?.length ?? 0) > 0,
  });

  const hasTechFinalized = techStatus?.bids.some((b) => b.isQualified !== null) ?? false;

  const { data: financialData } = useQuery({
    queryKey: ["financial", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}/evaluation/financial`)).data.data as {
      tender: { technicalWeight: number; financialWeight: number };
      bids: FinancialBid[];
    },
    enabled: hasTechFinalized,
  });

  const finalizeTechMut = useMutation({
    mutationFn: async () => { await api.patch(`/tenders/${tenderId}/evaluation/technical/finalize`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tech-status", tenderId] });
      qc.invalidateQueries({ queryKey: ["financial", tenderId] });
      qc.invalidateQueries({ queryKey: ["tender", tenderId] });
      toast.success("Technical evaluation finalized");
    },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed"),
  });

  const finalizeFinMut = useMutation({
    mutationFn: async () => { await api.patch(`/tenders/${tenderId}/evaluation/financial/finalize`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial", tenderId] });
      qc.invalidateQueries({ queryKey: ["tender", tenderId] });
      toast.success("Financial evaluation finalized");
    },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div className="space-y-6">
      {/* Step 1: Committee */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5" />Step 1: Evaluation Committee</CardTitle></CardHeader>
        <CardContent>
          {committeeLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : !committee || committee.length === 0 ? (
            <CommitteeAssignForm tenderId={tenderId} />
          ) : (
            <div className="space-y-2">
              {committee.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{m.user.fullName}</span>
                    <span className="text-xs text-muted-foreground">{m.user.email}</span>
                  </div>
                  {m.hasCompletedEvaluation
                    ? <Badge variant="outline" className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
                    : <Badge variant="outline" className="bg-amber-100 text-amber-700">Pending</Badge>
                  }
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Technical Evaluation */}
      {(committee?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5" />Step 2: Technical Evaluation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {techLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : !techStatus ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${techStatus.totalMembers > 0 ? (techStatus.completedMembers / techStatus.totalMembers) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm font-medium">{techStatus.completedMembers}/{techStatus.totalMembers} evaluators completed</span>
                </div>

                {techStatus.isComplete && techStatus.bids.length > 0 && (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bidder</TableHead>
                          {techStatus.bids[0]?.evaluatorScores.map((es) => (
                            <TableHead key={es.evaluatorName} className="text-center">{es.evaluatorName}</TableHead>
                          ))}
                          <TableHead className="text-center">Average</TableHead>
                          <TableHead className="text-center">Qualified</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {techStatus.bids.map((b) => (
                          <TableRow key={b.bidId}>
                            <TableCell className="font-medium">{b.bidderName}</TableCell>
                            {b.evaluatorScores.map((es) => (
                              <TableCell key={es.evaluatorName} className="text-center">{es.totalScore.toFixed(1)}</TableCell>
                            ))}
                            <TableCell className="text-center font-semibold">{b.avgScore?.toFixed(1) ?? "—"}</TableCell>
                            <TableCell className="text-center">
                              {b.isQualified === null ? "—" : b.isQualified
                                ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                : <XOctagon className="h-4 w-4 text-red-500 mx-auto" />
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {techStatus.isComplete && !hasTechFinalized && (
                  <Button onClick={() => finalizeTechMut.mutate()} disabled={finalizeTechMut.isPending}>
                    {finalizeTechMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Finalize Technical Evaluation
                  </Button>
                )}
                {hasTechFinalized && <Badge variant="outline" className="bg-green-100 text-green-700">Technical Evaluation Finalized</Badge>}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Financial Evaluation */}
      {hasTechFinalized && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5" />Step 3: Financial Evaluation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!financialData || financialData.bids.length === 0 ? (
              <p className="text-sm text-muted-foreground">No qualified bids for financial evaluation.</p>
            ) : (
              <>
                <FinancialRankTable bids={financialData.bids} />

                {techStatus?.bids.some((b) => b.status === "TECHNICALLY_QUALIFIED") ? (
                  <Button onClick={() => finalizeFinMut.mutate()} disabled={finalizeFinMut.isPending}>
                    {finalizeFinMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Finalize Financial Evaluation
                  </Button>
                ) : techStatus?.bids.some((b) => b.status === "EVALUATED") ? (
                  <Badge variant="outline" className="bg-green-100 text-green-700">Financial Evaluation Finalized</Badge>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Award & Publish */}
      {financialData && financialData.bids.length > 0 && (
        <AwardSection tenderId={tenderId} financialBids={financialData.bids} />
      )}
    </div>
  );
}

// ─── FINANCIAL RANK TABLE ─────────────────────────────────────────────────────

function FinancialRankTable({ bids }: { bids: FinancialBid[] }) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Bidder</TableHead>
            <TableHead className="text-center">Avg Tech Score</TableHead>
            <TableHead className="text-right">Bid Amount</TableHead>
            <TableHead className="text-center">Financial Score</TableHead>
            <TableHead className="text-center">Combined Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((b) => (
            <TableRow key={b.bidId} className={b.rank === 1 ? "bg-green-50" : ""}>
              <TableCell className="font-bold">#{b.rank}</TableCell>
              <TableCell className="font-medium">{b.bidderName} {b.rank === 1 && <Trophy className="h-3.5 w-3.5 inline text-green-600 ml-1" />}</TableCell>
              <TableCell className="text-center">{b.avgTechnicalScore.toFixed(1)}</TableCell>
              <TableCell className="text-right">ETB {b.bidAmount.toLocaleString()}</TableCell>
              <TableCell className="text-center">{b.financialScore.toFixed(1)}</TableCell>
              <TableCell className="text-center font-semibold">{b.combinedScore.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── AWARD SECTION ────────────────────────────────────────────────────────────

function AwardSection({ tenderId, financialBids }: { tenderId: number; financialBids: FinancialBid[] }) {
  const qc = useQueryClient();
  const [confirmAward, setConfirmAward] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const { data: tender } = useQuery({
    queryKey: ["tender", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}`)).data.data.tender,
  });

  const rank1 = financialBids.find((b) => b.rank === 1);
  const isAwarded = tender?.status === "AWARDED";
  const isFinancialFinalized = financialBids.some((b) => b.rank === 1);

  const hasEvaluatedBids = !isAwarded && isFinancialFinalized;

  const awardMut = useMutation({
    mutationFn: async () => { await api.patch(`/tenders/${tenderId}/award`, { winningBidId: rank1!.bidId }); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tender", tenderId] });
      qc.invalidateQueries({ queryKey: ["financial", tenderId] });
      toast.success("Tender awarded successfully");
      setConfirmAward(false);
    },
    onError: (e: ApiErr) => { toast.error(e.response?.data?.message || "Failed"); setConfirmAward(false); },
  });

  const publishMut = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/tenders/${tenderId}/publish-results`);
      return res.data?.data as { emailsSent?: number } | undefined;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["tender", tenderId] });
      const count = data?.emailsSent ?? 0;
      toast.success(
        count > 0
          ? `Results published — ${count} email${count !== 1 ? "s" : ""} sent to all bidders`
          : "Results published — all bidders notified"
      );
      setConfirmPublish(false);
    },
    onError: (e: ApiErr) => { toast.error(e.response?.data?.message || "Failed"); setConfirmPublish(false); },
  });

  if (!isFinancialFinalized) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5" />Step 4: Award Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAwarded && rank1 && hasEvaluatedBids && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm font-medium text-green-800">
                Recommended winner: <strong>{rank1.bidderName}</strong> — ETB {rank1.bidAmount.toLocaleString()} (Combined Score: {rank1.combinedScore.toFixed(1)})
              </p>
            </div>
            <Button onClick={() => setConfirmAward(true)}>
              <Award className="mr-2 h-4 w-4" />Award to Rank #1 Bidder
            </Button>
          </>
        )}

        {isAwarded && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-1">
              <Badge variant="outline" className="bg-green-200 text-green-800">Tender Awarded</Badge>
              {rank1 && (
                <p className="text-sm text-green-800 mt-2">
                  Winner: <strong>{rank1.bidderName}</strong> — ETB {rank1.bidAmount.toLocaleString()}
                </p>
              )}
            </div>
            <Button onClick={() => setConfirmPublish(true)} variant="outline">
              <Megaphone className="mr-2 h-4 w-4" />Publish Results to All Bidders
            </Button>
          </>
        )}

        {confirmAward && rank1 && (
          <Dialog open onOpenChange={() => setConfirmAward(false)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Confirm Award</DialogTitle>
                <DialogDescription>
                  Award this tender to <strong>{rank1.bidderName}</strong> for ETB {rank1.bidAmount.toLocaleString()}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmAward(false)}>Cancel</Button>
                <Button onClick={() => awardMut.mutate()} disabled={awardMut.isPending}>
                  {awardMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirm Award
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {confirmPublish && (
          <Dialog open onOpenChange={() => setConfirmPublish(false)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Publish Results</DialogTitle>
                <DialogDescription>This will notify all bidders of the evaluation results via email with a detailed PDF report attached. The winner will receive a congratulations email, and other bidders will be informed of their ranking and can request a debriefing.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmPublish(false)}>Cancel</Button>
                <Button onClick={() => publishMut.mutate()} disabled={publishMut.isPending}>
                  {publishMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

// ─── COMMITTEE ASSIGN FORM ────────────────────────────────────────────────────

function CommitteeAssignForm({ tenderId }: { tenderId: number }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number[]>([]);

  const { data: evaluators, isLoading } = useQuery({
    queryKey: ["available-evaluators"],
    queryFn: async () => (await api.get("/evaluators/available")).data.data.evaluators as { id: number; fullName: string; email: string }[],
  });

  const assignMut = useMutation({
    mutationFn: async () => { await api.post(`/tenders/${tenderId}/committee`, { memberIds: selected }); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["committee", tenderId] });
      toast.success("Committee assigned");
    },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed"),
  });

  const toggle = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Select at least 3 evaluators to form the committee.</p>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {evaluators?.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-2 border rounded-md hover:bg-muted/30 cursor-pointer" onClick={() => toggle(u.id)}>
            <Checkbox checked={selected.includes(u.id)} onCheckedChange={() => toggle(u.id)} />
            <div><p className="text-sm font-medium">{u.fullName}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
          </div>
        ))}
        {(!evaluators || evaluators.length === 0) && <p className="text-sm text-muted-foreground">No active evaluators found.</p>}
      </div>
      <Button onClick={() => assignMut.mutate()} disabled={selected.length < 3 || assignMut.isPending}>
        {assignMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Assign Committee ({selected.length} selected)
      </Button>
    </div>
  );
}

// ─── ADDENDUM DIALOG ──────────────────────────────────────────────────────────

function AddendumDialog({ open, onClose, tenderId, onCreated }: { open: boolean; onClose: () => void; tenderId: number; onCreated: () => void }) {
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!desc) { toast.error("Description is required"); return; }
    setSaving(true);
    try {
      await api.post(`/tenders/${tenderId}/addenda`, { description: desc, newDeadline: deadline || undefined });
      toast.success("Addendum issued");
      setDesc(""); setDeadline("");
      onCreated();
    } catch (err: unknown) {
      toast.error((err as ApiErr).response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Issue Addendum</DialogTitle><DialogDescription>Describe the changes. Optionally extend the submission deadline.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Description *</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} /></div>
          <div className="space-y-2"><Label>New Submission Deadline (optional)</Label><Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !desc}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Issue Addendum</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
