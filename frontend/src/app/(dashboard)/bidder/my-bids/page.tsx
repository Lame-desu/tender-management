"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, FileText, Download, Eye, Trophy, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Bid, BidDocument, TenderCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const bidStatusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  OPENED: "bg-cyan-100 text-cyan-700",
  TECHNICALLY_QUALIFIED: "bg-green-100 text-green-700",
  TECHNICALLY_DISQUALIFIED: "bg-red-100 text-red-700",
  EVALUATED: "bg-amber-100 text-amber-700",
  SELECTED: "bg-green-200 text-green-800 font-semibold",
  NOT_SELECTED: "bg-gray-100 text-gray-600",
};

const catColors: Record<string, string> = {
  GOODS: "bg-purple-100 text-purple-700",
  WORKS: "bg-orange-100 text-orange-700",
  CONSULTING: "bg-cyan-100 text-cyan-700",
};

const tenderStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PUBLISHED: "bg-blue-100 text-blue-700",
  UNDER_EVALUATION: "bg-amber-100 text-amber-700",
  AWARDED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

type BidWithTender = Bid & {
  tender: { id: number; title: string; category: TenderCategory; status: string; submissionDeadline: string };
  _count: { documents: number };
};

type BidDetail = Bid & {
  documents: BidDocument[];
  tender: {
    id: number; title: string; category: string; status: string;
    createdBy: number; submissionDeadline: string;
    bidSecurityRequired: boolean; bidSecurityAmount: number | null;
  };
  bidOwner: { id: number; fullName: string; bidderProfile: { organizationName: string | null } | null };
  evaluationSummary: {
    avgTechnicalScore: number; avgFinancialScore: number | null;
    combinedScore: number | null; rank: number | null; isWinner: boolean;
  } | null;
  debriefingRequest: {
    id: number; requestDate: string; response: string | null; respondedDate: string | null;
  } | null;
};

type ApiErr = { response?: { data?: { message?: string } } };

export default function MyBidsPage() {
  const [page, setPage] = useState(1);
  const [selectedBidId, setSelectedBidId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bids", page],
    queryFn: async () => {
      return (await api.get(`/bids/my-bids?page=${page}&limit=15`)).data.data as {
        bids: BidWithTender[];
        total: number;
        page: number;
        totalPages: number;
      };
    },
  });

  const { data: bidDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["bid-detail", selectedBidId],
    queryFn: async () => (await api.get(`/bids/${selectedBidId}`)).data.data.bid as BidDetail,
    enabled: !!selectedBidId,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bids</h1>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tender Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Bid Amount</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Bid Status</TableHead>
              <TableHead>Tender Status</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !data?.bids.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  You haven&apos;t submitted any bids yet.{" "}
                  <Link href="/bidder/tenders" className="text-primary hover:underline">Browse tenders</Link>
                </TableCell>
              </TableRow>
            ) : (
              data.bids.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    <Link href={`/bidder/tenders/${b.tender.id}`} className="hover:underline">{b.tender.title}</Link>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={catColors[b.tender.category]}>{b.tender.category}</Badge></TableCell>
                  <TableCell>ETB {b.bidAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(b.submissionDate), "MMM d, yyyy")}</TableCell>
                  <TableCell><Badge variant="outline" className={bidStatusColors[b.status]}>{b.status.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={tenderStatusColors[b.tender.status]}>{b.tender.status.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBidId(b.id)}>
                      <Eye className="h-4 w-4 mr-1" />View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
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

      {selectedBidId && (
        <Dialog open onOpenChange={() => setSelectedBidId(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Bid Details</DialogTitle></DialogHeader>
            {detailLoading || !bidDetail ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-4">
                {/* Result Banner */}
                {bidDetail.status === "SELECTED" && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div><p className="font-semibold text-green-800">Your bid has been selected!</p><p className="text-sm text-green-700">Congratulations on winning this tender.</p></div>
                  </div>
                )}
                {bidDetail.status === "NOT_SELECTED" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <p className="font-medium text-gray-700">Your bid was not selected</p>
                    <p className="text-sm text-muted-foreground">You may request a debriefing to understand the evaluation results.</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground">Tender</p>
                  <Link href={`/bidder/tenders/${bidDetail.tender.id}`} className="text-sm font-medium text-primary hover:underline">{bidDetail.tender.title}</Link>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Technical Summary</p>
                  <p className="text-sm whitespace-pre-wrap mt-1">{bidDetail.technicalProposal}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Bid Amount</p><p className="text-sm font-medium">ETB {bidDetail.bidAmount.toLocaleString()}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline" className={bidStatusColors[bidDetail.status]}>{bidDetail.status.replace(/_/g, " ")}</Badge></div>
                </div>
                {bidDetail.bidSecurityInfo && (
                  <><Separator /><div><p className="text-xs text-muted-foreground">Bid Security Info</p><p className="text-sm mt-1">{bidDetail.bidSecurityInfo}</p></div></>
                )}
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Uploaded Documents ({bidDetail.documents.length})</p>
                  {bidDetail.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents.</p>
                  ) : (
                    <div className="space-y-2">
                      {bidDetail.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{doc.fileName}</span>
                            <Badge variant="outline" className="text-xs">{doc.documentCategory}</Badge>
                          </div>
                          <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/files/${doc.id}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {bidDetail.evaluationSummary && (
                  <><Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Evaluation Results</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Technical Score: </span><strong>{bidDetail.evaluationSummary.avgTechnicalScore.toFixed(1)}</strong></div>
                      {bidDetail.evaluationSummary.avgFinancialScore != null && (
                        <div><span className="text-muted-foreground">Financial Score: </span><strong>{bidDetail.evaluationSummary.avgFinancialScore.toFixed(1)}</strong></div>
                      )}
                      {bidDetail.evaluationSummary.combinedScore != null && (
                        <div><span className="text-muted-foreground">Combined Score: </span><strong>{bidDetail.evaluationSummary.combinedScore.toFixed(1)}</strong></div>
                      )}
                      {bidDetail.evaluationSummary.rank != null && (
                        <div><span className="text-muted-foreground">Rank: </span><strong>#{bidDetail.evaluationSummary.rank}</strong></div>
                      )}
                    </div>
                  </div></>
                )}

                {/* Debriefing Section */}
                {bidDetail.status === "NOT_SELECTED" && (
                  <><Separator /><DebriefingSection bidId={bidDetail.id} debriefing={bidDetail.debriefingRequest} /></>
                )}

                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm">{format(new Date(bidDetail.submissionDate), "MMM d, yyyy HH:mm")}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function DebriefingSection({ bidId, debriefing }: {
  bidId: number;
  debriefing: { id: number; requestDate: string; response: string | null; respondedDate: string | null } | null;
}) {
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestMut = useMutation({
    mutationFn: async () => { await api.post(`/bids/${bidId}/debriefing`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bid-detail", bidId] });
      toast.success("Debriefing requested");
      setConfirmOpen(false);
    },
    onError: (e: ApiErr) => { toast.error(e.response?.data?.message || "Failed"); setConfirmOpen(false); },
  });

  if (!debriefing) {
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-2">Debriefing</p>
        <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
          <MessageSquare className="mr-2 h-3.5 w-3.5" />Request Debriefing
        </Button>
        {confirmOpen && (
          <Dialog open onOpenChange={() => setConfirmOpen(false)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Request Debriefing</DialogTitle>
                <DialogDescription>You will receive an explanation of the evaluation results and how your bid was assessed.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button onClick={() => requestMut.mutate()} disabled={requestMut.isPending}>
                  {requestMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">Debriefing</p>
      <div className="border rounded-md p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Requested {format(new Date(debriefing.requestDate), "MMM d, yyyy")}</span>
          {debriefing.response ? (
            <Badge variant="outline" className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Responded</Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-700">Pending</Badge>
          )}
        </div>
        {debriefing.response && (
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1">Response — {debriefing.respondedDate && format(new Date(debriefing.respondedDate), "MMM d, yyyy")}</p>
            <p className="text-sm whitespace-pre-wrap">{debriefing.response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
