"use client";

import { useState, useEffect, useMemo } from "react";
import { StickyNavbar } from "./sticky-navbar";
import { StickyNavbarBtn } from "./sticky-navbar-btn";
import { useBreakpointValue } from "@chakra-ui/react";
import {
  RiDashboardLine,
  RiDashboardFill,
  RiCheckboxCircleLine,
  RiCheckboxCircleFill,
  RiBookShelfLine,
  RiBookShelfFill,
  RiMoneyDollarCircleLine,
  RiMoneyDollarCircleFill,
  RiUser2Line,
  RiUser2Fill,
} from "react-icons/ri";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  Portal,
  VStack,
  Avatar,
  CloseButton,
  Button,
  Text,
  Box,
  Flex,
  HStack,
  Separator,
  Badge,
  Input,
  InputGroup,
  IconButton,
  Show,
} from "@chakra-ui/react";
import { PrimaryMdButton } from "st-peter-ui";
import {
  LuSun,
  LuMoon,
  LuHouse,
  LuCreditCard,
  LuFileText,
  LuChevronRight,
  LuChevronLeft,
  LuChevronUp,
  LuChevronDown,
  LuEye,
  LuEyeOff,
  LuUser,
  LuLock,
  LuPlus,
  LuX,
  LuLayoutGrid,
  LuArrowLeftRight,
} from "react-icons/lu";
import { RiHome4Line, RiHome4Fill } from "react-icons/ri";

import { HiOutlineUsers, HiUsers } from "react-icons/hi2";
import {
  BsFileEarmarkSpreadsheet,
  BsFileEarmarkSpreadsheetFill,
  BsFileEarmarkExcel,
  BsFileEarmarkExcelFill,
} from "react-icons/bs";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { FaHandHoldingUsd } from "react-icons/fa";
import { MdOutlineManageAccounts, MdManageAccounts } from "react-icons/md";
import { IoLeaf, IoLeafOutline } from "react-icons/io5";
import type { IconType } from "react-icons";
import type { NavItem } from "../app-layout.type";
import { useColorMode } from "@/components/ui/color-mode";
import { useDemoAuth } from "@/components/ui/demo-auth";
import ProfilePage from "@/app/(account)/account/profile/page";

const toast = {
  error: (_message: string) => undefined,
  success: (_message: string) => undefined,
};

type ProfileView =
  | "main"
  | "edit-account"
  | "change-password"
  | "navbar-customize";

interface NavOptionDef {
  key: string;
  title: string;
  href: string;
  Icon: IconType;
  activeIcon: IconType;
  match: (p: string) => boolean;
  roles: string[];
}

const NAVBAR_STORAGE_KEY = "navbar-quick-items";
const DEFAULT_NAV_HREFS = ["/", "/plans", "/pay-my-plan", "/claims"];

const ALL_NAV_OPTIONS: NavOptionDef[] = [
  {
    key: "/",
    title: "Home",
    href: "/",
    Icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    match: (p) => p === "/",
    roles: ["branch", "bmstl", "sales-agent"],
  },
  {
    key: "/plans",
    title: "Products",
    href: "/plans",
    Icon: IoLeafOutline,
    activeIcon: IoLeaf,
    match: (p) =>
      p.startsWith("/plans") ||
      p.startsWith("/plan-details") ||
      p.startsWith("/plan-comparison"),
    roles: ["branch", "bmstl", "sales-agent"],
  },
  {
    key: "/pay-my-plan",
    title: "Pay",
    href: "/pay-my-plan",
    Icon: LuCreditCard,
    activeIcon: LuCreditCard,
    match: (p) =>
      p.startsWith("/pay-my-plan") ||
      p.startsWith("/account/pay-my-plan") ||
      p.startsWith("/order-summary"),
    roles: ["branch", "bmstl", "sales-agent"],
  },
  {
    key: "/claims",
    title: "Claim",
    href: "/claims",
    Icon: LuFileText,
    activeIcon: LuFileText,
    match: (p) => p.startsWith("/claims"),
    roles: ["branch", "bmstl", "sales-agent"],
  },
];

const FONT_SIZES = [
  { value: "sm", px: "14px", title: "Small", scale: 0.82 },
  { value: "md", px: "16px", title: "Normal", scale: 1 },
  { value: "lg", px: "18px", title: "Large", scale: 1.18 },
];

const ROLE_LABELS: Record<string, string> = {
  branch: "Branch Cashier/Encoder",
  bm: "Branch Manager",
  amd: "Account Management",
  claims: "Claims",
  stl: "Sales Team Leader",
  "sales-agent": "Sales Agent",
};
const PW_STRENGTH_META = [
  { label: "", color: "gray.300" },
  { label: "Very Weak", color: "red.500" },
  { label: "Weak", color: "orange.400" },
  { label: "Fair", color: "yellow.500" },
  { label: "Strong", color: "green.400" },
  { label: "Very Strong", color: "green.600" },
] as const;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

function parseSessionEmail(token: string | null): string {
  if (!token) return "";
  try {
    const json = token.split(".")[0];
    const padded = json.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (padded.length % 4)) % 4;
    const decoded = atob(padded + "=".repeat(padding));
    const payload = JSON.parse(decoded) as { email?: string };
    return payload.email ?? "";
  } catch {
    return "";
  }
}

function emailToDisplayName(email: string): string {
  const prefix = email.split("@")[0] ?? "";
  return prefix
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function calcPwStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function navItemIsActive(item: NavItem, pathname: string): boolean {
  if (item.href)
    return pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    item.subItems?.some(
      (s) => pathname === s.href || pathname.startsWith(s.href + "/"),
    ) ?? false
  );
}

function navItemHref(item: NavItem): string {
  return item.href ?? item.subItems?.[0]?.href ?? "/";
}

export function AppBottomNavBar({
  profileOpen: profileOpenProp,
  onProfileOpenChange,
  navItems,
}: {
  onToggleSidebar?: () => void;
  notifications?: unknown[];
  profileOpen?: boolean;
  onProfileOpenChange?: (open: boolean) => void;
  navItems?: NavItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { isLoggedIn } = useDemoAuth();

  // Dialog + view state (controlled from parent when prop provided)
  const [profileOpenInternal, setProfileOpenInternal] = useState(false);
  const profileOpen =
    profileOpenProp !== undefined ? profileOpenProp : profileOpenInternal;
  const setProfileOpen = (v: boolean) => {
    setProfileOpenInternal(v);
    onProfileOpenChange?.(v);
  };
  const [profileView, setProfileView] = useState<ProfileView>("main");

  // Full-screen dialog that hosts the /account/profile page (instead of routing)
  const [profilePageOpen, setProfilePageOpen] = useState(false);

  // User info
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Preferences
  const { colorMode, setColorMode } = useColorMode();
  const [fontSize, setFontSizeLocal] = useState("md");

  // Quick nav customization
  const [quickNavHrefs, setQuickNavHrefs] =
    useState<string[]>(DEFAULT_NAV_HREFS);
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);

  // Edit account
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Change password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    setFontSizeLocal(localStorage.getItem("font-size-pref") ?? "md");
    const session = readCookie("osp_session");
    const parsedEmail = parseSessionEmail(session);
    setEmail(parsedEmail);
    const userRole = readCookie("osp_user") ?? "";
    setRole(userRole);
    const storedName = localStorage.getItem("user-display-name");
    setEditName(storedName || emailToDisplayName(parsedEmail));

    try {
      const stored = localStorage.getItem(NAVBAR_STORAGE_KEY);
      if (stored) setQuickNavHrefs(JSON.parse(stored) as string[]);
    } catch {
      // keep defaults
    }
  }, []);

  // Options available to the current role
  const availableOptions = useMemo(
    () => ALL_NAV_OPTIONS.filter((o) => !role || o.roles.includes(role)),
    [role],
  );

  // Resolved nav items for the sticky bar (filtered to valid options)
  const computedNavItems = useMemo(() => {
    return quickNavHrefs
      .map((href) => availableOptions.find((o) => o.key === href))
      .filter((o): o is NavOptionDef => o !== undefined);
  }, [quickNavHrefs, availableOptions]);

  const displayName = editName || emailToDisplayName(email) || "User";

  const handleDialogOpenChange = (open: boolean) => {
    setProfileOpen(open);
    if (!open) {
      setProfileView("main");
      setReplacingIdx(null);
      resetPasswordForm();
    }
  };

  const resetPasswordForm = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
  };

  const handleColorMode = (mode: string) => {
    setColorMode(mode as "light" | "dark");
  };

  const handleFontSize = (size: string) => {
    const sizeMap: Record<string, string> = {
      sm: "14px",
      md: "16px",
      lg: "18px",
    };
    localStorage.setItem("font-size-pref", size);
    document.documentElement.style.fontSize = sizeMap[size];
    setFontSizeLocal(size);
  };

  const saveQuickNav = (hrefs: string[]) => {
    setQuickNavHrefs(hrefs);
    localStorage.setItem(NAVBAR_STORAGE_KEY, JSON.stringify(hrefs));
  };

  const addNavItem = (href: string) => {
    if (quickNavHrefs.length >= 4 || quickNavHrefs.includes(href)) return;
    saveQuickNav([...quickNavHrefs, href]);
  };

  const removeNavItem = (href: string) => {
    saveQuickNav(quickNavHrefs.filter((h) => h !== href));
  };

  const moveNavItem = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= quickNavHrefs.length) return;
    const updated = [...quickNavHrefs];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    saveQuickNav(updated);
  };

  const replaceNavItem = (idx: number, newHref: string) => {
    const updated = [...quickNavHrefs];
    updated[idx] = newHref;
    saveQuickNav(updated);
    setReplacingIdx(null);
  };

  const handleSaveAccount = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Display name cannot be empty");
      return;
    }
    setEditLoading(true);
    try {
      localStorage.setItem("user-display-name", trimmed);
      toast.success("Account updated");
      setProfileView("main");
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwStrength < 2) {
      toast.error("Password is too weak");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to change password");
        return;
      }
      toast.success("Password changed successfully");
      resetPasswordForm();
      setProfileView("main");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setProfileOpen(false);
    router.push("/login");
  };

  const pwStrength = calcPwStrength(newPw);
  const pwMeta = PW_STRENGTH_META[pwStrength] ?? PW_STRENGTH_META[0];
  const fontSizeLabel =
    fontSize === "sm" ? "Small" : fontSize === "lg" ? "Large" : "Normal";

  const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"];

  const pickPalette = (name: string) => {
    const index = name.charCodeAt(0) % colorPalette.length;
    return colorPalette[index];
  };

  const unpinnedOptions = availableOptions.filter(
    (o) => !quickNavHrefs.includes(o.key),
  );

  return (
    <>
      <Show when={isMobile}>
        <StickyNavbar>
          {navItems
            ? navItems.flatMap((item) => {
                const entries = [];
                if (item.bottomNav) {
                  entries.push(
                    <StickyNavbarBtn
                      key={item.label}
                      btnChildren={item.icon as IconType}
                      activeIcon={item.activeIcon as IconType | undefined}
                      title={item.displayName ?? item.label}
                      isActive={navItemIsActive(item, pathname)}
                      onClickEvent={() => router.push(navItemHref(item))}
                    />,
                  );
                }
                item.subItems
                  ?.filter((s) => s.bottomNav)
                  .forEach((sub) => {
                    entries.push(
                      <StickyNavbarBtn
                        key={sub.label}
                        btnChildren={item.icon as IconType}
                        activeIcon={item.activeIcon as IconType | undefined}
                        title={sub.displayName ?? sub.label}
                        isActive={
                          pathname === sub.href ||
                          pathname.startsWith(sub.href + "/")
                        }
                        onClickEvent={() => router.push(sub.href)}
                      />,
                    );
                  });
                return entries;
              })
            : computedNavItems.map((item) => (
                <StickyNavbarBtn
                  key={item.key}
                  btnChildren={item.Icon}
                  activeIcon={item.activeIcon}
                  title={item.title}
                  isActive={item.match(pathname)}
                  onClickEvent={() => router.push(item.href)}
                />
              ))}
          {/* Profile (logged in) or Guest (not logged in) */}
          {isLoggedIn ? (
            <Box
              as="button"
              onClick={() => setProfilePageOpen(true)}
              px="14px"
              py="10px"
              borderRadius="2xl"
              cursor="pointer"
              outline="none"
              userSelect="none"
              _hover={{ bg: "rgba(0,0,0,0.04)" }}
              _active={{ transform: "scale(0.88)" }}
              style={{ transition: "transform 0.14s ease" }}
            >
              <Flex direction="column" align="center" gap="4px">
                <Box
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  overflow="hidden"
                  outline="2px solid"
                  outlineColor="var(--chakra-colors-primary)"
                  flexShrink={0}
                >
                  <img
                    src="https://lh3.googleusercontent.com/a-/ALV-UjVMJSHCRae9AI71omM-12-JXe6RRORMkcfShnPQRn5izScdfxo=s240-p-k-rw-no"
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <Box
                  mt={1}
                  fontSize="2xs"
                  fontWeight="500"
                  letterSpacing="0.06em"
                  lineHeight="1"
                  maxW="52px"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  color="var(--chakra-colors-primary)"
                  style={{ opacity: 1, transition: "opacity 0.2s ease" }}
                >
                  Profile
                </Box>
              </Flex>
            </Box>
          ) : (
            <StickyNavbarBtn
              btnChildren={LuUser}
              title="Login"
              isActive={pathname === "/login"}
              onClickEvent={() => router.push("/login")}
            />
          )}
        </StickyNavbar>
      </Show>

      <Dialog.Root
        open={profileOpen}
        onOpenChange={(e) => handleDialogOpenChange(e.open)}
        size="md"
        motionPreset="slide-in-bottom"
        placement="bottom"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              display="flex"
              flexDirection="column"
              maxH="80vh"
              borderRadius="md"
              overflow="hidden"
            >
              <Dialog.Header p={0} border={0}>
                <Dialog.Title display="none">
                  Profile & Preferences
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.CloseTrigger
                asChild
                position="absolute"
                top={3}
                right={3}
                zIndex={2}
              >
                <CloseButton
                  size="md"
                  color={profileView === "main" ? "white" : "gray.500"}
                />
              </Dialog.CloseTrigger>

              <Dialog.Body p={0} overflowY="auto" flex="1">
                {/* ══════════════════════════════════════════
                    MAIN VIEW
                ══════════════════════════════════════════ */}
                {profileView === "main" && (
                  <>
                    {/* Profile header */}
                    <Box
                      bg="var(--chakra-colors-primary)"
                      pt={12}
                      pb={8}
                      px={4}
                      textAlign="center"
                    >
                      <Avatar.Root
                        size="2xl"
                        mx="auto"
                        mb={4}
                        colorPalette={pickPalette(displayName || "U")}
                      >
                        <Avatar.Image
                          src="https://lh3.googleusercontent.com/a-/ALV-UjVMJSHCRae9AI71omM-12-JXe6RRORMkcfShnPQRn5izScdfxo=s240-p-k-rw-no"
                          alt={displayName}
                        />
                        <Avatar.Fallback name={displayName} />
                      </Avatar.Root>
                      <Text
                        color="white"
                        fontWeight="bold"
                        fontSize="xl"
                        lineHeight="1.2"
                        mb={1}
                      >
                        {displayName}
                      </Text>
                      {email && (
                        <Text
                          color="rgba(255,255,255,0.75)"
                          fontSize="sm"
                          mb={2}
                        >
                          {email}
                        </Text>
                      )}
                      {role && (
                        <Box display="inline-flex">
                          <Badge
                            bg="rgba(255,255,255,0.15)"
                            color="white"
                            borderRadius="full"
                            px={3}
                            py={0.5}
                            fontSize="xs"
                            fontWeight="medium"
                            border="1px solid rgba(255,255,255,0.3)"
                          >
                            {ROLE_LABELS[role] ?? role}
                          </Badge>
                        </Box>
                      )}
                    </Box>

                    {/* Account section */}
                    <Box px={4} pt={5} pb={1}>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="widest"
                        mb={3}
                      >
                        Account
                      </Text>

                      <Box
                        as="button"
                        w="full"
                        textAlign="left"
                        _hover={{ opacity: 0.7 }}
                        transition="opacity 0.15s"
                        onClick={() => setProfileView("edit-account")}
                      >
                        <Flex justify="space-between" align="center" py={3}>
                          <Flex align="center" gap={3}>
                            <Box
                              w="38px"
                              h="38px"
                              borderRadius="xl"
                              bg="gray.100"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="gray.600"
                              flexShrink={0}
                            >
                              <LuUser size={16} />
                            </Box>
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold">
                                Edit Account
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Update your display name
                              </Text>
                            </Box>
                          </Flex>
                          <LuChevronRight
                            size={16}
                            color="var(--chakra-colors-gray-400)"
                          />
                        </Flex>
                      </Box>

                      <Separator />

                      <Box
                        as="button"
                        w="full"
                        textAlign="left"
                        _hover={{ opacity: 0.7 }}
                        transition="opacity 0.15s"
                        onClick={() => {
                          resetPasswordForm();
                          setProfileView("change-password");
                        }}
                      >
                        <Flex justify="space-between" align="center" py={3}>
                          <Flex align="center" gap={3}>
                            <Box
                              w="38px"
                              h="38px"
                              borderRadius="xl"
                              bg="gray.100"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="gray.600"
                              flexShrink={0}
                            >
                              <LuLock size={16} />
                            </Box>
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold">
                                Change Password
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Update your login password
                              </Text>
                            </Box>
                          </Flex>
                          <LuChevronRight
                            size={16}
                            color="var(--chakra-colors-gray-400)"
                          />
                        </Flex>
                      </Box>
                    </Box>

                    <Separator mx={4} />

                    {/* Preferences section */}
                    <Box px={4} pt={4} pb={2}>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="widest"
                        mb={3}
                      >
                        Preferences
                      </Text>

                      {/* Appearance */}
                      <Flex justify="space-between" align="center" py={3}>
                        <Flex align="center" gap={3}>
                          <Box
                            w="38px"
                            h="38px"
                            borderRadius="xl"
                            bg="gray.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="gray.600"
                            flexShrink={0}
                          >
                            {colorMode === "dark" ? (
                              <LuMoon size={16} />
                            ) : (
                              <LuSun size={16} />
                            )}
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold">
                              Appearance
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {colorMode === "light"
                                ? "Light mode"
                                : "Dark mode"}
                            </Text>
                          </Box>
                        </Flex>
                        <HStack gap={1.5}>
                          {(["light", "dark"] as const).map((mode) => {
                            const isActive = colorMode === mode;
                            return (
                              <Button
                                key={mode}
                                size="sm"
                                variant="outline"
                                px={3}
                                h="34px"
                                gap={1.5}
                                bg={
                                  isActive
                                    ? "var(--chakra-colors-primary)"
                                    : "transparent"
                                }
                                color={isActive ? "white" : "gray.600"}
                                borderColor={
                                  isActive
                                    ? "var(--chakra-colors-primary)"
                                    : "gray.200"
                                }
                                _hover={{
                                  bg: isActive
                                    ? "var(--chakra-colors-primary)"
                                    : "gray.50",
                                }}
                                onClick={() => handleColorMode(mode)}
                              >
                                {mode === "light" ? (
                                  <LuSun size={13} />
                                ) : (
                                  <LuMoon size={13} />
                                )}
                                <Text
                                  fontSize="xs"
                                  textTransform="capitalize"
                                  fontWeight="medium"
                                >
                                  {mode}
                                </Text>
                              </Button>
                            );
                          })}
                        </HStack>
                      </Flex>

                      <Separator />

                      {/* Text size */}
                      <Flex justify="space-between" align="center" py={3}>
                        <Flex align="center" gap={3}>
                          <Box
                            w="38px"
                            h="38px"
                            borderRadius="xl"
                            bg="gray.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="gray.600"
                            fontWeight="bold"
                            fontSize="15px"
                            flexShrink={0}
                          >
                            A
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold">
                              Text Size
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {fontSizeLabel}
                            </Text>
                          </Box>
                        </Flex>
                        <HStack gap={1}>
                          {FONT_SIZES.map((opt) => {
                            const isActive = fontSize === opt.value;
                            return (
                              <Button
                                key={opt.value}
                                size="sm"
                                variant="outline"
                                w="40px"
                                h="34px"
                                p={0}
                                bg={
                                  isActive
                                    ? "var(--chakra-colors-primary)"
                                    : "transparent"
                                }
                                color={isActive ? "white" : "gray.600"}
                                borderColor={
                                  isActive
                                    ? "var(--chakra-colors-primary)"
                                    : "gray.200"
                                }
                                _hover={{
                                  bg: isActive
                                    ? "var(--chakra-colors-primary)"
                                    : "gray.50",
                                }}
                                onClick={() => handleFontSize(opt.value)}
                                title={opt.title}
                              >
                                <Text
                                  fontWeight={isActive ? "bold" : "normal"}
                                  style={{ fontSize: `${opt.scale * 13}px` }}
                                >
                                  A
                                </Text>
                              </Button>
                            );
                          })}
                        </HStack>
                      </Flex>

                      <Separator />

                      {/* Quick Navigation */}
                      <Box
                        as="button"
                        w="full"
                        textAlign="left"
                        _hover={{ opacity: 0.7 }}
                        transition="opacity 0.15s"
                        onClick={() => setProfileView("navbar-customize")}
                      >
                        <Flex justify="space-between" align="center" py={3}>
                          <Flex align="center" gap={3}>
                            <Box
                              w="38px"
                              h="38px"
                              borderRadius="xl"
                              bg="gray.100"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="gray.600"
                              flexShrink={0}
                            >
                              <LuLayoutGrid size={16} />
                            </Box>
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold">
                                Quick Navigation
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {quickNavHrefs.length} of 4 items pinned
                              </Text>
                            </Box>
                          </Flex>
                          <LuChevronRight
                            size={16}
                            color="var(--chakra-colors-gray-400)"
                          />
                        </Flex>
                      </Box>
                    </Box>

                    <Separator mx={4} />

                    {/* Actions */}
                    <Box px={4} pt={4} pb={10}>
                      <VStack gap={2.5}>
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
                          variant="outline"
                          color="red.600"
                          borderColor="red.200"
                          _hover={{ bg: "red.50" }}
                          onClick={handleLogout}
                        >
                          Sign Out
                        </Button>
                      </VStack>
                    </Box>
                  </>
                )}

                {/* ══════════════════════════════════════════
                    EDIT ACCOUNT VIEW
                ══════════════════════════════════════════ */}
                {profileView === "edit-account" && (
                  <>
                    {/* Sub-view header */}
                    <Box
                      px={4}
                      pt={4}
                      pb={3}
                      borderBottomWidth="1px"
                      borderColor="gray.200"
                    >
                      <Flex align="center" gap={2} pr={10}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label="Back"
                          color="gray.600"
                          onClick={() => setProfileView("main")}
                        >
                          <LuChevronLeft />
                        </IconButton>
                        <Text fontWeight="bold" fontSize="md">
                          Edit Account
                        </Text>
                      </Flex>
                    </Box>

                    {/* Avatar */}
                    <Box textAlign="center" pt={2} pb={4}>
                      <Avatar.Root size="xl" mx="auto" mb={1}>
                        <Avatar.Image
                          src="https://lh3.googleusercontent.com/a-/ALV-UjVMJSHCRae9AI71omM-12-JXe6RRORMkcfShnPQRn5izScdfxo=s240-p-k-rw-no"
                          alt={editName}
                        />
                        <Avatar.Fallback name={editName} />
                      </Avatar.Root>
                    </Box>

                    {/* Form — related fields joined into one connected group */}
                    <VStack gap={4} px={4} pb={10} align="stretch">
                      <Box
                        w="full"
                        borderWidth="1px"
                        borderColor="gray.200"
                        borderRadius="lg"
                        overflow="hidden"
                      >
                        {/* Display Name */}
                        <Box px={3} py={2.5}>
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.500"
                          >
                            Display Name
                          </Text>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Your name"
                            border="none"
                            px={0}
                            h="auto"
                            py={1}
                            _focusVisible={{
                              boxShadow: "none",
                              outline: "none",
                            }}
                          />
                        </Box>

                        <Separator />

                        {/* Email */}
                        <Box px={3} py={2.5}>
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.500"
                          >
                            Email
                          </Text>
                          <Input
                            value={email}
                            readOnly
                            opacity={0.6}
                            cursor="not-allowed"
                            border="none"
                            px={0}
                            h="auto"
                            py={1}
                            _focusVisible={{
                              boxShadow: "none",
                              outline: "none",
                            }}
                          />
                        </Box>

                        <Separator />

                        {/* Role */}
                        <Box px={3} py={2.5}>
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.500"
                          >
                            Role
                          </Text>
                          <Input
                            value={ROLE_LABELS[role] ?? role}
                            readOnly
                            opacity={0.6}
                            cursor="not-allowed"
                            border="none"
                            px={0}
                            h="auto"
                            py={1}
                            _focusVisible={{
                              boxShadow: "none",
                              outline: "none",
                            }}
                          />
                        </Box>
                      </Box>

                      <Button
                        w="full"
                        bg="var(--chakra-colors-primary)"
                        color="white"
                        _hover={{ opacity: 0.9 }}
                        loading={editLoading}
                        onClick={handleSaveAccount}
                      >
                        Save Changes
                      </Button>
                    </VStack>
                  </>
                )}

                {/* ══════════════════════════════════════════
                    CHANGE PASSWORD VIEW
                ══════════════════════════════════════════ */}
                {profileView === "change-password" && (
                  <>
                    {/* Sub-view header */}
                    <Box
                      px={4}
                      pt={4}
                      pb={3}
                      borderBottomWidth="1px"
                      borderColor="gray.200"
                    >
                      <Flex align="center" gap={2} pr={10}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label="Back"
                          color="gray.600"
                          onClick={() => setProfileView("main")}
                        >
                          <LuChevronLeft />
                        </IconButton>
                        <Text fontWeight="bold" fontSize="md">
                          Change Password
                        </Text>
                      </Flex>
                    </Box>

                    {/* Form */}
                    <VStack gap={5} px={4} pt={6} pb={10}>
                      {/* Current password */}
                      <Box w="full">
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color="gray.500"
                          mb={1.5}
                        >
                          Current Password
                        </Text>
                        <InputGroup
                          endElement={
                            <IconButton
                              size="xs"
                              variant="ghost"
                              color="gray.500"
                              aria-label="Toggle visibility"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                            >
                              {showCurrentPw ? (
                                <LuEyeOff size={15} />
                              ) : (
                                <LuEye size={15} />
                              )}
                            </IconButton>
                          }
                        >
                          <Input
                            type={showCurrentPw ? "text" : "password"}
                            value={currentPw}
                            onChange={(e) => setCurrentPw(e.target.value)}
                            placeholder="Enter current password"
                            size="md"
                          />
                        </InputGroup>
                      </Box>

                      {/* New password */}
                      <Box w="full">
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color="gray.500"
                          mb={1.5}
                        >
                          New Password
                        </Text>
                        <InputGroup
                          endElement={
                            <IconButton
                              size="xs"
                              variant="ghost"
                              color="gray.500"
                              aria-label="Toggle visibility"
                              onClick={() => setShowNewPw(!showNewPw)}
                            >
                              {showNewPw ? (
                                <LuEyeOff size={15} />
                              ) : (
                                <LuEye size={15} />
                              )}
                            </IconButton>
                          }
                        >
                          <Input
                            type={showNewPw ? "text" : "password"}
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            placeholder="Enter new password"
                            size="md"
                          />
                        </InputGroup>

                        {/* Strength meter */}
                        {newPw && (
                          <Box mt={2}>
                            <Flex gap={1} mb={1}>
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Box
                                  key={i}
                                  flex={1}
                                  h="3px"
                                  borderRadius="full"
                                  bg={
                                    i <= pwStrength ? pwMeta.color : "gray.200"
                                  }
                                  transition="background 0.2s"
                                />
                              ))}
                            </Flex>
                            <Text
                              fontSize="xs"
                              color={pwMeta.color}
                              fontWeight="medium"
                            >
                              {pwMeta.label}
                            </Text>
                          </Box>
                        )}
                      </Box>

                      {/* Confirm password */}
                      <Box w="full">
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color="gray.500"
                          mb={1.5}
                        >
                          Confirm New Password
                        </Text>
                        <InputGroup
                          endElement={
                            <IconButton
                              size="xs"
                              variant="ghost"
                              color="gray.500"
                              aria-label="Toggle visibility"
                              onClick={() => setShowConfirmPw(!showConfirmPw)}
                            >
                              {showConfirmPw ? (
                                <LuEyeOff size={15} />
                              ) : (
                                <LuEye size={15} />
                              )}
                            </IconButton>
                          }
                        >
                          <Input
                            type={showConfirmPw ? "text" : "password"}
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            placeholder="Confirm new password"
                            size="md"
                          />
                        </InputGroup>
                        {confirmPw && confirmPw !== newPw && (
                          <Text fontSize="xs" color="red.500" mt={1}>
                            Passwords do not match
                          </Text>
                        )}
                      </Box>

                      <Button
                        w="full"
                        mt={1}
                        bg="var(--chakra-colors-primary)"
                        color="white"
                        _hover={{ opacity: 0.9 }}
                        disabled={
                          !currentPw ||
                          !newPw ||
                          !confirmPw ||
                          newPw !== confirmPw ||
                          pwStrength < 2
                        }
                        loading={pwLoading}
                        onClick={handleChangePassword}
                      >
                        Update Password
                      </Button>
                    </VStack>
                  </>
                )}

                {/* ══════════════════════════════════════════
                    NAVBAR CUSTOMIZE VIEW
                ══════════════════════════════════════════ */}
                {profileView === "navbar-customize" && (
                  <>
                    {/* Sub-view header */}
                    <Box
                      px={4}
                      pt={4}
                      pb={3}
                      borderBottomWidth="1px"
                      borderColor="gray.200"
                      position="sticky"
                      top={0}
                      bg="bg"
                      zIndex={1}
                    >
                      <Flex align="center" gap={2} pr={10}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label="Back"
                          color="gray.600"
                          onClick={() => {
                            setReplacingIdx(null);
                            setProfileView("main");
                          }}
                        >
                          <LuChevronLeft />
                        </IconButton>
                        <Box>
                          <Text fontWeight="bold" fontSize="md">
                            Quick Navigation
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Choose up to 4 shortcuts for the bottom bar
                          </Text>
                        </Box>
                      </Flex>
                    </Box>

                    {/* Pinned items */}
                    <Box px={4} pt={5} pb={2}>
                      <Flex align="center" justify="space-between" mb={3}>
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color="gray.500"
                          textTransform="uppercase"
                          letterSpacing="widest"
                        >
                          Pinned
                        </Text>
                        <Text
                          fontSize="xs"
                          color={
                            quickNavHrefs.length >= 4
                              ? "orange.500"
                              : "gray.400"
                          }
                          fontWeight="medium"
                        >
                          {quickNavHrefs.length} / 4
                        </Text>
                      </Flex>

                      {quickNavHrefs.length === 0 ? (
                        <Flex
                          align="center"
                          justify="center"
                          py={6}
                          borderRadius="xl"
                          borderWidth="1px"
                          borderStyle="dashed"
                          borderColor="gray.200"
                        >
                          <Text fontSize="sm" color="gray.400">
                            No items pinned — add from below
                          </Text>
                        </Flex>
                      ) : (
                        <VStack gap={0}>
                          {quickNavHrefs.map((href, idx) => {
                            const option = availableOptions.find(
                              (o) => o.key === href,
                            );
                            if (!option) return null;
                            const ItemIcon = option.Icon;
                            const isFirst = idx === 0;
                            const isLast = idx === quickNavHrefs.length - 1;
                            const isReplacing = replacingIdx === idx;
                            return (
                              <Box key={href} w="full">
                                <Flex
                                  justify="space-between"
                                  align="center"
                                  py={2.5}
                                  px={isReplacing ? 2 : 0}
                                  borderRadius={isReplacing ? "lg" : undefined}
                                  bg={isReplacing ? "orange.50" : undefined}
                                  borderWidth={isReplacing ? "1px" : undefined}
                                  borderColor={
                                    isReplacing ? "orange.200" : undefined
                                  }
                                  transition="all 0.15s"
                                >
                                  <Flex align="center" gap={3}>
                                    <Box
                                      w="36px"
                                      h="36px"
                                      borderRadius="lg"
                                      bg={
                                        isReplacing
                                          ? "orange.400"
                                          : "var(--chakra-colors-primary)"
                                      }
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      color="white"
                                      flexShrink={0}
                                    >
                                      <ItemIcon size={15} />
                                    </Box>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="medium">
                                        {option.title}
                                      </Text>
                                      {isReplacing && (
                                        <Text
                                          fontSize="xs"
                                          color="orange.500"
                                          fontWeight="medium"
                                        >
                                          Select replacement below
                                        </Text>
                                      )}
                                    </Box>
                                  </Flex>
                                  <HStack gap={0.5}>
                                    <IconButton
                                      size="xs"
                                      variant="ghost"
                                      aria-label="Move up"
                                      color="gray.500"
                                      disabled={isFirst || isReplacing}
                                      onClick={() => moveNavItem(idx, -1)}
                                    >
                                      <LuChevronUp size={14} />
                                    </IconButton>
                                    <IconButton
                                      size="xs"
                                      variant="ghost"
                                      aria-label="Move down"
                                      color="gray.500"
                                      disabled={isLast || isReplacing}
                                      onClick={() => moveNavItem(idx, 1)}
                                    >
                                      <LuChevronDown size={14} />
                                    </IconButton>
                                    <IconButton
                                      size="xs"
                                      variant={isReplacing ? "solid" : "ghost"}
                                      aria-label={
                                        isReplacing
                                          ? "Cancel replace"
                                          : "Replace item"
                                      }
                                      bg={
                                        isReplacing ? "orange.400" : undefined
                                      }
                                      color={isReplacing ? "white" : "gray.500"}
                                      _hover={{
                                        bg: isReplacing
                                          ? "orange.500"
                                          : "gray.100",
                                      }}
                                      onClick={() =>
                                        setReplacingIdx(
                                          isReplacing ? null : idx,
                                        )
                                      }
                                    >
                                      <LuArrowLeftRight size={13} />
                                    </IconButton>
                                    <IconButton
                                      size="xs"
                                      variant="ghost"
                                      aria-label="Remove"
                                      color="red.400"
                                      _hover={{ bg: "red.50" }}
                                      disabled={isReplacing}
                                      onClick={() => removeNavItem(href)}
                                    >
                                      <LuX size={14} />
                                    </IconButton>
                                  </HStack>
                                </Flex>
                                {!isLast && <Separator />}
                              </Box>
                            );
                          })}
                        </VStack>
                      )}
                    </Box>

                    <Separator mx={4} my={1} />

                    {/* Available items */}
                    <Box px={4} pt={4} pb={10}>
                      <Flex align="center" justify="space-between" mb={3}>
                        {replacingIdx !== null ? (
                          <Box>
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="orange.500"
                              textTransform="uppercase"
                              letterSpacing="widest"
                            >
                              Select Replacement
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt={0.5}>
                              for &quot;
                              {
                                availableOptions.find(
                                  (o) => o.key === quickNavHrefs[replacingIdx],
                                )?.title
                              }
                              &quot;
                            </Text>
                          </Box>
                        ) : (
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="gray.500"
                            textTransform="uppercase"
                            letterSpacing="widest"
                          >
                            Available
                          </Text>
                        )}
                        {replacingIdx !== null && (
                          <Button
                            size="xs"
                            variant="ghost"
                            color="gray.500"
                            onClick={() => setReplacingIdx(null)}
                          >
                            Cancel
                          </Button>
                        )}
                      </Flex>

                      {unpinnedOptions.length === 0 ? (
                        <Text
                          fontSize="sm"
                          color="gray.400"
                          py={3}
                          textAlign="center"
                        >
                          All available items are pinned
                        </Text>
                      ) : (
                        <VStack gap={0}>
                          {unpinnedOptions.map((option, idx) => {
                            const ItemIcon = option.Icon;
                            const isLast = idx === unpinnedOptions.length - 1;
                            const isReplacingMode = replacingIdx !== null;
                            const canAdd = quickNavHrefs.length < 4;
                            const actionEnabled = isReplacingMode || canAdd;
                            return (
                              <Box key={option.key} w="full">
                                <Flex
                                  justify="space-between"
                                  align="center"
                                  py={2.5}
                                >
                                  <Flex align="center" gap={3}>
                                    <Box
                                      w="36px"
                                      h="36px"
                                      borderRadius="lg"
                                      bg={
                                        isReplacingMode
                                          ? "orange.50"
                                          : "gray.100"
                                      }
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      color={
                                        isReplacingMode
                                          ? "orange.500"
                                          : "gray.500"
                                      }
                                      flexShrink={0}
                                    >
                                      <ItemIcon size={15} />
                                    </Box>
                                    <Text
                                      fontSize="sm"
                                      fontWeight="medium"
                                      color={
                                        actionEnabled ? "inherit" : "gray.400"
                                      }
                                    >
                                      {option.title}
                                    </Text>
                                  </Flex>
                                  {isReplacingMode ? (
                                    <IconButton
                                      size="xs"
                                      variant="outline"
                                      aria-label="Use as replacement"
                                      borderColor="orange.300"
                                      color="orange.500"
                                      _hover={{ bg: "orange.50" }}
                                      onClick={() =>
                                        replaceNavItem(replacingIdx, option.key)
                                      }
                                    >
                                      <LuArrowLeftRight size={13} />
                                    </IconButton>
                                  ) : (
                                    <IconButton
                                      size="xs"
                                      variant="outline"
                                      aria-label="Pin item"
                                      disabled={!canAdd}
                                      borderColor={
                                        canAdd
                                          ? "var(--chakra-colors-primary)"
                                          : "gray.200"
                                      }
                                      color={
                                        canAdd
                                          ? "var(--chakra-colors-primary)"
                                          : "gray.300"
                                      }
                                      _hover={{
                                        bg: canAdd ? "blue.50" : "transparent",
                                      }}
                                      onClick={() => addNavItem(option.key)}
                                    >
                                      <LuPlus size={13} />
                                    </IconButton>
                                  )}
                                </Flex>
                                {!isLast && <Separator />}
                              </Box>
                            );
                          })}
                        </VStack>
                      )}
                    </Box>
                  </>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Full-screen profile page, opened as a dialog instead of a route */}
      <Dialog.Root
        open={profilePageOpen}
        onOpenChange={(e) => setProfilePageOpen(e.open)}
        size="full"
        motionPreset="slide-in-bottom"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger
                asChild
                position="fixed"
                top={3}
                right={3}
                zIndex={20}
              >
                <CloseButton size="md" color="white" />
              </Dialog.CloseTrigger>

              <Dialog.Body p={0} overflowY="auto">
                <ProfilePage />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
