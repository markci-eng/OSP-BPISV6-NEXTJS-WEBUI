"use client";

import React, { useEffect, useState } from "react";
import {
  Flex,
  IconButton,
  Input,
  Box,
  Avatar,
  Dialog,
  Text,
  VStack,
  Badge,
  Popover,
  Portal,
  InputGroup,
  Separator,
  useBreakpointValue,
  Show,
  Image,
  Button,
  CloseButton,
} from "@chakra-ui/react";
import {
  LuMenu,
  LuSearch,
  LuBell,
  LuX,
  LuUser,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";
import { ColorModeButton, useColorMode } from "@/components/ui/color-mode";
import { NotificationDataProps } from "./app-layout.type";
import { Tooltip } from "../ui/tooltip";
import { Body, PrimaryMdButton, Small } from "st-peter-ui";

import logoIcon from "@/public/images/logo/icon.png";
import { useRouter } from "next/navigation";

export default function AppHeader({
  onToggleSidebar,
  notifications,
}: {
  onToggleSidebar: () => void;
  notifications: NotificationDataProps[];
}) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [notifOpen, setNotifOpen] = useState(false);
  const [systemColorMode, setColorMode] = useState(
    localStorage?.getItem("color-mode") ?? "light",
  );

  useEffect(() => {
    localStorage.setItem("color-mode", systemColorMode);
  }, [systemColorMode]);

  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  return (
    <Flex
      className="no-print"
      h="58px"
      px={4}
      align="center"
      justify="space-between"
      bg="bg"
      borderBottom="1px solid"
      borderColor="gray.200"
      fontFamily="'Open Sans', sans-serif"
    >
      {/* Left side */}
      <Flex align="center" gap={2}>
        {/* Sidebar toggle */}
        <Show when={!isMobile}>
          <IconButton
            color={"gray.fg"}
            aria-label="Toggle sidebar"
            size="sm"
            variant="ghost"
            onClick={onToggleSidebar}
          >
            <LuMenu />
          </IconButton>
        </Show>
        <Show when={isMobile}>
          <Flex align="center" gap={2}>
            <Box
              w="24px"
              h="24px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Image
                src={logoIcon.src}
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Box overflow="hidden" transition="width 0.2s">
              <Body
                fontWeight="bold"
                whiteSpace="nowrap"
                transition="opacity 0.2s"
                color="primary"
              >
                {"One St. Peter"}
              </Body>
              <Small mt={"-5px"} color={"primary"} fontStyle={"italic"}>
                Life Plan Operations
              </Small>
            </Box>
          </Flex>
        </Show>
      </Flex>

      {/* Right side */}
      <Flex align="center" gap={2}>
        <Dialog.Root size="full" motionPreset="slide-in-bottom">
          <Dialog.Trigger asChild>
            <IconButton
              color={"gray.fg"}
              display={{ base: "flex" }}
              aria-label="Search"
              size="sm"
              variant="ghost"
            >
              <LuSearch />
            </IconButton>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <InputGroup
                    flex="1"
                    startElement={<LuSearch />}
                    endElement={
                      <Dialog.CloseTrigger>
                        <Box
                          py={1}
                          px={2}
                          bg={"gray.100"}
                          borderRadius={"md"}
                          cursor={"pointer"}
                          _hover={{ bg: "gray.200" }}
                        >
                          Cancel
                        </Box>
                      </Dialog.CloseTrigger>
                    }
                  >
                    <Input placeholder="Search . . ." />
                  </InputGroup>
                </Dialog.Header>
                <Dialog.Body>
                  <Text textAlign={"center"} py={5}>
                    No recent searches
                  </Text>
                </Dialog.Body>
                <Dialog.Footer></Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        <ColorModeButton
          color={"gray.fg"}
          _hover={{ color: "primary" }}
          onClick={(e) => {
            e.preventDefault();
            if (systemColorMode == "light") {
              setColorMode("dark");
            } else {
              setColorMode("light");
            }
            window.location.reload();
          }}
        />

        {/* Notifications */}
        <Popover.Root
          lazyMount
          unmountOnExit
          open={notifOpen}
          onOpenChange={(e) => setNotifOpen(e.open)}
        >
          <Popover.Trigger asChild>
            <Box position="relative">
              <IconButton
                color={"gray.fg"}
                aria-label="Notifications"
                size="sm"
                variant="ghost"
                onClick={() => setNotifOpen(!notifOpen)}
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
                >
                  {notifications.length}
                </Badge>
              )}
            </Box>
          </Popover.Trigger>

          <Portal>
            <Popover.Positioner>
              <Popover.Content w="280px" p={0} borderRadius="md" shadow="md">
                <Popover.Arrow />
                <Popover.Body maxH="300px" overflowY="auto" p={1}>
                  <VStack
                    gap={1}
                    align="stretch"
                    fontFamily="'calibri'"
                    fontWeight="semibold"
                  >
                    {notifications.length > 0 ? (
                      notifications.map((n, idx) => (
                        <React.Fragment key={n.id}>
                          <Box
                            p={2} // decreased padding
                            // borderRadius="md"
                            _hover={{
                              bg: "bg.emphasized",
                              cursor: "pointer",
                            }}
                          >
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
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>

        {/* User menu */}
        <Box cursor="pointer" onClick={() => setProfileOpen(true)}>
          <Tooltip
            ids={{ trigger: "1" }}
            content="Mark Cristian Ibe"
            contentProps={{ css: { bg: "white" } }}
          >
            <Avatar.Root size={"sm"} ids={{ root: "1" }}>
              <Avatar.Fallback name="Mark Cristian Ibe" />
              {/* <Avatar.Image src="https://lh3.googleusercontent.com/a/ACg8ocJb6Q7Tm0nXfaF1A0tcdFs3JrTHqyaXyo5UauoS4SnjyYuIQTbi=s317-c-no" /> */}
            </Avatar.Root>
          </Tooltip>

          <Dialog.Root
            open={profileOpen}
            onOpenChange={(e) => setProfileOpen(e.open)}
            size="md"
            placement="top"
          >
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title display="none" />
                </Dialog.Header>
                <Dialog.Body as={VStack} gap={8} py={8}>
                  {/* Profile Picture */}
                  <Avatar.Root size="xl">
                    <Avatar.Image src="/images/profile.jpg" alt="Profile" />
                    <Avatar.Fallback />
                  </Avatar.Root>

                  {/* User Name */}
                  <VStack gap={1}>
                    <Text fontSize="lg" fontWeight="bold">
                      Yhuan Shin Tejima
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      SPLPI-01-123456789
                    </Text>
                  </VStack>

                  {/* Action Buttons */}
                  <VStack gap={3} w="full" pt={4}>
                    <PrimaryMdButton
                      w="full"
                      onClick={() => {
                        router.push("/profile");
                        setProfileOpen(false);
                      }}
                    >
                      Manage Account
                    </PrimaryMdButton>
                    <Button
                      w="full"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        localStorage.removeItem("user");
                        setProfileOpen(false);
                        window.location.reload();
                      }}
                    >
                      Sign Out
                    </Button>
                  </VStack>
                </Dialog.Body>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="md" />
                </Dialog.CloseTrigger>{" "}
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </Box>
      </Flex>
    </Flex>
  );
}
