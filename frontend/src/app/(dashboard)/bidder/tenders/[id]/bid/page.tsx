"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { isPast } from "date-fns";
import {
  Loader2, Upload, X, FileText, DollarSign, Shield, CheckSquare, AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";
import { Tender } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const ACCEPTED = ".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png";
const MAX_SIZE = 10 * 1024 * 1024;

type ApiErr = { response?: { data?: { message?: string } } };

export default function SubmitBidPage() {
  const { id } = useParams();
  const router = useRouter();
  const tenderId = parseInt(id as string, 10);

  const techInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const [technicalProposal, setTechnicalProposal] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidSecurityInfo, setBidSecurityInfo] = useState({
    reference: "",
    bank: "",
    amount: "",
    validityDate: "",
  });
  const [technicalDocs, setTechnicalDocs] = useState<File[]>([]);
  const [otherDocs, setOtherDocs] = useState<File[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: tender, isLoading: tenderLoading } = useQuery({
    queryKey: ["tender", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}`)).data.data.tender as Tender,
    enabled: !isNaN(tenderId),
  });

  const { data: existingBid, isLoading: checkLoading } = useQuery({
    queryKey: ["bid-check", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}/bids/check`)).data.data as { exists: boolean; bidId: number | null },
    enabled: !isNaN(tenderId),
  });

  const submitMut = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("technicalProposal", technicalProposal);
      formData.append("bidAmount", bidAmount);

      if (tender?.bidSecurityRequired) {
        const secInfo = JSON.stringify(bidSecurityInfo);
        formData.append("bidSecurityInfo", secInfo);
      }

      technicalDocs.forEach((f) => formData.append("technicalDocs", f));
      otherDocs.forEach((f) => formData.append("otherDocs", f));

      await api.post(`/tenders/${tenderId}/bids`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Bid submitted successfully!");
      router.push("/bidder/my-bids");
    },
    onError: (e: ApiErr) => {
      toast.error(e.response?.data?.message || "Failed to submit bid");
      setShowConfirmDialog(false);
    },
  });

  const addFiles = useCallback((files: FileList | null, target: "tech" | "other") => {
    if (!files) return;
    const arr = Array.from(files);
    const valid: File[] = [];

    for (const f of arr) {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} exceeds 10MB limit`);
        continue;
      }
      valid.push(f);
    }

    if (target === "tech") {
      setTechnicalDocs((prev) => [...prev, ...valid]);
    } else {
      setOtherDocs((prev) => [...prev, ...valid]);
    }
  }, []);

  const removeFile = (target: "tech" | "other", index: number) => {
    if (target === "tech") {
      setTechnicalDocs((prev) => prev.filter((_, i) => i !== index));
    } else {
      setOtherDocs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (tenderLoading || checkLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tender) {
    return <p className="text-muted-foreground text-center py-10">Tender not found.</p>;
  }

  if (isPast(new Date(tender.submissionDeadline))) {
    toast.error("Submission deadline has passed");
    router.push(`/bidder/tenders/${tenderId}`);
    return null;
  }

  if (existingBid?.exists) {
    toast.info("You have already submitted a bid for this tender");
    router.push("/bidder/my-bids");
    return null;
  }

  const securityValid = !tender.bidSecurityRequired || (
    bidSecurityInfo.reference.trim() &&
    bidSecurityInfo.bank.trim() &&
    bidSecurityInfo.amount.trim() &&
    bidSecurityInfo.validityDate
  );

  const canSubmit =
    technicalProposal.trim() &&
    Number(bidAmount) > 0 &&
    technicalDocs.length > 0 &&
    securityValid &&
    confirmed;

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Submit Bid</h1>
        <p className="text-muted-foreground mt-1">For: {tender.title}</p>
      </div>

      {/* Section 1: Technical Proposal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />Technical Proposal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Technical Summary *</Label>
            <Textarea
              placeholder="Describe your approach, methodology, and relevant experience..."
              value={technicalProposal}
              onChange={(e) => setTechnicalProposal(e.target.value)}
              rows={6}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Technical Documents * <span className="text-muted-foreground font-normal">(at least 1 required)</span></Label>

            {tender.requiredDocuments.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                <p className="text-xs font-medium text-amber-800 mb-1">Required Documents Checklist:</p>
                <ul className="text-xs text-amber-700 space-y-0.5">
                  {tender.requiredDocuments.map((d, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckSquare className="h-3 w-3" />{d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => techInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files, "tech"); }}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drag and drop files or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, DOC, XLSX, XLS, JPG, PNG (max 10MB)</p>
              <input
                ref={techInputRef}
                type="file"
                multiple
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => addFiles(e.target.files, "tech")}
              />
            </div>

            {technicalDocs.length > 0 && (
              <div className="space-y-2 mt-2">
                {technicalDocs.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{formatSize(f.size)}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removeFile("tech", i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Financial Proposal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />Financial Proposal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Bid Amount (ETB) *</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
            {Number(bidAmount) <= 0 && bidAmount !== "" && (
              <p className="text-xs text-red-500">Bid amount must be positive.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Bid Security */}
      {tender.bidSecurityRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />Bid Security
              <span className="text-sm font-normal text-muted-foreground">(Required — ETB {tender.bidSecurityAmount?.toLocaleString()})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Guarantee Reference *</Label>
                <Input
                  placeholder="e.g. BG-2026-001"
                  value={bidSecurityInfo.reference}
                  onChange={(e) => setBidSecurityInfo((s) => ({ ...s, reference: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Issuing Bank *</Label>
                <Input
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  value={bidSecurityInfo.bank}
                  onChange={(e) => setBidSecurityInfo((s) => ({ ...s, bank: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Guarantee Amount (ETB) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={bidSecurityInfo.amount}
                  onChange={(e) => setBidSecurityInfo((s) => ({ ...s, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Validity Date *</Label>
                <Input
                  type="date"
                  value={bidSecurityInfo.validityDate}
                  onChange={(e) => setBidSecurityInfo((s) => ({ ...s, validityDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Supporting Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />Supporting Documents
            <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => otherInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files, "other"); }}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Drag and drop files or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, DOC, XLSX, XLS, JPG, PNG (max 10MB)</p>
            <input
              ref={otherInputRef}
              type="file"
              multiple
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => addFiles(e.target.files, "other")}
            />
          </div>

          {otherDocs.length > 0 && (
            <div className="space-y-2 mt-3">
              {otherDocs.map((f, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{formatSize(f.size)}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removeFile("other", i)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review & Submit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review & Submit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-md p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Technical Summary</span>
              <span>{technicalProposal ? `${technicalProposal.length} chars` : "Not provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Technical Documents</span>
              <span>{technicalDocs.length} file(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bid Amount</span>
              <span>{bidAmount ? `ETB ${Number(bidAmount).toLocaleString()}` : "Not provided"}</span>
            </div>
            {tender.bidSecurityRequired && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bid Security</span>
                <span>{bidSecurityInfo.reference ? "Provided" : "Not provided"}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supporting Documents</span>
              <span>{otherDocs.length} file(s)</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
            />
            <label htmlFor="confirm" className="text-sm cursor-pointer leading-snug">
              I confirm that all information provided is accurate and complete
            </label>
          </div>

          {!canSubmit && confirmed && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-xs">Please fill in all required fields before submitting.</p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={!canSubmit || submitMut.isPending}
            onClick={() => setShowConfirmDialog(true)}
          >
            Submit Bid
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Dialog open onOpenChange={() => setShowConfirmDialog(false)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogDescription>
                Once submitted, your bid cannot be modified. Are you sure you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
              <Button onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>
                {submitMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Submit Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
