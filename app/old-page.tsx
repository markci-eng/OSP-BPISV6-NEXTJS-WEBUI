"use client";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Menu,
  Portal,
  ScrollArea,
  Separator,
} from "@chakra-ui/react";
import { BaseText, Body, SectionTitle, Small } from "st-peter-ui";
import { IconType } from "react-icons";
import {
  LuArrowDown,
  LuArrowUp,
  LuChartBar,
  LuTrendingUp,
  LuTrophy,
  LuUsers,
  LuZap,
} from "react-icons/lu";
import {
  RiUserFollowLine,
  RiUserForbidLine,
  RiUserShared2Line,
  RiUserUnfollowLine,
} from "react-icons/ri";
import { Tooltip as ToolTip } from "@/components/ui/tooltip";
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
import { useEffect, useState } from "react";
import Page from "@/components/layout/page/Page";
import React from "react";
import { OSPBadge } from "@/components/common/badge/badge";
import {
  agentLeaderboards,
  monthlyNewSales,
  planholders,
  quotaAndCollections,
} from "./(bpis)/dashboard-data";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getRoleLabel(role: string | null): string {
  if (role === "branch") return "Branch";
  if (role === "bmstl") return "BM / STL";
  if (role === "sales-agent") return "Sales Agent";
  return "";
}

export default function Dashboard() {
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

  return (
    <Page.Root
      title={name ? `Hi, ${name}!` : "Welcome!"}
      description={"Welcome to St. Peter Portal"}
    >
      <Page.MainContent>
        {/* ── Account Overview ── */}
        <Flex direction="column" gap={3}>
          <SectionLabel
            title="Account Overview"
            subtitle="Month-over-month account metrics"
          />
          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }}
            gap={4}
          >
            <TileItem
              Icon={RiUserShared2Line}
              title="New Sales"
              value={planholders.newSales.toLocaleString()}
              prevVal={planholders.prevNewSales.toLocaleString()}
              monthOverMonthPercentage={
                ((planholders.newSales - planholders.prevNewSales) /
                  planholders.prevNewSales) *
                100
              }
            />
            <TileItem
              Icon={RiUserFollowLine}
              title="Active Accounts"
              value="12.1k"
              prevVal={planholders.prevActiveAccounts.toLocaleString()}
              monthOverMonthPercentage={
                ((planholders.activeAccounts - planholders.prevActiveAccounts) /
                  planholders.prevActiveAccounts) *
                100
              }
            />
            <TileItem
              Icon={RiUserForbidLine}
              title="Lapsed Accounts"
              value="7.3k"
              prevVal={planholders.prevLapsedAccounts.toLocaleString()}
              order="desc"
              monthOverMonthPercentage={
                ((planholders.lapsedAccounts - planholders.prevLapsedAccounts) /
                  planholders.prevLapsedAccounts) *
                100
              }
            />
            <TileItem
              Icon={RiUserUnfollowLine}
              title="Terminated Accounts"
              value="24.7k"
              prevVal={planholders.prevTerminatedAccounts.toLocaleString()}
              order="desc"
              monthOverMonthPercentage={
                ((planholders.terminatedAccounts -
                  planholders.prevTerminatedAccounts) /
                  planholders.prevTerminatedAccounts) *
                100
              }
            />
          </Grid>
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
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
              bg="white"
              overflow="hidden"
            >
              <CardHeader
                icon={
                  <LuTrendingUp
                    size={14}
                    color="var(--chakra-colors-primary)"
                  />
                }
                title="Quota & Collection"
                subtitle="Amount targets"
              />
              <Box px={4} py={2}>
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
            </Box>

            {/* Accounts due & collected */}
            <Box
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
              bg="white"
              overflow="hidden"
            >
              <CardHeader
                icon={
                  <LuUsers size={14} color="var(--chakra-colors-primary)" />
                }
                title="Accounts Due & Collected"
                subtitle="Account count targets"
              />
              <Box px={4} py={2}>
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
            </Box>

            {/* Efficiency donuts */}
            <Box
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
              bg="white"
              overflow="hidden"
            >
              <CardHeader
                icon={<LuZap size={14} color="var(--chakra-colors-primary)" />}
                title="Efficiency Rates"
                subtitle="Collection efficiency"
              />
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
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
              bg="white"
              overflow="hidden"
            >
              <CardHeader
                icon={
                  <LuTrophy size={14} color="var(--chakra-colors-primary)" />
                }
                title="Sales Agent Leaderboard"
                subtitle="Ranked by new sales this month"
              />
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
            </Box>

            {/* Monthly new sales chart */}
            <Box
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
              bg="white"
              overflow="hidden"
            >
              <Flex
                align="center"
                justify="space-between"
                gap={2}
                px={4}
                pt={4}
                pb={3}
                borderBottom="1px solid"
                borderColor="gray.50"
              >
                <Flex align="center" gap={2.5}>
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="var(--chakra-colors-primary-disabled)/20"
                    flexShrink={0}
                  >
                    <LuChartBar
                      size={14}
                      color="var(--chakra-colors-primary)"
                    />
                  </Box>
                  <Box>
                    <SectionTitle fontWeight="semibold" color="gray.800">
                      Monthly New Sales
                    </SectionTitle>
                    <Small color="gray.400">New plans enrolled per month</Small>
                  </Box>
                </Flex>
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      borderRadius="lg"
                      flexShrink={0}
                    >
                      {year}
                    </Button>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        {["2026", "2025", "2024"].map((y) => (
                          <Menu.Item
                            key={y}
                            value={y}
                            onClick={() => setYear(y)}
                          >
                            {y}
                          </Menu.Item>
                        ))}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </Flex>
              <Box px={4} pb={4} pt={3}>
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
              </Box>
            </Box>
          </Grid>
        </Flex>
      </Page.MainContent>
    </Page.Root>
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
};

const TileItem = ({
  Icon,
  title,
  value,
  prevVal,
  monthOverMonthPercentage,
  order = "asc",
}: TileItemProps) => {
  const isPositive =
    order === "asc"
      ? monthOverMonthPercentage >= 0
      : monthOverMonthPercentage <= 0;

  return (
    <Box
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
      bg="white"
      overflow="hidden"
    >
      <Box h="3px" bg={isPositive ? "green.400" : "red.400"} />
      <Box p={4}>
        <Flex justify="space-between" align="flex-start" mb={3}>
          <Box
            p={2}
            borderRadius="lg"
            bg="var(--chakra-colors-primary-disabled)/20"
          >
            <Icon size={17} color="var(--chakra-colors-primary)" />
          </Box>
          <ToolTip
            content={"Previous month: " + prevVal}
            contentProps={{ css: { bg: "white" } }}
            positioning={{ placement: "top-end" }}
          >
            <OSPBadge type={isPositive ? "success" : "danger"} size="md">
              {monthOverMonthPercentage > 0 ? (
                <LuArrowUp />
              ) : monthOverMonthPercentage < 0 ? (
                <LuArrowDown />
              ) : null}{" "}
              {Math.abs(monthOverMonthPercentage).toFixed(1)}%
            </OSPBadge>
          </ToolTip>
        </Flex>
        <BaseText
          as="div"
          fontSize="2xl"
          fontWeight="bold"
          color="gray.800"
          lineHeight="1"
        >
          {value}
        </BaseText>
        <Small as="div" fontWeight="semibold" color="gray.600" mt={1.5}>
          {title}
        </Small>
        <Small as="div" color="gray.400" mt={0.5}>
          from {prevVal} prior month
        </Small>
      </Box>
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
