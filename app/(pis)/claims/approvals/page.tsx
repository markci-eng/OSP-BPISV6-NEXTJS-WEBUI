"use client";
import { useState } from "react";
import { Box, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { ChevronDown, Filter } from "lucide-react";
import { Page } from "osp-ui-kit";

import { ApprovalsTable } from "./components/ApprovalsTable";
import type { ApprovalView } from "./data/types";

const APPROVAL_TYPES: { label: string; value: ApprovalView }[] = [
  { label: "Service", value: "service" },
  { label: "Death Claim", value: "death-claim" },
];

// Request type selector trigger.
function RequestTypeFilterMenu({
  view,
  setView,
  w,
}: {
  view: ApprovalView;
  setView: (view: ApprovalView) => void;
  w?: string | { base?: string; md?: string };
}) {
  const selectedLabel =
    APPROVAL_TYPES.find((t) => t.value === view)?.label ?? "";

  return (
    <HStack w={w} gap={2} align="stretch">
      <Menu.Root>
        <Menu.Trigger asChild>
          <HStack
            flex="1"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="xl"
            bg="white"
            px={4}
            py={3}
            cursor="pointer"
            justify="space-between"
            gap={3}
            _hover={{ borderColor: "gray.300" }}
            transition="border-color 0.15s"
            userSelect="none"
          >
            <HStack gap={3} minW={0} flex="1">
              <Box color="var(--chakra-colors-primary)" flexShrink={0}>
                <Filter size={18} />
              </Box>
              <Box minW={0} flex="1">
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  lineHeight="1"
                >
                  Request Type
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.800"
                  lineClamp={1}
                  mt="3px"
                >
                  {selectedLabel}
                </Text>
              </Box>
            </HStack>
            <Box color="gray.400" flexShrink={0}>
              <ChevronDown size={16} />
            </Box>
          </HStack>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="260px">
              {APPROVAL_TYPES.map((type) => (
                <Menu.Item
                  key={type.value}
                  value={type.value}
                  onClick={() => setView(type.value)}
                  fontWeight={type.value === view ? "600" : "400"}
                  color={
                    type.value === view
                      ? "var(--chakra-colors-primary)"
                      : undefined
                  }
                >
                  {type.label}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </HStack>
  );
}

export default function page() {
  const [view, setView] = useState<ApprovalView>("service");

  return (
    <Page.Root
      title="Approvals"
      description="Review & process pending requests."
      headerButton="menu"
    >
      {/* Beside the title on desktop, where it reads as a property of the page
          rather than as the first row of the list. */}
      <Page.ToolContent>
        <Box display={{ base: "none", md: "block" }}>
          <RequestTypeFilterMenu view={view} setView={setView} w="sm" />
        </Box>
      </Page.ToolContent>

      <Page.MainContent>
        {/* ── Request type selector (mobile) ── */}
        <Box display={{ base: "block", md: "none" }}>
          <RequestTypeFilterMenu view={view} setView={setView} w="full" />
        </Box>

        {/* ── List ── */}
        <ApprovalsTable view={view} setView={setView} />
      </Page.MainContent>
    </Page.Root>
  );
}
