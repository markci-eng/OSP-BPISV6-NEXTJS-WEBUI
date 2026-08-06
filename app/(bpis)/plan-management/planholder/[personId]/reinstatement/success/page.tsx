"use client";

import { SuccessPage } from "osp-ui-kit";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <SuccessPage
      title="Application Submitted"
      description=" A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="RI-NS234567"
      dateTime="Nov 25, 2025, 2:30 PM"
      additionalDetails={[{ label: "Total Amount:", value: "₱3,000.00" }]}
      primaryActionLabel="Go back to Home"
      onPrimaryAction={() => {
        router.push("/");
      }}
      secondaryActionLabel="Track My Request"
      onSecondaryAction={() => {
        router.push("/transaction/RI-NS234567");
      }}
    />
  );
};

export default page;
