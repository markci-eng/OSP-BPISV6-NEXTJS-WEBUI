"use client";
import { Box, Flex, ScrollArea } from "@chakra-ui/react";
import {
  BrandedAvatar,
  EmptyStateCard,
  ErrorStateCard,
  StaticCard,
} from "osp-ui-kit";
import { LuTrophy } from "react-icons/lu";
import { Body, Small } from "st-peter-ui";
import { useDashboardOverview } from "@/app/(bpis)/hooks/useDashboardOverview";
import type { AgentLeaderboardEntry } from "@/app/(bpis)/api/dashboard.types";
import { LeaderboardCardSkeleton } from "./DashboardSkeleton";

export const LeaderboardCard = () => {
  const overview = useDashboardOverview();

  if (overview.isLoading) return <LeaderboardCardSkeleton />;
  if (overview.error)
    return <ErrorStateCard onRetry={overview.refetch} h={{ xl: "full" }} />;

  return <LeaderboardContent data={overview.data!.agentLeaderboard} />;
};

/* ─── Sales agent leaderboard card ─── */
const LeaderboardContent = ({ data }: { data: AgentLeaderboardEntry[] }) => (
  <Box>
    <StaticCard
      activeIcon={<LuTrophy />}
      title={"Sales Agent Leaderboard"}
      subtitle={"Ranked by new sales this month"}
      h={{ xl: "full" }}
    >
      {data.length === 0 ? (
        <EmptyStateCard
          title="No sales activity yet"
          description="Agent rankings will appear once new sales are recorded this month."
        />
      ) : (
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
                {data.map((agent, i) => (
                  <LeaderboardItem
                    key={agent.name}
                    rank={i + 1}
                    name={agent.name}
                    ns={agent.ns}
                    max={data[0].ns}
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

      <BrandedAvatar name={name} fallbackFontSize="xs" />

      <Box flex={1} minW={0}>
        <Body fontSize="sm" fontWeight="semibold" color="gray.700" lineClamp={1}>
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
