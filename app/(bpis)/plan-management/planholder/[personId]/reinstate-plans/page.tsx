"use client";
import { Box } from "@chakra-ui/react";
// import { ReinstatementPage } from "@splpi/operations";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "st-peter-ui";
import { ReinstatementPage } from "./reinstatement-page";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

export default function Reinstatement() {
  const router = useRouter();
  const { messageBox } = useMessageDialog();

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },

    {
      label: "Planholder",
      href: "/plan-management/planholder",
    },

    {
      label: "PI123453I",
      href: "/plan-management/planholder/PI123453I",
    },
    {
      label: "Reinstatement",
      href: "#",
    },
  ];

  return (
    <Box mx="auto" p={4}>
      <Breadcrumb items={breadcrumbItems} />
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
        successLink={"/plan-management/reinstatement/success"}
      />
    </Box>
  );
}
