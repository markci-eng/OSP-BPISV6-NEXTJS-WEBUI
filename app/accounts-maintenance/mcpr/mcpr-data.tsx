import React from "react";
import { Body, Small } from "st-peter-ui";
import MCPRList from "./mcpr-list";
import {
  Box,
  Flex,
  Separator,
  SimpleGrid,
  Span,
  Strong,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

export default function MCPRDataPage() {
  const summaryCardProps = {
    bg: BRAND_COLORS.white,
    boxShadow: STANDARD_SHADOWS.level1,
    borderRadius: STANDARD_RADIUS.md,
    borderWidth: "1px",
    borderColor: BRAND_COLORS.neutralBorder,
    p: { base: 4, md: 5 },
  } as const;

  return (
    <>
      <Box flex="1" minW={0} overflow="hidden">
        <MCPRList />
      </Box>
      
      {/* Summary Section */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        gap={{ base: 4, md: 5 }}
      >
        {/* No Of Accounts */}
        <Box {...summaryCardProps}>
          <Strong color={BRAND_COLORS.primaryGreen}>No Of Accounts</Strong>
          <Separator my={2} />
          <Flex justify="center">
            <Text fontSize={{ base: "xl", md: "2xl" }}>150</Text>
          </Flex>
        </Box>

        {/* Quota */}
        <Box {...summaryCardProps}>
          <Strong color={BRAND_COLORS.primaryGreen}>Quota:</Strong>
          <Separator my={2} />
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            <InfoItem label="Commission" value="50,000" />
            <InfoItem label="Non-Commission" value="50,000" />
          </SimpleGrid>
        </Box>

        {/* Collection */}
        <Box {...summaryCardProps}>
          <Strong color={BRAND_COLORS.primaryGreen}>Collection:</Strong>
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
