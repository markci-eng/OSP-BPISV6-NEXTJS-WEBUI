"use client";
import { SuccessPage } from "@splpi/operations";
import { useParams, useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const params = useParams<{ saleforceId: string }>();

  return (
    <SuccessPage
      variant="application"
      title="Re-Organization Request Submitted"
      description="The re-organization request has been submitted and is subject to approval. A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="RA-0000000"
      dateTime={new Date().toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}
      onClickHome={() => {
        router.push(`/sales-force/profile/${params.saleforceId}`);
      }}
      onClickProceed={() => {
        router.push("/transaction/RA-0000000");
      }}
    />
  );
};

export default page;
