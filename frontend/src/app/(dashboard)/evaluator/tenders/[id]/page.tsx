"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  FileText,
  Download,
  Users,
  CheckCircle2,
  Clock,
  Shield,
  Calendar,
  ChevronRight,
  AlertCircle,
  Star,
  BarChart3,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { EvaluationCriteria } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface BidDocument {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  documentCategory: string;
  uploadDate: string;
  bidId: number;
}

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

interface CommitteeMember {
  id: number;
  userId: number;
  user: { id: number; fullName: string; email: string };
  hasCompletedEvaluation: boolean;
}

interface Assignment {
  id: number;
  tenderId: number;
  tender: {
    id: number;
    title: string;
    category: string;
    status: string;
    submissionDeadline: string;
    _count: { bids: number };
  };
  evalStatus: string;
  myEvaluationsCount: number;
  totalBids: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const evalStatusConfig: Record<string, { color: string; bg: string }> = {
  "Pending Technical Evaluation": {
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  "Technical Submitted — Awaiting others": {
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  "Financial Evaluation Available": {
    color: "text-cyan-700",
    bg: "bg-cyan-100",
  },
  "Evaluation Complete": { color: "text-green-700", bg: "bg-green-100" },
  "Awaiting Bid Opening": { color: "text-gray-600", bg: "bg-gray-100" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ScoreBar({ score, max, size = "md" }: { score: number; max: number; size?: "sm" | "md" }) {
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400";
  const h = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className={`w-full ${h} bg-muted rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-32 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Evaluation Summary Component ──────────────────────────────────────────────

function EvaluationSummaryCard({
  bids,
  myEvaluations,
  criteria,
  totalWeight,
  minimumTechnicalScore,
}: {
  bids: TechBid[];
  myEvaluations: MyEvaluation[];
  criteria: EvaluationCriteria[];
  totalWeight: number;
  minimumTechnicalScore: number;
}) {
  const evalMap = new Map<number, MyEvaluation>();
  for (const ev of myEvaluations) {
    evalMap.set(ev.bidId, ev);
  }

  // Sort bids by score (highest first)
  const scoredBids = bids
    .map((bid) => ({
      bid,
      eval: evalMap.get(bid.id),
    }))
    .sort((a, b) => (b.eval?.totalScore ?? 0) - (a.eval?.totalScore ?? 0));

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">My Evaluation Summary</h2>
            <p className="text-sm text-white/70">
              Your scores for all {bids.length} bidder{bids.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="font-semibold w-8">#</TableHead>
              <TableHead className="font-semibold">Bidder</TableHead>
              {criteria.map((c) => (
                <TableHead
                  key={c.name}
                  className="text-center font-semibold min-w-[80px]"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-default">
                        <span className="text-xs">{c.name}</span>
                        <div className="text-[10px] text-muted-foreground font-normal">
                          max {c.weight}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Max score: {c.weight}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
              <TableHead className="text-center font-semibold min-w-[100px]">
                <span className="text-xs">Total</span>
                <div className="text-[10px] text-muted-foreground font-normal">
                  max {totalWeight}
                </div>
              </TableHead>
              <TableHead className="text-center font-semibold w-20">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scoredBids.map(({ bid, eval: myEval }, index) => {
              const total = myEval?.totalScore ?? 0;
              const passed = total >= minimumTechnicalScore;
              const pct = totalWeight > 0 ? (total / totalWeight) * 100 : 0;

              return (
                <TableRow
                  key={bid.id}
                  className={`transition-colors ${
                    index === 0 && myEval
                      ? "bg-emerald-50/50"
                      : "hover:bg-muted/30"
                  }`}
                >
                  {/* Rank */}
                  <TableCell>
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 && myEval
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm"
                          : index === 1 && myEval
                          ? "bg-slate-200 text-slate-700"
                          : index === 2 && myEval
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </TableCell>

                  {/* Bidder */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {bid.bidderName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {bid.bidderName}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Criteria scores */}
                  {criteria.map((c) => {
                    const cs = myEval?.criteriaScores.find(
                      (s) => s.criteriaName === c.name
                    );
                    const score = cs?.score ?? 0;
                    const scorePct = c.weight > 0 ? (score / c.weight) * 100 : 0;

                    return (
                      <TableCell key={c.name} className="text-center">
                        {myEval ? (
                          <div className="space-y-1">
                            <span
                              className={`text-sm font-semibold ${
                                scorePct >= 80
                                  ? "text-emerald-600"
                                  : scorePct >= 50
                                  ? "text-amber-600"
                                  : "text-red-500"
                              }`}
                            >
                              {score}
                            </span>
                            <ScoreBar score={score} max={c.weight} size="sm" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    );
                  })}

                  {/* Total */}
                  <TableCell className="text-center">
                    {myEval ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-lg font-bold">{total.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            /{totalWeight}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {pct.toFixed(0)}%
                        </div>
                        <ScoreBar score={total} max={totalWeight} size="sm" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Pass/Fail */}
                  <TableCell className="text-center">
                    {myEval ? (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          passed
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {passed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Pass
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Fail
                          </>
                        )}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Remarks row */}
            {scoredBids.some(({ eval: e }) => e?.remarks) && (
              <>
                <TableRow>
                  <TableCell
                    colSpan={criteria.length + 4}
                    className="bg-slate-50 py-2"
                  >
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Your Remarks
                    </span>
                  </TableCell>
                </TableRow>
                {scoredBids
                  .filter(({ eval: e }) => e?.remarks)
                  .map(({ bid, eval: myEval }) => (
                    <TableRow key={`remark-${bid.id}`}>
                      <TableCell />
                      <TableCell className="font-medium text-sm">
                        {bid.bidderName}
                      </TableCell>
                      <TableCell
                        colSpan={criteria.length + 2}
                        className="text-sm text-muted-foreground italic"
                      >
                        &quot;{myEval?.remarks}&quot;
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer with min score reminder */}
      <div className="px-6 py-3 bg-slate-50 border-t flex items-center gap-2 text-sm">
        <Shield className="h-4 w-4 text-amber-500" />
        <span className="text-muted-foreground">Minimum Technical Score:</span>
        <span className="font-semibold text-amber-700">{minimumTechnicalScore}</span>
        <span className="text-muted-foreground">/ {totalWeight}</span>
      </div>
    </Card>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function TenderDetailPage() {
  const { id } = useParams();
  const tenderId = parseInt(id as string, 10);
  const { user } = useAuth();

  // Fetch tender + bids + evaluations
  const {
    data: techData,
    isLoading: techLoading,
    isError: techError,
  } = useQuery({
    queryKey: ["tech-eval-data", tenderId],
    queryFn: async () =>
      (await api.get(`/tenders/${tenderId}/evaluation/technical`)).data
        .data as TechData,
    enabled: !isNaN(tenderId),
  });

  // Fetch committee
  const { data: committeeData, isLoading: committeeLoading } = useQuery({
    queryKey: ["committee", tenderId],
    queryFn: async () =>
      (await api.get(`/tenders/${tenderId}/committee`)).data.data as {
        committee: CommitteeMember[];
      },
    enabled: !isNaN(tenderId),
  });

  // Fetch evaluator assignments for status
  const { data: assignmentsData } = useQuery({
    queryKey: ["evaluator-assignments"],
    queryFn: async () =>
      (await api.get("/evaluator/assignments")).data.data
        .assignments as Assignment[],
  });

  if (techLoading) {
    return <PageSkeleton />;
  }

  if (techError || !techData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-muted-foreground">
          Failed to load tender details
        </p>
        <Link href="/evaluator/tenders">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assigned Tenders
          </Button>
        </Link>
      </div>
    );
  }

  const { tender, bids, myEvaluations } = techData;
  const committee = committeeData?.committee ?? [];
  const currentAssignment = assignmentsData?.find(
    (a) => a.tenderId === tenderId || a.tender.id === tenderId
  );
  const evalStatus = currentAssignment?.evalStatus ?? "Unknown";
  const statusCfg = evalStatusConfig[evalStatus] ?? {
    color: "text-gray-600",
    bg: "bg-gray-100",
  };

  const hasSubmitted =
    myEvaluations.length > 0 && myEvaluations.length === bids.length;

  const criteria = tender.evaluationCriteria;
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  // Build a lookup from bidId to my evaluation
  const evalMap = new Map<number, MyEvaluation>();
  for (const ev of myEvaluations) {
    evalMap.set(ev.bidId, ev);
  }

  const isCompleted =
    evalStatus === "Evaluation Complete" ||
    evalStatus === "Financial Evaluation Available";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/evaluator/tenders"
          className="hover:text-foreground transition-colors"
        >
          Assigned Tenders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-md">
          {tender.title}
        </span>
      </nav>

      {/* ── Top Grid: Tender Info + Committee ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tender Information Card */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <CardTitle className="text-xl lg:text-2xl leading-tight">
                {tender.title}
              </CardTitle>
              <Badge
                variant="outline"
                className={`${statusCfg.bg} ${statusCfg.color} shrink-0 text-xs font-medium`}
              >
                {evalStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Evaluation Criteria
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">
                        Criterion
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Weight (Max Score)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-mono">
                            {c.weight}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 border-t-2">
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right">
                        <Badge className="font-mono bg-blue-600 hover:bg-blue-700">
                          {totalWeight}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">
                  Minimum Technical Score:
                </span>
                <span className="font-semibold text-amber-700">
                  {tender.minimumTechnicalScore}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Committee Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-blue-600" />
              Evaluation Committee
            </CardTitle>
          </CardHeader>
          <CardContent>
            {committeeLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                ))}
              </div>
            ) : committee.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No committee members assigned.
              </p>
            ) : (
              <div className="space-y-1">
                {committee.map((member) => {
                  const isCurrentUser = user?.id === member.userId;
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                        isCurrentUser
                          ? "bg-blue-50 dark:bg-blue-950/30"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCurrentUser
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {member.user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.user.fullName}
                          {isCurrentUser && (
                            <span className="text-blue-600 ml-1">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {member.hasCompletedEvaluation ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                            ) : (
                              <Clock className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.hasCompletedEvaluation
                              ? "Evaluation completed"
                              : "Evaluation pending"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                  <span>Progress</span>
                  <span className="font-medium">
                    {committee.filter((m) => m.hasCompletedEvaluation).length}/
                    {committee.length} completed
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mx-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                    style={{
                      width: `${
                        committee.length > 0
                          ? (committee.filter((m) => m.hasCompletedEvaluation)
                              .length /
                              committee.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── My Evaluation Summary (shown when evaluator has submitted) ─────── */}
      {hasSubmitted && myEvaluations.length > 0 && (
        <EvaluationSummaryCard
          bids={bids}
          myEvaluations={myEvaluations}
          criteria={criteria}
          totalWeight={totalWeight}
          minimumTechnicalScore={tender.minimumTechnicalScore}
        />
      )}

      {/* ── Bids Section ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold">Submitted Bids</h2>
          <Badge
            variant="secondary"
            className="text-sm font-semibold px-3 py-0.5"
          >
            {bids.length}
          </Badge>
        </div>

        {bids.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No bids available to display.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => {
              const myEval = evalMap.get(bid.id);
              return (
                <Card
                  key={bid.id}
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {bid.bidderName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {bid.bidderName}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(
                                new Date(bid.submissionDate),
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {myEval && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 px-3 py-1">
                          <Star className="h-3 w-3 mr-1" />
                          Score: {myEval.totalScore.toFixed(1)}/{totalWeight}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Technical Proposal */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Technical Proposal
                      </h4>
                      <div className="bg-muted/40 rounded-lg p-4 max-h-[200px] overflow-y-auto border border-border/50">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {bid.technicalProposal}
                        </p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Documents
                        {bid.documents.length > 0 && (
                          <span className="ml-1.5 text-xs font-normal">
                            ({bid.documents.length})
                          </span>
                        )}
                      </h4>
                      {bid.documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No documents attached.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {bid.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={`${
                                process.env.NEXT_PUBLIC_API_URL ||
                                "http://localhost:5000/api"
                              }/files/${doc.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/doc inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-background hover:bg-muted/70 hover:border-blue-300 transition-all duration-200"
                            >
                              <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate max-w-[180px]">
                                  {doc.fileName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.fileSize)} ·{" "}
                                  {doc.documentCategory}
                                </p>
                              </div>
                              <Download className="h-3.5 w-3.5 text-muted-foreground group-hover/doc:text-blue-500 transition-colors shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bid Security */}
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          Bid Security
                        </h4>
                        <p className="text-sm mt-0.5">
                          {bid.bidSecurityInfo || (
                            <span className="italic text-muted-foreground">
                              Not provided
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Score Breakdown (if evaluated) */}
                    {myEval && myEval.criteriaScores.length > 0 && (
                      <div className="border rounded-lg overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
                        <div className="px-4 py-3 border-b bg-blue-50/80 dark:bg-blue-950/30">
                          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                            <Star className="h-4 w-4" />
                            Your Score Breakdown
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {myEval.criteriaScores.map((cs, i) => {
                            const criterion = criteria.find(
                              (c) => c.name === cs.criteriaName
                            );
                            const maxScore = criterion?.weight ?? 0;
                            return (
                              <div key={i} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-foreground">
                                    {cs.criteriaName}
                                  </span>
                                  <span className="font-semibold">
                                    {cs.score}
                                    <span className="text-muted-foreground font-normal">
                                      /{maxScore}
                                    </span>
                                  </span>
                                </div>
                                <ScoreBar
                                  score={cs.score}
                                  max={maxScore}
                                  size="sm"
                                />
                              </div>
                            );
                          })}
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">Total Score</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">
                                {myEval.totalScore.toFixed(1)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                / {totalWeight}
                              </span>
                              <Badge
                                variant="outline"
                                className={`ml-1 text-xs ${
                                  myEval.totalScore >= tender.minimumTechnicalScore
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                {myEval.totalScore >= tender.minimumTechnicalScore ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Pass
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Below min
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                          {myEval.remarks && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                  Your Remarks
                                </p>
                                <p className="text-sm text-muted-foreground italic">
                                  &quot;{myEval.remarks}&quot;
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Action Section ────────────────────────────────────────────────── */}
      <div className="pb-4">
        {hasSubmitted ? (
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-900">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300">
                      Evaluation Submitted
                    </p>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      {isCompleted
                        ? "This tender's evaluation process is complete."
                        : "Your technical evaluation has been recorded."}
                    </p>
                  </div>
                </div>
                {!isCompleted && (
                  <Link href={`/evaluator/tenders/${tenderId}/evaluate`}>
                    <Button
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                    >
                      View / Edit Evaluation
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : bids.length > 0 ? (
          <Link href={`/evaluator/tenders/${tenderId}/evaluate`}>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
            >
              Start Evaluation
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
