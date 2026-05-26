"use client";

import React, { useState } from "react";
import {
  Badge,
  Box,
  CloseButton,
  Dialog,
  IconButton,
  Popover,
  Portal,
  Separator,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { LuBell } from "react-icons/lu";
import { Body, Small } from "st-peter-ui";
import { NotificationDataProps } from "../app-layout.type";

export function HeaderNotifications({
  notifications,
}: {
  notifications: NotificationDataProps[];
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const bellButton = (
    <Box position="relative">
      <IconButton
        color={"gray.fg"}
        aria-label="Notifications"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(!open)}
      >
        <LuBell />
      </IconButton>

      {notifications.length > 0 && (
        <Badge
          bg="#ef4444"
          color="white"
          borderRadius="full"
          fontSize="0.6rem"
          position="absolute"
          top="0"
          right="0"
          minW="4"
          h="4"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor={"pointer"}
        >
          {notifications.length}
        </Badge>
      )}
    </Box>
  );

  const notificationList = (
    <VStack
      gap={1}
      align="stretch"
      fontFamily="'calibri'"
      fontWeight="semibold"
    >
      {notifications.length > 0 ? (
        notifications.map((n, idx) => (
          <React.Fragment key={n.id}>
            <Box p={2} _hover={{ bg: "bg.emphasized", cursor: "pointer" }}>
              <Body fontWeight="semibold" color={"gray.fg"}>
                {n.title}
              </Body>
              <Small color="gray.500">{n.description}</Small>
            </Box>
            {idx !== notifications.length - 1 && <Separator />}
          </React.Fragment>
        ))
      ) : (
        <Small color="gray.fg" textAlign="center">
          No notifications
        </Small>
      )}
    </VStack>
  );

  if (isMobile) {
    return (
      <>
        {bellButton}
        <Dialog.Root
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          size="full"
          motionPreset="slide-in-bottom"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  px={4}
                  py={3}
                >
                  <Dialog.Title fontSize="md" fontWeight="semibold">
                    Notifications
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body p={2} overflowY="auto">
                  {notificationList}
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </>
    );
  }

  return (
    <Popover.Root
      lazyMount
      unmountOnExit
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Popover.Trigger asChild>{bellButton}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="280px" p={0} borderRadius="md" shadow="md">
            <Popover.Arrow />
            <Popover.Body maxH="300px" overflowY="auto" p={1}>
              {notificationList}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
