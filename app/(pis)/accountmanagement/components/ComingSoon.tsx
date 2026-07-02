import { Box, Flex, Text } from "@chakra-ui/react";
import { LuHammer } from "react-icons/lu";
import Page from "@/claude components/layout/page/Page";

export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Page.Root title={title} description={description} headerButton="back">
      <Page.MainContent>
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={3}
          py={20}
          borderWidth="1px"
          borderColor="gray.100"
          borderRadius="xl"
          bg="white"
        >
          <Box color="gray.300">
            <LuHammer size={36} />
          </Box>
          <Text fontWeight="600" color="gray.700">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.400">
            This module is under construction.
          </Text>
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
}
