"use client";
import { SuccessPage } from "osp-ui-kit";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <SuccessPage
      title="Payment Successful"
      description="Your payment has been processed. A confirmation email has been sent, and you can view or track this anytime in your account."
      transactionId="PMP-000001"
      dateTime="Jun 29, 2026, 12:00 PM"
      additionalDetails={[
        { label: "Total Amount Paid:", value: "₱3,000.00" },
      ]}
      primaryActionLabel="Go back to Home"
      onPrimaryAction={() => {
        router.push("/");
      }}
      secondaryActionLabel="Track My Request"
      onSecondaryAction={() => {
        router.push("/transaction/PMP-000001");
      }}
    />
  );
};

export default page;
