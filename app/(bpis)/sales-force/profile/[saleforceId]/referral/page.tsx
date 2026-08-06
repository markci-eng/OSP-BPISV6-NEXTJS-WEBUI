"use client";
import ReferralPage from "@/components/saleforce/pages/referral-page";
import { Page } from "osp-ui-kit";

export default function ReferrallPage() {
  return (
    <Page.Root
      title="Referral"
      description="Share your referral link and track it."
    >
      <Page.MainContent>
        <ReferralPage />
      </Page.MainContent>
    </Page.Root>
  );
}
