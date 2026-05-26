"use client";

import { Badge, Box, Flex, Separator, Text, VStack } from "@chakra-ui/react";
import { Body, Small } from "st-peter-ui";
import {
  LuFileCheck,
  LuFileText,
  LuReplace,
  LuTrendingUpDown,
} from "react-icons/lu";
import Drawer from "@/components/drawers/Drawer";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

export interface RequestHistoryItem {
  type: "Contract Renewal" | "Movement" | "Re-Assignment";
  description: string;
  transactionId: string;
  date: string;
}

export const mockRequestHistory: RequestHistoryItem[] = [
  {
    type: "Contract Renewal",
    description: "Approved - contract extended for 12 months.",
    transactionId: "CR-202-5821",
    date: "2025-12-18",
  },
  {
    type: "Movement",
    description: "Promoted from SA1 to SA2.",
    transactionId: "MV-202-5190",
    date: "2025-09-02",
  },
  {
    type: "Re-Assignment",
    description: "Superior changed to Garcia, Leo (STL1).",
    transactionId: "RA-202-4602",
    date: "2025-06-11",
  },
  {
    type: "Contract Renewal",
    description: "Approved - contract extended for 12 months.",
    transactionId: "CR-202-3910",
    date: "2024-12-20",
  },
  {
    type: "Movement",
    description: "Hired as SA1.",
    transactionId: "MV-202-3301",
    date: "2024-03-05",
  },
];

const typeIcon = (type: RequestHistoryItem["type"]) => {
  switch (type) {
    case "Contract Renewal":
      return <LuFileCheck />;
    case "Movement":
      return <LuTrendingUpDown />;
    case "Re-Assignment":
      return <LuReplace />;
    default:
      return <LuFileText />;
  }
};

interface RequestHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: RequestHistoryItem[];
}

export function RequestHistoryDrawer({
  open,
  onOpenChange,
  items = mockRequestHistory,
}: RequestHistoryDrawerProps) {
  return (
    <Drawer title="Request History" open={open} onOpenChange={onOpenChange}>
      {items.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          gap={2}
          py={8}
          px={4}
          color="gray.500"
          textAlign="center"
        >
          <LuFileText size={28} />
          <Text>No history to show.</Text>
        </Flex>
      ) : (
        <VStack align="stretch" gap={0} py={2}>
          {items.map((item, idx) => (
            <Box key={item.transactionId}>
              <Flex gap={3} py={3} align="start">
                <Flex
                  w="32px"
                  h="32px"
                  borderRadius={STANDARD_RADIUS.full}
                  bg={BRAND_COLORS.successBg}
                  color={BRAND_COLORS.primaryGreen}
                  borderWidth="1px"
                  borderColor={BRAND_COLORS.softGreen}
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  {typeIcon(item.type)}
                </Flex>
                <Box flex="1" minW={0}>
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={2}
                    wrap="wrap"
                  >
                    <Text
                      fontWeight="semibold"
                      color={BRAND_COLORS.neutralText}
                      fontSize="sm"
                    >
                      {item.type}
                    </Text>
                    <Small color="gray.500">{item.date}</Small>
                  </Flex>
                  <Body color="gray.600">{item.description}</Body>
                  <Badge
                    mt={2}
                    bg={BRAND_COLORS.subtleBg}
                    color={BRAND_COLORS.neutralText}
                    borderColor={BRAND_COLORS.neutralBorder}
                    borderWidth="1px"
                    borderRadius={STANDARD_RADIUS.full}
                    px={2}
                  >
                    # {item.transactionId}
                  </Badge>
                </Box>
              </Flex>
              {idx < items.length - 1 && <Separator />}
            </Box>
          ))}
        </VStack>
      )}
    </Drawer>
  );
}

export default RequestHistoryDrawer;
