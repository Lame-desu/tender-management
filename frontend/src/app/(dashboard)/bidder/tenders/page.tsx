"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow, isPast, differenceInHours } from "date-fns";
import { Search, Loader2, Clock, Shield, FileText } from "lucide-react";
import api from "@/lib/api";
import { Tender } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const catColors: Record<string, string> = {
  GOODS: "bg-purple-100 text-purple-700",
  WORKS: "bg-orange-100 text-orange-700",
  CONSULTING: "bg-cyan-100 text-cyan-700",
};

type TenderWithCounts = Tender & { _count: { bids: number; addenda: number; clarifications: number } };

function DeadlineCountdown({ deadline }: { deadline: string }) {
  const date = new Date(deadline);
  if (isPast(date)) {
    return <span className="text-red-600 font-medium text-sm">Closed</span>;
  }
  const hours = differenceInHours(date, new Date());
  const display = formatDistanceToNow(date, { addSuffix: false });
  return (
    <span className={`text-sm font-medium ${hours <= 24 ? "text-red-600" : hours <= 72 ? "text-amber-600" : "text-green-600"}`}>
      {display} left
    </span>
  );
}

export default function BrowseTendersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [sort, setSort] = useState("deadline");

  const { data, isLoading } = useQuery({
    queryKey: ["bidder-tenders", page, search, catFilter, sort],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: "12", status: "PUBLISHED" });
      if (search) p.set("search", search);
      if (catFilter !== "ALL") p.set("category", catFilter);
      return (await api.get(`/tenders?${p}`)).data.data as {
        tenders: TenderWithCounts[];
        total: number;
        page: number;
        totalPages: number;
      };
    },
  });

  const tenders = data?.tenders || [];

  const sorted = [...tenders].sort((a, b) => {
    if (sort === "deadline") {
      return new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Browse Tenders</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="GOODS">Goods</SelectItem>
            <SelectItem value="WORKS">Works</SelectItem>
            <SelectItem value="CONSULTING">Consulting</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Deadline: Soonest</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !sorted.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No open tenders available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sorted.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link href={`/bidder/tenders/${t.id}`} className="hover:underline">
                      <CardTitle className="text-base leading-snug">{t.title}</CardTitle>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={catColors[t.category]}>{t.category}</Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">Published</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <DeadlineCountdown deadline={t.submissionDeadline} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.bidSecurityRequired ? (
                      <span className="text-sm">Required (ETB {t.bidSecurityAmount?.toLocaleString()})</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not Required</span>
                    )}
                  </div>
                  {(t._count?.addenda || 0) > 0 && (
                    <span className="text-xs text-amber-600 font-medium">{t._count.addenda} addenda</span>
                  )}
                </div>

                <Link href={`/bidder/tenders/${t.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-1">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">Page {data.page} of {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
