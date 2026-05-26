"use client";

import { Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "st-peter-ui";

import { RopPage } from "@splpi/operations";

const page = () => {
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
  const router = useRouter();
  return (
    <Box p={4} mx="auto">
      <Breadcrumb items={breadcrumbItems} />
      <RopPage onClick={() => router.push("/plan-management/rop-payout")} />
    </Box>
  );
};

export default page;
