"use client";
import { ReinstatementPage } from "@/components/plan-management/reinstatement-page/reinstatement-page";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "st-peter-ui";

export default function Reinstatement() {
  const router = useRouter();

  return (
    <ReinstatementPage
      onSuccess={(transactionId, transactionAmt) => {
        alert(
          "Reinstatement Application Submitted Successfully! \n Transaction No: " +
            transactionId +
            "\n Transaction Amount: ₱ " +
            transactionAmt.toLocaleString(),
        );
        router.push("/plan-management/reinstatement/success");
      }}
      successLink={
        "/plan-management/planholder/PI123454I/reinstatement/success"
      }
    />
  );
}
