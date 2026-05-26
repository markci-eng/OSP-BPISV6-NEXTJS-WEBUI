import { Box } from "@chakra-ui/react";
import { TrackMyRequest } from "osp.cis.nextjs.components";
import React from "react";

const page = () => {
  return (
    <Box mt="24" p="8" w="full" maxW="7xl" mx="auto">
      <TrackMyRequest />
    </Box>
  );
};

export default page;
