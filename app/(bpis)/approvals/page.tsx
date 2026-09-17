"use client";
import { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Menu,
  Portal,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Check, ChevronDown, Filter } from "lucide-react";
import type { IconType } from "react-icons";
import {
  LuFileStack,
  LuReceipt,
  LuShieldCheck,
  LuUserCog,
  LuUsers,
} from "react-icons/lu";
import { BottomQuickActions, Page } from "osp-ui-kit";

import { ApprovalsTable } from "./components/ApprovalsTable";
import type { ApprovalView } from "@/app/(bpis)/data/approvals/types";
import { TbChecklist } from "react-icons/tb";

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
  {
    label: "User Assignment",
    value: "user-assignment",
    icon: LuShieldCheck,
    description: "Approve access group assignments",
  },
];

// Inner content of the trigger card — rendered as a normal nested child so it
// works whether the wrapping card is a Menu.Trigger (desktop) or a plain
// clickable box (mobile).
function TriggerContent({ label, open }: { label: string; open?: boolean }) {
  const Icon =
    APPROVAL_TYPES.find((x) => x.label === label)?.icon ?? TbChecklist;

  return (
    <>
      <HStack gap={3} minW={0} flex="1">
        <Box color="var(--chakra-colors-primary)" flexShrink={0}>
          <Icon size={20} />
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
      <Box
        color="gray.400"
        flexShrink={0}
        transition="transform 0.2s ease"
        transform={open ? "rotate(180deg)" : "rotate(0deg)"}
      >
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
      description={
        useBreakpointValue({ base: true, md: false })
          ? "Review & process pending requests."
          : ""
      }
      headerButton="menu"
    >
      <Page.MainContent>
        {/* Desktop / web — dropdown menu */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <Flex
              display={{ base: "none", md: "flex" }}
              flex="1"
              // bg="white"
              cursor="pointer"
              justify="start"
              gap={3}
              userSelect="none"
              align={"center"}
            >
              <Flex direction={"column"}>
                <Flex align={"center"} gap={2}>
                  <Text
                    fontSize="2xl"
                    fontWeight="600"
                    color="gray.800"
                    lineClamp={1}
                  >
                    {selectedLabel}
                  </Text>
                  <Box
                    color="gray.500"
                    flexShrink={0}
                    transition="transform 0.2s ease"
                    css={{
                      "[data-state=open] &": { transform: "rotate(180deg)" },
                    }}
                  >
                    <ChevronDown size={20} />
                  </Box>
                </Flex>
                <Text fontSize="xs" color="gray.500" lineClamp={1}>
                  {APPROVAL_TYPES.find((x) => x.label === selectedLabel)
                    ?.description ?? ""}
                </Text>
              </Flex>
            </Flex>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="320px" p={1.5} borderRadius="xl" shadow="lg">
                {APPROVAL_TYPES.map((type) => {
                  const selected = type.value === view;
                  return (
                    <Menu.Item
                      key={type.value}
                      value={type.value}
                      onClick={() => setView(type.value)}
                      px={2.5}
                      py={2.5}
                      gap={3}
                      borderRadius="lg"
                      bg={
                        selected
                          ? "color-mix(in srgb, var(--chakra-colors-primary) 8%, transparent)"
                          : undefined
                      }
                      _hover={{ bg: "gray.100" }}
                    >
                      <Flex
                        align="center"
                        justify="center"
                        boxSize="34px"
                        flexShrink={0}
                        borderRadius="lg"
                        bg={
                          selected ? "var(--chakra-colors-primary)" : "gray.100"
                        }
                        color={selected ? "white" : "gray.500"}
                        transition="background 0.15s, color 0.15s"
                      >
                        <type.icon size={17} />
                      </Flex>

                      <Box minW={0} flex="1">
                        <Text
                          fontSize="sm"
                          fontWeight={selected ? "600" : "500"}
                          color={
                            selected
                              ? "var(--chakra-colors-primary)"
                              : "gray.800"
                          }
                          lineClamp={1}
                        >
                          {type.label}
                        </Text>
                        <Text fontSize="xs" color="gray.500" lineClamp={1}>
                          {type.description}
                        </Text>
                      </Box>

                      {selected && (
                        <Box
                          color="var(--chakra-colors-primary)"
                          flexShrink={0}
                        >
                          <Check size={16} />
                        </Box>
                      )}
                    </Menu.Item>
                  );
                })}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        {/* ── Request type selector ── */}
        <HStack
          display={{ base: "flex", md: "none" }}
          w={{ base: "full", md: "sm" }}
          gap={2}
          align="stretch"
        >
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
            <TriggerContent label={selectedLabel} open={typeMenuOpen} />
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
              type.value === view ? "var(--chakra-colors-primary)" : undefined,
          }))}
        />

        {/* ── List ── */}
        <ApprovalsTable view={view} setView={setView} />
      </Page.MainContent>
    </Page.Root>
  );
}
