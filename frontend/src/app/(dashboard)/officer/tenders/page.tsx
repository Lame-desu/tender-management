"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Send, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { isPast } from "date-fns";
import api from "@/lib/api";
import { Tender } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700", PUBLISHED: "bg-blue-100 text-blue-700",
  UNDER_EVALUATION: "bg-amber-100 text-amber-700", AWARDED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};
const catColors: Record<string, string> = {
  GOODS: "bg-purple-100 text-purple-700", WORKS: "bg-orange-100 text-orange-700",
  CONSULTING: "bg-cyan-100 text-cyan-700",
};

type TenderWithCounts = Tender & { _count: { bids: number; addenda: number; clarifications: number } };
type ApiErr = { response?: { data?: { message?: string } } };

export default function TendersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [catFilter, setCatFilter] = useState("ALL");
  const [confirmAction, setConfirmAction] = useState<{ tender: TenderWithCounts; action: "publish" | "cancel" } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["officer-tenders", page, search, statusFilter, catFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) p.set("search", search);
      if (statusFilter !== "ALL") p.set("status", statusFilter);
      if (catFilter !== "ALL") p.set("category", catFilter);
      return (await api.get(`/tenders?${p}`)).data.data as { tenders: TenderWithCounts[]; total: number; page: number; totalPages: number };
    },
  });

  const actionMut = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => {
      await api.patch(`/tenders/${id}/${action}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["officer-tenders"] });
      toast.success(confirmAction?.action === "publish" ? "Tender published" : "Tender cancelled");
      setConfirmAction(null);
    },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Action failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Tenders</h1>
        <Link href="/officer/tenders/new"><Button><Plus className="mr-2 h-4 w-4" />Create Tender</Button></Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tenders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="UNDER_EVALUATION">Under Evaluation</SelectItem>
            <SelectItem value="AWARDED">Awarded</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="GOODS">Goods</SelectItem>
            <SelectItem value="WORKS">Works</SelectItem>
            <SelectItem value="CONSULTING">Consulting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Title</TableHead>
              <TableHead className="w-[12%]">Category</TableHead>
              <TableHead className="w-[18%]">Status</TableHead>
              <TableHead className="w-[13%]">Published</TableHead>
              <TableHead className="w-[13%]">Deadline</TableHead>
              <TableHead className="w-[6%]">Bids</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : !data?.tenders.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No tenders found.</TableCell></TableRow>
            ) : data.tenders.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium max-w-[250px] truncate">{t.title}</TableCell>
                <TableCell><Badge variant="outline" className={catColors[t.category]}>{t.category}</Badge></TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[t.status]}>{t.status.replace("_", " ")}</Badge>
                  {t.status === "PUBLISHED" && isPast(new Date(t.submissionDeadline)) && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 ml-1"><AlertTriangle className="h-3 w-3 mr-0.5" />Awaiting Opening</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{t.publishDate ? format(new Date(t.publishDate), "MMM d, yyyy") : "—"}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(t.submissionDeadline), "MMM d, yyyy")}</TableCell>
                <TableCell>{t._count.bids}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/officer/tenders/${t.id}`}><Eye className="mr-2 h-4 w-4" />View</Link></DropdownMenuItem>
                      {t.status === "DRAFT" && <DropdownMenuItem asChild><Link href={`/officer/tenders/${t.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>}
                      {t.status === "DRAFT" && <DropdownMenuItem onClick={() => setConfirmAction({ tender: t, action: "publish" })}><Send className="mr-2 h-4 w-4" />Publish</DropdownMenuItem>}
                      {["DRAFT", "PUBLISHED"].includes(t.status) && <DropdownMenuItem onClick={() => setConfirmAction({ tender: t, action: "cancel" })} className="text-destructive"><XCircle className="mr-2 h-4 w-4" />Cancel</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
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

      {confirmAction && (
        <Dialog open onOpenChange={() => setConfirmAction(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{confirmAction.action === "publish" ? "Publish Tender" : "Cancel Tender"}</DialogTitle>
              <DialogDescription>
                {confirmAction.action === "publish"
                  ? `Publish "${confirmAction.tender.title}"? All bidders will be notified.`
                  : `Cancel "${confirmAction.tender.title}"? This action cannot be undone.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
              <Button
                variant={confirmAction.action === "cancel" ? "destructive" : "default"}
                onClick={() => actionMut.mutate({ id: confirmAction.tender.id, action: confirmAction.action })}
                disabled={actionMut.isPending}
              >
                {actionMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {confirmAction.action === "publish" ? "Publish" : "Cancel Tender"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
