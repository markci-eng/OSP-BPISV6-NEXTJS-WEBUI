"use client";
import { ChangeModePage } from "@/components/plan-management/planholder-profile/components/change-of-mode/change-mode-page";
import { Box } from "@chakra-ui/react";
import { Breadcrumb } from "st-peter-ui";

export default function Page() {
  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },

    {
      label: "Change of Mode",
      href: "/plan-management/change-of-mode",
    },
  ];
  return (
    <>
      {/* <Box pt={4} px={6} mx="auto">
        <Breadcrumb items={breadcrumbItems} />
      </Box> */}
      <ChangeModePage
        onSuccess={function (
          transactionId: string,
          transactionAmount: number,
        ): void {
          throw new Error("Function not implemented.");
        }}
        successLink="/plan-management/change-of-mode/success"
        breadcrumbItems={breadcrumbItems}
      />
    </>
  );
}
