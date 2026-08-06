"use client";
import { Box } from "@chakra-ui/react";
import React from "react";
import { SuccessPage } from "osp-ui-kit";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <Box mt={8} mb={10}>
      <SuccessPage
        title="Claim Submitted"
        description=" A confirmation email has also been sent, and you can view or track this anytime in your account."
        transactionId="CL-NS234567"
        dateTime="Nov 25, 2025, 2:30 PM"
        primaryActionLabel="Go back to Home"
        onPrimaryAction={() => {
          router.push("/");
        }}
        secondaryActionLabel="Track My Request"
        onSecondaryAction={() => {
          router.push("/transaction/CL-NS234567");
        }}
      ></SuccessPage>
    </Box>
  );
};

export default page;
