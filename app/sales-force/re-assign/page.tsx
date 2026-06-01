"use client";
import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import ReassignPageWeb from "./reassign-web";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";

const ReassignPage = () => {
  const [superior, setSuperior] = React.useState<SalesAgent | null>(null);
  return <ReassignPageWeb superior={superior} setSuperior={setSuperior} />;
};

export default ReassignPage;
