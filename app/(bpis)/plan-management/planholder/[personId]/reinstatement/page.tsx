"use client";
import { ReinstatementPage } from "@/components/plan-management/reinstatement-page/reinstatement-page";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "st-peter-ui";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

export default function Reinstatement() {
  const router = useRouter();
  const { messageBox } = useMessageDialog();

  return (
    <ReinstatementPage
      onSuccess={async (transactionId, transactionAmt) => {
        await messageBox({
          title: "Reinstatement Submitted",
          message:
            "Reinstatement Application Submitted Successfully!\nTransaction No: " +
            transactionId +
            "\nTransaction Amount: ₱ " +
            transactionAmt.toLocaleString(),
          confirmText: "Okay",
          variant: "success",
        });
        router.push("/plan-management/reinstatement/success");
      }}
      successLink={
        "/plan-management/planholder/PI123454I/reinstatement/success"
      }
    />
  );
}
