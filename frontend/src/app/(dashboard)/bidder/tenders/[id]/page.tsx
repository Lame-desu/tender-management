"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format, isPast, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Loader2, MessageSquare, FileText, ListChecks, CalendarDays,
  Shield, CheckCircle2, Send, AlertCircle, Trophy, BarChart3, Download,
} from "lucide-react";
import api from "@/lib/api";
import { Tender, TenderAddendum, Clarification, EvaluationCriteria } from "@/types";
import { exportBidOpeningRecordPDF } from "@/lib/pdf-export";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const catColors: Record<string, string> = {
  GOODS: "bg-purple-100 text-purple-700",
  WORKS: "bg-orange-100 text-orange-700",
  CONSULTING: "bg-cyan-100 text-cyan-700",
};

type FullTender = Tender & {
  addenda: (TenderAddendum & { issuedUser: { fullName: string } })[];
  clarifications: (Clarification & { askedUser: { id: number; fullName: string }; answeredUser?: { fullName: string } | null })[];
  createdUser: { id: number; fullName: string };
  _count: { bids: number; addenda: number; clarifications: number };
};

type ApiErr = { response?: { data?: { message?: string } } };

export default function BidderTenderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const tenderId = parseInt(id as string, 10);

  const [question, setQuestion] = useState("");

  const { data: tender, isLoading } = useQuery({
    queryKey: ["tender", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}`)).data.data.tender as FullTender,
    enabled: !isNaN(tenderId),
  });

  const { data: existingBid } = useQuery({
    queryKey: ["bid-check", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}/bids/check`)).data.data as { exists: boolean; bidId: number | null },
    enabled: !isNaN(tenderId),
  });

  const askMut = useMutation({
    mutationFn: async (q: string) => {
      await api.post(`/tenders/${tenderId}/clarifications`, { question: q });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tender", tenderId] });
      toast.success("Question submitted");
      setQuestion("");
    },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed to submit question"),
  });

  if (isLoading || !tender) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ec = tender.evaluationCriteria as EvaluationCriteria[];
  const deadlinePassed = isPast(new Date(tender.submissionDeadline));
  const clarDeadlinePassed = isPast(new Date(tender.clarificationDeadline));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{tender.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline" className={catColors[tender.category]}>{tender.category}</Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">Published</Badge>
          {!deadlinePassed && (
            <span className="text-sm text-muted-foreground">
              Closes {formatDistanceToNow(new Date(tender.submissionDeadline), { addSuffix: true })}
            </span>
          )}
          {deadlinePassed && (
            <Badge variant="outline" className="bg-red-100 text-red-700">Deadline Passed</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><FileText className="mr-1.5 h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="addenda"><ListChecks className="mr-1.5 h-4 w-4" />Addenda ({tender._count.addenda})</TabsTrigger>
          <TabsTrigger value="clarifications"><MessageSquare className="mr-1.5 h-4 w-4" />Clarifications ({tender._count.clarifications})</TabsTrigger>
          {tender.status === "AWARDED" && (
            <TabsTrigger value="results"><BarChart3 className="mr-1.5 h-4 w-4" />Results</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tender.description}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-1">Eligibility Criteria</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tender.eligibilityCriteria}</p>
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
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 font-medium">Criterion</th>
                        <th className="text-right p-2 font-medium">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ec.map((c, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{c.name}</td>
                          <td className="p-2 text-right">{c.weight}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  <p>Technical Weight: {tender.technicalWeight}% | Financial Weight: {tender.financialWeight}%</p>
                  <p>Minimum Technical Score: {tender.minimumTechnicalScore}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Clarification Deadline</p>
                    <p className="text-sm font-medium">
                      {format(new Date(tender.clarificationDeadline), "MMM d, yyyy HH:mm")}
                      {clarDeadlinePassed && <span className="text-red-500 ml-2">(Passed)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submission Deadline</p>
                    <p className="text-sm font-medium">
                      {format(new Date(tender.submissionDeadline), "MMM d, yyyy HH:mm")}
                      {deadlinePassed && <span className="text-red-500 ml-2">(Passed)</span>}
                    </p>
                  </div>
                </div>
              </div>
              {tender.bidSecurityRequired && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Bid Security Required: <strong>ETB {tender.bidSecurityAmount?.toLocaleString()}</strong></p>
                  </div>
                </>
              )}
              {!tender.bidSecurityRequired && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Bid Security: Not Required</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit Bid CTA */}
          <Card>
            <CardContent className="pt-6">
              {existingBid?.exists ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">You have already submitted a bid</p>
                    <Link href="/bidder/my-bids" className="text-sm text-primary hover:underline">
                      View your bid
                    </Link>
                  </div>
                </div>
              ) : deadlinePassed ? (
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-muted-foreground">The submission deadline has passed.</p>
                </div>
              ) : (
                <Link href={`/bidder/tenders/${tender.id}/bid`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" />Submit Bid
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Bid Opening Record */}
          {existingBid?.exists && ["UNDER_EVALUATION", "AWARDED"].includes(tender.status) && (
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Bids for this tender have been opened.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await api.get(`/reports/bid-opening/${tender.id}`);
                      exportBidOpeningRecordPDF(res.data.data);
                    } catch { toast.error("Failed to generate record"); }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />Download Bid Opening Record
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Addenda Tab */}
        <TabsContent value="addenda" className="space-y-4 mt-4">
          {!tender.addenda.length ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No addenda issued.</CardContent>
            </Card>
          ) : (
            tender.addenda.map((a) => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Addendum #{a.addendumNumber}</CardTitle>
                    <span className="text-xs text-muted-foreground">{format(new Date(a.issuedDate), "MMM d, yyyy HH:mm")}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{a.description}</p>
                  {a.newDeadline && (
                    <p className="text-sm mt-2 text-primary font-medium">
                      New deadline: {format(new Date(a.newDeadline), "MMM d, yyyy HH:mm")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Issued by {a.issuedUser?.fullName}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Clarifications Tab */}
        <TabsContent value="clarifications" className="space-y-4 mt-4">
          {!clarDeadlinePassed ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ask a Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Type your question about this tender..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Your identity will be kept anonymous.</p>
                  <Button
                    size="sm"
                    onClick={() => askMut.mutate(question)}
                    disabled={!question.trim() || askMut.isPending}
                  >
                    {askMut.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Submit Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-4 text-center text-muted-foreground">
                Clarification period has ended.
              </CardContent>
            </Card>
          )}

          {!tender.clarifications.length ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No clarifications yet.</CardContent>
            </Card>
          ) : (
            tender.clarifications.map((c) => (
              <Card key={c.id}>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {c.askedUser?.fullName} &middot; {format(new Date(c.askedDate), "MMM d, yyyy HH:mm")}
                    </p>
                    <p className="text-sm font-medium mt-1">{c.question}</p>
                  </div>
                  {c.answer ? (
                    <div className="bg-muted/50 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Answer by {c.answeredUser?.fullName} &middot; {c.answeredDate && format(new Date(c.answeredDate), "MMM d, yyyy HH:mm")}
                      </p>
                      <p className="text-sm">{c.answer}</p>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700">Pending answer</Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Results Tab */}
        {tender.status === "AWARDED" && (
          <TabsContent value="results" className="space-y-4 mt-4">
            <ResultsTab tenderId={tenderId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

type BidResult = {
  bidId: number;
  bidderName: string;
  bidAmount: number;
  status: string;
  avgTechnicalScore: number | null;
  avgFinancialScore: number | null;
  combinedScore: number | null;
  rank: number | null;
  isWinner: boolean;
  isMine: boolean;
};

type ResultsData = {
  tender: {
    title: string;
    status: string;
    technicalWeight: number;
    financialWeight: number;
    minimumTechnicalScore: number;
  };
  bids: BidResult[];
  myBidId: number | null;
  totalBids: number;
};

const rankBadge = (rank: number | null) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank ? `#${rank}` : "—";
};

const bidResultColors: Record<string, string> = {
  SELECTED: "bg-green-100 text-green-800",
  NOT_SELECTED: "bg-gray-100 text-gray-600",
  EVALUATED: "bg-amber-100 text-amber-700",
  TECHNICALLY_QUALIFIED: "bg-blue-100 text-blue-700",
  TECHNICALLY_DISQUALIFIED: "bg-red-100 text-red-700",
};

function ResultsTab({ tenderId }: { tenderId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tender-results", tenderId],
    queryFn: async () => {
      try {
        return (await api.get(`/tenders/${tenderId}/results`)).data.data as ResultsData;
      } catch {
        return null;
      }
    },
  });

  if (isLoading) return <Card><CardContent className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></CardContent></Card>;
  if (!data) return <Card><CardContent className="py-8 text-center text-muted-foreground">Results not available yet.</CardContent></Card>;

  const winner = data.bids.find((b) => b.isWinner);
  const myBid = data.bids.find((b) => b.isMine);
  const rankedBids = data.bids.filter((b) => b.rank != null);
  const disqualifiedBids = data.bids.filter((b) => b.status === "TECHNICALLY_DISQUALIFIED");

  return (
    <div className="space-y-5">
      {/* Winner Announcement Banner */}
      {winner && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.07]">
            <Trophy className="w-full h-full text-green-600" />
          </div>
          <CardContent className="pt-6 pb-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Tender Awarded</p>
                <p className="text-lg font-bold text-green-900">{winner.bidderName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-green-700">
                  <span>Bid Amount: <strong>ETB {winner.bidAmount.toLocaleString()}</strong></span>
                  {winner.combinedScore != null && <span>Combined Score: <strong>{winner.combinedScore.toFixed(1)}</strong></span>}
                  <span>Total Participants: <strong>{data.totalBids}</strong></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Position Card */}
      {myBid && (
        <Card className={myBid.isWinner ? "border-green-300 bg-green-50/50" : "border-blue-200 bg-blue-50/30"}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${myBid.isWinner ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {myBid.rank ? `#${myBid.rank}` : "—"}
                </div>
                <div>
                  <p className="font-semibold text-sm">Your Bid Position</p>
                  <p className="text-xs text-muted-foreground">{myBid.bidderName}</p>
                </div>
              </div>
              <Badge variant="outline" className={bidResultColors[myBid.status] || "bg-gray-100"}>
                {myBid.status.replace(/_/g, " ")}
              </Badge>
            </div>
            {myBid.isWinner && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="font-semibold text-green-800 text-sm">Congratulations! Your bid has been selected as the winner!</p>
              </div>
            )}
            {myBid.status === "NOT_SELECTED" && (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <p className="text-sm text-gray-700">Your bid was not selected. You may <Link href="/bidder/my-bids" className="text-primary font-medium hover:underline">request a debriefing</Link> for more details.</p>
              </div>
            )}
            {myBid.status === "TECHNICALLY_DISQUALIFIED" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">Your bid did not meet the minimum technical score requirement ({data.tender.minimumTechnicalScore} points). You may <Link href="/bidder/my-bids" className="text-primary font-medium hover:underline">request a debriefing</Link>.</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Bid Amount</p>
                <p className="font-bold text-sm">ETB {myBid.bidAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Technical ({data.tender.technicalWeight}%)</p>
                <p className="font-bold text-sm">{myBid.avgTechnicalScore != null ? myBid.avgTechnicalScore.toFixed(1) : "—"}</p>
              </div>
              <div className="bg-white rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Financial ({data.tender.financialWeight}%)</p>
                <p className="font-bold text-sm">{myBid.avgFinancialScore != null ? myBid.avgFinancialScore.toFixed(1) : "—"}</p>
              </div>
              <div className="bg-white rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Combined Score</p>
                <p className="font-bold text-sm">{myBid.combinedScore != null ? myBid.combinedScore.toFixed(1) : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!myBid && data.myBidId === null && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-muted-foreground">
            <p className="text-sm">You did not submit a bid for this tender.</p>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Evaluation Leaderboard
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Scoring: Technical {data.tender.technicalWeight}% + Financial {data.tender.financialWeight}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {rankedBids.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left p-3 font-medium w-16">Rank</th>
                    <th className="text-left p-3 font-medium">Bidder</th>
                    <th className="text-right p-3 font-medium">Bid Amount</th>
                    <th className="text-center p-3 font-medium">Technical</th>
                    <th className="text-center p-3 font-medium">Financial</th>
                    <th className="text-center p-3 font-medium">Combined</th>
                    <th className="text-center p-3 font-medium w-28">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedBids.map((bid, idx) => (
                    <tr
                      key={bid.bidId}
                      className={`border-b last:border-b-0 transition-colors ${
                        bid.isMine
                          ? "bg-blue-50 hover:bg-blue-100/80 font-medium"
                          : bid.isWinner
                          ? "bg-green-50/50 hover:bg-green-50"
                          : idx % 2 === 0
                          ? "bg-white hover:bg-muted/30"
                          : "bg-muted/10 hover:bg-muted/30"
                      }`}
                    >
                      <td className="p-3">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          bid.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                          bid.rank === 2 ? "bg-gray-100 text-gray-700" :
                          bid.rank === 3 ? "bg-orange-100 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {rankBadge(bid.rank)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span>{bid.bidderName}</span>
                          {bid.isMine && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">YOU</Badge>
                          )}
                          {bid.isWinner && (
                            <Trophy className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right tabular-nums">ETB {bid.bidAmount.toLocaleString()}</td>
                      <td className="p-3 text-center tabular-nums">{bid.avgTechnicalScore?.toFixed(1) ?? "—"}</td>
                      <td className="p-3 text-center tabular-nums">{bid.avgFinancialScore?.toFixed(1) ?? "—"}</td>
                      <td className="p-3 text-center font-semibold tabular-nums">{bid.combinedScore?.toFixed(1) ?? "—"}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={`text-[10px] ${bidResultColors[bid.status] || "bg-gray-100"}`}>
                          {bid.status === "SELECTED" ? "WINNER" : bid.status === "NOT_SELECTED" ? "NOT SELECTED" : bid.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No ranked bids available.</p>
          )}
        </CardContent>
      </Card>

      {/* Disqualified Bids */}
      {disqualifiedBids.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Technically Disqualified ({disqualifiedBids.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              These bids scored below the minimum technical requirement ({data.tender.minimumTechnicalScore} points) and were not considered for financial evaluation.
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-red-50/50 border-b">
                    <th className="text-left p-3 font-medium">Bidder</th>
                    <th className="text-center p-3 font-medium">Technical Score</th>
                    <th className="text-center p-3 font-medium w-28">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {disqualifiedBids.map((bid) => (
                    <tr
                      key={bid.bidId}
                      className={`border-b last:border-b-0 ${bid.isMine ? "bg-red-50/50 font-medium" : ""}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span>{bid.bidderName}</span>
                          {bid.isMine && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">YOU</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center tabular-nums text-red-600 font-medium">{bid.avgTechnicalScore?.toFixed(1) ?? "—"}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="bg-red-100 text-red-700 text-[10px]">DISQUALIFIED</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transparency Note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-dashed">
        <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Evaluation results are published in accordance with public procurement transparency standards. All participating bidders
          can view the complete evaluation results. For detailed feedback on your bid, you may request a debriefing from the{" "}
          <Link href="/bidder/my-bids" className="text-primary hover:underline">My Bids</Link> page.
        </p>
      </div>
    </div>
  );
}
