"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Search, FolderOpen, Clock, Trophy, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Tender, Bid, TenderCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const catColors: Record<string, string> = {
  GOODS: "bg-purple-100 text-purple-700",
  WORKS: "bg-orange-100 text-orange-700",
  CONSULTING: "bg-cyan-100 text-cyan-700",
};

const bidStatusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  OPENED: "bg-cyan-100 text-cyan-700",
  TECHNICALLY_QUALIFIED: "bg-green-100 text-green-700",
  TECHNICALLY_DISQUALIFIED: "bg-red-100 text-red-700",
  EVALUATED: "bg-amber-100 text-amber-700",
  SELECTED: "bg-green-200 text-green-800 font-semibold",
  NOT_SELECTED: "bg-gray-100 text-gray-600",
};

interface Stats {
  activeTenders: number;
  totalBids: number;
  pendingResults: number;
  wonBids: number;
  recentTenders: (Tender & { _count: { bids: number; addenda: number } })[];
  recentBids: (Bid & { tender: { id: number; title: string; category: TenderCategory; status: string } })[];
}

export default function BidderDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["bidder-stats"],
    queryFn: async () => (await api.get("/bids/stats")).data.data as Stats,
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Tenders", value: data.activeTenders, icon: Search, color: "text-blue-600" },
          { label: "My Bids", value: data.totalBids, icon: FolderOpen, color: "text-purple-600" },
          { label: "Pending Results", value: data.pendingResults, icon: Clock, color: "text-amber-600" },
          { label: "Won Bids", value: data.wonBids, icon: Trophy, color: "text-green-600" },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Tenders</CardTitle>
              <Link href="/bidder/tenders">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!data.recentTenders.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No open tenders available.</p>
            ) : (
              data.recentTenders.map((t) => (
                <Link key={t.id} href={`/bidder/tenders/${t.id}`} className="block">
                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${catColors[t.category]}`}>{t.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(t.submissionDeadline), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">My Recent Bids</CardTitle>
              <Link href="/bidder/my-bids">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!data.recentBids.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">You haven&apos;t submitted any bids yet.</p>
            ) : (
              data.recentBids.map((b) => (
                <Link key={b.id} href={`/bidder/my-bids?bid=${b.id}`} className="block">
                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{b.tender?.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ETB {b.bidAmount.toLocaleString()} &middot; {format(new Date(b.submissionDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs flex-shrink-0 ${bidStatusColors[b.status]}`}>
                      {b.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
