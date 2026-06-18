"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Separator,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { PrimaryMdButton } from "st-peter-ui";
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
  LuShield,
  LuUsers,
} from "react-icons/lu";
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
import { useRouter } from "next/navigation";
import { useColorMode } from "@/components/ui/color-mode";
import { useDemoAuth } from "@/components/ui/demo-auth";

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

const REFERRAL_CODE = "YHUAN1234-A";

const ALL_NAV_OPTIONS: NavOptionDef[] = [
  {
    key: "/",
    title: "Home",
    href: "/",
    Icon: LuHouse,
    activeIcon: LuHouse,
    match: (p) => p === "/",
    roles: ["branch", "bm", "stl", "sales-agent"],
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
    roles: ["branch", "bm", "stl", "sales-agent"],
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
    roles: ["branch", "bm", "stl", "sales-agent"],
  },
  {
    key: "/claims",
    title: "Claim",
    href: "/claims",
    Icon: LuFileText,
    activeIcon: LuFileText,
    match: (p) => p.startsWith("/claims"),
    roles: ["branch", "bm", "stl", "sales-agent"],
  },
  {
    key: "/",
    title: "Dashboard",
    href: "/",
    Icon: RiDashboardLine,
    activeIcon: RiDashboardFill,
    match: (p) => p === "/" || p.startsWith("/dashboard"),
    roles: ["branch", "bm", "stl", "sales-agent"],
  },
  {
    key: "/approvals",
    title: "Approvals",
    href: "/approvals",
    Icon: RiCheckboxCircleLine,
    activeIcon: RiCheckboxCircleFill,
    match: (p) => p.startsWith("/approvals"),
    roles: ["branch", "bmstl"],
  },
  {
    key: "/document-management",
    title: "Documents",
    href: "/document-management",
    Icon: RiBookShelfLine,
    activeIcon: RiBookShelfFill,
    match: (p) => p.startsWith("/document-management"),
    roles: ["branch"],
  },
  {
    key: "/payment/encode-payment",
    title: "Encode Payment",
    href: "/payment/encode-payment",
    Icon: RiMoneyDollarCircleLine,
    activeIcon: RiMoneyDollarCircleFill,
    match: (p) => p === "/payment/encode-payment",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/payment/view-drs",
    title: "View DRS",
    href: "/payment/view-drs",
    Icon: RiMoneyDollarCircleLine,
    activeIcon: RiMoneyDollarCircleFill,
    match: (p) => p === "/payment/view-drs",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/payment/encodevalidated-deposit",
    title: "Encode Deposit Slip",
    href: "/payment/encodevalidated-deposit",
    Icon: RiMoneyDollarCircleLine,
    activeIcon: RiMoneyDollarCircleFill,
    match: (p) => p === "/payment/encodevalidated-deposit",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/payment/viewvalidated-deposit",
    title: "View Deposit Slips",
    href: "/payment/viewvalidated-deposit",
    Icon: RiMoneyDollarCircleLine,
    activeIcon: RiMoneyDollarCircleFill,
    match: (p) => p === "/payment/viewvalidated-deposit",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/payment/credit-memo",
    title: "Credit Memo",
    href: "/payment/credit-memo",
    Icon: RiMoneyDollarCircleLine,
    activeIcon: RiMoneyDollarCircleFill,
    match: (p) => p === "/payment/credit-memo",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/sales-force/profile",
    title: "Agent Profile",
    href: "/sales-force/profile",
    Icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    match: (p) => p === "/sales-force/profile",
    roles: ["branch"],
  },
  {
    key: "/sales-force/re-assign",
    title: "Re-Organization",
    href: "/sales-force/re-assign",
    Icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    match: (p) => p === "/sales-force/re-assign",
    roles: ["branch"],
  },
  {
    key: "/sales-force/new",
    title: "Add New Agent",
    href: "/sales-force/new",
    Icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    match: (p) => p === "/sales-force/new",
    roles: ["branch"],
  },
  {
    key: "/plan-management/new",
    title: "Add New Sale",
    href: "/plan-management/new",
    Icon: HiOutlineUsers,
    activeIcon: HiUsers,
    match: (p) => p === "/plan-management/new",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/plan-management/planholder",
    title: "Planholder Profile",
    href: "/plan-management/planholder",
    Icon: HiOutlineUsers,
    activeIcon: HiUsers,
    match: (p) => p.startsWith("/plan-management/planholder"),
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/plan-management/change-of-mode",
    title: "Change of Mode",
    href: "/plan-management/change-of-mode",
    Icon: HiOutlineUsers,
    activeIcon: HiUsers,
    match: (p) => p === "/plan-management/change-of-mode",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/disbursement/comte",
    title: "COM/TE",
    href: "/disbursement/comte",
    Icon: BsFileEarmarkSpreadsheet,
    activeIcon: BsFileEarmarkSpreadsheetFill,
    match: (p) => p === "/disbursement/comte",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/disbursement/rfexpense",
    title: "Revolving Fund",
    href: "/disbursement/rfexpense",
    Icon: BsFileEarmarkSpreadsheet,
    activeIcon: BsFileEarmarkSpreadsheetFill,
    match: (p) => p === "/disbursement/rfexpense",
    roles: ["branch"],
  },
  {
    key: "/loan",
    title: "Loan",
    href: "/loan",
    Icon: LiaHandHoldingUsdSolid,
    activeIcon: FaHandHoldingUsd,
    match: (p) => p.startsWith("/loan"),
    roles: ["branch"],
  },
  {
    key: "/accounts-maintenance/mcpr",
    title: "MCPR",
    href: "/accounts-maintenance/mcpr",
    Icon: MdOutlineManageAccounts,
    activeIcon: MdManageAccounts,
    match: (p) => p === "/accounts-maintenance/mcpr",
    roles: ["branch", "sales-agent"],
  },
  {
    key: "/accounts-maintenance/next-month-loading",
    title: "Next Month Loading",
    href: "/accounts-maintenance/next-month-loading",
    Icon: MdOutlineManageAccounts,
    activeIcon: MdManageAccounts,
    match: (p) => p === "/accounts-maintenance/next-month-loading",
    roles: ["branch"],
  },
  {
    key: "/accounts-maintenance/floating-accounts",
    title: "Floating Accounts",
    href: "/accounts-maintenance/floating-accounts",
    Icon: MdOutlineManageAccounts,
    activeIcon: MdManageAccounts,
    match: (p) => p === "/accounts-maintenance/floating-accounts",
    roles: ["branch"],
  },
  {
    key: "/accounts-maintenance/accounts-transfer",
    title: "Transfer of Accounts",
    href: "/accounts-maintenance/accounts-transfer",
    Icon: MdOutlineManageAccounts,
    activeIcon: MdManageAccounts,
    match: (p) => p === "/accounts-maintenance/accounts-transfer",
    roles: ["branch"],
  },
  {
    key: "/dc",
    title: "Doc Cancellation",
    href: "/dc",
    Icon: BsFileEarmarkExcel,
    activeIcon: BsFileEarmarkExcelFill,
    match: (p) => p === "/dc",
    roles: ["sales-agent"],
  },
];

const FONT_SIZES = [
  { value: "sm", px: "14px", title: "Small", scale: 0.82 },
  { value: "md", px: "16px", title: "Normal", scale: 1 },
  { value: "lg", px: "18px", title: "Large", scale: 1.18 },
];

const ROLE_LABELS: Record<string, string> = {
  branch: "Branch",
  bm: "Branch Manager",
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

const Profile = () => {
  const router = useRouter();
  const { logout } = useDemoAuth();

  const [profileView, setProfileView] = useState<ProfileView>("main");

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

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Responsive: two-pane on tablet/desktop, drill-in sheet on mobile.
  // Guard with isMounted to avoid SSR/client hydration mismatch.
  const [isMounted, setIsMounted] = useState(false);
  const isDesktopRaw = useBreakpointValue({ base: false, md: true });
  const isDesktop = isMounted ? (isDesktopRaw ?? false) : false;

  useEffect(() => {
    setIsMounted(true);
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

  const displayName = "Joyce Basilio-Ramos";

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

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_CODE);
      toast.success("Referral code copied");
    } catch {
      toast.error("Failed to copy referral code");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network errors on demo logout
    }
    logout();
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

  const mainContent = (
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
          <Text color="rgba(255,255,255,0.75)" fontSize="sm" mb={2}>
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
          <Flex
            justify="space-between"
            align="center"
            py={3}
            px={isDesktop ? 2 : 0}
            borderRadius="lg"
            bg={
              isDesktop && profileView === "edit-account"
                ? "gray.100"
                : undefined
            }
          >
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
                  Update your email, and mobile number
                </Text>
              </Box>
            </Flex>
            <LuChevronRight size={16} color="var(--chakra-colors-gray-400)" />
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
          <Flex
            justify="space-between"
            align="center"
            py={3}
            px={isDesktop ? 2 : 0}
            borderRadius="lg"
            bg={
              isDesktop && profileView === "change-password"
                ? "gray.100"
                : undefined
            }
          >
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
            <LuChevronRight size={16} color="var(--chakra-colors-gray-400)" />
          </Flex>
        </Box>

        <Separator />

        {/* Two Factor Authentication */}
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
              <LuShield size={16} />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="semibold">
                Two Factor Authentication
              </Text>
              <Text fontSize="xs" color="gray.500">
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Text>
            </Box>
          </Flex>
          <Box
            role="switch"
            aria-checked={twoFactorEnabled}
            aria-label="Toggle two factor authentication"
            tabIndex={0}
            onClick={() => setTwoFactorEnabled((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTwoFactorEnabled((v) => !v);
              }
            }}
            w="44px"
            h="26px"
            borderRadius="full"
            bg={twoFactorEnabled ? "var(--chakra-colors-primary)" : "gray.300"}
            position="relative"
            transition="background 0.15s"
            cursor="pointer"
            flexShrink={0}
            outline="none"
          >
            <Box
              position="absolute"
              top="3px"
              left={twoFactorEnabled ? "21px" : "3px"}
              w="20px"
              h="20px"
              borderRadius="full"
              bg="white"
              boxShadow="sm"
              transition="left 0.15s"
            />
          </Box>
        </Flex>

        <Separator />

        {/* Referral Code */}
        {/* <Box
          as="button"
          w="full"
          textAlign="left"
          _hover={{ opacity: 0.7 }}
          transition="opacity 0.15s"
          onClick={copyReferralCode}
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
                  Referral Code
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {REFERRAL_CODE}
                </Text>
              </Box>
            </Flex>
            <LuChevronRight size={16} color="var(--chakra-colors-gray-400)" />
          </Flex>
        </Box> */}

        <Separator />

        {/* My Agent/s */}
        {/* <Box
          as="button"
          w="full"
          textAlign="left"
          _hover={{ opacity: 0.7 }}
          transition="opacity 0.15s"
          onClick={() => router.push("/account/profile/agents")}
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
                <LuUsers size={16} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="semibold">
                  My Agent/s
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Assigned referral agent records
                </Text>
              </Box>
            </Flex>
            <LuChevronRight size={16} color="var(--chakra-colors-gray-400)" />
          </Flex>
        </Box> */}
      </Box>

      {/* <Separator mx={4} /> */}

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
                {colorMode === "light" ? "Light mode" : "Dark mode"}
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
                  bg={isActive ? "var(--chakra-colors-primary)" : "transparent"}
                  color={isActive ? "white" : "gray.600"}
                  borderColor={
                    isActive ? "var(--chakra-colors-primary)" : "gray.200"
                  }
                  _hover={{
                    bg: isActive ? "var(--chakra-colors-primary)" : "gray.50",
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
        {/* <Flex justify="space-between" align="center" py={3}>
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
                  bg={isActive ? "var(--chakra-colors-primary)" : "transparent"}
                  color={isActive ? "white" : "gray.600"}
                  borderColor={
                    isActive ? "var(--chakra-colors-primary)" : "gray.200"
                  }
                  _hover={{
                    bg: isActive ? "var(--chakra-colors-primary)" : "gray.50",
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
        </Flex> */}

        <Separator />

        {/* Quick Navigation */}
        {/* <Box
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
            </Box> */}
      </Box>

      {/* <Separator mx={4} /> */}

      {/* Actions */}
      <Box px={4} pt={4} pb={10}>
        <VStack gap={2.5}>
          {/* <PrimaryMdButton w="full" onClick={() => router.push("/profile")}>
                Manage Account
              </PrimaryMdButton> */}
          <Button
            w="full"
            variant="outline"
            color="red.600"
            borderColor="red.200"
            _hover={{ bg: "red.50" }}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </VStack>
      </Box>
    </>
  );

  const editAccountContent = (
    <>
      {/* Sub-view header */}
      <Box px={4} pt={4} pb={3} borderBottomWidth="1px" borderColor="gray.200">
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
          <Avatar.Image src="/images/profile.jpg" alt={editName} />
          <Avatar.Fallback name={editName} />
        </Avatar.Root>
      </Box>

      {/* Form */}
      <VStack gap={4} px={4} pb={10} align="stretch">
        {/* <Box w="full">
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="gray.500"
                mb={1.5}
              >
                Display Name
              </Text>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                size="md"
              />
            </Box> */}

        <Box w="full">
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5}>
            Email
          </Text>
          <Input
            value={email}
            readOnly
            opacity={0.55}
            cursor="not-allowed"
            size="md"
          />
        </Box>

        <Box w="full">
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5}>
            Mobile Number
          </Text>
          <Input
            // value={ROLE_LABELS[role] ?? role}
            readOnly
            opacity={0.55}
            cursor="not-allowed"
            size="md"
          />
        </Box>

        <Button
          w="full"
          mt={2}
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
  );

  const changePasswordContent = (
    <>
      {/* Sub-view header */}
      <Box px={4} pt={4} pb={3} borderBottomWidth="1px" borderColor="gray.200">
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
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5}>
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
                {showCurrentPw ? <LuEyeOff size={15} /> : <LuEye size={15} />}
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
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5}>
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
                {showNewPw ? <LuEyeOff size={15} /> : <LuEye size={15} />}
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
                    bg={i <= pwStrength ? pwMeta.color : "gray.200"}
                    transition="background 0.2s"
                  />
                ))}
              </Flex>
              <Text fontSize="xs" color={pwMeta.color} fontWeight="medium">
                {pwMeta.label}
              </Text>
            </Box>
          )}
        </Box>

        {/* Confirm password */}
        <Box w="full">
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5}>
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
                {showConfirmPw ? <LuEyeOff size={15} /> : <LuEye size={15} />}
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
  );

  const navbarCustomizeContent = (
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
          {/* <Box>
                <Text fontWeight="bold" fontSize="md">
                  Quick Navigation
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Choose up to 4 shortcuts for the bottom bar
                </Text>
              </Box> */}
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
            color={quickNavHrefs.length >= 4 ? "orange.500" : "gray.400"}
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
              const option = availableOptions.find((o) => o.key === href);
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
                    borderColor={isReplacing ? "orange.200" : undefined}
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
                          isReplacing ? "Cancel replace" : "Replace item"
                        }
                        bg={isReplacing ? "orange.400" : undefined}
                        color={isReplacing ? "white" : "gray.500"}
                        _hover={{
                          bg: isReplacing ? "orange.500" : "gray.100",
                        }}
                        onClick={() =>
                          setReplacingIdx(isReplacing ? null : idx)
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
          <Text fontSize="sm" color="gray.400" py={3} textAlign="center">
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
                  <Flex justify="space-between" align="center" py={2.5}>
                    <Flex align="center" gap={3}>
                      <Box
                        w="36px"
                        h="36px"
                        borderRadius="lg"
                        bg={isReplacingMode ? "orange.50" : "gray.100"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color={isReplacingMode ? "orange.500" : "gray.500"}
                        flexShrink={0}
                      >
                        <ItemIcon size={15} />
                      </Box>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={actionEnabled ? "inherit" : "gray.400"}
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
                        onClick={() => replaceNavItem(replacingIdx, option.key)}
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
                          canAdd ? "var(--chakra-colors-primary)" : "gray.200"
                        }
                        color={
                          canAdd ? "var(--chakra-colors-primary)" : "gray.300"
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
  );

  const subViewContent =
    profileView === "edit-account"
      ? editAccountContent
      : profileView === "change-password"
        ? changePasswordContent
        : profileView === "navbar-customize"
          ? navbarCustomizeContent
          : null;

  // ── Desktop / tablet: two-pane (persistent menu + detail panel) ──
  if (isDesktop) {
    return (
      <Flex
        maxW="6xl"
        mx="auto"
        w="full"
        minH="100%"
        gap={6}
        p={{ md: 6, lg: 8 }}
        align="start"
      >
        {/* Left: profile card + section menu */}
        <Box
          w={{ md: "300px", lg: "340px" }}
          flexShrink={0}
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          overflow="hidden"
          bg="bg"
          position="sticky"
          top={6}
        >
          {mainContent}
        </Box>

        {/* Right: active section detail */}
        <Box
          flex="1"
          minW={0}
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          overflow="hidden"
          bg="bg"
          minH="540px"
        >
          {subViewContent ?? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              minH="540px"
              px={6}
              textAlign="center"
              color="gray.400"
            >
              <Box
                w="56px"
                h="56px"
                borderRadius="2xl"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <LuUser size={24} />
              </Box>
              <Text fontSize="md" fontWeight="semibold" color="gray.600">
                {/* Manage your account */}
              </Text>
              <Text fontSize="sm" mt={1} maxW="280px">
                Choose Edit Account, Change Password, or Quick Navigation from
                the menu to update your details here.
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    );
  }

  // ── Mobile: single-column drill-in sheet ──
  return (
    <Box maxW="480px" mx="auto" w="full" minH="100%" bg="bg">
      {profileView === "main" ? mainContent : subViewContent}
    </Box>
  );
};

export default Profile;
