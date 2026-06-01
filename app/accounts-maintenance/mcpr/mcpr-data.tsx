import React from "react";
import { Body, Box, PrimaryMdButton, Small } from "st-peter-ui";
import MCPRList from "./mcpr-list";
import {
  Flex,
  Grid,
  GridItem,
  Separator,
  SimpleGrid,
  Span,
  Strong,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function MCPRDataPage() {
  return (
    <>
      <Box flex="1" overflow="auto">
        <MCPRList />
      </Box>
      
      {/* Summary Section */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {/* No Of Accounts */}
        <Box bg="white" boxShadow="sm" borderRadius="lg" borderWidth="0.5px" p={4}>
          <Strong color="var(--chakra-colors-primary)">No Of Accounts</Strong>
          <Separator my={2} />
          <Flex justify="center">
            <Text fontSize={{ base: "xl", md: "2xl" }}>150</Text>
          </Flex>
        </Box>

        {/* Quota */}
        <Box bg="white" boxShadow="sm" borderRadius="lg" borderWidth="0.5px" p={4}>
          <Strong color="var(--chakra-colors-primary)">Quota:</Strong>
          <Separator my={2} />
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            <InfoItem label="Commission" value="50,000" />
            <InfoItem label="Non-Commission" value="50,000" />
          </SimpleGrid>
        </Box>

        {/* Collection */}
        <Box bg="white" boxShadow="sm" borderRadius="lg" borderWidth="0.5px" p={4}>
          <Strong color="var(--chakra-colors-primary)">Collection:</Strong>
          <Separator my={2} />
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            <InfoItem label="Commission" value="50,000" />
            <InfoItem label="Non-Commission" value="50,000" />
          </SimpleGrid>
        </Box>
      </SimpleGrid>
    </>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <VStack gap={1} align="start" minW={0}>
    <Small color="gray.500">{label}</Small>
    <Body>
      <Span fontWeight="regular">{value}</Span>
    </Body>
  </VStack>
);
