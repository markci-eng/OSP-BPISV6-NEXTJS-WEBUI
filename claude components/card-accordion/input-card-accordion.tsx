"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuCheck, LuChevronDown, LuChevronUp, LuHash } from "react-icons/lu";

interface InputCardAccordionProps {
  icon: React.ReactNode;
  openedIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  isComplete?: boolean;
}

export function InputCardAccordion({
  icon,
  openedIcon,
  title,
  subtitle,
  children,
  defaultOpen,
  isOpen: controlledOpen,
  onToggle,
  isComplete,
}: InputCardAccordionProps) {
  const [internalOpen, setInternalOpen] = useState(() => {
    if (defaultOpen !== undefined) return defaultOpen;
    if (typeof window !== "undefined") return window.innerWidth >= 768;
    return false;
  });
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalOpen((prev: boolean) => !prev);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const activeIcon = isOpen && openedIcon ? openedIcon : icon;

  return (
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
    >
      {/* Header / trigger */}
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={3}
        cursor="pointer"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        _hover={{ bg: "gray.50" }}
        transition="background 0.15s ease"
      >
        <Flex align="center" gap={2}>
          <Box
            p={2}
            borderRadius="full"
            bg={"gray.100"}
            color={"inherit"}
            transition="background 0.2s ease, color 0.2s ease"
          >
            {activeIcon}
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
              {title}
            </Text>
            <Flex align="center" gap={1} fontSize="xs" color="gray.500">
              <LuHash size={12} />
              <Text>{subtitle}</Text>
            </Flex>
          </Box>
        </Flex>

        {/* Chevron + completion indicator */}
        <Flex align="center" gap={1.5} flexShrink={0}>
          {isComplete && (
            <Box color="green.500">
              <LuCheck size={16} />
            </Box>
          )}
          <Box color="gray.400">
            {isOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
          </Box>
        </Flex>
      </Flex>

      {/* Collapsible content */}
      {isOpen && children && (
        <Box p={4} borderTopWidth={1} borderColor="gray.100">
          {children}
        </Box>
      )}
    </Box>
  );
}
