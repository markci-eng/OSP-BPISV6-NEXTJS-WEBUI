"use client";
import { Box } from "@chakra-ui/react";
import { SuccessPage } from "@splpi/operations";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <Box mt={8} mb={10}>
      <SuccessPage
        variant="payment"
        title="Payment Success"
        description=" A confirmation email has also been sent, and you can view or track this anytime in your account."
        transactionId="PY-NS234567"
        totalAmount="₱3,000.00"
        dateTime="Nov 25, 2025, 2:30 PM"
        onClickHome={() => {
          router.push("/");
        }}
        onClickProceed={() => {
          router.push("/transaction/PY-123");
        }}
      ></SuccessPage>
    </Box>
  );
};

export default page;
