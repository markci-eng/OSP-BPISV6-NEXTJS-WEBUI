"use client";

import { useParams, useRouter } from "next/navigation";
import { RopPage } from "@/components/plan-management/planholder-profile/components/rop/rop-page";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const personId = params?.personId as string;

  return (
    <RopPage
      onProceed={() =>
        router.push(`/plan-management/planholder/${personId}/rop-payout`)
      }
    />
  );
}
