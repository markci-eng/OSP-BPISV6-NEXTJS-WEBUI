"use client";
import { Box, Carousel, SimpleGrid } from "@chakra-ui/react";
import { ErrorStateCard } from "osp-ui-kit";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import {
  RiUserFollowLine,
  RiUserForbidLine,
  RiUserShared2Line,
  RiUserUnfollowLine,
} from "react-icons/ri";
import { IconType } from "react-icons";
import { useDashboardOverview } from "@/app/(bpis)/hooks/useDashboardOverview";
import type { AccountOverview } from "@/app/(bpis)/api/dashboard.types";
import { formatCompact } from "@/lib/format/compact";
import { AccountOverviewSkeleton } from "./DashboardSkeleton";
import { MetricTile } from "./MetricTile";

export const AccountOverviewSection = () => {
  const overview = useDashboardOverview();

  if (overview.error) return <ErrorStateCard onRetry={overview.refetch} />;
  if (!overview.data) return <AccountOverviewSkeleton />;

  return <AccountOverviewContent data={overview.data.accountOverview} />;
};

/** Month over month, in percent. A month with no prior figure has no movement. */
const movement = (current: number, previous: number) =>
  previous === 0 ? 0 : ((current - previous) / previous) * 100;

/**
 * One row of the overview, described as data so the mobile carousel and the
 * desktop grid render from the same source. A fall in lapsed or terminated
 * accounts is good news, hence `betterWhen`.
 */
type Tile = {
  Icon: IconType;
  label: string;
  accent: "success" | "info" | "warning" | "danger";
  count: number;
  prevMonth: number;
  betterWhen?: "rising" | "falling";
};

const buildTiles = (data: AccountOverview): Tile[] => [
  {
    Icon: RiUserShared2Line,
    label: "New Sales",
    accent: "success",
    count: data.newSales,
    prevMonth: data.prevNewSales,
  },
  {
    Icon: RiUserFollowLine,
    label: "Active Accounts",
    accent: "info",
    count: data.activeAccounts,
    prevMonth: data.prevActiveAccounts,
  },
  {
    Icon: RiUserForbidLine,
    label: "Lapsed Accounts",
    accent: "warning",
    count: data.lapsedAccounts,
    prevMonth: data.prevLapsedAccounts,
    betterWhen: "falling",
  },
  {
    Icon: RiUserUnfollowLine,
    label: "Terminated Accounts",
    accent: "danger",
    count: data.terminatedAccounts,
    prevMonth: data.prevTerminatedAccounts,
    betterWhen: "falling",
  },
];

const OverviewTile = ({ tile }: { tile: Tile }) => (
  <MetricTile
    Icon={tile.Icon}
    title={tile.label}
    accent={tile.accent}
    value={formatCompact(tile.count)}
    prevVal={formatCompact(tile.prevMonth)}
    order={tile.betterWhen === "falling" ? "desc" : "asc"}
    monthOverMonthPercentage={movement(tile.count, tile.prevMonth)}
  />
);

/* ─── Account overview tiles ─── */
const AccountOverviewContent = ({ data }: { data: AccountOverview }) => {
  const tiles = buildTiles(data);

  return (
    <>
      {/* Mobile: carousel; Desktop (md+): 4-column grid */}
      <Box display={{ base: "block", md: "none" }}>
        <Carousel.Root slideCount={tiles.length} loop>
          <Carousel.ItemGroup>
            {tiles.map((tile, i) => (
              <Carousel.Item key={tile.label} index={i}>
                <Box boxShadow={"card"}>
                  <OverviewTile tile={tile} />
                </Box>
              </Carousel.Item>
            ))}
          </Carousel.ItemGroup>
          <Carousel.Control mt={3} justifyContent="center" gap={4}>
            <Carousel.PrevTrigger>
              <LuChevronLeft />
            </Carousel.PrevTrigger>
            <Carousel.Indicators
              transition="width 0.2s ease-in-out"
              transformOrigin="center"
              opacity="0.5"
              boxSize="2"
              bg={"primaryDisabled"}
              _current={{
                width: "10",
                bg: "primary",
                opacity: 1,
              }}
            />
            <Carousel.NextTrigger>
              <LuChevronRight />
            </Carousel.NextTrigger>
          </Carousel.Control>
        </Carousel.Root>
      </Box>
      <SimpleGrid display={{ base: "none", md: "grid" }} columns={4} gap={3}>
        {tiles.map((tile) => (
          <OverviewTile key={tile.label} tile={tile} />
        ))}
      </SimpleGrid>
    </>
  );
};
