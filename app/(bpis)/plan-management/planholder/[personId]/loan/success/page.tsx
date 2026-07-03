"use client";
import { SuccessPage } from "@splpi/operations";
import { useParams, useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const params = useParams();
  const personId = params?.personId as string;

  return (
    <SuccessPage
      variant="application"
      title="Application Success"
      description=" A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="LAF-2026-000001"
      dateTime="Nov 25, 2025, 2:30 PM"
      onClickHome={() => {
        router.push("/");
      }}
      onClickProceed={() => {
        router.push("/transaction/LAF-2026-000001");
      }}
    />
  );
};

export default page;
