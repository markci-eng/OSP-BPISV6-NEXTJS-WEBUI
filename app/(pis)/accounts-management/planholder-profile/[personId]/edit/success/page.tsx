"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { SuccessPage } from "osp-ui-kit";

const page = () => {
  const router = useRouter();
  return (
    <SuccessPage
      title="Changes Submitted"
      description="Planholder information has been updated successfully. A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="EPH-NS234567"
      dateTime="Nov 25, 2025, 2:30 PM"
      onSecondaryAction={() => {
        router.push("/");
      }}
      onPrimaryAction={() => {
        router.push("/transaction/EPH-NS234567");
      }}
    />
  );
};

export default page;
