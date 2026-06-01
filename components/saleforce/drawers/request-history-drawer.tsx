"use client";

import { Box, Flex, Separator, Text, VStack } from "@chakra-ui/react";
import { Body, Small } from "st-peter-ui";
import { OSPBadge } from "../../common/badge/badge";
import {
  LuFileCheck,
  LuReplace,
  LuTrendingUpDown,
  LuFileText,
} from "react-icons/lu";
import Drawer from "@/components/drawers/Drawer";

export interface RequestHistoryItem {
  type: "Contract Renewal" | "Movement" | "Re-Assignment";
  description: string;
  transactionId: string;
  date: string;
}

export const mockRequestHistory: RequestHistoryItem[] = [
  {
    type: "Contract Renewal",
    description: "Approved — contract extended for 12 months.",
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
    description: "Approved — contract extended for 12 months.",
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
        <Text color="gray.500" py={4}>
          No history to show.
        </Text>
      ) : (
        <VStack align="stretch" gap={0} py={2}>
          {items.map((item, idx) => (
            <Box key={item.transactionId}>
              <Flex gap={3} py={3} align="start">
                <Flex
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg="var(--chakra-colors-primary-disabled)"
                  color="var(--chakra-colors-primary)"
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
                      color="gray.700"
                      fontSize="sm"
                    >
                      {item.type}
                    </Text>
                    <Small color="gray.500">{item.date}</Small>
                  </Flex>
                  <Body color="gray.600">{item.description}</Body>
                  <Box mt={1}>
                    <OSPBadge type="info"># {item.transactionId}</OSPBadge>
                  </Box>
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
