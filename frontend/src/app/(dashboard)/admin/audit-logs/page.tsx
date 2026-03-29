"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { exportAuditTrailPDF } from "@/lib/pdf-export";
import { AuditLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("ALL");
  const [entityType, setEntityType] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, action, entityType, startDate, endDate],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: "25" });
      if (action !== "ALL") p.set("action", action);
      if (entityType !== "ALL") p.set("entityType", entityType);
      if (startDate) p.set("startDate", startDate);
      if (endDate) p.set("endDate", endDate);
      return (await api.get(`/audit-logs?${p}`)).data.data as {
        logs: (AuditLog & { performedUser: { id: number; fullName: string; email: string } })[];
        total: number;
        page: number;
        totalPages: number;
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <Button
          variant="outline"
          disabled={!data?.logs.length}
          onClick={async () => {
            try {
              const p = new URLSearchParams({ limit: "500" });
              if (action !== "ALL") p.set("action", action);
              if (startDate) p.set("startDate", startDate);
              if (endDate) p.set("endDate", endDate);
              const res = await api.get(`/reports/audit-trail?${p}`);
              exportAuditTrailPDF(
                res.data.data,
                startDate && endDate ? { startDate, endDate } : undefined
              );
            } catch { toast.error("Failed to export"); }
          }}
        >
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Actions</SelectItem>
            <SelectItem value="logged in">Login</SelectItem>
            <SelectItem value="logged out">Logout</SelectItem>
            <SelectItem value="Created">Account Created</SelectItem>
            <SelectItem value="Activated">Activated</SelectItem>
            <SelectItem value="Deactivated">Deactivated</SelectItem>
            <SelectItem value="Changed">Role Changed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityType} onValueChange={(v) => { setEntityType(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Entities</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Tender">Tender</SelectItem>
            <SelectItem value="Bid">Bid</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="w-[160px]" placeholder="From" />
        <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="w-[160px]" placeholder="To" />
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[18%]">Timestamp</TableHead>
              <TableHead className="w-[18%]">User</TableHead>
              <TableHead className="w-[25%]">Action</TableHead>
              <TableHead className="w-[14%]">Entity Type</TableHead>
              <TableHead className="w-[10%]">Entity ID</TableHead>
              <TableHead className="w-[15%]">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : !data?.logs.length ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No audit logs found.</TableCell></TableRow>
            ) : data.logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">{format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}</TableCell>
                <TableCell className="font-medium">{log.performedUser.fullName}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="text-muted-foreground">{log.entityType || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{log.entityId || "—"}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{log.ipAddress || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
