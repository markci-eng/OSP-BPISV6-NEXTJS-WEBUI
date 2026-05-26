"use client";

import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  HStack,
  Icon,
  Input,
  InputGroup,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Search, User } from "lucide-react";
import { Planholder } from "./types";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

interface PlanholderLookupProps {
  open: boolean;
  onClose: () => void;
  onSelect: (p: Planholder) => void;
}

const MOCK_PLANHOLDERS: Planholder[] = [
  {
    id: "PH001",
    name: "John A. Doe",
    policyNo: "POL-2024-001",
    plan: "Life Plus",
    status: "Active",
  },
  {
    id: "PH002",
    name: "Maria S. Cruz",
    policyNo: "POL-2024-002",
    plan: "Health Shield",
    status: "Active",
  },
  {
    id: "PH003",
    name: "James T. Santos",
    policyNo: "POL-2024-003",
    plan: "Education Plan",
    status: "Active",
  },
  {
    id: "PH004",
    name: "Ana G. Reyes",
    policyNo: "POL-2024-004",
    plan: "Retirement Fund",
    status: "Lapsed",
  },
  {
    id: "PH005",
    name: "Robert C. Lim",
    policyNo: "POL-2024-005",
    plan: "Life Plus",
    status: "Active",
  },
];

export function PlanholderLookup({
  open,
  onClose,
  onSelect,
}: PlanholderLookupProps) {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_PLANHOLDERS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.policyNo.toLowerCase().includes(q),
    );
  }, [search]);

  const handleSelect = (p: Planholder) => {
    onSelect(p);
    onClose();
    setSearch("");
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
          setSearch("");
        }
      }}
      placement="center"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW="lg"
            rounded={STANDARD_RADIUS.lg}
            overflow="hidden"
          >
            <Dialog.Header>
              <Dialog.Title asChild>
                <Text fontSize="lg" fontWeight="semibold">
                  Find Planholder
                </Text>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="stretch" gap={3}>
                <InputGroup
                  startElement={
                    <Icon as={Search} boxSize={4} color="fg.muted" />
                  }
                >
                  <Input
                    placeholder="Search by name or policy number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </InputGroup>

                <Box maxH="300px" overflowY="auto">
                  <VStack align="stretch" gap={1}>
                    {filtered.map((p) => (
                      <Button
                        key={p.id}
                        as="button"
                        type="button"
                        w="full"
                        textAlign="left"
                        px={3}
                        py={2.5}
                        rounded={STANDARD_RADIUS.md}
                        transition="background-color 0.2s"
                        _hover={{ bg: BRAND_COLORS.subtleBg }}
                        onClick={() => handleSelect(p)}
                      >
                        <HStack align="start" gap={3}>
                          <Box
                            h="8"
                            w="8"
                            rounded="full"
                            bg={BRAND_COLORS.successBg}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <Icon
                              as={User}
                              boxSize={4}
                              color={BRAND_COLORS.primaryGreen}
                            />
                          </Box>

                          <Box minW="0" flex="1">
                            <Text fontSize="sm" fontWeight="medium" truncate>
                              {p.name}
                            </Text>

                            <Text fontSize="xs" color="fg.muted">
                              {p.policyNo} · {p.plan} ·{" "}
                              <Box
                                as="span"
                                color={
                                  p.status === "Active"
                                    ? BRAND_COLORS.primaryGreen
                                    : BRAND_COLORS.destructiveRed
                                }
                              >
                                {p.status}
                              </Box>
                            </Text>
                          </Box>
                        </HStack>
                      </Button>
                    ))}

                    {filtered.length === 0 && (
                      <Text
                        fontSize="sm"
                        color="fg.muted"
                        textAlign="center"
                        py={8}
                      >
                        No planholders found.
                      </Text>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
