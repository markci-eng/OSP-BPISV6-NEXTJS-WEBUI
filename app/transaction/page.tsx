import TrackMyRequest from "@/components/request-tracker/track-my-request";
import { Box } from "@chakra-ui/react";
const page = () => {
  return (
    <Box mt="24" p="8" w="full" maxW="7xl" mx="auto">
      <TrackMyRequest />
    </Box>
  );
};

export default page;
