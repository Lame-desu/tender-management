"use client";

import TenderForm from "@/components/shared/TenderForm";

export default function CreateTenderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Tender</h1>
      <TenderForm mode="create" />
    </div>
  );
}
