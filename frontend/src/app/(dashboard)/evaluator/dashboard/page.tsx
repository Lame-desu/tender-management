"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ClipboardCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Flame,
  ArrowRight,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Colour maps                                                        */
/* ------------------------------------------------------------------ */

const catColors: Record<string, string> = {
  GOODS: "bg-violet-100 text-violet-700 border-violet-200",
  WORKS: "bg-orange-100 text-orange-700 border-orange-200",
  CONSULTING: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const evalStatusColors: Record<string, string> = {
  "Pending Technical Evaluation": "bg-amber-50 text-amber-700 border-amber-200",
  "Technical Submitted — Awaiting others": "bg-blue-50 text-blue-700 border-blue-200",
  "Financial Evaluation Available": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Evaluation Complete": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Awaiting Bid Opening": "bg-gray-100 text-gray-600 border-gray-200",
};

const statusBorderAccent: Record<string, string> = {
  "Pending Technical Evaluation": "border-l-amber-500",
  "Technical Submitted — Awaiting others": "border-l-blue-500",
  "Financial Evaluation Available": "border-l-cyan-500",
  "Evaluation Complete": "border-l-emerald-500",
  "Awaiting Bid Opening": "border-l-gray-400",
};

/* ------------------------------------------------------------------ */
/*  Skeleton Loader                                                    */
/* ------------------------------------------------------------------ */

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action required skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-64" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All assignments skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-32 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  count,
  label,
  gradient,
  iconColor,
}: {
  icon: React.ElementType;
  count: number;
  label: string;
  gradient: string;
  iconColor: string;
}) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-0 shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${gradient}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tracking-tight">{count}</p>
            <p className="text-xs font-medium text-muted-foreground truncate">
              {label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Action Required Card                                               */
/* ------------------------------------------------------------------ */

function ActionCard({ assignment }: { assignment: Assignment }) {
  const deadline = new Date(assignment.tender.submissionDeadline);
  const overdue = isPast(deadline);

  return (
    <Card
      className={`group overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        statusBorderAccent[assignment.evalStatus] || "border-l-gray-400"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {assignment.tender.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[11px] ${catColors[assignment.tender.category] || "bg-gray-100 text-gray-600"}`}
              >
                {assignment.tender.category}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {assignment.totalBids} bid{assignment.totalBids !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                }`}
              >
                <Calendar className="h-3 w-3" />
                {overdue
                  ? "Overdue"
                  : `Due ${formatDistanceToNow(deadline, { addSuffix: true })}`}
              </span>
            </div>
          </div>

          <Link
            href={`/evaluator/tenders/${assignment.tender.id}`}
            className="shrink-0"
          >
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-sm"
            >
              Start Evaluation
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Assignment Grid Card                                               */
/* ------------------------------------------------------------------ */

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const progress =
    assignment.totalBids > 0
      ? Math.round((assignment.myEvaluationsCount / assignment.totalBids) * 100)
      : 0;

  const deadline = new Date(assignment.tender.submissionDeadline);
  const overdue = isPast(deadline);

  const actionButton = () => {
    switch (assignment.evalStatus) {
      case "Pending Technical Evaluation":
        return (
          <Link href={`/evaluator/tenders/${assignment.tender.id}`} className="block">
            <Button className="w-full gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-sm">
              Evaluate
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        );
      case "Technical Submitted — Awaiting others":
        return (
          <Link href={`/evaluator/tenders/${assignment.tender.id}`} className="block">
            <Button variant="outline" className="w-full gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              View Submission
            </Button>
          </Link>
        );
      case "Financial Evaluation Available":
        return (
          <Link href={`/evaluator/tenders/${assignment.tender.id}`} className="block">
            <Button variant="outline" className="w-full gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              View Results
            </Button>
          </Link>
        );
      case "Evaluation Complete":
        return (
          <Link href={`/evaluator/tenders/${assignment.tender.id}`} className="block">
            <Button variant="outline" className="w-full gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              <CheckCircle2 className="h-3.5 w-3.5" />
              View Results
            </Button>
          </Link>
        );
      case "Awaiting Bid Opening":
        return (
          <Button variant="outline" className="w-full gap-1.5" disabled>
            <Clock className="h-3.5 w-3.5" />
            Awaiting Bids
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className={`group overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        statusBorderAccent[assignment.evalStatus] || "border-l-gray-400"
      }`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Title & status */}
        <div className="space-y-2.5">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {assignment.tender.title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={`text-[11px] ${catColors[assignment.tender.category] || "bg-gray-100 text-gray-600"}`}
            >
              {assignment.tender.category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[11px] ${evalStatusColors[assignment.evalStatus] || "bg-gray-100 text-gray-600"}`}
            >
              {assignment.evalStatus}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {assignment.totalBids} bid{assignment.totalBids !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-foreground/70">
            <TrendingUp className="h-3 w-3" />
            {assignment.myEvaluationsCount}/{assignment.totalBids} evaluated
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-between text-xs">
          <span
            className={`inline-flex items-center gap-1 ${
              overdue ? "text-red-600 font-medium" : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-3 w-3" />
            {overdue ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </>
            ) : (
              format(deadline, "MMM d, yyyy")
            )}
          </span>
          {!overdue && (
            <span className="text-muted-foreground">
              {formatDistanceToNow(deadline, { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Action button */}
        {actionButton()}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function EvaluatorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["evaluator-assignments"],
    queryFn: async () =>
      (await api.get("/evaluator/assignments")).data.data
        .assignments as Assignment[],
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-1">
        <DashboardSkeleton />
      </div>
    );
  }

  const assignments = data || [];

  /* ---------- derived counts ---------- */
  const totalCount = assignments.length;
  const pendingCount = assignments.filter(
    (a) => a.evalStatus === "Pending Technical Evaluation"
  ).length;
  const completedCount = assignments.filter((a) =>
    [
      "Evaluation Complete",
      "Technical Submitted — Awaiting others",
      "Financial Evaluation Available",
    ].includes(a.evalStatus)
  ).length;
  const awaitingCount = assignments.filter(
    (a) => a.evalStatus === "Awaiting Bid Opening"
  ).length;

  /* ---------- action-required items (pending, sorted by deadline) ---------- */
  const actionRequired = assignments
    .filter((a) => a.evalStatus === "Pending Technical Evaluation")
    .sort(
      (a, b) =>
        new Date(a.tender.submissionDeadline).getTime() -
        new Date(b.tender.submissionDeadline).getTime()
    );

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-1">
      {/* ============================================================ */}
      {/*  Welcome Header                                               */}
      {/* ============================================================ */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your evaluation assignments.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  Empty state                                                   */}
      {/* ============================================================ */}
      {assignments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No assignments yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              You haven&apos;t been assigned to any tender evaluations. When a
              procurement officer assigns you, your tasks will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ======================================================== */}
          {/*  Stats Overview                                           */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              count={totalCount}
              label="Total Assignments"
              gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
              iconColor="text-white"
            />
            <StatCard
              icon={Clock}
              count={pendingCount}
              label="Pending Evaluations"
              gradient="bg-gradient-to-br from-amber-400 to-yellow-500"
              iconColor="text-white"
            />
            <StatCard
              icon={CheckCircle2}
              count={completedCount}
              label="Completed"
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              iconColor="text-white"
            />
            <StatCard
              icon={AlertTriangle}
              count={awaitingCount}
              label="Awaiting Bid Opening"
              gradient="bg-gradient-to-br from-gray-400 to-gray-500"
              iconColor="text-white"
            />
          </div>

          {/* ======================================================== */}
          {/*  Action Required                                          */}
          {/* ======================================================== */}
          {actionRequired.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Action Required
                </h2>
                <Badge className="ml-1 bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                  {actionRequired.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {actionRequired.map((a) => (
                  <ActionCard key={a.id} assignment={a} />
                ))}
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/*  All Assignments                                          */}
          {/* ======================================================== */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                All Assignments
              </h2>
              <Badge variant="secondary" className="ml-1">
                {totalCount}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
