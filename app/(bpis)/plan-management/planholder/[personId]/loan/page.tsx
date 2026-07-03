"use client";

import { LoanPage } from "@/components/loan/loan-page";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const personId = params?.personId as string;

  return (
    <LoanPage
      onProceed={() =>
        router.push(`/plan-management/planholder/${personId}/loan/success`)
      }
    />
  );
}
