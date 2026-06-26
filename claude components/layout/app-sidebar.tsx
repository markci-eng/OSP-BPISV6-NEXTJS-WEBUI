"use client";

import {
  Flex,
  VStack,
  Text,
  Box,
  IconButton,
  useBreakpointValue,
  Collapsible,
  ScrollArea,
  Image,
  Separator,
  Grid,
  GridItem,
  Show,
  Avatar,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RiCloseLine, RiLogoutBoxRLine } from "react-icons/ri";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { NavItem, SidebarProps } from "./app-layout.type";
import logoIcon from "@/public/images/logo/icon.png";
import { Body, Small } from "st-peter-ui";
import { useDemoAuth } from "@/components/ui/demo-auth";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

function parseDisplayName(session: string | null): string {
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

const ROLE_LABELS: Record<string, string> = {
  branch: "Branch",
  bmstl: "BM / STL",
  "sales-agent": "Sales Agent",
};

interface NavItemRowProps {
  item: NavItem;
  index: number;
  isSidebarOpen: boolean;
  isMobile: boolean;
  pathname: string;
  navItemExpanded: string;
  setNavItemExpanded: (label: string) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (i: number | null) => void;
  onClose?: () => void;
}

function NavItemRow({
  item,
  index,
  isSidebarOpen,
  isMobile,
  pathname,
  navItemExpanded,
  setNavItemExpanded,
  hoveredIndex,
  setHoveredIndex,
  onClose,
}: NavItemRowProps) {
  const isHovered = hoveredIndex === index;
  const isActive =
    pathname === item.href ||
    item.subItems?.findLast(
      (itm) => itm.href === pathname.substring(0, itm.href.length),
    ) != null ||
    (item.subItems?.some((sub) => sub.href === pathname) ?? false);

  const [isExpanded, setIsExpanded] = useState(isActive);

  const Icon = isActive ? (item.activeIcon ?? item.icon) : item.icon;

  useEffect(() => {
    if (navItemExpanded === item.label) {
      setIsExpanded(true);
    } else if (!isActive) {
      setIsExpanded(false);
    }
  }, [navItemExpanded]);

  useEffect(() => {
    setIsExpanded(isActive);
  }, [isActive]);

  return (
    <Tooltip
      content={item.label}
      positioning={{ placement: "right" }}
      disabled={isSidebarOpen}
    >
      {item.subItems ? (
        <Collapsible.Root
          open={isExpanded}
          onOpenChange={(e) => {
            setIsExpanded(e.open);
            setNavItemExpanded(e.open ? item.label : "");
          }}
        >
          <Collapsible.Trigger asChild>
            <Flex
              align="center"
              justify={isSidebarOpen ? "flex-start" : "justify-between"}
              p={2}
              py={3}
              borderRadius="md"
              gap={isSidebarOpen ? 3 : 0}
              bg={
                isActive && !isSidebarOpen
                  ? "primary"
                  : isHovered || (isExpanded && isSidebarOpen)
                    ? "gray.border"
                    : "transparent"
              }
              cursor="pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              transition="background 0.2s"
            >
              <Flex
                align={"center"}
                justify={"flex-start"}
                borderRadius="md"
                gap={isSidebarOpen ? 3 : 0}
                width={"full"}
              >
                <Box
                  w="24px"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon
                    size={20}
                    color={
                      isActive && !isSidebarOpen
                        ? "white"
                        : "var(--chakra-colors-primary)"
                    }
                  />
                </Box>
                <Box
                  overflow="hidden"
                  onClick={item.onClick}
                  transition="max-width 0.2s, opacity 0.2s"
                  maxWidth={isSidebarOpen ? "220px" : "0px"}
                >
                  <Small
                    color={"gray.fg"}
                    whiteSpace="nowrap"
                    fontWeight={"regular"}
                    fontSize={"sm"}
                    transition="opacity 0.2s"
                  >
                    {item.label}
                  </Small>
                </Box>
              </Flex>
              {isSidebarOpen && (
                <Box p={1}>
                  {isExpanded ? (
                    <BiChevronUp color={"gray.solid"} />
                  ) : (
                    <BiChevronDown color={"gray.solid"} />
                  )}
                </Box>
              )}
            </Flex>
          </Collapsible.Trigger>
          {isSidebarOpen && (
            <Collapsible.Content>
              <Grid templateColumns={"repeat(10, 1fr)"} my={2}>
                <Separator
                  orientation="vertical"
                  ml={5}
                  borderColor={"primary"}
                />
                <GridItem colSpan={9}>
                  <Box>
                    {item.subItems.map((subItem) => {
                      const isItemActive =
                        pathname.substring(0, subItem.href.length) ===
                        subItem.href;
                      return (
                        <Link
                          key={subItem.label}
                          href={subItem.href ?? "#"}
                          passHref
                        >
                          <Flex
                            align="center"
                            p={3}
                            borderRadius="md"
                            gap={isSidebarOpen ? 3 : 0}
                            bg={isItemActive ? "primary" : "transparent"}
                            _hover={{
                              bg: isItemActive ? "primaryHover" : "gray.subtle",
                            }}
                            cursor="pointer"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => isMobile && onClose?.()}
                            transition="background 0.2s"
                          >
                            <Box
                              overflow="hidden"
                              onClick={subItem.onClick}
                              transition="max-width 0.2s, opacity 0.2s"
                              maxWidth={isSidebarOpen ? "220px" : "0px"}
                            >
                              <Text
                                color={
                                  isItemActive
                                    ? "white"
                                    : isHovered
                                      ? "gray.solid"
                                      : "gray.fg"
                                }
                                whiteSpace="nowrap"
                                fontSize={"sm"}
                                opacity={isSidebarOpen ? 1 : 0}
                                transition="opacity 0.2s"
                              >
                                {subItem.label}
                              </Text>
                            </Box>
                          </Flex>
                        </Link>
                      );
                    })}
                  </Box>
                </GridItem>
              </Grid>
            </Collapsible.Content>
          )}
        </Collapsible.Root>
      ) : (
        <Link href={item.href ?? "#"} passHref>
          <Flex
            align="center"
            justify={isSidebarOpen ? "flex-start" : "justify-between"}
            p={2}
            py={3}
            borderRadius="md"
            gap={isSidebarOpen ? 3 : 0}
            bg={
              isActive ? "primary" : isHovered ? "gray.border" : "transparent"
            }
            cursor="pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => isMobile && onClose?.()}
            transition="background 0.2s"
          >
            <Flex
              align={"center"}
              justify={"flex-start"}
              borderRadius="md"
              gap={isSidebarOpen ? 3 : 0}
              width={"full"}
            >
              <Box
                w="24px"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Icon
                  size={20}
                  color={isActive ? "white" : "var(--chakra-colors-primary)"}
                />
              </Box>
              <Box
                overflow="hidden"
                onClick={item.onClick}
                transition="max-width 0.2s, opacity 0.2s"
                maxWidth={isSidebarOpen ? "220px" : "0px"}
              >
                <Text
                  color={isActive ? "white" : "gray.fg"}
                  whiteSpace="nowrap"
                  fontWeight={isActive ? "semibold" : "regular"}
                  fontSize={"sm"}
                  opacity={isSidebarOpen ? 1 : 0}
                  transition="opacity 0.2s"
                >
                  {item.label}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Link>
      )}
    </Tooltip>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
  navItems,
  appName,
  appSubtitle,
}: SidebarProps & {
  navItems: NavItem[];
  appName: string;
  appSubtitle?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [navItemExpanded, setNavItemExpanded] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();
  const { logout } = useDemoAuth();
  const { messageBox } = useMessageDialog();

  const handleSignOut = async () => {
    const confirmed = await messageBox({
      title: "Sign Out",
      message: "Are you sure you want to sign out?",
      variant: "warning",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      showCancel: true,
    });
    if (!confirmed) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network errors on demo logout
    }
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const session = readCookie("osp_session");
    const _role = readCookie("osp_user") ?? "";
    setDisplayName(parseDisplayName(session));
    setDisplayName("Joyce Basilio-Ramos");
    setRole(
      _role == "branch"
        ? "Branch Cashier/Encoder"
        : _role == "bm"
          ? "Branch Manager"
          : _role == "stl"
            ? "Sales Team Leader"
            : _role,
    );
  }, []);

  // Detect mobile safely
  const isMobileRaw = useBreakpointValue({ base: true, lg: false });
  const isMobile = isMobileRaw ?? false; // stable boolean

  const pathname = usePathname();

  // Final open state
  const isSidebarOpen = isOpen || isExpanded;
  const sidebarWidth = isSidebarOpen ? 300 : 60;

  // ----------------------------
  // Handle collapsed but visible by default on desktop
  // ----------------------------
  useEffect(() => {
    if (typeof isMobile === "boolean") {
      if (isMobile) {
        // mobile: respect controlled sidebar open/close
        if (!isOpen) setIsExpanded(false);
      } else {
        // desktop: always collapsed by default but visible
        setIsExpanded(false);
      }
    }
  }, [isMobile, isOpen]); // ✅ stable dependency array

  return (
    <>
      <Flex
        className="no-print"
        direction="column"
        bg="bg"
        _dark={{ bg: "rgba(20, 24, 36, 0.88)" }}
        color="fg"
        h="100dvh"
        w={`${sidebarWidth}px`}
        minW={`${sidebarWidth}px`}
        transition="width 0.2s, left 0.3s"
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
        gap={0}
        borderRight="1px solid"
        borderColor="gray.200"
        position={isMobile ? "fixed" : "relative"}
        zIndex={isMobile ? 1000 : "auto"}
        left={isMobile ? (isOpen ? "0" : "-250px") : "0"}
        top={0}
        shadow={isMobile ? "md" : "none"}
        borderRadius={0}
        overflow="hidden"
        minH="100dvh"
        style={{
          paddingTop: "max(8px, env(safe-area-inset-top))",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          paddingLeft: "max(8px, env(safe-area-inset-left))",
          paddingRight: "8px",
        }}
      >
        {/* Logo + Close button (Mobile) */}
        <Show when={isMobile}>
          <Flex
            align="center"
            justify="space-between"
            gap={2}
            p={2}
            py={3}
            h="50px"
            minH="50px"
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            {/* User Profile Header */}
            <Flex align="center" gap={2} px={2} py={2}>
              <Box
                p="2px"
                borderRadius="full"
                border="2px solid"
                borderColor="var(--chakra-colors-primary-disabled)"
                flexShrink={0}
              >
                <Avatar.Root
                  size="sm"
                  bg="var(--chakra-colors-primary-disabled)/30"
                >
                  <Avatar.Image
                    src="https://lh3.googleusercontent.com/a-/ALV-UjVMJSHCRae9AI71omM-12-JXe6RRORMkcfShnPQRn5izScdfxo=s240-p-k-rw-no"
                    alt={displayName}
                  />
                  <Avatar.Fallback
                    color="var(--chakra-colors-primary)"
                    fontWeight="semibold"
                    name={displayName}
                  />
                </Avatar.Root>
              </Box>
              <Box
                overflow="hidden"
                opacity={isSidebarOpen ? 1 : 0}
                transition="opacity 0.2s, max-width 0.2s"
                maxWidth={isSidebarOpen ? "220px" : "0px"}
              >
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  whiteSpace="nowrap"
                  lineHeight="1.3"
                  color="gray.800"
                  truncate
                >
                  {displayName || "—"}
                </Text>
                <Text fontSize="xs" color="primary" whiteSpace="nowrap">
                  {ROLE_LABELS[role] ?? role}
                </Text>
              </Box>
            </Flex>

            {isMobile && isOpen && (
              <IconButton
                aria-label="Close sidebar"
                size="sm"
                variant="ghost"
                color={"gray.fg"}
                onClick={onClose}
              >
                <RiCloseLine />
              </IconButton>
            )}
          </Flex>
        </Show>

        {/* Logo + Close button (Web) */}
        <Show when={!isMobile}>
          <Flex
            align="center"
            justify="space-between"
            gap={2}
            p={0.5}
            py={3}
            h="50px"
            minH="50px"
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Flex align="center" gap={2.5}>
              <Box
                w="40px"
                h="40px"
                borderRadius="12px"
                bg="green.50"
                borderWidth="1px"
                borderColor="green.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="sm"
                flexShrink={0}
              >
                <img
                  src="/images/logo/icon.png"
                  alt="St. Peter Logo"
                  width={26}
                  height={26}
                  style={{ objectFit: "contain" }}
                />
              </Box>

              <Box>
                <Text
                  fontWeight="700"
                  fontSize="md"
                  color="gray.800"
                  lineHeight="1.2"
                  letterSpacing="-0.01em"
                >
                  {appName}
                </Text>

                <Text
                  fontSize="9px"
                  color="#085725"
                  letterSpacing="0.18em"
                  textTransform="uppercase"
                  fontWeight="600"
                >
                  {appSubtitle}
                </Text>
              </Box>
            </Flex>

            {isMobile && isOpen && (
              <IconButton
                aria-label="Close sidebar"
                size="sm"
                variant="ghost"
                color={"gray.fg"}
                onClick={onClose}
              >
                <RiCloseLine />
              </IconButton>
            )}
          </Flex>
        </Show>

        {/* Navigation */}
        <ScrollArea.Root maxW="lg" size={"xs"} mt={2} flex="1">
          <ScrollArea.Viewport
            css={{
              "--scroll-shadow-size": "4rem",
              "&[data-at-top]": {
                maskImage:
                  "linear-gradient(180deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
              },
              "&[data-at-bottom]": {
                maskImage:
                  "linear-gradient(0deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
              },
            }}
          >
            <ScrollArea.Content spaceY="4" textStyle="sm">
              <VStack align="stretch" gap={2} mt={2}>
                {navItems.map((item, index) => (
                  <NavItemRow
                    key={item.label}
                    item={item}
                    index={index}
                    isSidebarOpen={isSidebarOpen}
                    isMobile={isMobile ?? false}
                    pathname={pathname}
                    navItemExpanded={navItemExpanded}
                    setNavItemExpanded={setNavItemExpanded}
                    hoveredIndex={hoveredIndex}
                    setHoveredIndex={setHoveredIndex}
                    onClose={onClose}
                  />
                ))}
              </VStack>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar visibility={"hidden"}>
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner />
        </ScrollArea.Root>

        {/* Sign Out */}
        <Box borderTop="1px solid" borderColor="gray.200" pt={2}>
          <Tooltip
            content="Sign Out"
            positioning={{ placement: "right" }}
            disabled={isSidebarOpen}
          >
            <Flex
              align="center"
              p={2}
              py={3}
              borderRadius="md"
              gap={isSidebarOpen ? 3 : 0}
              cursor="pointer"
              _hover={{ bg: "red.subtle" }}
              onClick={handleSignOut}
              transition="background 0.2s"
            >
              <Box
                w="24px"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <RiLogoutBoxRLine
                  size={20}
                  color="var(--chakra-colors-red-500)"
                />
              </Box>
              <Box
                overflow="hidden"
                transition="max-width 0.2s, opacity 0.2s"
                maxWidth={isSidebarOpen ? "220px" : "0px"}
                opacity={isSidebarOpen ? 1 : 0}
              >
                <Text color="red.500" whiteSpace="nowrap" fontSize="sm">
                  Sign Out
                </Text>
              </Box>
            </Flex>
          </Tooltip>
        </Box>
      </Flex>

      {isMobile && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.400"
          zIndex={999}
          opacity={isOpen ? 1 : 0}
          pointerEvents={isOpen ? "auto" : "none"}
          transition="opacity 0.3s"
          onClick={onClose}
        />
      )}

      {/* Always-white cap over the status bar (safe-area-inset-top) on mobile */}
      <Box
        display={{ base: "block", lg: "none" }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        pointerEvents="none"
        zIndex={1001}
        style={{ height: "env(safe-area-inset-top)" }}
        bg="white"
        _dark={{ bg: "rgba(20, 24, 36, 1)" }}
      />
    </>
  );
}
