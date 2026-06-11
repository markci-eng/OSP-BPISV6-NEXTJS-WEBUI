"use client";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Portal,
  ScrollArea,
  Separator,
  Menu,
  Avatar,
} from "@chakra-ui/react";
import {
  LuClipboardList,
  LuInfo,
  LuChevronLeft,
  LuChevronRight,
  LuMouse,
  LuMoveHorizontal,
  LuChartBar,
  LuTrendingUp,
  LuTrophy,
  LuUsers,
  LuZap,
  LuArrowDown,
  LuArrowUp,
} from "react-icons/lu";
import { Calendar, MapPin } from "lucide-react";
import { useState, ElementType, useEffect } from "react";
import { Carousel } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { setYear } from "date-fns";
import {
  RiUserShared2Line,
  RiUserFollowLine,
  RiUserForbidLine,
  RiUserUnfollowLine,
} from "react-icons/ri";
import { BaseText, Body, SectionTitle, Small } from "st-peter-ui";
import {
  planholders,
  quotaAndCollections,
  agentLeaderboards,
  monthlyNewSales,
} from "./dashboard-data";
import { OSPBadge } from "@/components/common/badge/badge";
import { IconType } from "react-icons";
import UserWelcomeBanner from "@/claude components/layout/page/UserWelcomeBanner";
import { useDemoAuth } from "@/components/ui/demo-auth";
import { Card } from "@/claude components/card-accordion/card";

// --- Types ---
type DashboardKeys = "request" | "service" | "reservation" | "activetrips";

interface DashboardCard {
  id: DashboardKeys;
  label: string;
  icon: ElementType;
  count: number;
  description: string;
  color: string;
}

interface TableRow {
  id: string;
  name: string;
  detail: string;
  date: string;
}

// --- Data ---
const dashboardCards: DashboardCard[] = [
  {
    id: "request",
    label: "Requests",
    icon: LuClipboardList,
    count: 3,
    description: "Bookings to confirm",
    color: "#388e3c",
  },
  {
    id: "service",
    label: "Contracting",
    icon: LuInfo,
    count: 2,
    description: "Services to contract",
    color: "#1976d2",
  },
  {
    id: "reservation",
    label: "Room Reservation",
    icon: Calendar,
    count: 3,
    description: "Rooms to reserve",
    color: "#f57c00",
  },
  {
    id: "activetrips",
    label: "Active Trips",
    icon: MapPin,
    count: 5,
    description: "Trips in progress",
    color: "#8e24aa",
  },
];

const tableData: Record<DashboardKeys, TableRow[]> = {
  request: [
    {
      id: "REQ001",
      name: "John Doe",
      detail: "Booking Pending",
      date: "2026-04-06",
    },
    {
      id: "REQ002",
      name: "Jane Smith",
      detail: "Booking Pending",
      date: "2026-04-05",
    },
    {
      id: "REQ003",
      name: "Alice Johnson",
      detail: "Booking Pending",
      date: "2026-04-04",
    },
  ],
  service: [
    {
      id: "SER001",
      name: "Miguel Santos",
      detail: "Contract Pending",
      date: "2026-04-06",
    },
    {
      id: "SER002",
      name: "Andrea Cruz",
      detail: "Contract Pending",
      date: "2026-04-05",
    },
  ],
  reservation: [
    {
      id: "RES001",
      name: "Carlos Mendoza",
      detail: "Pending Reservation",
      date: "2026-04-06",
    },
    {
      id: "RES002",
      name: "Jasmine Reyes",
      detail: "Pending Reservation",
      date: "2026-04-05",
    },
    {
      id: "RES003",
      name: "Paolo Navarro",
      detail: "Pending Reservation",
      date: "2026-04-04",
    },
  ],
  activetrips: [
    {
      id: "TRIP001",
      name: "ABC-1234 | Juan Dela Cruz",
      detail: "Ongoing",
      date: "2026-04-06",
    },
    {
      id: "TRIP002",
      name: "XYZ-5678 | Maria Santos",
      detail: "Ongoing",
      date: "2026-04-05",
    },
    {
      id: "TRIP003",
      name: "LMN-9101 | Roberto Garcia",
      detail: "Ongoing",
      date: "2026-04-04",
    },
  ],
};

// --- Design tokens ---
const C = {
  ink: "#1B2024",
  body: "#3C434B",
  muted: "#8B9097",
  faint: "#A2A8AE",
  line: "#EEF0F2",
  border: "#ECEEF0",
  bgSoft: "#F6F7F8",
  shadow: "0 1px 2px rgba(16,24,40,.04), 0 6px 18px rgba(16,24,40,.05)",
  primary: "#1B9E57",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// --- Stat card (desktop) ---
function StatCard({
  card,
  isSelected,
  onClick,
}: {
  card: DashboardCard;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = card.icon;
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: `1px solid ${isSelected ? card.color : C.border}`,
        borderRadius: 18,
        boxShadow: isSelected
          ? `0 0 0 2px ${card.color}22, ${C.shadow}`
          : C.shadow,
        padding: 20,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        flex: 1,
        minHeight: 150,
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: card.color,
        }}
      />

      {/* Icon chip */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 11,
          background: `${card.color}18`,
          color: card.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Icon size={20} />
      </div>

      {/* Count */}
      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: "-.02em",
          lineHeight: 1,
          color: C.ink,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {card.count}
      </div>

      {/* Label */}
      <div
        style={{ fontSize: 14.5, fontWeight: 700, marginTop: 10, color: C.ink }}
      >
        {card.label}
      </div>

      {/* Description */}
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
        {card.description}
      </div>
    </div>
  );
}

// --- Mobile stat card (for carousel) ---
function MobileStatCard({
  card,
  isSelected,
  onClick,
}: {
  card: DashboardCard;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = card.icon;
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: `2px solid ${isSelected ? card.color : C.border}`,
        borderRadius: 20,
        boxShadow: isSelected ? `0 4px 20px ${card.color}30` : C.shadow,
        padding: "20px 20px 18px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 4,
          background: card.color,
          borderRadius: "0 0 0 20px",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `${card.color}15`,
            color: card.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-.02em",
              lineHeight: 1,
              color: C.ink,
            }}
          >
            {card.count}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.ink,
              marginTop: 4,
            }}
          >
            {card.label}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            {card.description}
          </div>
        </div>
      </div>
    </div>
  );
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

function getRoleLabel(role: string | null): string {
  if (role === "branch") return "Branch";
  if (role === "bmstl") return "BM / STL";
  if (role === "sales-agent") return "Sales Agent";
  return "";
}

export default function Dashboard() {
  const router = useRouter();
  const [selected, setSelected] = useState<DashboardKeys>("request");
  const activeIndex = dashboardCards.findIndex((c) => c.id === selected);
  const activeCard = dashboardCards[activeIndex];
  const rows = tableData[selected];

  const statusFilters = (() => {
    switch (selected) {
      case "request":
        return ["Unconfirmed"];
      case "service":
        return ["Uncontracted"];
      case "reservation":
        return ["Pending Reservation"];
      case "activetrips":
        return ["Ongoing"];
      default:
        return [];
    }
  })();

  const handleNavigate = (id: string) => {
    if (selected === "request") router.push(`/request/${id}`);
    else if (selected === "service") router.push(`/serviceinfo/${id}`);
    else if (selected === "reservation") router.push(`/reservation/room/${id}`);
    else if (selected === "activetrips") router.push(`/tripticket/${id}`);
  };

  const ActiveIcon = activeCard?.icon;

  const [year, setYear] = useState("2026");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const chartData = monthlyNewSales.find((y) => y.year === year)?.data ?? [];

  useEffect(() => {
    setUserRole(readCookie("osp_user"));
    setDisplayName(localStorage.getItem("user-display-name") ?? "");
  }, []);

  const greetLabel = getGreeting();
  const roleLabel = getRoleLabel(userRole);
  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const name = "Mark Cristian";
  const { login } = useDemoAuth();

  useEffect(() => {
    login();
  }, [login]);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: "10px 8px 8px",
      }}
    >
      <UserWelcomeBanner firstName={"Joyce"} branch={"Head Office"} />

      {/* ── Account Overview ── */}
      <Flex direction="column" gap={3}>
        <SectionLabel
          title="Account Overview"
          subtitle="Month-over-month account metrics"
        />
        <Carousel.Root slideCount={4} loop>
          <Carousel.ItemGroup>
            <Carousel.Item index={0} px={2}>
              <TileItem
                Icon={RiUserShared2Line}
                title="New Sales"
                value={planholders.newSales.toLocaleString()}
                prevVal={planholders.prevNewSales.toLocaleString()}
                color="#1B9E57"
                monthOverMonthPercentage={
                  ((planholders.newSales - planholders.prevNewSales) /
                    planholders.prevNewSales) *
                  100
                }
              />
            </Carousel.Item>
            <Carousel.Item index={1} px={2}>
              <TileItem
                Icon={RiUserFollowLine}
                title="Active Accounts"
                value="12.1k"
                prevVal={planholders.prevActiveAccounts.toLocaleString()}
                color="#1976D2"
                monthOverMonthPercentage={
                  ((planholders.activeAccounts -
                    planholders.prevActiveAccounts) /
                    planholders.prevActiveAccounts) *
                  100
                }
              />
            </Carousel.Item>
            <Carousel.Item index={2} px={2}>
              <TileItem
                Icon={RiUserForbidLine}
                title="Lapsed Accounts"
                value="7.3k"
                prevVal={planholders.prevLapsedAccounts.toLocaleString()}
                order="desc"
                color="#F57C00"
                monthOverMonthPercentage={
                  ((planholders.lapsedAccounts -
                    planholders.prevLapsedAccounts) /
                    planholders.prevLapsedAccounts) *
                  100
                }
              />
            </Carousel.Item>
            <Carousel.Item index={3} px={2}>
              <TileItem
                Icon={RiUserUnfollowLine}
                title="Terminated Accounts"
                value="24.7k"
                prevVal={planholders.prevTerminatedAccounts.toLocaleString()}
                order="desc"
                color="#E53E3E"
                monthOverMonthPercentage={
                  ((planholders.terminatedAccounts -
                    planholders.prevTerminatedAccounts) /
                    planholders.prevTerminatedAccounts) *
                  100
                }
              />
            </Carousel.Item>
          </Carousel.ItemGroup>
          <Carousel.Control mt={3} justifyContent="center">
            <Carousel.PrevTrigger>
              <LuChevronLeft />
            </Carousel.PrevTrigger>
            <Carousel.Indicators />
            <Carousel.NextTrigger>
              <LuChevronRight />
            </Carousel.NextTrigger>
          </Carousel.Control>
        </Carousel.Root>
      </Flex>

      {/* ── Efficiency ── */}
      <Flex direction="column" gap={3}>
        <SectionLabel
          title="Efficiency"
          subtitle="Quota vs. collection performance"
        />
        <Grid
          templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
          gap={4}
          alignItems="stretch"
        >
          {/* Quota & Collection amounts */}
          <Box
          // borderRadius="xl"
          // border="1px solid"
          // borderColor="gray.100"
          // boxShadow="sm"
          // bg="white"
          // overflow="hidden"
          >
            <Card
              activeIcon={<LuTrendingUp size={14} />}
              title="Quota & Collection"
              subtitle="Amount targets"
            >
              <Box px={0} py={2}>
                <MetricRow
                  label="Comm. Quota"
                  value={quotaAndCollections.comQuota}
                  isAmount
                />
                <MetricRow
                  label="Comm. Collection"
                  value={quotaAndCollections.comCollection}
                  isAmount
                />
                <Separator my={1} borderColor="gray.50" />
                <MetricRow
                  label="Non-Comm. Quota"
                  value={quotaAndCollections.nComQuota}
                  isAmount
                />
                <MetricRow
                  label="Non-Comm. Collection"
                  value={quotaAndCollections.nComCollection}
                  isAmount
                  last
                />
              </Box>
            </Card>
          </Box>

          {/* Accounts due & collected */}
          <Box
          // borderRadius="xl"
          // border="1px solid"
          // borderColor="gray.100"
          // boxShadow="sm"
          // bg="white"
          // overflow="hidden"
          >
            {/* <CardHeader
              icon={<LuUsers size={14} color="var(--chakra-colors-primary)" />}
              title="Accounts Due & Collected"
              subtitle="Account count targets"
            /> */}
            <Card
              activeIcon={<LuUsers />}
              title={"Accounts Due & Collected"}
              subtitle={"Account count targets"}
            >
              <Box px={0} py={2}>
                <MetricRow
                  label="Comm. Accounts Due"
                  value={quotaAndCollections.comAcctDue}
                />
                <MetricRow
                  label="Comm. Accounts Collected"
                  value={quotaAndCollections.comAcctCollection}
                />
                <Separator my={1} borderColor="gray.50" />
                <MetricRow
                  label="Non-Comm. Accounts Due"
                  value={quotaAndCollections.nComAcctDue}
                />
                <MetricRow
                  label="Non-Comm. Accounts Collected"
                  value={quotaAndCollections.nComAcctCollection}
                  last
                />
              </Box>
            </Card>
          </Box>

          {/* Efficiency donuts */}
          <Box>
            <Card
              activeIcon={<LuZap />}
              title={"Efficiency Rates"}
              subtitle={"Collection efficiency"}
            >
              <Grid templateColumns="repeat(2, 1fr)" px={2} pb={2}>
                <EfficiencyDonutChart
                  title="ADE Com"
                  quota={quotaAndCollections.comAcctDue}
                  collection={quotaAndCollections.comAcctCollection}
                  passingRate={50}
                />
                <EfficiencyDonutChart
                  title="ADE NCom"
                  quota={quotaAndCollections.nComAcctDue}
                  collection={quotaAndCollections.nComAcctCollection}
                  passingRate={50}
                />
                <EfficiencyDonutChart
                  title="CVE Com"
                  quota={quotaAndCollections.comQuota}
                  collection={quotaAndCollections.comCollection}
                  passingRate={50}
                />
                <EfficiencyDonutChart
                  title="CVE NCom"
                  quota={quotaAndCollections.nComQuota}
                  collection={quotaAndCollections.nComCollection}
                  passingRate={50}
                />
              </Grid>
            </Card>
          </Box>
        </Grid>
      </Flex>

      {/* ── Performance ── */}
      <Flex direction="column" gap={3}>
        <SectionLabel
          title="Performance"
          subtitle="Sales rankings and monthly trends"
        />
        <Grid
          templateColumns={{ base: "1fr", xl: "2fr 3fr" }}
          gap={4}
          alignItems="stretch"
        >
          {/* Leaderboard */}
          <Box
          // borderRadius="xl"
          // border="1px solid"
          // borderColor="gray.100"
          // boxShadow="sm"
          // bg="white"
          // overflow="hidden"
          >
            <Card
              activeIcon={<LuTrophy />}
              title={"Sales Agent Leaderboard"}
              subtitle={"Ranked by new sales this month"}
            >
              <ScrollArea.Root height="360px">
                <ScrollArea.Viewport
                  css={{
                    "--scroll-shadow-size": "2rem",
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
                  <ScrollArea.Content px={4} py={2}>
                    <Flex direction="column">
                      {agentLeaderboards.map((agent, i) => (
                        <LeaderboardItem
                          key={agent.name}
                          rank={i + 1}
                          name={agent.name}
                          ns={agent.ns}
                          max={agentLeaderboards[0].ns}
                        />
                      ))}
                    </Flex>
                  </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar visibility="hidden">
                  <ScrollArea.Thumb />
                </ScrollArea.Scrollbar>
                <ScrollArea.Corner />
              </ScrollArea.Root>
            </Card>
          </Box>

          {/* Monthly new sales chart */}
          <Card
            activeIcon={<LuChartBar size={14} />}
            title="Monthly New Sales"
            subtitle="New plans enrolled per month"
          >
            <Flex justify="flex-end" mb={3}>
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="outline" size="sm" borderRadius="lg">
                    {year}
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      {["2026", "2025", "2024"].map((y) => (
                        <Menu.Item key={y} value={y} onClick={() => setYear(y)}>
                          {y}
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Flex>
            <ResponsiveContainer width="100%" height={330}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F3F4F6"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #F3F4F6",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.03)", radius: 8 }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--chakra-colors-primary)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Flex>
    </Box>
  );
}

/* ─── Section label ─── */
const SectionLabel = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <Box>
    <SectionTitle fontWeight="semibold" color="gray.700">
      {title}
    </SectionTitle>
    {subtitle && (
      <Small color="gray.400" mt="1px">
        {subtitle}
      </Small>
    )}
  </Box>
);

/* ─── Card header ─── */
const CardHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <Flex
    align="center"
    gap={2.5}
    px={4}
    pt={4}
    pb={3}
    borderBottom="1px solid"
    borderColor="gray.50"
  >
    <Box
      p={2}
      borderRadius="lg"
      bg="var(--chakra-colors-primary-disabled)/20"
      flexShrink={0}
    >
      {icon}
    </Box>
    <Box>
      <SectionTitle fontWeight="semibold" color="gray.800">
        {title}
      </SectionTitle>
      {subtitle && <Small color="gray.400">{subtitle}</Small>}
    </Box>
  </Flex>
);

/* ─── Metric row ─── */
const MetricRow = ({
  label,
  value,
  isAmount = false,
  last = false,
}: {
  label: string;
  value: number;
  isAmount?: boolean;
  last?: boolean;
}) => (
  <Flex
    align="center"
    justify="space-between"
    py={2.5}
    borderBottom={last ? "none" : "1px solid"}
    borderColor="gray.50"
  >
    <Small color="gray.500">{label}</Small>
    <Body fontSize="sm" fontWeight="semibold" color="gray.700">
      {isAmount
        ? "₱" +
          value.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : value.toLocaleString()}
    </Body>
  </Flex>
);

/* ─── KPI tile ─── */
type TileItemProps = {
  Icon: IconType;
  title: string;
  value: string;
  prevVal: string;
  monthOverMonthPercentage: number;
  order?: "asc" | "desc";
  color: string;
};

const TileItem = ({
  Icon,
  title,
  value,
  prevVal,
  monthOverMonthPercentage,
  order = "asc",
  color,
}: TileItemProps) => {
  const isPositive =
    order === "asc"
      ? monthOverMonthPercentage >= 0
      : monthOverMonthPercentage <= 0;

  return (
    <Box
      borderRadius="3xl"
      p={6}
      minH="150px"
      position="relative"
      bg={`${color}18`}
      border="2px solid"
      borderColor={`${color}`}
      boxShadow="sm"
      overflow="hidden"
    >
      <Flex justify="space-between" align="start">
        <Flex direction="column" gap={3} align="start">
          <Small as="div" fontWeight="700" style={{ color }}>
            {title}
          </Small>
          <BaseText
            as="div"
            fontSize="5xl"
            fontWeight="bold"
            color="gray.800"
            lineHeight="1"
          >
            {value}
          </BaseText>
          <Small as="div" color="gray.500">
            from {prevVal} prior month
          </Small>
        </Flex>
        <Box p={3} bg={`${color}20`} style={{ color }} borderRadius="2xl">
          <Icon size={28} />
        </Box>
      </Flex>
      <Flex justify="flex-end" mt={3}>
        <OSPBadge type={isPositive ? "success" : "danger"} size="md">
          {monthOverMonthPercentage > 0 ? (
            <LuArrowUp />
          ) : monthOverMonthPercentage < 0 ? (
            <LuArrowDown />
          ) : null}{" "}
          {Math.abs(monthOverMonthPercentage).toFixed(1)}%
        </OSPBadge>
      </Flex>
    </Box>
  );
};

/* ─── Efficiency donut ─── */
const EfficiencyDonutChart = ({
  title,
  quota,
  collection,
  passingRate,
}: {
  title: string;
  quota: number;
  collection: number;
  passingRate: number;
}) => {
  const pct = quota > 0 ? Math.min((collection / quota) * 100, 100) : 0;
  const isLow = pct < passingRate;
  const activeColor = isLow ? "#F87171" : "var(--chakra-colors-primary)";
  const bgColor = isLow ? "#FECACA" : "var(--chakra-colors-primary-disabled)";

  const data = [
    { name: "collected", value: Math.max(collection, 0) },
    { name: "remaining", value: Math.max(quota - collection, 0) },
  ];

  return (
    <Flex direction="column" align="center" gap={1} py={3}>
      <Box position="relative" w="80px" h="80px">
        <PieChart
          width={80}
          height={80}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <Pie
            data={data}
            cx={40}
            cy={40}
            innerRadius={24}
            outerRadius={36}
            dataKey="value"
            strokeWidth={0}
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={activeColor} />
            <Cell fill={bgColor} />
          </Pie>
        </PieChart>
        {/* Centered label — overlaid absolutely */}
        <Flex
          position="absolute"
          inset={0}
          align="center"
          justify="center"
          direction="column"
          gap={0}
          pointerEvents="none"
        >
          <Small
            style={{ fontSize: "11px" }}
            fontWeight="700"
            color={isLow ? "red.500" : "gray.700"}
            lineHeight="1"
          >
            {pct.toFixed(0)}%
          </Small>
        </Flex>
      </Box>
      <Small
        style={{ fontSize: "10px" }}
        fontWeight="semibold"
        color="gray.500"
        textAlign="center"
        lineHeight="1.2"
      >
        {title}
      </Small>
    </Flex>
  );
};

/* ─── Leaderboard item ─── */
const RANK_COLORS = ["#F59E0B", "#94A3B8", "#F97316"] as const;

const LeaderboardItem = ({
  name,
  ns,
  max,
  rank,
}: {
  name: string;
  ns: number;
  max: number;
  rank: number;
}) => {
  const isTop3 = rank <= 3;
  const rankColor = isTop3 ? RANK_COLORS[rank - 1] : undefined;

  return (
    <Flex
      align="center"
      gap={3}
      py={2.5}
      borderBottom="1px solid"
      borderColor="gray.50"
      _last={{ borderBottom: "none" }}
    >
      <Box
        w="22px"
        h="22px"
        borderRadius="full"
        bg={isTop3 ? rankColor : "gray.100"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Small
          style={{ fontSize: "9px" }}
          fontWeight="bold"
          color={isTop3 ? "white" : "gray.400"}
          lineHeight="1"
        >
          {rank}
        </Small>
      </Box>

      <Avatar.Root
        size="sm"
        bg="var(--chakra-colors-primary-disabled)/30"
        flexShrink={0}
      >
        <Avatar.Fallback
          name={name}
          color="var(--chakra-colors-primary)"
          fontSize="xs"
        />
      </Avatar.Root>

      <Box flex={1} minW={0}>
        <Body
          fontSize="sm"
          fontWeight="semibold"
          color="gray.700"
          lineClamp={1}
        >
          {name}
        </Body>
        <Small color="gray.400">{ns.toLocaleString()} sales</Small>
      </Box>

      <Box w="72px" flexShrink={0}>
        <Flex justify="flex-end" mb={1}>
          <Small
            style={{ fontSize: "9px" }}
            color="gray.400"
            fontWeight="semibold"
          >
            {((ns / max) * 100).toFixed(0)}%
          </Small>
        </Flex>
        <Box h="4px" bg="gray.100" borderRadius="full">
          <Box
            h="full"
            borderRadius="full"
            style={{
              backgroundColor: isTop3
                ? rankColor
                : "var(--chakra-colors-primary)",
            }}
            w={((ns / max) * 100).toFixed(1) + "%"}
            transition="width 0.4s ease"
          />
        </Box>
      </Box>
    </Flex>
  );
};
