"use client";

import {
  Button,
  Flex,
  Menu,
  Portal,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import Link from "next/link";
import { BiCaretDown } from "react-icons/bi";
import React from "react";

export type ActionButtonItem =
  | {
      type?: "action";
      label: string;
      href?: string;
      onClick?: () => void;
      icon: React.ElementType;
      colorScheme?: string;
      variant?: "outline" | "solid" | "ghost";
    }
  | {
      type: "separator";
    };

type ActionButtonsProps = {
  buttons: ActionButtonItem[];
  iconBoxSize?: number;
};

export default function ActionButtons({
  buttons,
  iconBoxSize = 16,
}: ActionButtonsProps) {
  return (
    <Flex gap={2} wrap="wrap">
      {/* ================= DESKTOP BUTTONS ================= */}
      {/* <Flex gap={2} wrap="wrap" display={{ base: "none", md: "flex" }}>
        {buttons.map((btn, index) => {
          if (btn.type === "separator") {
            return (
              <Box
                key={`sep-${index}`}
                w="1px"
                bg="gray.300"
                mx={2}
                alignSelf="stretch"
              />
            );
          }

          const buttonEl = (
            <Button
              size="sm"
              variant={btn.variant || "outline"}
              colorScheme={btn.colorScheme || "gray"}
              px={3}
              gap={2}
              transition="all 0.2s"
              onClick={btn.onClick}
              _hover={{
                transform: "translateY(-1px)",
                shadow: "sm",
              }}
            >
              <btn.icon size={iconBoxSize} />
              <Text fontSize="sm">{btn.label}</Text>
            </Button>
          );

          return btn.href && !btn.onClick ? (
            <Link key={btn.label} href={btn.href}>
              {buttonEl}
            </Link>
          ) : (
            <React.Fragment key={btn.label}>{buttonEl}</React.Fragment>
          );
        })}
      </Flex> */}

      {/* ================= MOBILE DROPDOWN ================= */}
      <Flex>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button size="sm" variant="solid" borderRadius={"15px"} px={"15px"}>
              Actions <BiCaretDown />
            </Button>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content borderRadius="md" shadow="lg" p={1}>
                {buttons.map((btn, index) => {
                  if (btn.type === "separator") {
                    return <Menu.Separator key={`sep-${index}`} />;
                  }

                  const itemContent = (
                    <HStack
                      gap={2}
                      px={3}
                      py={2}
                      borderRadius="md"
                      _hover={{ bg: "gray.100" }}
                      cursor="pointer"
                    >
                      <btn.icon size={16} />
                      <Text fontSize="sm">{btn.label}</Text>
                    </HStack>
                  );

                  return btn.href && !btn.onClick ? (
                    <Menu.Item key={btn.label} value={btn.label} asChild>
                      <Link href={btn.href}>{itemContent}</Link>
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      key={btn.label}
                      value={btn.label}
                      onClick={btn.onClick}
                    >
                      {itemContent}
                    </Menu.Item>
                  );
                })}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  );
}
