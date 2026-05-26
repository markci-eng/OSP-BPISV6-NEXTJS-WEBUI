"use client";
import { Box } from "@chakra-ui/react";
import { ReinstatementPage } from "@splpi/operations";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "st-peter-ui";

export default function Reinstatement() {
  const router = useRouter();

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },

    {
      label: "Reinstatement",
      href: "/plan-management/reinstatement",
    },
  ];

  return (
    <Box mx="auto" p={4}>
      <Breadcrumb items={breadcrumbItems} />
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
        successLink={"/plan-management/reinstatement/success"}
      />
    </Box>
  );
}
