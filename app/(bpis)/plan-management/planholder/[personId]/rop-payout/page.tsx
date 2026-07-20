"use client";

import { useParams, useRouter } from "next/navigation";
import { RopPayoutPage } from "@/components/plan-management/planholder-profile/components/rop/rop-payout-page";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const personId = params?.personId as string;

  return (
    <RopPayoutPage
      onClickHome={() => router.push("/")}
      onClickTrack={() => router.push(`/transaction/ROP-26-${personId}`)}
    />
  );
}
