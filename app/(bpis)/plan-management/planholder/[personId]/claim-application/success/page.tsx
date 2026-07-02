"use client";
import { Box } from "@chakra-ui/react";
import React from "react";
import { SuccessPage } from "@splpi/operations";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <Box mt={8} mb={10}>
      <SuccessPage
        variant="application"
        title="Claim Submitted"
        description=" A confirmation email has also been sent, and you can view or track this anytime in your account."
        transactionId="CL-NS234567"
        dateTime="Nov 25, 2025, 2:30 PM"
        onClickHome={() => {
          router.push("/");
        }}
        onClickProceed={() => {
          router.push("/transaction/CL-NS234567");
        }}
      ></SuccessPage>
    </Box>
  );
};

export default page;
