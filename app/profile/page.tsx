"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/page/Page";
import SectionTitle from "@/components/texts/SectionTitle";
import LabelText from "@/components/texts/LabelText";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  IconButton,
  Separator,
  Text,
} from "@chakra-ui/react";
import {
  LuBanknote,
  LuCheck,
  LuCopy,
  LuDownload,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSmartphone,
  LuUsers,
  LuWifi,
  LuWifiOff,
} from "react-icons/lu";
import { RiQrCodeLine } from "react-icons/ri";
import { OSPBadge } from "@/components/common/badge/badge";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

// ── Static data (mirrors previous UserProfile props) ──────────────────────────

const PROFILE = {
  accountNo: "SPLP123456789",
  firstName: "YHUAN SHIN",
  middleName: "FRANZA",
  lastName: "TEJIMA",
  email: "yhuanshin@example.com",
  phone: "123-456-7890",
  address: "123 Main St, City, State 12345",
};

const REFERRAL = {
  code: "REF123456",
  link: "https://example.com/referral",
  totalRewards: "$100.00",
};

const PAYOUTS = [
  { channel: "Bank Transfer", accountNo: "1234567890", branch: "Main Branch" },
];

const AGENTS = [
  {
    referralCode: "AGENT123",
    agentName: "Agent Name",
    mobile: "123-456-7890",
    email: "",
  },
];

// ── Card shell ─────────────────────────────────────────────────────────────────

function Card({ children, ...props }: React.ComponentProps<typeof Box>) {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
      overflow="hidden"
      {...props}
    >
      {children}
    </Box>
  );
}

// ── Section header row (icon + label) ─────────────────────────────────────────

function CardSection({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box p={{ base: 4, md: 5 }}>
      <Flex align="center" gap={2} mb={3}>
        <Box
          w="28px"
          h="28px"
          borderRadius="lg"
          bg="var(--chakra-colors-primary)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          flexShrink={0}
        >
          <Icon size={14} />
        </Box>
        <SectionTitle>{label}</SectionTitle>
      </Flex>
      <Separator mb={3} />
      {children}
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const fullName = `${PROFILE.firstName} ${PROFILE.middleName[0]}. ${PROFILE.lastName}`;

export default function ProfilePage() {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // PWA state
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onInstallPrompt);

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      toast.success("App installed successfully!");
    }
    setDeferredPrompt(null);
  };

  const handleCopy = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
        toast.success("Referral code copied!");
      } else {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        toast.success("Referral link copied!");
      }
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"]

const pickPalette = (name: string) => {
  const index = name.charCodeAt(0) % colorPalette.length
  return colorPalette[index]
}

  return (
    <Page.Root
      title="My Profile"
      subtitle={fullName}
      description="View and manage your account details and preferences."
      swapOnScroll
    >
      <Page.MainContent>

        {/* ── Hero card ── */}
        <Page.Row>
          <Card>

            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "center", md: "flex-start" }}
              gap={{ base: 4, md: 6 }}
              p={{ base: 5, md: 6 }}
            >
              {/* Avatar */}
              <Avatar.Root size="2xl" flexShrink={0} colorPalette={pickPalette(fullName)}>
                <Avatar.Image src="/images/profile.jpg" alt={fullName} />
                <Avatar.Fallback
                  name={fullName}
                />
              </Avatar.Root>

              {/* Identity block */}
              <Box flex={1} textAlign={{ base: "center", md: "left" }}>
                <Text
                  fontFamily="var(--font-dm-sans), system-ui, sans-serif"
                  fontWeight={700}
                  fontSize={{ base: "xl", md: "2xl" }}
                  color="var(--chakra-colors-primary-hover)"
                  lineHeight={1.15}
                  mb={0.5}
                >
                  {fullName}
                </Text>

                <Text fontSize="sm" color="gray.500" mb={2}>
                  {PROFILE.accountNo}
                </Text>

                <HStack gap={2} justify={{ base: "center", md: "flex-start" }} flexWrap="wrap">
                  <OSPBadge type="success">Active</OSPBadge>
                  <OSPBadge type="info">Branch</OSPBadge>
                </HStack>

                {/* Quick contact strip */}
                <Flex
                  mt={4}
                  gap={{ base: 3, md: 5 }}
                  wrap="wrap"
                  justify={{ base: "center", md: "flex-start" }}
                >
                  {[
                    { Icon: LuMail, value: PROFILE.email },
                    { Icon: LuPhone, value: PROFILE.phone },
                  ].map(({ Icon, value }) => (
                    <Flex key={value} align="center" gap={1.5}>
                      <Icon size={13} color="var(--chakra-colors-gray-400)" />
                      <Text fontSize="sm" color="gray.600">
                        {value}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            </Flex>
          </Card>
        </Page.Row>

        {/* ── Personal Info + Referral (2-col on desktop) ── */}
        <Page.Row>
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={4}
            alignItems="start"
          >
            {/* Personal Information */}
            <Card>
              <CardSection icon={LuMapPin} label="Personal Information">
                <Flex direction="column" gap={2.5}>
                  <LabelText label="Email" value={PROFILE.email} />
                  <LabelText label="Phone" value={PROFILE.phone} />
                  <LabelText label="Address" value={PROFILE.address} />
                </Flex>
              </CardSection>
            </Card>

            {/* Referral */}
            <Card>
              <CardSection icon={RiQrCodeLine} label="Referral">
                <Flex direction="column" gap={4}>
                  {/* QR Code */}
                  <Flex direction="column" align="center" pt={1} gap={2}>
                    <Box
                      p={3}
                      bg="white"
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="gray.200"
                      display="inline-flex"
                    >
                      <QRCodeSVG
                        value={REFERRAL.link}
                        size={148}
                        bgColor="#ffffff"
                        fgColor="var(--chakra-colors-primary, #1a1a1a)"
                        level="M"
                      />
                    </Box>
                    <Text fontSize="xs" color="gray.400">
                      Scan to share your referral link
                    </Text>
                  </Flex>

                  {/* Referral Code + copy */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5}>
                      Referral Code
                    </Text>
                    <Flex
                      align="center"
                      gap={2}
                      bg="gray.50"
                      borderRadius="lg"
                      px={3}
                      py={2.5}
                      borderWidth="1px"
                      borderColor="gray.200"
                    >
                      <Text
                        flex={1}
                        fontFamily="mono"
                        fontSize="sm"
                        fontWeight="semibold"
                        letterSpacing="wider"
                        color="gray.800"
                      >
                        {REFERRAL.code}
                      </Text>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="Copy referral code"
                        color={codeCopied ? "green.500" : "gray.400"}
                        onClick={() => handleCopy(REFERRAL.code, "code")}
                        transition="color 0.15s"
                      >
                        {codeCopied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                      </IconButton>
                    </Flex>
                  </Box>

                  {/* Referral Link + copy */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5}>
                      Referral Link
                    </Text>
                    <Flex
                      align="center"
                      gap={2}
                      bg="gray.50"
                      borderRadius="lg"
                      px={3}
                      py={2.5}
                      borderWidth="1px"
                      borderColor="gray.200"
                    >
                      <Text
                        flex={1}
                        fontSize="xs"
                        color="blue.600"
                        overflow="hidden"
                        style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        title={REFERRAL.link}
                      >
                        {REFERRAL.link}
                      </Text>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="Copy referral link"
                        color={linkCopied ? "green.500" : "gray.400"}
                        onClick={() => handleCopy(REFERRAL.link, "link")}
                        transition="color 0.15s"
                        flexShrink={0}
                      >
                        {linkCopied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                      </IconButton>
                    </Flex>
                  </Box>

                  {/* Total Rewards */}
                  <LabelText label="Total Rewards" value={REFERRAL.totalRewards} />

                </Flex>
              </CardSection>
            </Card>
          </Grid>
        </Page.Row>

        {/* ── Payout Methods ── */}
        <Page.Row>
          <Card>
            <CardSection icon={LuBanknote} label="Payout Methods">
              {PAYOUTS.map((payout, i) => (
                <Box key={i}>
                  {i > 0 && <Separator my={3} />}
                  <Flex direction="column" gap={2.5}>
                    <LabelText label="Channel" value={payout.channel} />
                    <LabelText label="Account No." value={payout.accountNo} />
                    <LabelText label="Branch" value={payout.branch} />
                  </Flex>
                </Box>
              ))}
            </CardSection>
          </Card>
        </Page.Row>

        {/* ── Agents / Upline ── */}
        <Page.Row>
          <Card>
            <CardSection icon={LuUsers} label="Agents">
              {AGENTS.map((agent, i) => (
                <Box key={i}>
                  {i > 0 && <Separator my={3} />}
                  <Flex direction="column" gap={2.5}>
                    <LabelText label="Referral Code" value={agent.referralCode} />
                    <LabelText label="Agent Name" value={agent.agentName} />
                    <LabelText label="Mobile" value={agent.mobile} />
                    {agent.email && (
                      <LabelText label="Email" value={agent.email} />
                    )}
                  </Flex>
                </Box>
              ))}
            </CardSection>
          </Card>
        </Page.Row>

        {/* ── App / PWA ── */}
        <Page.Row>
          <Card>
            <CardSection icon={LuSmartphone} label="App">
              <Flex direction="column" gap={3}>
                <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
                  <LabelText label="Connection" value={isOnline ? "Online" : "Offline"} />
                  <Flex align="center" gap={1.5}>
                    {isOnline ? (
                      <LuWifi size={14} color="var(--chakra-colors-green-500)" />
                    ) : (
                      <LuWifiOff size={14} color="var(--chakra-colors-red-500)" />
                    )}
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color={isOnline ? "green.600" : "red.600"}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </Text>
                  </Flex>
                </Flex>

                <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
                  <LabelText label="Install Status" value={isInstalled ? "Installed" : "Not installed"} />
                  {isInstalled ? (
                    <Text fontSize="xs" fontWeight="semibold" color="green.600">
                      Installed
                    </Text>
                  ) : deferredPrompt ? (
                    <Button
                      size="xs"
                      colorPalette="green"
                      variant="solid"
                      onClick={handleInstall}
                    >
                      <LuDownload />
                      Install App
                    </Button>
                  ) : (
                    <Text fontSize="xs" color="gray.400">
                      Open in browser to install
                    </Text>
                  )}
                </Flex>
              </Flex>
            </CardSection>
          </Card>
        </Page.Row>

      </Page.MainContent>
    </Page.Root>
  );
}
