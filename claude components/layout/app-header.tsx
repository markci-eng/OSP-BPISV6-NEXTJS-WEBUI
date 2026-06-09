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
  Separator,
  useBreakpointValue,
  Show,
  Image,
  Button,
} from "@chakra-ui/react";
import {
  LuMenu,
  LuSearch,
  LuBell,
  LuX,
  LuClipboardList,
  LuRefreshCw,
  LuUserCheck,
  LuCreditCard,
  LuFileText,
  LuTriangleAlert,
  LuCircleHelp,
  LuBotMessageSquare,
} from "react-icons/lu";
import { NotificationDataProps } from "./app-layout.type";
import { Body, Small } from "st-peter-ui";

import logoIcon from "@/public/images/logo/icon.png";

const DEFAULT_NOTIF_ICON = {
  Icon: LuBell as React.ElementType,
  bg: "#F3F4F6",
  color: "#6B7280",
};

const NOTIF_ICON_MAP: Record<
  string,
  { Icon: React.ElementType; bg: string; color: string }
> = {
  request: { Icon: LuClipboardList, bg: "#D3EDEE", color: "#006838" },
  system: { Icon: LuRefreshCw, bg: "#DBEAFE", color: "#283D91" },
  approval: { Icon: LuUserCheck, bg: "#ACD6A6", color: "#006838" },
  payment: { Icon: LuCreditCard, bg: "#FFF9C4", color: "#92792D" },
  document: { Icon: LuFileText, bg: "#D3EDEE", color: "#026BA9" },
  alert: { Icon: LuTriangleAlert, bg: "#FFCEE9", color: "#BF1F2F" },
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

function parseAvatarName(session: string | null): string {
  if (!session) return "";
  try {
    const json = session.split(".")[0];
    const padded = json.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (padded.length % 4)) % 4;
    const decoded = atob(padded + "=".repeat(padding));
    const payload = JSON.parse(decoded) as { email?: string };
    const email = payload.email ?? "";
    const stored =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("user-display-name")
        : null;
    return (
      stored ||
      (email.split("@")[0] ?? "")
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim()
    );
  } catch {
    return "";
  }
}

export default function AppHeader({
  onToggleSidebar,
  notifications,
  onOpenProfile,
  appName = "App",
  appSubtitle,
  breadcrumb,
}: {
  onToggleSidebar: () => void;
  notifications: NotificationDataProps[];
  onOpenProfile: () => void;
  appName?: string;
  appSubtitle?: string;
  breadcrumb?: React.ReactNode;
}) {
  const isMobileBreak = useBreakpointValue({ base: true, lg: false });
  const [isMounted, setIsMounted] = useState(false);
  const [avatarName, setAvatarName] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchTab, setSearchTab] = useState<"all" | "recent">("all");
  const [readIds, setReadIds] = useState<Set<number>>(
    () => new Set(notifications.filter((n) => n.read).map((n) => n.id)),
  );
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));
  // Defer to client value only after mount to avoid SSR/client mismatch
  const isMobile = isMounted ? isMobileBreak : false;

  useEffect(() => {
    setIsMounted(true);
    setAvatarName(parseAvatarName(readCookie("osp_session")));
  }, []);

  const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"];

  const pickPalette = (name: string) => {
    const index = name.charCodeAt(0) % colorPalette.length;
    return colorPalette[index];
  };

  return (
    <Flex
      className="no-print"
      h="80px"
      px={4}
      align="center"
      justify="space-between"
      bg="bg"
      _dark={{ bg: "rgba(20, 24, 36, 0.88)" }}
      // borderBottom="1px solid"
      // borderColor="gray.200"
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
          {breadcrumb}
        </Show>
        <Show when={isMobile}>
          <Flex align="center" gap={2}>
            <IconButton
              color={"gray.fg"}
              aria-label="Toggle sidebar"
              size="sm"
              variant="ghost"
              onClick={onToggleSidebar}
            >
              <LuMenu />
            </IconButton>
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
                color="gray.800"
              >
                {appName}
              </Body>
              {appSubtitle && (
                // <Small mt={"-5px"} color={"primary"} fontStyle={"normal"}>
                //   {appSubtitle}
                // </Small>
                <Text
                  mt={"-5px"}
                  color="#003818"
                  fontStyle={"normal"}
                  fontSize="small"
                >
                  {appSubtitle}
                </Text>
              )}
            </Box>
          </Flex>
        </Show>
      </Flex>

      {/* Right side */}
      <Flex align="center">
        {/* <IconButton
          color="gray.fg"
          aria-label="Page tour"
          size="xl"
          variant="ghost"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("osp-start-page-tour"))
          }
        >
          <LuCircleHelp />
        </IconButton> */}
        <Dialog.Root
          size="full"
          motionPreset="slide-in-bottom"
          onExitComplete={() => {
            setSearchValue("");
            setSearchTab("all");
          }}
        >
          <Dialog.Trigger asChild>
            <IconButton
              color={"gray.fg"}
              display={{ base: "flex" }}
              aria-label="Search"
              size="xl"
              variant="ghost"
            >
              <LuSearch />
            </IconButton>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content bg="white" _dark={{ bg: "gray.900" }}>
                {/* Search bar row */}
                <Dialog.Header
                  p={0}
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                  _dark={{ borderColor: "gray.700" }}
                >
                  <Flex align="center" gap={2} px={3} pt={3} pb={3} w="full">
                    <Flex
                      flex={1}
                      minW={0}
                      align="center"
                      gap={2}
                      bg="gray.100"
                      _dark={{ bg: "gray.800" }}
                      borderRadius="xl"
                      px={3}
                      py={2}
                    >
                      <Box color="gray.400" flexShrink={0}>
                        <LuSearch size={16} />
                      </Box>
                      <Input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search . . ."
                        border="none"
                        bg="transparent"
                        p={0}
                        h="auto"
                        minW={0}
                        fontSize="md"
                        _focus={{ outline: "none", boxShadow: "none" }}
                        autoFocus
                      />
                    </Flex>
                    <Dialog.CloseTrigger asChild>
                      <Button
                        variant="ghost"
                        color="green.600"
                        fontWeight="medium"
                        px={2}
                        flexShrink={0}
                        onClick={() => setSearchValue("")}
                      >
                        Cancel
                      </Button>
                    </Dialog.CloseTrigger>
                  </Flex>
                </Dialog.Header>

                {/* Suggestions list */}
                <Dialog.Body p={0}>
                  {/* Filter tab pills */}
                  <Flex
                    gap={2}
                    px={3}
                    py={3}
                    borderBottomWidth="1px"
                    borderColor="gray.100"
                    _dark={{ borderColor: "gray.700" }}
                  >
                    {(["all", "recent"] as const).map((tab) => (
                      <Box
                        key={tab}
                        px={4}
                        py={1.5}
                        borderRadius="full"
                        bg={searchTab === tab ? "gray.800" : "gray.100"}
                        color={searchTab === tab ? "white" : "gray.600"}
                        cursor="pointer"
                        fontSize="sm"
                        fontWeight="medium"
                        onClick={() => setSearchTab(tab)}
                        _dark={{
                          bg: searchTab === tab ? "white" : "gray.700",
                          color: searchTab === tab ? "gray.900" : "gray.300",
                        }}
                      >
                        {tab === "all" ? "All" : "Recent"}
                      </Box>
                    ))}
                  </Flex>
                  <VStack gap={0} align="stretch">
                    {[
                      "Approvals",
                      "Claims",
                      "Payment",
                      "Plan Management",
                      "Disbursement",
                      "Accounts Maintenance",
                      "Sales Force",
                      "Loan",
                      "Document Management",
                    ]
                      .filter(
                        (s) =>
                          !searchValue ||
                          s
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()),
                      )
                      .map((s) => (
                        <Flex
                          key={s}
                          align="center"
                          gap={3}
                          px={4}
                          py={3.5}
                          borderBottomWidth="1px"
                          borderColor="gray.100"
                          _dark={{ borderColor: "gray.700" }}
                          _hover={{ bg: "gray.50", cursor: "pointer" }}
                        >
                          <Box color="gray.400" flexShrink={0}>
                            <LuSearch size={16} />
                          </Box>
                          <Text fontSize="md" color="gray.700" _dark={{ color: "gray.200" }}>
                            {s}
                          </Text>
                        </Flex>
                      ))}
                    {[
                      "Approvals",
                      "Claims",
                      "Payment",
                      "Plan Management",
                      "Disbursement",
                      "Accounts Maintenance",
                      "Sales Force",
                      "Loan",
                      "Document Management",
                    ].filter(
                      (s) =>
                        !searchValue ||
                        s.toLowerCase().includes(searchValue.toLowerCase()),
                    ).length === 0 && (
                      <Text
                        textAlign="center"
                        py={10}
                        color="gray.400"
                        fontSize="sm"
                      >
                        No results found
                      </Text>
                    )}
                  </VStack>
                </Dialog.Body>
                <Dialog.Footer />
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        {/* Chatbot */}
        <IconButton
          aria-label="Chatbot"
          size="xl"
          variant="ghost"
          _hover={{ bg: "green.50" }}
        >
          <LuBotMessageSquare />
        </IconButton>

        {/* Notifications */}
        {isMobile ? (
          <Dialog.Root size="full" motionPreset="slide-in-bottom">
            <Dialog.Trigger asChild>
              <Box position="relative" display="inline-flex">
                <IconButton
                  color="gray.fg"
                  aria-label="Notifications"
                  size="xl"
                  variant="ghost"
                >
                  <LuBell />
                </IconButton>
                {unreadCount > 0 && (
                  <Badge
                    bg="#ef4444"
                    color="white"
                    borderRadius="full"
                    fontSize="xs"
                    position="absolute"
                    top="6px"
                    right="6px"
                    minW="4"
                    h="4"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Box>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  {/* Header */}
                  <Dialog.Header
                    p={0}
                    borderBottomWidth="1px"
                    borderColor="gray.200"
                  >
                    <Flex
                      px={4}
                      py={3}
                      align="center"
                      justify="space-between"
                      w="full"
                    >
                      <Flex align="center" gap={2}>
                        <Dialog.Title fontWeight="bold" fontSize="md">
                          Notifications
                        </Dialog.Title>
                        {unreadCount > 0 && (
                          <Badge
                            bg="var(--chakra-colors-primary)"
                            color="white"
                            borderRadius="full"
                            fontSize="xs"
                            px={1.5}
                            h="18px"
                            display="flex"
                            alignItems="center"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </Flex>
                      <Flex align="center" gap={1}>
                        {unreadCount > 0 && (
                          <Button
                            size="xs"
                            variant="ghost"
                            fontSize="xs"
                            fontWeight="medium"
                            color="var(--chakra-colors-primary)"
                            onClick={markAllRead}
                          >
                            Mark all read
                          </Button>
                        )}
                        <Dialog.CloseTrigger asChild>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            aria-label="Close"
                            position="static"
                          >
                            <LuX />
                          </IconButton>
                        </Dialog.CloseTrigger>
                      </Flex>
                    </Flex>
                  </Dialog.Header>
                  {/* Body */}
                  <Dialog.Body p={0} overflowY="auto">
                    {notifications.length > 0 ? (
                      <VStack gap={0} align="stretch">
                        {notifications.map((n, idx) => {
                          const cfg =
                            NOTIF_ICON_MAP[n.type] ?? DEFAULT_NOTIF_ICON;
                          const isUnread = !readIds.has(n.id);
                          const NotifIcon = cfg.Icon;
                          return (
                            <React.Fragment key={n.id}>
                              <Box
                                px={4}
                                py={3}
                                bg={isUnread ? "bg.subtle" : "bg"}
                                _hover={{ bg: "bg.muted", cursor: "pointer" }}
                                transition="background 150ms ease-out"
                              >
                                <Flex gap={3} align="flex-start">
                                  {/* Unread dot column */}
                                  <Flex
                                    w="8px"
                                    flexShrink={0}
                                    justify="center"
                                    pt="15px"
                                  >
                                    {isUnread && (
                                      <Box
                                        w="6px"
                                        h="6px"
                                        borderRadius="full"
                                        bg="var(--chakra-colors-primary)"
                                      />
                                    )}
                                  </Flex>
                                  {/* Icon circle */}
                                  <Box
                                    w="40px"
                                    h="40px"
                                    borderRadius="full"
                                    flexShrink={0}
                                    bg={cfg.bg}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <NotifIcon size={18} color={cfg.color} />
                                  </Box>
                                  {/* Content */}
                                  <Box flex={1} minW={0}>
                                    <Flex
                                      justify="space-between"
                                      align="flex-start"
                                      gap={2}
                                    >
                                      <Text
                                        fontSize="sm"
                                        fontWeight={
                                          isUnread ? "semibold" : "medium"
                                        }
                                        color="gray.fg"
                                        lineHeight="1.3"
                                      >
                                        {n.title}
                                      </Text>
                                      <Text
                                        fontSize="xs"
                                        color="gray.400"
                                        flexShrink={0}
                                        lineHeight="1.5"
                                      >
                                        {n.timestamp}
                                      </Text>
                                    </Flex>
                                    <Text
                                      fontSize="xs"
                                      color="gray.500"
                                      mt={0.5}
                                      lineHeight="1.5"
                                    >
                                      {n.description}
                                    </Text>
                                  </Box>
                                </Flex>
                              </Box>
                              {idx !== notifications.length - 1 && (
                                <Separator />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </VStack>
                    ) : (
                      <Box py={20} textAlign="center">
                        <Box
                          w="56px"
                          h="56px"
                          borderRadius="full"
                          bg="gray.100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mx="auto"
                          mb={3}
                        >
                          <LuBell size={24} color="#9CA3AF" />
                        </Box>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="gray.fg"
                        >
                          All caught up!
                        </Text>
                        <Text fontSize="xs" color="gray.400" mt={1}>
                          No new notifications
                        </Text>
                      </Box>
                    )}
                  </Dialog.Body>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        ) : (
          <Popover.Root
            lazyMount
            unmountOnExit
            open={notifOpen}
            onOpenChange={(e) => setNotifOpen(e.open)}
          >
            <Popover.Trigger asChild>
              <Box position="relative" display="inline-flex">
                <IconButton
                  color="gray.fg"
                  aria-label="Notifications"
                  size="sm"
                  variant="ghost"
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  <LuBell />
                </IconButton>
                {unreadCount > 0 && (
                  <Badge
                    bg="#ef4444"
                    color="white"
                    borderRadius="full"
                    fontSize="xs"
                    position="absolute"
                    top="2px"
                    right="2px"
                    minW="4"
                    h="4"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Box>
            </Popover.Trigger>
            <Portal>
              <Popover.Positioner>
                <Popover.Content
                  w="340px"
                  p={0}
                  borderRadius="xl"
                  shadow="xl"
                  overflow="hidden"
                >
                  <Popover.Arrow />
                  {/* Header */}
                  <Box borderBottomWidth="1px" borderColor="gray.200">
                    <Flex
                      px={3}
                      py={2.5}
                      align="center"
                      justify="space-between"
                    >
                      <Flex align="center" gap={2}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.fg">
                          Notifications
                        </Text>
                        {unreadCount > 0 && (
                          <Badge
                            bg="var(--chakra-colors-primary)"
                            color="white"
                            borderRadius="full"
                            fontSize="xs"
                            px={1.5}
                            h="18px"
                            display="flex"
                            alignItems="center"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </Flex>
                      {unreadCount > 0 && (
                        <Button
                          size="xs"
                          variant="ghost"
                          fontSize="xs"
                          fontWeight="medium"
                          color="var(--chakra-colors-primary)"
                          onClick={markAllRead}
                        >
                          Mark all read
                        </Button>
                      )}
                    </Flex>
                  </Box>
                  {/* List */}
                  <Box maxH="380px" overflowY="auto">
                    {notifications.length > 0 ? (
                      <VStack gap={0} align="stretch">
                        {notifications.map((n, idx) => {
                          const cfg =
                            NOTIF_ICON_MAP[n.type] ?? DEFAULT_NOTIF_ICON;
                          const isUnread = !readIds.has(n.id);
                          const NotifIcon = cfg.Icon;
                          return (
                            <React.Fragment key={n.id}>
                              <Box
                                px={3}
                                py={2.5}
                                bg={isUnread ? "bg.subtle" : "bg"}
                                _hover={{ bg: "bg.muted", cursor: "pointer" }}
                                transition="background 150ms ease-out"
                              >
                                <Flex gap={3} align="flex-start">
                                  {/* Unread dot column */}
                                  <Flex
                                    w="8px"
                                    flexShrink={0}
                                    justify="center"
                                    pt="13px"
                                  >
                                    {isUnread && (
                                      <Box
                                        w="6px"
                                        h="6px"
                                        borderRadius="full"
                                        bg="var(--chakra-colors-primary)"
                                      />
                                    )}
                                  </Flex>
                                  {/* Icon circle */}
                                  <Box
                                    w="36px"
                                    h="36px"
                                    borderRadius="full"
                                    flexShrink={0}
                                    bg={cfg.bg}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <NotifIcon size={16} color={cfg.color} />
                                  </Box>
                                  {/* Content */}
                                  <Box flex={1} minW={0}>
                                    <Flex
                                      justify="space-between"
                                      align="flex-start"
                                      gap={2}
                                    >
                                      <Text
                                        fontSize="sm"
                                        fontWeight={
                                          isUnread ? "semibold" : "medium"
                                        }
                                        color="gray.fg"
                                        lineHeight="1.3"
                                      >
                                        {n.title}
                                      </Text>
                                      <Text
                                        fontSize="xs"
                                        color="gray.400"
                                        flexShrink={0}
                                        lineHeight="1.5"
                                      >
                                        {n.timestamp}
                                      </Text>
                                    </Flex>
                                    <Text
                                      fontSize="xs"
                                      color="gray.500"
                                      mt={0.5}
                                      lineHeight="1.5"
                                    >
                                      {n.description}
                                    </Text>
                                  </Box>
                                </Flex>
                              </Box>
                              {idx !== notifications.length - 1 && (
                                <Separator />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </VStack>
                    ) : (
                      <Box py={12} textAlign="center">
                        <Box
                          w="48px"
                          h="48px"
                          borderRadius="full"
                          bg="gray.100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mx="auto"
                          mb={3}
                        >
                          <LuBell size={20} color="#9CA3AF" />
                        </Box>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="gray.fg"
                        >
                          All caught up!
                        </Text>
                        <Text fontSize="xs" color="gray.400" mt={1}>
                          No new notifications
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>
        )}

        <Show when={!isMobile}>
          <Avatar.Root
            cursor="pointer"
            onClick={onOpenProfile}
            title="Account & Settings"
            colorPalette={pickPalette(avatarName || "U")}
          >
            <Avatar.Image
              src="https://lh3.googleusercontent.com/a-/ALV-UjVMJSHCRae9AI71omM-12-JXe6RRORMkcfShnPQRn5izScdfxo=s240-p-k-rw-no"
              alt={avatarName || "U"}
            />
            <Avatar.Fallback name={avatarName || "U"} fontWeight="bold" />
          </Avatar.Root>
        </Show>
      </Flex>
    </Flex>
  );
}
