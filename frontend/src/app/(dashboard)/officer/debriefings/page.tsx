"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type ApiErr = { response?: { data?: { message?: string } } };

interface Debriefing {
  id: number;
  requestDate: string;
  response: string | null;
  respondedDate: string | null;
  respondedUser: { fullName: string } | null;
  bid: {
    id: number;
    bidAmount: number;
    tender: { id: number; title: string };
    bidOwner: { fullName: string; bidderProfile: { organizationName: string | null } | null };
    evaluationSummary: {
      avgTechnicalScore: number;
      avgFinancialScore: number | null;
      combinedScore: number | null;
      rank: number | null;
    } | null;
  };
}

export default function DebriefingsPage() {
  const qc = useQueryClient();
  const [respondingTo, setRespondingTo] = useState<Debriefing | null>(null);
  const [responseText, setResponseText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["officer-debriefings"],
    queryFn: async () => (await api.get("/debriefings")).data.data.debriefings as Debriefing[],
  });

  const respondMut = useMutation({
    mutationFn: async () => {
      await api.patch(`/debriefings/${respondingTo!.id}/respond`, { response: responseText });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["officer-debriefings"] });
      toast.success("Response sent");
      setRespondingTo(null);
      setResponseText("");
    },
    onError: (e: ApiErr) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Debriefing Requests</h1>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tender Title</TableHead>
              <TableHead>Bidder Name</TableHead>
              <TableHead>Bid Amount</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
            ) : !data?.length ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No debriefing requests.</TableCell></TableRow>
            ) : (
              data.map((d) => {
                const bidderName = d.bid.bidOwner.bidderProfile?.organizationName || d.bid.bidOwner.fullName;
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{d.bid.tender.title}</TableCell>
                    <TableCell>{bidderName}</TableCell>
                    <TableCell>ETB {d.bid.bidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(d.requestDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {d.response ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Responded</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!d.response ? (
                        <Button variant="outline" size="sm" onClick={() => { setRespondingTo(d); setResponseText(""); }}>
                          Respond
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setRespondingTo(d)}>
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {respondingTo && (
        <Dialog open onOpenChange={() => setRespondingTo(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{respondingTo.response ? "Debriefing Response" : "Respond to Debriefing"}</DialogTitle>
              <DialogDescription>{respondingTo.bid.tender.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Bidder: </span><strong>{respondingTo.bid.bidOwner.bidderProfile?.organizationName || respondingTo.bid.bidOwner.fullName}</strong></div>
                <div><span className="text-muted-foreground">Bid Amount: </span><strong>ETB {respondingTo.bid.bidAmount.toLocaleString()}</strong></div>
              </div>
              {respondingTo.bid.evaluationSummary && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Technical Score: </span><strong>{respondingTo.bid.evaluationSummary.avgTechnicalScore.toFixed(1)}</strong></div>
                    {respondingTo.bid.evaluationSummary.avgFinancialScore != null && (
                      <div><span className="text-muted-foreground">Financial Score: </span><strong>{respondingTo.bid.evaluationSummary.avgFinancialScore.toFixed(1)}</strong></div>
                    )}
                    {respondingTo.bid.evaluationSummary.combinedScore != null && (
                      <div><span className="text-muted-foreground">Combined Score: </span><strong>{respondingTo.bid.evaluationSummary.combinedScore.toFixed(1)}</strong></div>
                    )}
                    {respondingTo.bid.evaluationSummary.rank != null && (
                      <div><span className="text-muted-foreground">Rank: </span><strong>#{respondingTo.bid.evaluationSummary.rank}</strong></div>
                    )}
                  </div>
                </>
              )}
              <Separator />
              {respondingTo.response ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Response — {respondingTo.respondedDate && format(new Date(respondingTo.respondedDate), "MMM d, yyyy HH:mm")}</p>
                  <p className="text-sm whitespace-pre-wrap">{respondingTo.response}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Response *</Label>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={6}
                    placeholder="Explain the strengths and weaknesses of the bid, the evaluation criteria applied, and how the scores were determined..."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRespondingTo(null)}>Close</Button>
              {!respondingTo.response && (
                <Button onClick={() => respondMut.mutate()} disabled={!responseText.trim() || respondMut.isPending}>
                  {respondMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send Response
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
