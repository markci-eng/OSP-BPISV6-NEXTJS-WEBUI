"use client";
import { SuccessPage } from "osp-ui-kit";
import { useParams, useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const params = useParams<{ saleforceId: string }>();

  return (
    <SuccessPage
      title="Changes Saved"
      description="The agent's information has been updated successfully. A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="ED-0000000"
      dateTime={new Date().toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}
      primaryActionLabel="Go back to Home"
      onPrimaryAction={() => {
        router.push(`/sales-force/profile/${params.saleforceId}`);
      }}
      secondaryActionLabel="Track My Request"
      onSecondaryAction={() => {
        router.push("/transaction/ED-0000000");
      }}
    />
  );
};

export default page;
