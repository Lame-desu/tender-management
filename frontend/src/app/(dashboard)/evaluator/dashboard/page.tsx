"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2, ClipboardCheck } from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const catColors: Record<string, string> = {
  GOODS: "bg-purple-100 text-purple-700",
  WORKS: "bg-orange-100 text-orange-700",
  CONSULTING: "bg-cyan-100 text-cyan-700",
};

const evalStatusColors: Record<string, string> = {
  "Pending Technical Evaluation": "bg-amber-100 text-amber-700",
  "Technical Submitted — Awaiting others": "bg-blue-100 text-blue-700",
  "Financial Evaluation Available": "bg-cyan-100 text-cyan-700",
  "Evaluation Complete": "bg-green-100 text-green-700",
  "Awaiting Bid Opening": "bg-gray-100 text-gray-600",
};

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

export default function EvaluatorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["evaluator-assignments"],
    queryFn: async () => (await api.get("/evaluator/assignments")).data.data.assignments as Assignment[],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const assignments = data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Evaluations</h1>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No evaluation assignments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{a.tender.title}</CardTitle>
                  <Badge variant="outline" className={evalStatusColors[a.evalStatus] || "bg-gray-100 text-gray-600"}>
                    {a.evalStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={catColors[a.tender.category]}>{a.tender.category}</Badge>
                  <span className="text-xs text-muted-foreground">{a.totalBids} bid(s)</span>
                </div>

                {a.evalStatus === "Pending Technical Evaluation" && (
                  <Link href={`/evaluator/tenders/${a.tender.id}/evaluate`}>
                    <Button className="w-full">Evaluate</Button>
                  </Link>
                )}
                {a.evalStatus === "Technical Submitted — Awaiting others" && (
                  <Link href={`/evaluator/tenders/${a.tender.id}/evaluate`}>
                    <Button variant="outline" className="w-full">View Submission</Button>
                  </Link>
                )}
                {a.evalStatus === "Financial Evaluation Available" && (
                  <Link href={`/evaluator/tenders/${a.tender.id}/evaluate`}>
                    <Button variant="outline" className="w-full">View Results</Button>
                  </Link>
                )}
                {a.evalStatus === "Evaluation Complete" && (
                  <Link href={`/evaluator/tenders/${a.tender.id}/evaluate`}>
                    <Button variant="outline" className="w-full">View Results</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
