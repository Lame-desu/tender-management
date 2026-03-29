"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2, FileText, Download, ChevronDown, ChevronUp, CheckCircle2, Trophy,
} from "lucide-react";
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

export default function EvaluatePage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const tenderId = parseInt(id as string, 10);

  const [scores, setScores] = useState<Record<number, Record<string, number>>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [expandedBid, setExpandedBid] = useState<number | null>(null);
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

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { tender, bids } = data;
  const criteria = tender.evaluationCriteria;

  const setScore = (bidId: number, criteriaName: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [bidId]: { ...prev[bidId], [criteriaName]: value },
    }));
  };

  const getBidTotal = (bidId: number) => {
    const bidScores = scores[bidId] || {};
    return Object.values(bidScores).reduce((sum, v) => sum + (v || 0), 0);
  };

  const allValid = bids.every((bid) =>
    criteria.every((c) => {
      const score = scores[bid.id]?.[c.name] ?? -1;
      return score >= 0 && score <= c.weight;
    })
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Technical Evaluation</h1>
        <p className="text-muted-foreground mt-1">{tender.title}</p>
        {hasSubmitted && (
          <Badge variant="outline" className="bg-green-100 text-green-700 mt-2">
            <CheckCircle2 className="h-3 w-3 mr-1" />Evaluation Submitted
          </Badge>
        )}
      </div>

      {/* Criteria Reference */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evaluation Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Criterion</TableHead>
                  <TableHead className="text-right">Weight (Max Score)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-right font-medium">{c.weight}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">{criteria.reduce((s, c) => s + c.weight, 0)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Minimum Technical Score: {tender.minimumTechnicalScore}</p>
        </CardContent>
      </Card>

      {/* Bid Evaluations */}
      {bids.map((bid) => (
        <Card key={bid.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{bid.bidderName}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  Total: {getBidTotal(bid.id).toFixed(1)} / {criteria.reduce((s, c) => s + c.weight, 0)}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}>
                  {expandedBid === bid.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedBid === bid.id && (
            <CardContent className="pt-0 space-y-3 border-t">
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Technical Proposal</p>
                <p className="text-sm whitespace-pre-wrap mt-1 max-h-40 overflow-y-auto">{bid.technicalProposal}</p>
              </div>
              {bid.documents.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Documents</p>
                  <div className="space-y-1">
                    {bid.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{doc.fileName}</span>
                        </div>
                        <a href={`http://localhost:5000/api/files/${doc.id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}

          <CardContent className={expandedBid === bid.id ? "space-y-4" : "pt-0 space-y-4"}>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {criteria.map((c) => (
                <div key={c.name} className="space-y-1">
                  <Label className="text-xs">{c.name} (0-{c.weight})</Label>
                  <Input
                    type="number"
                    min={0}
                    max={c.weight}
                    step={0.5}
                    value={scores[bid.id]?.[c.name] ?? 0}
                    onChange={(e) => setScore(bid.id, c.name, Math.min(c.weight, Math.max(0, parseFloat(e.target.value) || 0)))}
                    disabled={hasSubmitted}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Remarks (optional)</Label>
              <Textarea
                rows={2}
                value={remarks[bid.id] || ""}
                onChange={(e) => setRemarks((prev) => ({ ...prev, [bid.id]: e.target.value }))}
                disabled={hasSubmitted}
                placeholder="Any comments on this bid..."
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Submit */}
      {!hasSubmitted && bids.length > 0 && (
        <Button size="lg" className="w-full" disabled={!allValid} onClick={() => setConfirmOpen(true)}>
          Submit All Evaluations
        </Button>
      )}

      {hasSubmitted && (
        <Card>
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium">Evaluation submitted</p>
            <p className="text-sm text-muted-foreground">Waiting for other committee members to complete their evaluations.</p>
          </CardContent>
        </Card>
      )}

      {/* Financial Results (if available) */}
      {financialData && financialData.bids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5" />Financial Evaluation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Bidder</TableHead>
                    <TableHead className="text-center">Tech Score</TableHead>
                    <TableHead className="text-right">Bid Amount</TableHead>
                    <TableHead className="text-center">Financial Score</TableHead>
                    <TableHead className="text-center">Combined Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.bids.map((b) => (
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
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialog */}
      {confirmOpen && (
        <Dialog open onOpenChange={() => setConfirmOpen(false)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Submit Evaluation</DialogTitle>
              <DialogDescription>Are you sure you want to submit your technical evaluation? You can update your scores until the officer finalizes.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>
                {submitMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
