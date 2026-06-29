"use client";
import { SuccessPage } from "@splpi/operations";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <SuccessPage
      variant="application"
      title="Payment Successful"
      description="Your payment has been processed. A confirmation email has been sent, and you can view or track this anytime in your account."
      transactionId="PMP-000001"
      totalAmount="₱3,000.00"
      dateTime="Jun 29, 2026, 12:00 PM"
      onClickHome={() => {
        router.push("/");
      }}
      onClickProceed={() => {
        router.push("/transaction/PMP-000001");
      }}
    />
  );
};

export default page;
