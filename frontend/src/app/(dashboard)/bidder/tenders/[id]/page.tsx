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

function ResultsTab({ tenderId }: { tenderId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tender-results", tenderId],
    queryFn: async () => {
      try {
        return (await api.get(`/tenders/${tenderId}/results`)).data.data as {
          winner: { bidderName: string; bidAmount: number } | null;
          myBid: {
            bidId: number; status: string; bidAmount: number;
            avgTechnicalScore: number | null; avgFinancialScore: number | null;
            combinedScore: number | null; rank: number | null;
          } | null;
          totalBids: number;
        };
      } catch {
        return null;
      }
    },
  });

  if (isLoading) return <Card><CardContent className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></CardContent></Card>;
  if (!data) return <Card><CardContent className="py-8 text-center text-muted-foreground">Results not available yet.</CardContent></Card>;

  return (
    <div className="space-y-4">
      {/* Winner Info */}
      {data.winner && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold">Winner: {data.winner.bidderName}</p>
                <p className="text-sm text-muted-foreground">Winning bid: ETB {data.winner.bidAmount.toLocaleString()} &middot; {data.totalBids} total bids</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Own Scores */}
      {data.myBid && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Your Bid Results</CardTitle></CardHeader>
          <CardContent>
            {data.myBid.status === "SELECTED" && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="font-semibold text-green-800">Your bid has been selected!</p>
              </div>
            )}
            {data.myBid.status === "NOT_SELECTED" && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                <p className="text-sm text-gray-700">Your bid was not selected. You may request a debriefing from the My Bids page.</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {data.myBid.avgTechnicalScore != null && (
                <div><span className="text-muted-foreground block text-xs">Technical Score</span><strong>{data.myBid.avgTechnicalScore.toFixed(1)}</strong></div>
              )}
              {data.myBid.avgFinancialScore != null && (
                <div><span className="text-muted-foreground block text-xs">Financial Score</span><strong>{data.myBid.avgFinancialScore.toFixed(1)}</strong></div>
              )}
              {data.myBid.combinedScore != null && (
                <div><span className="text-muted-foreground block text-xs">Combined Score</span><strong>{data.myBid.combinedScore.toFixed(1)}</strong></div>
              )}
              {data.myBid.rank != null && (
                <div><span className="text-muted-foreground block text-xs">Rank</span><strong>#{data.myBid.rank}</strong></div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!data.myBid && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">You did not submit a bid for this tender.</CardContent></Card>
      )}
    </div>
  );
}
