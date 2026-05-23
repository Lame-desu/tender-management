"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FileText,
  BarChart3,
  ClipboardEdit,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Clock,
  CircleDot,
  Hourglass,
  ArrowRight,
  Eye,
  Trophy,
  Inbox,
} from "lucide-react";
import { format, isPast, formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ── Types ────────────────────────────────────────────────────────────────────

interface Assignment {
  id: number;
  tenderId: number;
  createdAt?: string;
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

// ── Status helpers ───────────────────────────────────────────────────────────

type EvalKey = "pending" | "submitted" | "financial" | "complete" | "awaiting";

function evalKey(status: string): EvalKey {
  switch (status) {
    case "Pending Technical Evaluation":
      return "pending";
    case "Technical Submitted — Awaiting others":
      return "submitted";
    case "Financial Evaluation Available":
      return "financial";
    case "Evaluation Complete":
      return "complete";
    case "Awaiting Bid Opening":
      return "awaiting";
    default:
      return "awaiting";
  }
}

const statusConfig: Record<
  EvalKey,
  {
    label: string;
    badgeClass: string;
    borderClass: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Pending Evaluation",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    borderClass: "border-l-amber-500",
    icon: <CircleDot className="h-3 w-3 fill-amber-500 text-amber-500" />,
  },
  submitted: {
    label: "Submitted",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    borderClass: "border-l-blue-500",
    icon: <CircleDot className="h-3 w-3 fill-blue-500 text-blue-500" />,
  },
  financial: {
    label: "Financial Available",
    badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
    borderClass: "border-l-cyan-500",
    icon: <CircleDot className="h-3 w-3 fill-cyan-500 text-cyan-500" />,
  },
  complete: {
    label: "Complete",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    borderClass: "border-l-green-500",
    icon: <CheckCircle2 className="h-3 w-3 text-green-600" />,
  },
  awaiting: {
    label: "Awaiting Bids",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    borderClass: "border-l-gray-300",
    icon: <CircleDot className="h-3 w-3 fill-gray-400 text-gray-400" />,
  },
};

const categoryConfig: Record<string, string> = {
  GOODS: "bg-violet-100 text-violet-700 border-violet-200",
  WORKS: "bg-amber-100 text-amber-700 border-amber-200",
  CONSULTING: "bg-teal-100 text-teal-700 border-teal-200",
};

// ── Tab filter logic ─────────────────────────────────────────────────────────

type TabKey = "all" | "pending" | "in-progress" | "completed";

function filterByTab(assignments: Assignment[], tab: TabKey): Assignment[] {
  switch (tab) {
    case "pending":
      return assignments.filter(
        (a) => a.evalStatus === "Pending Technical Evaluation"
      );
    case "in-progress":
      return assignments.filter(
        (a) => a.evalStatus === "Technical Submitted — Awaiting others"
      );
    case "completed":
      return assignments.filter(
        (a) =>
          a.evalStatus === "Evaluation Complete" ||
          a.evalStatus === "Financial Evaluation Available"
      );
    default:
      return assignments;
  }
}

// ── Skeleton Card ────────────────────────────────────────────────────────────

function TenderCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-muted overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabKey }) {
  const messages: Record<TabKey, { title: string; desc: string; icon: React.ReactNode }> = {
    all: {
      title: "No Assigned Tenders",
      desc: "You haven't been assigned to any tenders yet. Check back later.",
      icon: <Inbox className="h-12 w-12" />,
    },
    pending: {
      title: "No Pending Evaluations",
      desc: "You've completed all pending evaluations. Great work!",
      icon: <CheckCircle2 className="h-12 w-12" />,
    },
    "in-progress": {
      title: "No In-Progress Evaluations",
      desc: "No evaluations are currently awaiting other committee members.",
      icon: <Hourglass className="h-12 w-12" />,
    },
    completed: {
      title: "No Completed Evaluations",
      desc: "You haven't completed any evaluations yet.",
      icon: <Trophy className="h-12 w-12" />,
    },
  };

  const { title, desc, icon } = messages[tab];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{desc}</p>
    </div>
  );
}

// ── Tender Card ──────────────────────────────────────────────────────────────

function TenderCard({ assignment }: { assignment: Assignment }) {
  const key = evalKey(assignment.evalStatus);
  const config = statusConfig[key];
  const catClass =
    categoryConfig[assignment.tender.category] ||
    "bg-gray-100 text-gray-600 border-gray-200";
  const deadline = new Date(assignment.tender.submissionDeadline);
  const deadlinePast = isPast(deadline);
  const progress =
    assignment.totalBids > 0
      ? Math.round(
          (assignment.myEvaluationsCount / assignment.totalBids) * 100
        )
      : 0;

  // Action button config
  const actionMap: Record<
    EvalKey,
    {
      label: string;
      variant: "default" | "outline" | "ghost";
      href: string;
      disabled: boolean;
      icon: React.ReactNode;
      gradient?: string;
    }
  > = {
    pending: {
      label: "Start Evaluation",
      variant: "default",
      href: `/evaluator/tenders/${assignment.tender.id}`,
      disabled: false,
      icon: <ArrowRight className="h-4 w-4 ml-2" />,
      gradient:
        "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/25",
    },
    submitted: {
      label: "View Submission",
      variant: "outline",
      href: `/evaluator/tenders/${assignment.tender.id}`,
      disabled: false,
      icon: <Eye className="h-4 w-4 ml-2" />,
    },
    financial: {
      label: "View Results",
      variant: "outline",
      href: `/evaluator/tenders/${assignment.tender.id}`,
      disabled: false,
      icon: <Eye className="h-4 w-4 ml-2" />,
    },
    complete: {
      label: "View Results",
      variant: "outline",
      href: `/evaluator/tenders/${assignment.tender.id}`,
      disabled: false,
      icon: <Eye className="h-4 w-4 ml-2" />,
    },
    awaiting: {
      label: "Awaiting Bid Opening",
      variant: "ghost",
      href: "#",
      disabled: true,
      icon: <Clock className="h-4 w-4 ml-2" />,
    },
  };

  const action = actionMap[key];

  return (
    <Card
      className={`border-l-4 ${config.borderClass} overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group`}
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {assignment.tender.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <Badge variant="outline" className={catClass}>
            {assignment.tender.category}
          </Badge>
          <Badge variant="outline" className={`gap-1.5 ${config.badgeClass}`}>
            {config.icon}
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Bids */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <BarChart3 className="h-3.5 w-3.5" />
              Bids
            </div>
            <p className="text-sm font-semibold">
              {assignment.totalBids}{" "}
              <span className="font-normal text-muted-foreground">
                submitted
              </span>
            </p>
          </div>

          {/* Progress */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <ClipboardEdit className="h-3.5 w-3.5" />
              Progress
            </div>
            <p className="text-sm font-semibold">
              {assignment.myEvaluationsCount}/{assignment.totalBids}{" "}
              <span className="font-normal text-muted-foreground">
                evaluated
              </span>
            </p>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <CalendarDays className="h-3.5 w-3.5" />
              Deadline
            </div>
            <p
              className={`text-sm font-semibold ${
                deadlinePast ? "text-red-600" : ""
              }`}
            >
              {format(deadline, "MMM d, yyyy")}
            </p>
            <p
              className={`text-xs ${
                deadlinePast
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {deadlinePast
                ? `${formatDistanceToNow(deadline)} ago`
                : `in ${formatDistanceToNow(deadline)}`}
            </p>
          </div>

          {/* Assigned */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <ClipboardList className="h-3.5 w-3.5" />
              Assigned
            </div>
            <p className="text-sm font-semibold">
              {assignment.createdAt
                ? format(new Date(assignment.createdAt), "MMM d, yyyy")
                : "—"}
            </p>
            {assignment.createdAt && (
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(assignment.createdAt))} ago
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter>
        {action.disabled ? (
          <Button
            variant="ghost"
            className="w-full cursor-not-allowed opacity-60"
            disabled
          >
            <Clock className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ) : (
          <Link href={action.href} className="w-full">
            <Button
              variant={action.gradient ? "default" : action.variant}
              className={`w-full ${action.gradient || ""}`}
            >
              {action.label}
              {action.icon}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function EvaluatorTendersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["evaluator-assignments"],
    queryFn: async () =>
      (await api.get("/evaluator/assignments")).data.data
        .assignments as Assignment[],
  });

  const assignments = useMemo(() => data || [], [data]);

  const counts = useMemo(() => {
    const all = assignments.length;
    const pending = assignments.filter(
      (a) => a.evalStatus === "Pending Technical Evaluation"
    ).length;
    const inProgress = assignments.filter(
      (a) => a.evalStatus === "Technical Submitted — Awaiting others"
    ).length;
    const completed = assignments.filter(
      (a) =>
        a.evalStatus === "Evaluation Complete" ||
        a.evalStatus === "Financial Evaluation Available"
    ).length;
    return { all, pending, inProgress, completed };
  }, [assignments]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Assigned Tenders
            </h1>
            <p className="text-sm text-muted-foreground">
              View and evaluate tenders assigned to you
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all" className="gap-1.5">
            All
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px] rounded-full"
            >
              {isLoading ? "…" : counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            Pending
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px] rounded-full bg-amber-100 text-amber-700"
            >
              {isLoading ? "…" : counts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-1.5">
            In Progress
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px] rounded-full bg-blue-100 text-blue-700"
            >
              {isLoading ? "…" : counts.inProgress}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            Completed
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px] rounded-full bg-green-100 text-green-700"
            >
              {isLoading ? "…" : counts.completed}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {(["all", "pending", "in-progress", "completed"] as TabKey[]).map(
          (tab) => (
            <TabsContent key={tab} value={tab}>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TenderCardSkeleton key={i} />
                  ))}
                </div>
              ) : filterByTab(assignments, tab).length === 0 ? (
                <EmptyState tab={tab} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByTab(assignments, tab).map((a) => (
                    <TenderCard key={a.id} assignment={a} />
                  ))}
                </div>
              )}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}
