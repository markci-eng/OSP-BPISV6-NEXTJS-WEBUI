import TrackMyRequest from "@/claude components/tracker/TrackMyRequest";
import { Box, Text } from "@chakra-ui/react";
import React from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  return (
    <Box w="full" pb={{ base: "100px", lg: 0 }}>
      <TrackMyRequest requestId={resolvedParams.id} />
      {/* <Text>{resolvedParams.id} </Text> */}
    </Box>
  );
};

export default page;
