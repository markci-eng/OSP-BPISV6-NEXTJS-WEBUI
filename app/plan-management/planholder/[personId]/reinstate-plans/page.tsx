"use client";
import { Box } from "@chakra-ui/react";
// import { ReinstatementPage } from "@splpi/operations";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "st-peter-ui";
import { ReinstatementPage } from "./reinstatement-page";

export default function Reinstatement() {
  const router = useRouter();

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
