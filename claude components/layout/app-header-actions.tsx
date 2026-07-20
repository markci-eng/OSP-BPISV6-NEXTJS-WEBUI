"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Badge,
  Button,
  Dialog,
  Flex,
  IconButton,
  Input,
  Portal,
  Popover,
  Separator,
  Text,
  VStack,
  useBreakpointValue,
  InputGroup,
} from "@chakra-ui/react";
import {
  LuBell,
  LuBotMessageSquare,
  LuSearch,
  LuX,
  LuClipboardList,
  LuRefreshCw,
  LuUserCheck,
  LuCreditCard,
  LuFileText,
  LuTriangleAlert,
  LuArrowRight,
  LuArrowLeft,
} from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useNotifications } from "./notifications-context";
import { NotificationDataProps } from "./app-layout.type";

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

function NotificationItem({
  n,
  isUnread,
  compact,
}: {
  n: NotificationDataProps;
  isUnread: boolean;
  compact?: boolean;
}) {
  const cfg = NOTIF_ICON_MAP[n.type] ?? DEFAULT_NOTIF_ICON;
  const NotifIcon = cfg.Icon;
  const iconSize = compact ? 36 : 40;
  const iconInner = compact ? 16 : 18;

  return (
    <Box
      px={compact ? 3 : 4}
      py={compact ? 2.5 : 3}
      bg={isUnread ? "bg.subtle" : "bg"}
      _hover={{ bg: "bg.muted", cursor: "pointer" }}
      transition="background 150ms ease-out"
    >
      <Flex gap={3} align="flex-start">
        <Flex
          w="8px"
          flexShrink={0}
          justify="center"
          pt={compact ? "13px" : "15px"}
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
        <Box
          w={`${iconSize}px`}
          h={`${iconSize}px`}
          borderRadius="full"
          flexShrink={0}
          bg={cfg.bg}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <NotifIcon size={iconInner} color={cfg.color} />
        </Box>
        <Box flex={1} minW={0}>
          <Flex justify="space-between" align="flex-start" gap={2}>
            <Text
              fontSize="sm"
              fontWeight={isUnread ? "semibold" : "medium"}
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
          <Text fontSize="xs" color="gray.500" mt={0.5} lineHeight="1.5">
            {n.description}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

function EmptyNotifications({ compact }: { compact?: boolean }) {
  return (
    <Box py={compact ? 12 : 20} textAlign="center">
      <Box
        w={compact ? "48px" : "56px"}
        h={compact ? "48px" : "56px"}
        borderRadius="full"
        bg="gray.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mx="auto"
        mb={3}
      >
        <LuBell size={compact ? 20 : 24} color="#9CA3AF" />
      </Box>
      <Text fontSize="sm" fontWeight="semibold" color="gray.fg">
        All caught up!
      </Text>
      <Text fontSize="xs" color="gray.400" mt={1}>
        No new notifications
      </Text>
    </Box>
  );
}

export function AppHeaderActions({
  iconColor = "gray.fg",
}: {
  iconColor?: string;
}) {
  const router = useRouter();
  const notifications = useNotifications();
  const isMobileBreak = useBreakpointValue({ base: true, lg: false });
  const [isMounted, setIsMounted] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(
    () => new Set(notifications.filter((n) => n.read).map((n) => n.id)),
  );
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchTab, setSearchTab] = useState<"all" | "recent">("all");
  const [trackerMode, setTrackerMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted ? isMobileBreak : false;
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  const handleTrackSubmit = () => {
    const id = searchValue.trim();
    if (!id) return;
    setSearchOpen(false);
    router.push(`/transaction/${encodeURIComponent(id)}`);
  };

  return (
    <Flex align="center">
      {/* Search */}
      <Dialog.Root
        size="full"
        motionPreset="slide-in-bottom"
        open={searchOpen}
        onOpenChange={(e) => setSearchOpen(e.open)}
        onExitComplete={() => {
          setSearchValue("");
          setSearchTab("all");
          setTrackerMode(false);
        }}
      >
        <Dialog.Trigger asChild>
          <IconButton
            color={iconColor}
            aria-label="Search"
            size="lg"
            variant="ghost"
            onClick={() => setSearchOpen(true)}
          >
            <LuSearch size={18} />
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
                  {trackerMode && (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      aria-label="Back to search"
                      flexShrink={0}
                      onClick={() => {
                        setTrackerMode(false);
                        setSearchValue("");
                      }}
                    >
                      <LuArrowLeft />
                    </IconButton>
                  )}
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
                    <Box
                      color={trackerMode ? "green.500" : "gray.400"}
                      flexShrink={0}
                    >
                      {trackerMode ? (
                        <LuClipboardList size={16} />
                      ) : (
                        <LuSearch size={16} />
                      )}
                    </Box>
                    <Input
                      value={searchValue}
                      onChange={(e) =>
                        setSearchValue(
                          trackerMode
                            ? e.target.value.toUpperCase()
                            : e.target.value,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && trackerMode)
                          handleTrackSubmit();
                      }}
                      placeholder={
                        trackerMode
                          ? "Enter reference number..."
                          : "Search . . ."
                      }
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
                {trackerMode ? (
                  /* Tracker mode body */
                  <VStack gap={4} px={4} py={6} align="stretch">
                    <Box
                      bg="green.50"
                      _dark={{ bg: "green.900" }}
                      borderRadius="xl"
                      p={4}
                    >
                      <Flex align="center" gap={3} mb={2}>
                        <Box
                          w="36px"
                          h="36px"
                          borderRadius="full"
                          bg="#D3EDEE"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          <LuClipboardList size={18} color="#006838" />
                        </Box>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="gray.700"
                          _dark={{ color: "gray.200" }}
                        >
                          Track My Request
                        </Text>
                      </Flex>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        _dark={{ color: "gray.400" }}
                      >
                        Enter your transaction reference number below and press
                        Track or hit Enter to view the status of your request.
                      </Text>
                    </Box>
                    <Button
                      colorScheme="green"
                      bg="var(--chakra-colors-primary)"
                      color="white"
                      borderRadius="xl"
                      size="lg"
                      disabled={!searchValue.trim()}
                      onClick={handleTrackSubmit}
                      _hover={{ opacity: 0.9 }}
                    >
                      Track Request
                      <LuArrowRight />
                    </Button>
                  </VStack>
                ) : (
                  <>
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
                      {/* Track My Request — always pinned at top */}
                      {(!searchValue ||
                        "Track My Request"
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())) && (
                        <Flex
                          align="center"
                          gap={3}
                          px={4}
                          py={3.5}
                          borderBottomWidth="1px"
                          borderColor="gray.100"
                          _dark={{ borderColor: "gray.700" }}
                          _hover={{ bg: "gray.50", cursor: "pointer" }}
                          onClick={() => {
                            setTrackerMode(true);
                            setSearchValue("");
                          }}
                        >
                          <Box color="green.600" flexShrink={0}>
                            <LuClipboardList size={16} />
                          </Box>
                          <Text
                            fontSize="md"
                            color="gray.700"
                            _dark={{ color: "gray.200" }}
                            flex={1}
                          >
                            Track My Request
                          </Text>
                          <Box color="gray.400" flexShrink={0}>
                            <LuArrowRight size={14} />
                          </Box>
                        </Flex>
                      )}
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
                            s.toLowerCase().includes(searchValue.toLowerCase()),
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
                            <Text
                              fontSize="md"
                              color="gray.700"
                              _dark={{ color: "gray.200" }}
                            >
                              {s}
                            </Text>
                          </Flex>
                        ))}
                      {!(
                        !searchValue ||
                        "Track My Request"
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                      ) &&
                        [
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
                  </>
                )}
              </Dialog.Body>
              <Dialog.Footer />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Chatbot */}
      {/* <IconButton
        aria-label="Chatbot"
        size="sm"
        variant="ghost"
        color={iconColor}
        _hover={{ bg: "green.50" }}
      >
        <LuBotMessageSquare size={18} />
      </IconButton> */}

      {/* Notifications — Dialog on mobile, Popover on desktop */}
      {isMobile ? (
        <Dialog.Root size="full" motionPreset="slide-in-bottom">
          <Dialog.Trigger asChild>
            <Box position="relative" display="inline-flex">
              <IconButton
                color={iconColor}
                aria-label="Notifications"
                size="lg"
                variant="ghost"
              >
                <LuBell size={18} />
              </IconButton>
              {unreadCount > 0 && (
                <Badge
                  bg="#ef4444"
                  color="white"
                  borderRadius="full"
                  fontSize="xs"
                  position="absolute"
                  top="8px"
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
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
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
                <Dialog.Body p={0} overflowY="auto">
                  {notifications.length > 0 ? (
                    <VStack gap={0} align="stretch">
                      {notifications.map((n, idx) => (
                        <React.Fragment key={n.id}>
                          <NotificationItem
                            n={n}
                            isUnread={!readIds.has(n.id)}
                          />
                          {idx !== notifications.length - 1 && <Separator />}
                        </React.Fragment>
                      ))}
                    </VStack>
                  ) : (
                    <EmptyNotifications />
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
                color={iconColor}
                aria-label="Notifications"
                size="lg"
                variant="ghost"
              >
                <LuBell size={18} />
              </IconButton>
              {unreadCount > 0 && (
                <Badge
                  bg="#ef4444"
                  color="white"
                  borderRadius="full"
                  fontSize="xs"
                  position="absolute"
                  top="8px"
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
                <Box borderBottomWidth="1px" borderColor="gray.200">
                  <Flex px={3} py={2.5} align="center" justify="space-between">
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
                      <Popover.CloseTrigger asChild>
                        <IconButton size="xs" variant="ghost" aria-label="Close">
                          <LuX />
                        </IconButton>
                      </Popover.CloseTrigger>
                    </Flex>
                  </Flex>
                </Box>
                <Box maxH="380px" overflowY="auto">
                  {notifications.length > 0 ? (
                    <VStack gap={0} align="stretch">
                      {notifications.map((n, idx) => (
                        <React.Fragment key={n.id}>
                          <NotificationItem
                            n={n}
                            isUnread={!readIds.has(n.id)}
                            compact
                          />
                          {idx !== notifications.length - 1 && <Separator />}
                        </React.Fragment>
                      ))}
                    </VStack>
                  ) : (
                    <EmptyNotifications compact />
                  )}
                </Box>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      )}
    </Flex>
  );
}
