"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import {
  Users, UserCheck, FileText, FolderOpen, Activity, Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Stats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  totalTenders: number;
  tendersByStatus: Record<string, number>;
  totalBids: number;
  recentActivity: { id: number; action: string; entityType: string | null; entityId: number | null; timestamp: string; userName: string }[];
}

export default function MonitoringPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/users/stats")).data.data as Stats,
    refetchInterval: 30000,
  });

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const r = stats.usersByRole;
  const s = stats.usersByStatus;
  const t = stats.tendersByStatus;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Monitoring</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="flex flex-wrap gap-1.5 mt-2 text-xs text-muted-foreground">
              <span>{r.ADMIN || 0} admins</span><span>&middot;</span>
              <span>{r.PROCUREMENT_OFFICER || 0} officers</span><span>&middot;</span>
              <span>{r.EVALUATOR || 0} evaluators</span><span>&middot;</span>
              <span>{r.BIDDER || 0} bidders</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Accounts</CardTitle>
            <UserCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{s.PENDING || 0}</div>
            <Link href="/admin/users?status=PENDING" className="text-xs text-primary hover:underline mt-2 inline-block">
              Review pending accounts &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTenders}</div>
            <div className="flex flex-wrap gap-1.5 mt-2 text-xs text-muted-foreground">
              <span>{t.DRAFT || 0} draft</span><span>&middot;</span>
              <span>{t.PUBLISHED || 0} published</span><span>&middot;</span>
              <span>{t.AWARDED || 0} awarded</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bids</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBids}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {s.ACTIVE || 0} active users
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!stats.recentActivity.length ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No recent activity.</TableCell></TableRow>
              ) : stats.recentActivity.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-sm">{format(new Date(a.timestamp), "MMM d, HH:mm")}</TableCell>
                  <TableCell className="font-medium text-sm">{a.userName}</TableCell>
                  <TableCell className="text-sm">{a.action}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {a.entityType ? <Badge variant="outline" className="text-xs">{a.entityType}{a.entityId ? ` #${a.entityId}` : ""}</Badge> : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
