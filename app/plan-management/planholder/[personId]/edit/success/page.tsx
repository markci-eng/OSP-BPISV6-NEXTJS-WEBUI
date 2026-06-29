"use client";
import React from "react";
import { SuccessPage } from "@splpi/operations";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <SuccessPage
      variant="application"
      title="Changes Submitted"
      description="Planholder information has been updated successfully. A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="EPH-NS234567"
      dateTime="Nov 25, 2025, 2:30 PM"
      onClickHome={() => {
        router.push("/");
      }}
      onClickProceed={() => {
        router.push("/transaction/EPH-NS234567");
      }}
    />
  );
};

export default page;
