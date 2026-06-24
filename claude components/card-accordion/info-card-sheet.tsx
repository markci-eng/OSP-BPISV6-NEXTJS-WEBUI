"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuChevronRight, LuHash } from "react-icons/lu";
import { BottomQuickActions } from "@/claude components/drawer/bottom-quick-actions";

export interface InfoCardSheetProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function InfoCardSheet({ icon, title, subtitle, children }: InfoCardSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        w="full"
        position="relative"
        p={1}
        borderRadius="2xl"
        bg="white"
        shadow="sm"
        transition="all 0.25s ease"
        _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
        overflow="hidden"
        cursor="pointer"
        onClick={() => setOpen(true)}
      >
        <Flex align="center" justify="space-between" px={4} py={3}>
          <Flex align="center" gap={2}>
            <Box
              p={2}
              borderRadius="full"
              bg="gray.100"
              color="inherit"
            >
              {icon}
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
                {title}
              </Text>
              {subtitle && (
                <Flex align="center" gap={1} fontSize="xs" color="gray.500">
                  <LuHash size={12} />
                  <Text>{subtitle}</Text>
                </Flex>
              )}
            </Box>
          </Flex>
          <Box color="gray.400" flexShrink={0}>
            <LuChevronRight size={16} />
          </Box>
        </Flex>
      </Box>

      <BottomQuickActions
        open={open}
        onOpenChange={setOpen}
        title={title}
        subtitle={subtitle}
      >
        {children}
      </BottomQuickActions>
    </>
  );
}
