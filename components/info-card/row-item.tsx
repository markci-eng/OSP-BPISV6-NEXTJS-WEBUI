import { Box, Flex, Text } from "@chakra-ui/react";

export const RowItem = ({ label, value }: { label: string; value?: any }) => (
  <Flex align="center" py={1.5} fontSize="sm">
    <Text color="gray.500" whiteSpace="nowrap">
      {label}
    </Text>

    <Box
      flex="1"
      mx={3}
      borderBottom="1px dashed"
      borderColor="gray.300"
      transform="translateY(2px)"
    />

    <Text fontWeight="medium" textAlign="right" whiteSpace="nowrap">
      {value ?? "-"}
    </Text>
  </Flex>
);
