"use client";

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  IconButton,
  Menu,
  Portal,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { LuEllipsis } from "react-icons/lu";
import { ReactNode, createContext, useContext, useState } from "react";
import { BiCaretDown } from "react-icons/bi";

const MenuModeCtx = createContext<"menu" | "dialog">("menu");

interface MenuButtonProps {
  children: ReactNode;
}

export default function MenuButton({ children }: MenuButtonProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <MenuModeCtx.Provider value="dialog">
        <Button size="sm" variant="solid" onClick={() => setOpen(true)}>
          Actions <BiCaretDown />
        </Button>

        <Dialog.Root
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          // size="full"
          placement="bottom"
          motionPreset="slide-in-bottom"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content
                // borderTopRadius="2xl"
                borderBottomRadius="0"
                maxH="100dvh"
                overflow="hidden"
              >
                <Dialog.Header
                  borderBottomWidth={1}
                  borderColor="gray.100"
                  py={4}
                  px={5}
                >
                  <Dialog.Title
                    fontSize="md"
                    fontWeight="semibold"
                    color="gray.700"
                  >
                    Actions
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton
                      position="absolute"
                      top={3}
                      right={3}
                      size="sm"
                    />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body p={0} overflowY="auto">
                  <VStack align="stretch" gap={0} py={2}>
                    {children}
                  </VStack>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </MenuModeCtx.Provider>
    );
  }

  return (
    <MenuModeCtx.Provider value="menu">
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="Actions"
            variant="solid"
            bg="white"
            color="gray.700"
            shadow="sm"
            _hover={{ bg: "gray.50" }}
          >
            <LuEllipsis />
          </IconButton>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content>{children}</Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </MenuModeCtx.Provider>
  );
}

interface MenuItemButtonProps {
  icon: ReactNode;
  label: string;
  itemKey: string;
  value: string;
  onClick: () => void;
}

export function MenuItemButton({
  icon,
  label,
  itemKey,
  value,
  onClick,
}: MenuItemButtonProps) {
  const mode = useContext(MenuModeCtx);

  if (mode === "dialog") {
    return (
      <Flex
        as="button"
        align="center"
        gap={3}
        w="full"
        px={5}
        py={4}
        fontSize="sm"
        fontWeight={500}
        color="gray.700"
        cursor="pointer"
        border="none"
        bg="transparent"
        _hover={{ bg: "gray.50" }}
        _active={{ bg: "gray.100" }}
        onClick={onClick}
      >
        <Box color="gray.400" lineHeight={1} fontSize="md">
          {icon}
        </Box>
        <Text fontSize="sm">{label}</Text>
      </Flex>
    );
  }

  return (
    <Menu.Item key={itemKey} value={value} asChild onClick={onClick}>
      <Flex>
        {icon}
        {label}
      </Flex>
    </Menu.Item>
  );
}
