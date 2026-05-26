"use client";
import { Box } from "@chakra-ui/react";
import React from "react";
import { SuccessPage } from "@splpi/operations";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <SuccessPage
      variant="application"
      title="Application Submitted"
      description=" A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="RI-NS234567"
      totalAmount="₱3,000.00"
      dateTime="Nov 25, 2025, 2:30 PM"
      onClickHome={() => {
        router.push("/");
      }}
      onClickProceed={() => {
        router.push("/transaction/RI-NS234567");
      }}
    />
  );
};

export default page;
