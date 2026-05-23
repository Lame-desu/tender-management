"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2, FileText, Download, CheckCircle2, Trophy, ArrowLeft,
  ChevronRight, AlertCircle, Info, Send, Star,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api";
import { EvaluationCriteria, BidDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

type ApiErr = { response?: { data?: { message?: string } } };

interface TechBid {
  id: number;
  bidderName: string;
  technicalProposal: string;
  bidSecurityInfo: string | null;
  documents: BidDocument[];
  submissionDate: string;
}

interface MyEvaluation {
  bidId: number;
  criteriaScores: { criteriaName: string; score: number }[];
  totalScore: number;
  remarks: string | null;
}

interface TechData {
  tender: {
    id: number;
    title: string;
    evaluationCriteria: EvaluationCriteria[];
    minimumTechnicalScore: number;
  };
  bids: TechBid[];
  myEvaluations: MyEvaluation[];
}

interface FinancialBid {
  bidId: number; bidderName: string; avgTechnicalScore: number;
  bidAmount: number; financialScore: number; combinedScore: number; rank: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-muted-foreground w-16 text-right">
        {score.toFixed(1)}/{max}
      </span>
    </div>
  );
}

function BidScoreCard({
  bid,
  criteria,
  scores,
  remarks,
  hasSubmitted,
  onScoreChange,
  onRemarkChange,
  getBidTotal,
}: {
  bid: TechBid;
  criteria: EvaluationCriteria[];
  scores: Record<number, Record<string, number>>;
  remarks: Record<number, string>;
  hasSubmitted: boolean;
  onScoreChange: (bidId: number, criteriaName: string, value: number) => void;
  onRemarkChange: (bidId: number, value: string) => void;
  getBidTotal: (bidId: number) => number;
}) {
  const totalMax = criteria.reduce((s, c) => s + c.weight, 0);
  const currentTotal = getBidTotal(bid.id);

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Bid Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {bid.bidderName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{bid.bidderName}</h3>
              <p className="text-xs text-muted-foreground">
                Submitted {format(new Date(bid.submissionDate), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {currentTotal.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">/{totalMax}</span>
            </div>
            <ScoreBar score={currentTotal} max={totalMax} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left Side: Bid Information */}
        <div className="p-6 lg:border-r space-y-4">
          {/* Technical Proposal */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-foreground">Technical Proposal</h4>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border">
              {bid.technicalProposal}
            </div>
          </div>

          {/* Documents */}
          {bid.documents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-violet-500" />
                <h4 className="text-sm font-semibold text-foreground">Documents ({bid.documents.length})</h4>
              </div>
              <div className="space-y-1.5">
                {bid.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                      </div>
                    </div>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/files/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bid Security */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${bid.bidSecurityInfo ? "bg-emerald-500" : "bg-red-400"}`} />
            <span className="text-muted-foreground">
              Bid Security: {bid.bidSecurityInfo ? "Provided" : "Not provided"}
            </span>
          </div>
        </div>

        {/* Right Side: Scoring Form */}
        <div className="p-6 bg-gradient-to-b from-blue-50/30 to-white space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-semibold text-foreground">Score This Bid</h4>
            {hasSubmitted && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 ml-auto text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />Submitted
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {criteria.map((c) => {
              const value = scores[bid.id]?.[c.name] ?? 0;
              const isValid = value >= 0 && value <= c.weight;
              return (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">{c.name}</Label>
                    <span className="text-xs text-muted-foreground">max {c.weight}</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={c.weight}
                      step={0.5}
                      value={value}
                      onChange={(e) => onScoreChange(bid.id, c.name, Math.min(c.weight, Math.max(0, parseFloat(e.target.value) || 0)))}
                      disabled={hasSubmitted}
                      className={`pr-12 ${!isValid ? "border-red-300 focus-visible:ring-red-400" : "focus-visible:ring-blue-400"}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-xs text-muted-foreground">/ {c.weight}</span>
                    </div>
                  </div>
                  <ScoreBar score={value} max={c.weight} />
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Remarks (optional)</Label>
            <Textarea
              rows={3}
              value={remarks[bid.id] || ""}
              onChange={(e) => onRemarkChange(bid.id, e.target.value)}
              disabled={hasSubmitted}
              placeholder="Add your comments on this bid..."
              className="resize-none focus-visible:ring-blue-400"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function EvaluatePage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const tenderId = parseInt(id as string, 10);

  const [scores, setScores] = useState<Record<number, Record<string, number>>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["tech-eval-data", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}/evaluation/technical`)).data.data as TechData,
    enabled: !isNaN(tenderId),
  });

  const { data: financialData } = useQuery({
    queryKey: ["financial-eval", tenderId],
    queryFn: async () => {
      try {
        return (await api.get(`/tenders/${tenderId}/evaluation/financial`)).data.data as {
          tender: { technicalWeight: number; financialWeight: number };
          bids: FinancialBid[];
        };
      } catch {
        return null;
      }
    },
    enabled: !isNaN(tenderId),
  });

  const hasSubmitted = (data?.myEvaluations?.length ?? 0) > 0 &&
    data?.myEvaluations?.length === data?.bids?.length;

  useEffect(() => {
    if (data?.myEvaluations && data.myEvaluations.length > 0) {
      const s: Record<number, Record<string, number>> = {};
      const r: Record<number, string> = {};
      for (const ev of data.myEvaluations) {
        s[ev.bidId] = {};
        for (const cs of ev.criteriaScores) {
          s[ev.bidId][cs.criteriaName] = cs.score;
        }
        r[ev.bidId] = ev.remarks || "";
      }
      setScores(s);
      setRemarks(r);
    } else if (data?.bids && data?.tender) {
      const s: Record<number, Record<string, number>> = {};
      const r: Record<number, string> = {};
      for (const bid of data.bids) {
        s[bid.id] = {};
        for (const c of data.tender.evaluationCriteria) {
          s[bid.id][c.name] = 0;
        }
        r[bid.id] = "";
      }
      setScores(s);
      setRemarks(r);
    }
  }, [data]);

  const submitMut = useMutation({
    mutationFn: async () => {
      const evaluations = data!.bids.map((bid) => ({
        bidId: bid.id,
        criteriaScores: data!.tender.evaluationCriteria.map((c) => ({
          criteriaName: c.name,
          score: scores[bid.id]?.[c.name] ?? 0,
        })),
        remarks: remarks[bid.id] || undefined,
      }));
      await api.post(`/tenders/${tenderId}/evaluation/technical`, { evaluations });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tech-eval-data", tenderId] });
      qc.invalidateQueries({ queryKey: ["evaluator-assignments"] });
      toast.success("Evaluation submitted successfully");
      setConfirmOpen(false);
    },
    onError: (e: ApiErr) => {
      toast.error(e.response?.data?.message || "Submission failed");
      setConfirmOpen(false);
    },
  });

  const setScore = (bidId: number, criteriaName: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [bidId]: { ...prev[bidId], [criteriaName]: value },
    }));
  };

  const setRemark = (bidId: number, value: string) => {
    setRemarks((prev) => ({ ...prev, [bidId]: value }));
  };

  const getBidTotal = (bidId: number) => {
    const bidScores = scores[bidId] || {};
    return Object.values(bidScores).reduce((sum, v) => sum + (v || 0), 0);
  };

  const allValid = useMemo(() => {
    if (!data) return false;
    return data.bids.every((bid) =>
      data.tender.evaluationCriteria.every((c) => {
        const score = scores[bid.id]?.[c.name] ?? -1;
        return score >= 0 && score <= c.weight;
      })
    );
  }, [data, scores]);

  // Summary for confirmation dialog
  const confirmSummary = useMemo(() => {
    if (!data) return [];
    return data.bids.map((bid) => ({
      name: bid.bidderName,
      total: getBidTotal(bid.id),
      max: data.tender.evaluationCriteria.reduce((s, c) => s + c.weight, 0),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, scores]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 max-w-5xl">
        {/* Skeleton breadcrumb */}
        <Skeleton className="h-5 w-48" />
        {/* Skeleton header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-5 w-64" />
        </div>
        {/* Skeleton criteria card */}
        <Skeleton className="h-48 w-full rounded-xl" />
        {/* Skeleton bid cards */}
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const { tender, bids } = data;
  const criteria = tender.evaluationCriteria;
  const totalMax = criteria.reduce((s, c) => s + c.weight, 0);

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/evaluator/tenders" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Assigned Tenders
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/evaluator/tenders/${tender.id}`} className="hover:text-foreground transition-colors">
            {tender.title}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Evaluation</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Star className="h-5 w-5 text-white" />
              </div>
              Technical Evaluation
            </h1>
            <p className="text-muted-foreground mt-1 ml-[52px]">{tender.title}</p>
          </div>
          {hasSubmitted && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1.5">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />Evaluation Submitted
            </Badge>
          )}
        </div>

        {/* Evaluation Criteria Reference */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Evaluation Criteria
              </CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    Min Score: {tender.minimumTechnicalScore}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bids must score at least {tender.minimumTechnicalScore} to qualify</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Criterion</TableHead>
                  <TableHead className="text-right w-32">Weight (Max Score)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-semibold">{c.weight}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-blue-50/50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-blue-600">{totalMax}</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bid Evaluations */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Bid Evaluations ({bids.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Review each bid&apos;s technical proposal and documents, then assign scores for each criterion.
          </p>
        </div>

        <div className="space-y-6">
          {bids.map((bid) => (
            <BidScoreCard
              key={bid.id}
              bid={bid}
              criteria={criteria}
              scores={scores}
              remarks={remarks}
              hasSubmitted={hasSubmitted}
              onScoreChange={setScore}
              onRemarkChange={setRemark}
              getBidTotal={getBidTotal}
            />
          ))}
        </div>

        {/* Submit Button */}
        {!hasSubmitted && bids.length > 0 && (
          <div className="sticky bottom-4 z-10">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all text-base py-6"
              disabled={!allValid}
              onClick={() => setConfirmOpen(true)}
            >
              <Send className="h-5 w-5 mr-2" />
              Submit All Evaluations
            </Button>
            {!allValid && (
              <p className="text-xs text-center text-amber-600 mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Please ensure all scores are within their valid ranges before submitting.
              </p>
            )}
          </div>
        )}

        {/* Submitted Success Card */}
        {hasSubmitted && (
          <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="py-8 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="font-semibold text-lg text-emerald-900">Evaluation Submitted</p>
              <p className="text-sm text-emerald-700/70 mt-1">
                Waiting for other committee members to complete their evaluations.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Financial Results */}
        {financialData && financialData.bids.length > 0 && (
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                Financial Evaluation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Bidder</TableHead>
                    <TableHead className="text-center">Tech Score</TableHead>
                    <TableHead className="text-right">Bid Amount</TableHead>
                    <TableHead className="text-center">Financial Score</TableHead>
                    <TableHead className="text-center">Combined Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.bids.map((b) => (
                    <TableRow key={b.bidId} className={b.rank === 1 ? "bg-emerald-50/70" : ""}>
                      <TableCell>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          b.rank === 1 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm" :
                          b.rank === 2 ? "bg-slate-200 text-slate-700" :
                          b.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {b.rank}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {b.bidderName}
                        {b.rank === 1 && <Trophy className="h-4 w-4 inline text-amber-500 ml-1.5" />}
                      </TableCell>
                      <TableCell className="text-center">{b.avgTechnicalScore.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-mono">ETB {b.bidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{b.financialScore.toFixed(1)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={b.rank === 1 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}>
                          {b.combinedScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Confirm Dialog */}
        {confirmOpen && (
          <Dialog open onOpenChange={() => setConfirmOpen(false)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  Confirm Submission
                </DialogTitle>
                <DialogDescription>
                  Review your scores below. You can update scores until the officer finalizes the evaluation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 my-2">
                {confirmSummary.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{item.total.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">/{item.max}</span>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => submitMut.mutate()}
                  disabled={submitMut.isPending}
                >
                  {submitMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  Submit Evaluation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}
