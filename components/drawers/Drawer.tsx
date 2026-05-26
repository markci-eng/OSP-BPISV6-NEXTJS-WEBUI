"use client";

import {
  CloseButton,
  Drawer as ChakraDrawer,
  Portal,
  Text,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { Body } from "st-peter-ui";

interface DrawerProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Drawer({
  title,
  children,
  open,
  onOpenChange,
}: DrawerProps) {
  return (
    <ChakraDrawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <ChakraDrawer.Backdrop />
        <ChakraDrawer.Positioner>
          <ChakraDrawer.Content>
            <ChakraDrawer.Header borderBottomWidth={1} borderColor="gray.200">
              <ChakraDrawer.Title>
                <Body
                  fontWeight="bold"
                  color="var(--chakra-colors-primary)"
                >
                  {title}
                </Body>
              </ChakraDrawer.Title>
              <ChakraDrawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </ChakraDrawer.CloseTrigger>
            </ChakraDrawer.Header>

            <ChakraDrawer.Body>{children}</ChakraDrawer.Body>
          </ChakraDrawer.Content>
        </ChakraDrawer.Positioner>
      </Portal>
    </ChakraDrawer.Root>
  );
}
