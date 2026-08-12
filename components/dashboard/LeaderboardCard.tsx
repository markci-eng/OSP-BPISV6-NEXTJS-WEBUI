"use client";
import { Box, Flex, NativeSelect, ScrollArea } from "@chakra-ui/react";
import {
  BrandedAvatar,
  EmptyStateCard,
  ErrorStateCard,
  StaticCard,
  Body,
  Small,
} from "osp-ui-kit";
import { LuTrophy } from "react-icons/lu";
import { useMemo, useState } from "react";
import { useDashboardOverview } from "@/app/(bpis)/hooks/useDashboardOverview";
import type { AgentLeaderboardEntry } from "@/app/(bpis)/api/dashboard.types";
import { formatCurrency } from "@/lib/format/currency";
import { LeaderboardCardSkeleton } from "./DashboardSkeleton";

export const LeaderboardCard = () => {
  const overview = useDashboardOverview();

  if (overview.isLoading) return <LeaderboardCardSkeleton />;
  if (overview.error)
    return <ErrorStateCard onRetry={overview.refetch} h={{ xl: "full" }} />;

  return <LeaderboardContent data={overview.data!.agentLeaderboard} />;
};

/* ─── Rankable metrics ─── */
type LeaderboardMetric =
  | "ns"
  | "quota"
  | "collection"
  | "acctDue"
  | "acctCollection"
  | "collectionEfficiency"
  | "accountEfficiency";

type MetricConfig = {
  value: LeaderboardMetric;
  /** Dropdown option text. */
  label: string;
  /** Card subtitle while this metric is selected. */
  subtitle: string;
  /** The number agents are ranked by. */
  valueOf: (agent: AgentLeaderboardEntry) => number;
  /** Supporting line under the agent name. */
  caption: (agent: AgentLeaderboardEntry) => string;
  /**
   * Rates are already a 0–100 figure, so the bar shows the rate itself. Volume
   * metrics have no natural ceiling, so their bar is a share of the leader.
   */
  isRate?: boolean;
};

const rate = (part: number, whole: number) =>
  whole > 0 ? (part / whole) * 100 : 0;

const percent = (n: number) => `${n.toFixed(1)}%`;

const METRICS: MetricConfig[] = [
  {
    value: "ns",
    label: "New Sales",
    subtitle: "Ranked by new sales this month",
    valueOf: (a) => a.ns,
    caption: (a) => `${a.ns.toLocaleString()} sales`,
  },
  {
    value: "quota",
    label: "Quota",
    subtitle: "Ranked by collection quota this month",
    valueOf: (a) => a.quota,
    caption: (a) => formatCurrency(a.quota),
  },
  {
    value: "collection",
    label: "Collection",
    subtitle: "Ranked by amount collected this month",
    valueOf: (a) => a.collection,
    caption: (a) => formatCurrency(a.collection),
  },
  {
    value: "acctDue",
    label: "Accounts Due",
    subtitle: "Ranked by accounts due this month",
    valueOf: (a) => a.acctDue,
    caption: (a) => `${a.acctDue.toLocaleString()} accounts due`,
  },
  {
    value: "acctCollection",
    label: "Accounts Collected",
    subtitle: "Ranked by accounts collected this month",
    valueOf: (a) => a.acctCollection,
    caption: (a) => `${a.acctCollection.toLocaleString()} accounts collected`,
  },
  {
    value: "collectionEfficiency",
    label: "Collection Efficiency",
    subtitle: "Ranked by collection against quota",
    valueOf: (a) => rate(a.collection, a.quota),
    caption: (a) => `${percent(rate(a.collection, a.quota))} of quota collected`,
    isRate: true,
  },
  {
    value: "accountEfficiency",
    label: "Account Efficiency",
    subtitle: "Ranked by accounts collected against due",
    valueOf: (a) => rate(a.acctCollection, a.acctDue),
    caption: (a) =>
      `${percent(rate(a.acctCollection, a.acctDue))} of accounts due collected`,
    isRate: true,
  },
];

/* ─── Sales agent leaderboard card ─── */
const LeaderboardContent = ({ data }: { data: AgentLeaderboardEntry[] }) => {
  const [metric, setMetric] = useState<LeaderboardMetric>("ns");
  const config = METRICS.find((m) => m.value === metric) ?? METRICS[0];

  // Rank is metric-driven, so the incoming order (by new sales) can't be reused.
  const ranked = useMemo(
    () => [...data].sort((a, b) => config.valueOf(b) - config.valueOf(a)),
    [data, config],
  );
  const leaderValue = ranked.length ? config.valueOf(ranked[0]) : 0;

  return (
    <Box>
      <StaticCard
        activeIcon={<LuTrophy />}
        title={"Sales Agent Leaderboard"}
        subtitle={config.subtitle}
        h={{ xl: "full" }}
        headerAction={<MetricSelect value={metric} onChange={setMetric} />}
      >
        {ranked.length === 0 ? (
          <EmptyStateCard
            title="No sales activity yet"
            description="Agent rankings will appear once new sales are recorded this month."
          />
        ) : (
          <ScrollArea.Root height="330px">
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
                  {ranked.map((agent, i) => (
                    <LeaderboardItem
                      key={agent.name}
                      rank={i + 1}
                      name={agent.name}
                      caption={config.caption(agent)}
                      pct={
                        config.isRate
                          ? Math.min(config.valueOf(agent), 100)
                          : rate(config.valueOf(agent), leaderValue)
                      }
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
        )}
      </StaticCard>
    </Box>
  );
};

/* ─── Metric picker ─── */
const MetricSelect = ({
  value,
  onChange,
}: {
  value: LeaderboardMetric;
  onChange: (metric: LeaderboardMetric) => void;
}) => (
  <NativeSelect.Root size="md" w="auto">
    <NativeSelect.Field
      aria-label="Rank leaderboard by"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value as LeaderboardMetric)}
      h="28px"
      fontSize="xs"
      fontWeight="semibold"
      borderRadius="md"
      bg="white"
    >
      {METRICS.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </NativeSelect.Field>
    <NativeSelect.Indicator />
  </NativeSelect.Root>
);

/* ─── Leaderboard item ─── */
const RANK_COLORS = ["#F59E0B", "#94A3B8", "#F97316"] as const;

const LeaderboardItem = ({
  name,
  caption,
  pct,
  rank,
}: {
  name: string;
  caption: string;
  /** Bar fill, 0–100. */
  pct: number;
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

      <BrandedAvatar name={name} fallbackFontSize="xs" />

      <Box flex={1} minW={0}>
        <Body
          fontSize="sm"
          fontWeight="semibold"
          color="gray.700"
          lineClamp={1}
        >
          {name}
        </Body>
        <Small color="gray.400" lineClamp={1}>
          {caption}
        </Small>
      </Box>

      <Box w="72px" flexShrink={0}>
        <Flex justify="flex-end" mb={1}>
          <Small
            style={{ fontSize: "9px" }}
            color="gray.400"
            fontWeight="semibold"
          >
            {pct.toFixed(0)}%
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
            w={pct.toFixed(1) + "%"}
            transition="width 0.4s ease"
          />
        </Box>
      </Box>
    </Flex>
  );
};
