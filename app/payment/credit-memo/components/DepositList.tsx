"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Trash2, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Deposit } from "./types";

interface DepositListProps {
  deposits: Deposit[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

const MotionBox = motion.create(Box);

export function DepositList({
  deposits,
  selectedId,
  onSelect,
  onRemove,
}: DepositListProps) {
  if (deposits.length === 0) {
    return (
      <Text fontSize="sm" color="fg.muted" py={4}>
        No deposits added yet.
      </Text>
    );
  }

  return (
    <Wrap gap="3" align="stretch">
      <AnimatePresence mode="popLayout">
        {deposits.map((d) => (
          <WrapItem key={d.id}>
            <MotionBox
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              minW="280px"
              maxW="340px"
              w="full"
              p="4"
              rounded="xl"
              bg="bg"
              borderWidth="1px"
              borderColor={selectedId === d.id ? "blue.200" : "border.muted"}
              boxShadow={selectedId === d.id ? "md" : "sm"}
              cursor="pointer"
              _hover={{ boxShadow: "md" }}
              outline={selectedId === d.id ? "2px solid" : "none"}
              outlineColor={selectedId === d.id ? "blue.200" : "transparent"}
              onClick={() => onSelect(d.id)}
            >
              <Flex align="start" justify="space-between" gap="2">
                <HStack align="start" gap="2">
                  <Flex
                    h="8"
                    w="8"
                    rounded="lg"
                    bg="blue.subtle"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={Building2} boxSize="4" color="blue.solid" />
                  </Flex>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      {d.bankName || "Bank"}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {d.depositType} · {d.depositDate?.split("T")[0]}
                    </Text>
                  </Box>
                </HStack>

                <Button
                  variant="ghost"
                  size="xs"
                  color="fg.muted"
                  _hover={{ color: "red.500", bg: "red.50" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(d.id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </Flex>

              <Flex mt="3" align="baseline" justify="space-between">
                <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                  Amount
                </Text>
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  fontVariantNumeric="tabular-nums"
                >
                  {formatCurrency(d.amount)}
                </Text>
              </Flex>
            </MotionBox>
          </WrapItem>
        ))}
      </AnimatePresence>
    </Wrap>
  );
}
