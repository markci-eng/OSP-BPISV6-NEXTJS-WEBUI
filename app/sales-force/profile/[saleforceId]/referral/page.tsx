"use client";
import ReferralPage from "@/components/saleforce/pages/referral-page";
import Page from "@/claude components/layout/page/Page";

export default function ReferrallPage() {
  return (
    <Page.Root
      title="Referral"
      description="Share your referral link, send it via email or SMS, and track referral history."
    >
      <Page.MainContent>
        <ReferralPage />
      </Page.MainContent>
    </Page.Root>
  );
}
