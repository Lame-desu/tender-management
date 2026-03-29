"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, FilePlus, FileCheck, Award, Plus, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Tender } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700", PUBLISHED: "bg-blue-100 text-blue-700",
  UNDER_EVALUATION: "bg-amber-100 text-amber-700", AWARDED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};
const catColors: Record<string, string> = {
  GOODS: "bg-purple-100 text-purple-700", WORKS: "bg-orange-100 text-orange-700",
  CONSULTING: "bg-cyan-100 text-cyan-700",
};

export default function OfficerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["officer-stats"],
    queryFn: async () => (await api.get("/tenders/officer-stats")).data.data as {
      total: number;
      byStatus: Record<string, number>;
      recentTenders: (Tender & { _count: { bids: number } })[];
    },
  });

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const s = data.byStatus;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/officer/tenders/new"><Button><Plus className="mr-2 h-4 w-4" />Create Tender</Button></Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tenders", value: data.total, icon: FileText, color: "text-muted-foreground" },
          { label: "Draft", value: s.DRAFT || 0, icon: FilePlus, color: "text-gray-600" },
          { label: "Published", value: s.PUBLISHED || 0, icon: FileCheck, color: "text-blue-600" },
          { label: "Awarded", value: s.AWARDED || 0, icon: Award, color: "text-green-600" },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{c.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Tenders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Title</TableHead>
                <TableHead className="w-[14%]">Category</TableHead>
                <TableHead className="w-[16%]">Status</TableHead>
                <TableHead className="w-[15%]">Deadline</TableHead>
                <TableHead className="w-[8%]">Bids</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data.recentTenders.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No tenders yet. Create your first tender!</TableCell></TableRow>
              ) : data.recentTenders.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium max-w-[250px] truncate">{t.title}</TableCell>
                  <TableCell><Badge variant="outline" className={catColors[t.category]}>{t.category}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[t.status]}>{t.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(t.submissionDeadline), "MMM d, yyyy")}</TableCell>
                  <TableCell>{t._count.bids}</TableCell>
                  <TableCell><Link href={`/officer/tenders/${t.id}`}><Button variant="ghost" size="sm">View</Button></Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
