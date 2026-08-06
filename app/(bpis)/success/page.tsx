"use client";
import { Box } from "@chakra-ui/react";
import { SuccessPage } from "osp-ui-kit";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <Box mt={8} mb={10}>
      <SuccessPage
        title="Payment Success"
        description=" A confirmation email has also been sent, and you can view or track this anytime in your account."
        transactionId="PY-NS234567"
        dateTime="Nov 25, 2025, 2:30 PM"
        additionalDetails={[
          { label: "Total Amount Paid:", value: "₱3,000.00" },
        ]}
        primaryActionLabel="Go back to Home"
        onPrimaryAction={() => {
          router.push("/");
        }}
        secondaryActionLabel="Track My Request"
        onSecondaryAction={() => {
          router.push("/transaction/PY-123");
        }}
      ></SuccessPage>
    </Box>
  );
};

export default page;
