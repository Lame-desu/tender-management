"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EvaluationsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/evaluator/tenders");
  }, [router]);
  return null;
}
