"use client";
import { useState } from "react";
import {
  Box,
  Dialog,
  Flex,
  Grid,
  IconButton,
  Portal,
  Text,
} from "@chakra-ui/react";
import {
  LuFileSearch,
  LuFileText,
  LuUsers,
  LuArrowLeftRight,
  LuChevronDown,
  LuChevronLeft,
} from "react-icons/lu";
import Page from "@/components/layout/page/Page";
import { ApprovalsTable } from "./components/ApprovalsTable";
import type { ApprovalView } from "./data/types";
import { approvalConfig } from "./config/approval-config";

const APPROVAL_TYPES: {
  label: string;
  value: ApprovalView;
  icon: React.ElementType;
}[] = [
  {
    label: "Reassignment of Documents",
    value: "reassignment-doc",
    icon: LuFileSearch,
  },
  { label: "Digital Remittance Slip (DRS)", value: "drs", icon: LuFileText },
  {
    label: "Movement of Employees",
    value: "movement-employees",
    icon: LuUsers,
  },
  {
    label: "Reassignment of SA2",
    value: "reassignment-sa2",
    icon: LuArrowLeftRight,
  },
];

export default function page() {
  const [view, setView] = useState<ApprovalView>("reassignment-doc");
  const [open, setOpen] = useState(false);

  const current = APPROVAL_TYPES.find((t) => t.value === view)!;

  return (
    <>
      <Page.Root
        title="Approvals"
        description="Review and process pending approval requests across all transaction types."
      >
        <Page.ToolContent>
          <Flex
            as="button"
            align="center"
            gap={2}
            px={3}
            py={2}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            bg="white"
            boxShadow="xs"
            cursor="pointer"
            onClick={() => setOpen(true)}
            _hover={{
              borderColor: "var(--chakra-colors-primary-disabled)",
              bg: "gray.50",
            }}
            transition="all 0.15s ease"
            minW="0"
            w={{ base: "full", md: "auto" }}
          >
            <Box
              p={1.5}
              borderRadius="md"
              bg="var(--chakra-colors-primary-disabled)/20"
              flexShrink={0}
            >
              <current.icon size={14} color="var(--chakra-colors-primary)" />
            </Box>
            <Box flex={1} minW={0} textAlign="left">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="var(--chakra-colors-primary)"
                lineHeight="1.2"
                truncate
              >
                {current.label}
              </Text>
            </Box>
            <LuChevronDown size={14} color="var(--chakra-colors-gray-400)" />
          </Flex>
        </Page.ToolContent>

        <Page.MainContent>
          <ApprovalsTable view={view} setView={setView} />
        </Page.MainContent>
      </Page.Root>

      <Dialog.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={{ base: 0, md: undefined }}>
            <Dialog.Content
              borderRadius={{ base: 0, md: "3xl" }}
              p={0}
              w={{ base: "100vw", md: "32rem" }}
              h={{ base: "100dvh", md: "32rem" }}
            >
              <Dialog.Header
                px={4}
                pt={5}
                pb={4}
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                <Flex align="center" gap={1}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                    color="gray.500"
                  >
                    <LuChevronLeft />
                  </IconButton>
                  <Dialog.Title fontSize="md" color="gray.800">
                    Request type
                  </Dialog.Title>
                </Flex>
              </Dialog.Header>
              <Dialog.Body px={6} py={5}>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                  gap={3}
                >
                  {APPROVAL_TYPES.map((type) => {
                    const isSelected = view === type.value;
                    const count = approvalConfig[type.value].data.length;
                    return (
                      <Box
                        key={type.value}
                        as="button"
                        textAlign="left"
                        onClick={() => {
                          setView(type.value);
                          setOpen(false);
                        }}
                        p={4}
                        border="1.5px solid"
                        borderColor={
                          isSelected
                            ? "var(--chakra-colors-primary)"
                            : "gray.200"
                        }
                        borderRadius="xl"
                        bg={
                          isSelected ? "var(--chakra-colors-primary)" : "white"
                        }
                        cursor="pointer"
                        transition="all 0.15s ease"
                        _hover={{
                          borderColor: isSelected
                            ? "var(--chakra-colors-primary)"
                            : "var(--chakra-colors-primary-disabled)",
                          bg: isSelected
                            ? "var(--chakra-colors-primary-hover)"
                            : "var(--chakra-colors-primary-disabled)/10",
                        }}
                      >
                        <Flex justify="space-between" align="flex-start" mb={6}>
                          <Box
                            w={9}
                            h={9}
                            borderRadius="lg"
                            bg={
                              isSelected
                                ? "var(--chakra-colors-primary-disabled)/30"
                                : "gray.100"
                            }
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <type.icon
                              size={18}
                              color={
                                isSelected
                                  ? "white"
                                  : "var(--chakra-colors-primary)"
                              }
                            />
                          </Box>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color={
                              isSelected
                                ? "white"
                                : "var(--chakra-colors-primary)"
                            }
                            lineHeight="1"
                          >
                            {count}
                          </Text>
                        </Flex>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color={isSelected ? "white" : "gray.800"}
                        >
                          {type.label}
                        </Text>
                      </Box>
                    );
                  })}
                </Grid>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
