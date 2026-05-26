"use client";

import {
  Box,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Body, Small } from "st-peter-ui";
import { OSPBadge } from "@/components/common/badge/badge";
import {
  LuFileCheck,
  LuReplace,
  LuTrendingUpDown,
  LuFileText,
} from "react-icons/lu";

export interface RequestHistoryItem {
  type:
    | "Reinstatement"
    | "Change of Mode"
    | "Transfer of Rights"
    | "Returned of Premium";
  description: string;
  transactionId: string;
  date: string;
}

export const mockRequestHistory: RequestHistoryItem[] = [
  {
    type: "Reinstatement",
    description: "Approved — Account has been reinstated.",
    transactionId: "RI-202-5821",
    date: "2025-12-18",
  },
  {
    type: "Reinstatement",
    description: "Approved — Account has been reinstated.",
    transactionId: "RI-202-5190",
    date: "2025-09-02",
  },
  {
    type: "Change of Mode",
    description: "Approved — Change of mode from Monthly to Quarterly.",
    transactionId: "CH-202-4602",
    date: "2025-06-11",
  },
  {
    type: "Transfer of Rights",
    description: "Approved — Plan has been transferred.",
    transactionId: "TR-202-3910",
    date: "2024-12-20",
  },
  {
    type: "Reinstatement",
    description: "Denied - Insufficient documentation.",
    transactionId: "RI-202-3301",
    date: "2024-03-05",
  },
];

const typeIcon = (type: RequestHistoryItem["type"]) => {
  switch (type) {
    case "Reinstatement":
      return <LuFileCheck />;
    case "Transfer of Rights":
      return <LuTrendingUpDown />;
    case "Change of Mode":
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
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header borderBottomWidth={1} borderColor="gray.200">
              <Drawer.Title>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color="var(--chakra-colors-primary)"
                >
                  Request History
                </Text>
              </Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body>
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
                            <OSPBadge type="info">
                              # {item.transactionId}
                            </OSPBadge>
                          </Box>
                        </Box>
                      </Flex>
                      {idx < items.length - 1 && <Separator />}
                    </Box>
                  ))}
                </VStack>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default RequestHistoryDrawer;
