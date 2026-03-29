"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Tender } from "@/types";
import TenderForm from "@/components/shared/TenderForm";

export default function EditTenderPage() {
  const { id } = useParams();
  const tenderId = parseInt(id as string, 10);

  const { data: tender, isLoading } = useQuery({
    queryKey: ["tender", tenderId],
    queryFn: async () => (await api.get(`/tenders/${tenderId}`)).data.data.tender as Tender,
    enabled: !isNaN(tenderId),
  });

  if (isLoading || !tender) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (tender.status !== "DRAFT") {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Only draft tenders can be edited.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Tender</h1>
      <TenderForm mode="edit" initial={tender} />
    </div>
  );
}
