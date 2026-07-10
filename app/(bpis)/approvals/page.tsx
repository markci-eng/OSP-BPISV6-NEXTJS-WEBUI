"use client";
import { useState } from "react";
import { Box, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { ChevronDown, Filter } from "lucide-react";
import type { IconType } from "react-icons";
import { LuFileStack, LuReceipt, LuUserCog, LuUsers } from "react-icons/lu";
import Page from "@/claude components/layout/page/Page";
import { BottomQuickActions } from "@/claude components/drawer/bottom-quick-actions";
import { ApprovalsTable } from "./components/ApprovalsTable";
import type { ApprovalView } from "@/data/approvals/types";

const APPROVAL_TYPES: {
  label: string;
  value: ApprovalView;
  icon: IconType;
  description: string;
}[] = [
  {
    label: "Reassignment of Documents",
    value: "reassignment-doc",
    icon: LuFileStack,
    description: "Move documents between assignees",
  },
  {
    label: "Digital Remittance Slip (DRS)",
    value: "drs",
    icon: LuReceipt,
    description: "Review remittance slips",
  },
  {
    label: "Movement of Employees",
    value: "movement-employees",
    icon: LuUsers,
    description: "Approve employee movements",
  },
  {
    label: "Reassignment of SA2",
    value: "reassignment-sa2",
    icon: LuUserCog,
    description: "Reassign SA2 records",
  },
];

// Inner content of the trigger card — rendered as a normal nested child so it
// works whether the wrapping card is a Menu.Trigger (desktop) or a plain
// clickable box (mobile).
function TriggerContent({ label }: { label: string }) {
  return (
    <>
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
            {label}
          </Text>
        </Box>
      </HStack>
      <Box color="gray.400" flexShrink={0}>
        <ChevronDown size={16} />
      </Box>
    </>
  );
}

export default function page() {
  const [view, setView] = useState<ApprovalView>("reassignment-doc");
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const selectedLabel =
    APPROVAL_TYPES.find((t) => t.value === view)?.label ?? "";

  return (
    <Page.Root
      title="Approvals"
      description="Review & process pending requests."
      headerButton="menu"
    >
      <Page.MainContent>
        {/* ── Request type selector ── */}
        <HStack w={{ base: "full", md: "sm" }} gap={2} align="stretch">
          {/* Desktop / web — dropdown menu */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <HStack
                display={{ base: "none", md: "flex" }}
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
                <TriggerContent label={selectedLabel} />
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

          {/* Mobile — bottom quick-actions drawer */}
          <HStack
            display={{ base: "flex", md: "none" }}
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
            onClick={() => setTypeMenuOpen(true)}
          >
            <TriggerContent label={selectedLabel} />
          </HStack>
        </HStack>

        {/* ── Request type drawer (mobile only) ── */}
        <BottomQuickActions
          open={typeMenuOpen}
          onOpenChange={setTypeMenuOpen}
          title="Request Type"
          subtitle="Choose the approvals you want to review"
          actions={APPROVAL_TYPES.map((type) => ({
            icon: type.icon,
            label: type.label,
            description: type.description,
            onClick: () => setView(type.value),
            iconColor: type.value === view ? "#fff" : undefined,
            iconBg:
              type.value === view
                ? "var(--chakra-colors-primary)"
                : undefined,
          }))}
        />

        {/* ── List ── */}
        <ApprovalsTable view={view} setView={setView} />
      </Page.MainContent>
    </Page.Root>
  );
}
