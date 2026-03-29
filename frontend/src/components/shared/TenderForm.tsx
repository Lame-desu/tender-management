"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Tender, TenderCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface CriteriaRow { name: string; weight: number }

interface Props {
  initial?: Tender;
  mode: "create" | "edit";
}

export default function TenderForm({ initial, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);

  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState<string>(initial?.category || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [eligibility, setEligibility] = useState(initial?.eligibilityCriteria || "");

  const [docs, setDocs] = useState<string[]>(initial?.requiredDocuments || [""]);
  const [criteria, setCriteria] = useState<CriteriaRow[]>(
    (initial?.evaluationCriteria as CriteriaRow[] | undefined)?.length
      ? (initial!.evaluationCriteria as CriteriaRow[])
      : [{ name: "", weight: 0 }]
  );

  const [minTechScore, setMinTechScore] = useState(initial?.minimumTechnicalScore ?? 70);
  const [techWeight, setTechWeight] = useState(initial?.technicalWeight ?? 80);
  const [finWeight, setFinWeight] = useState(initial?.financialWeight ?? 20);

  const [clarDeadline, setClarDeadline] = useState(
    initial?.clarificationDeadline ? initial.clarificationDeadline.slice(0, 16) : ""
  );
  const [subDeadline, setSubDeadline] = useState(
    initial?.submissionDeadline ? initial.submissionDeadline.slice(0, 16) : ""
  );
  const [bidSecurityRequired, setBidSecurityRequired] = useState(initial?.bidSecurityRequired ?? false);
  const [bidSecurityAmount, setBidSecurityAmount] = useState(initial?.bidSecurityAmount ?? 0);

  const totalWeight = criteria.reduce((s, c) => s + (c.weight || 0), 0);
  const errors: string[] = [];
  if (title.length < 10) errors.push("Title must be at least 10 characters");
  if (description.length < 50) errors.push("Description must be at least 50 characters");
  if (!category) errors.push("Category is required");
  if (!eligibility) errors.push("Eligibility criteria is required");
  if (docs.filter(Boolean).length === 0) errors.push("At least one required document");
  if (criteria.filter((c) => c.name).length === 0) errors.push("At least one evaluation criterion");
  if (totalWeight !== 100) errors.push(`Criteria weights sum to ${totalWeight}, must be 100`);
  if (techWeight + finWeight !== 100) errors.push("Technical + Financial weight must equal 100");
  if (!clarDeadline || !subDeadline) errors.push("Both deadlines are required");
  if (clarDeadline && subDeadline && new Date(clarDeadline) >= new Date(subDeadline)) errors.push("Clarification deadline must be before submission deadline");
  if (bidSecurityRequired && (!bidSecurityAmount || bidSecurityAmount <= 0)) errors.push("Bid security amount is required");

  const buildPayload = () => ({
    title,
    description,
    category: category as TenderCategory,
    eligibilityCriteria: eligibility,
    requiredDocuments: docs.filter(Boolean),
    evaluationCriteria: criteria.filter((c) => c.name),
    minimumTechnicalScore: minTechScore,
    technicalWeight: techWeight,
    financialWeight: finWeight,
    bidSecurityRequired,
    bidSecurityAmount: bidSecurityRequired ? bidSecurityAmount : null,
    clarificationDeadline: clarDeadline,
    submissionDeadline: subDeadline,
  });

  const handleSave = async (action: "draft" | "publish") => {
    if (errors.length > 0) { toast.error(errors[0]); return; }
    setSaving(action);
    try {
      let tenderId: number;
      if (mode === "create") {
        const res = await api.post("/tenders", buildPayload());
        tenderId = res.data.data.tender.id;
      } else {
        await api.put(`/tenders/${initial!.id}`, buildPayload());
        tenderId = initial!.id;
      }
      if (action === "publish") {
        await api.patch(`/tenders/${tenderId}/publish`);
        toast.success("Tender published!");
      } else {
        toast.success(mode === "create" ? "Tender created as draft" : "Tender updated");
      }
      router.push(`/officer/tenders/${tenderId}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to save tender");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Section 1: Basic Info */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter tender title (min 10 characters)" />
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GOODS">Goods</SelectItem>
                <SelectItem value="WORKS">Works</SelectItem>
                <SelectItem value="CONSULTING">Consulting Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Detailed description (min 50 characters)" />
            <p className="text-xs text-muted-foreground">{description.length}/50 characters minimum</p>
          </div>
          <div className="space-y-2">
            <Label>Eligibility Criteria *</Label>
            <Textarea value={eligibility} onChange={(e) => setEligibility(e.target.value)} rows={3} placeholder="Who can bid on this tender" />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Required Documents */}
      <Card>
        <CardHeader><CardTitle>Required Documents</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {docs.map((doc, i) => (
            <div key={i} className="flex gap-2">
              <Input value={doc} onChange={(e) => { const n = [...docs]; n[i] = e.target.value; setDocs(n); }} placeholder="e.g. Company Registration Certificate" />
              {docs.length > 1 && <Button variant="ghost" size="icon" onClick={() => setDocs(docs.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setDocs([...docs, ""])}><Plus className="mr-2 h-4 w-4" />Add Document</Button>
        </CardContent>
      </Card>

      {/* Section 3: Evaluation Criteria */}
      <Card>
        <CardHeader><CardTitle>Evaluation Criteria</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {criteria.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input className="flex-1" value={c.name} onChange={(e) => { const n = [...criteria]; n[i] = { ...n[i], name: e.target.value }; setCriteria(n); }} placeholder="Criterion name" />
                <div className="flex items-center gap-1 w-[120px]">
                  <Input type="number" value={c.weight || ""} onChange={(e) => { const n = [...criteria]; n[i] = { ...n[i], weight: parseInt(e.target.value) || 0 }; setCriteria(n); }} className="w-[80px]" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                {criteria.length > 1 && <Button variant="ghost" size="icon" onClick={() => setCriteria(criteria.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setCriteria([...criteria, { name: "", weight: 0 }])}><Plus className="mr-2 h-4 w-4" />Add Criterion</Button>
              <span className={`text-sm font-medium ${totalWeight === 100 ? "text-green-600" : "text-destructive"}`}>Total: {totalWeight}%</span>
            </div>
          </div>

          <hr />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Technical Weight (%)</Label>
              <Input type="number" value={techWeight} onChange={(e) => { const v = parseInt(e.target.value) || 0; setTechWeight(v); setFinWeight(100 - v); }} />
            </div>
            <div className="space-y-2">
              <Label>Financial Weight (%)</Label>
              <Input type="number" value={finWeight} onChange={(e) => { const v = parseInt(e.target.value) || 0; setFinWeight(v); setTechWeight(100 - v); }} />
            </div>
            <div className="space-y-2">
              <Label>Min. Technical Score</Label>
              <Input type="number" value={minTechScore} onChange={(e) => setMinTechScore(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <p className={`text-sm ${techWeight + finWeight === 100 ? "text-green-600" : "text-destructive"}`}>
            Technical ({techWeight}%) + Financial ({finWeight}%) = {techWeight + finWeight}%
          </p>
        </CardContent>
      </Card>

      {/* Section 4: Deadlines & Bid Security */}
      <Card>
        <CardHeader><CardTitle>Deadlines & Bid Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Clarification Deadline *</Label>
              <Input type="datetime-local" value={clarDeadline} onChange={(e) => setClarDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Submission Deadline *</Label>
              <Input type="datetime-local" value={subDeadline} onChange={(e) => setSubDeadline(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={bidSecurityRequired} onCheckedChange={setBidSecurityRequired} />
            <Label>Bid Security Required</Label>
          </div>
          {bidSecurityRequired && (
            <div className="space-y-2 max-w-xs">
              <Label>Bid Security Amount (ETB) *</Label>
              <Input type="number" value={bidSecurityAmount || ""} onChange={(e) => setBidSecurityAmount(parseFloat(e.target.value) || 0)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button variant="secondary" onClick={() => handleSave("draft")} disabled={!!saving}>
          {saving === "draft" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save as Draft
        </Button>
        <Button onClick={() => handleSave("publish")} disabled={!!saving}>
          {saving === "publish" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Publish
        </Button>
      </div>
    </div>
  );
}
