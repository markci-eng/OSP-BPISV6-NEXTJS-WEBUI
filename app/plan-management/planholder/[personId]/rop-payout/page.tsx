"use client";

import { Box, Flex } from "@chakra-ui/react";
import { RopStepPage } from "@splpi/operations";
import React from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "st-peter-ui";
const page = () => {
  const router = useRouter();
  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },

    {
      label: "Return of Premium",
      href: "/rop",
    },
  ];
  
  return (
    <Box p={4} mx="auto">
      <Breadcrumb items={breadcrumbItems} />
      <Box px={5}>
        <RopStepPage
        onClickHome={function (): void {
          throw new Error("Function not implemented.");
        }}
        onClickTrack={() => router.push("/transaction/PY-02910910")}
      />
      </Box>
    </Box>
  );
};

export default page;
