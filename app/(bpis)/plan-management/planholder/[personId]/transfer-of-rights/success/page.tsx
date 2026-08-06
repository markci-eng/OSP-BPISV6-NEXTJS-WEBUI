"use client";
import { Box } from "@chakra-ui/react";
import React from "react";
import { SuccessPage } from "osp-ui-kit";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <SuccessPage
      title="Application Submitted"
      description=" A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="TF-NS234567"
      dateTime="Nov 25, 2025, 2:30 PM"
      primaryActionLabel="Go back to Home"
      onPrimaryAction={() => {
        router.push("/");
      }}
      secondaryActionLabel="Track My Request"
      onSecondaryAction={() => {
        router.push("/transaction/TF-NS234567");
      }}
    />
  );
};

export default page;
