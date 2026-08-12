"use client";
import { DASHBOARD_ACCENT_COLORS, TREND_COLORS } from "@/lib/theme/dashboard-colors";
import { Box, Carousel, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { ErrorStateCard, BaseText, Body, Small } from "osp-ui-kit";
import { LuArrowDown, LuArrowUp, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import {
  RiUserFollowLine,
  RiUserForbidLine,
  RiUserShared2Line,
  RiUserUnfollowLine,
} from "react-icons/ri";
import { IconType } from "react-icons";
import { useDashboardOverview } from "@/app/(bpis)/hooks/useDashboardOverview";
import type { AccountOverview } from "@/app/(bpis)/api/dashboard.types";
import { AccountOverviewSkeleton } from "./DashboardSkeleton";

export const AccountOverviewSection = () => {
  const overview = useDashboardOverview();

  if (overview.isLoading) return <AccountOverviewSkeleton />;
  if (overview.error) return <ErrorStateCard onRetry={overview.refetch} />;

  return <AccountOverviewContent data={overview.data!.accountOverview} />;
};

/* ─── Account overview tiles ─── */
const AccountOverviewContent = ({ data }: { data: AccountOverview }) => (
  <>
    {/* Mobile: carousel; Desktop (md+): 4-column grid */}
    <Box display={{ base: "block", md: "none" }}>
      <Carousel.Root slideCount={4} loop>
        <Carousel.ItemGroup>
          <Carousel.Item index={0} px={2}>
            <TileItem
              Icon={RiUserShared2Line}
              title="New Sales"
              value={data.newSales.toLocaleString()}
              prevVal={data.prevNewSales.toLocaleString()}
              color={DASHBOARD_ACCENT_COLORS.positive}
              monthOverMonthPercentage={
                ((data.newSales - data.prevNewSales) / data.prevNewSales) * 100
              }
            />
          </Carousel.Item>
          <Carousel.Item index={1} px={2}>
            <TileItem
              Icon={RiUserFollowLine}
              title="Active Accounts"
              value="12.1k"
              prevVal={data.prevActiveAccounts.toLocaleString()}
              color={DASHBOARD_ACCENT_COLORS.info}
              monthOverMonthPercentage={
                ((data.activeAccounts - data.prevActiveAccounts) /
                  data.prevActiveAccounts) *
                100
              }
            />
          </Carousel.Item>
          <Carousel.Item index={2} px={2}>
            <TileItem
              Icon={RiUserForbidLine}
              title="Lapsed Accounts"
              value="7.3k"
              prevVal={data.prevLapsedAccounts.toLocaleString()}
              order="desc"
              color={DASHBOARD_ACCENT_COLORS.warning}
              monthOverMonthPercentage={
                ((data.lapsedAccounts - data.prevLapsedAccounts) /
                  data.prevLapsedAccounts) *
                100
              }
            />
          </Carousel.Item>
          <Carousel.Item index={3} px={2}>
            <TileItem
              Icon={RiUserUnfollowLine}
              title="Terminated Accounts"
              value="24.7k"
              prevVal={data.prevTerminatedAccounts.toLocaleString()}
              order="desc"
              color={DASHBOARD_ACCENT_COLORS.danger}
              monthOverMonthPercentage={
                ((data.terminatedAccounts - data.prevTerminatedAccounts) /
                  data.prevTerminatedAccounts) *
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
    </Box>
    <SimpleGrid display={{ base: "none", md: "grid" }} columns={4} gap={3}>
      <TileItem
        Icon={RiUserShared2Line}
        title="New Sales"
        value={data.newSales.toLocaleString()}
        prevVal={data.prevNewSales.toLocaleString()}
        color={DASHBOARD_ACCENT_COLORS.positive}
        monthOverMonthPercentage={
          ((data.newSales - data.prevNewSales) / data.prevNewSales) * 100
        }
      />
      <TileItem
        Icon={RiUserFollowLine}
        title="Active Accounts"
        value="12.1k"
        prevVal={data.prevActiveAccounts.toLocaleString()}
        color={DASHBOARD_ACCENT_COLORS.info}
        monthOverMonthPercentage={
          ((data.activeAccounts - data.prevActiveAccounts) /
            data.prevActiveAccounts) *
          100
        }
      />
      <TileItem
        Icon={RiUserForbidLine}
        title="Lapsed Accounts"
        value="7.3k"
        prevVal={data.prevLapsedAccounts.toLocaleString()}
        order="desc"
        color={DASHBOARD_ACCENT_COLORS.warning}
        monthOverMonthPercentage={
          ((data.lapsedAccounts - data.prevLapsedAccounts) /
            data.prevLapsedAccounts) *
          100
        }
      />
      <TileItem
        Icon={RiUserUnfollowLine}
        title="Terminated Accounts"
        value="24.7k"
        prevVal={data.prevTerminatedAccounts.toLocaleString()}
        order="desc"
        color={DASHBOARD_ACCENT_COLORS.danger}
        monthOverMonthPercentage={
          ((data.terminatedAccounts - data.prevTerminatedAccounts) /
            data.prevTerminatedAccounts) *
          100
        }
      />
    </SimpleGrid>
  </>
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

  const pct = Math.abs(monthOverMonthPercentage).toFixed(1);
  const trendColor = isPositive
    ? DASHBOARD_ACCENT_COLORS.positive
    : TREND_COLORS.negativeText;
  const trendBg = isPositive
    ? TREND_COLORS.positiveBg
    : TREND_COLORS.negativeBg;

  return (
    <Box
      borderRadius="3xl"
      position="relative"
      bg={`${color}18`}
      border="2px solid"
      borderColor={color}
      boxShadow="0 1px 4px rgba(0,0,0,0.06)"
      overflow="hidden"
    >
      <Box p={4}>
        {/* Header: icon + title */}
        <Flex align="center" gap={2} mb={3}>
          <Box
            p={2}
            bg={`${color}15`}
            style={{ color }}
            borderRadius="lg"
            flexShrink={0}
          >
            <Icon size={17} />
          </Box>
          <Body fontWeight="600" color="gray.500">
            {title}
          </Body>
        </Flex>

        {/* Main value */}
        <BaseText
          as="div"
          fontSize="5xl"
          fontWeight="700"
          color="gray.800"
          lineHeight="1"
        >
          {value}
        </BaseText>

        {/* MoM section */}
        <Flex
          align="center"
          justify="space-between"
          pt={2.5}
          borderTop="1px solid"
          borderColor="gray.100"
        >
          {/* Prior month reference */}
          <Box>
            <Small
              color="gray.400"
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              Prior Month
            </Small>
            <Small color="gray.500" fontWeight="semibold">
              {prevVal}
            </Small>
          </Box>

          {/* Trend pill */}
          <Flex direction="column" align="flex-end" gap={1}>
            <Flex
              align="center"
              gap={1}
              px={2.5}
              py={1.5}
              borderRadius="full"
              style={{ background: trendBg }}
            >
              {monthOverMonthPercentage > 0 ? (
                <LuArrowUp size={13} style={{ color: trendColor }} />
              ) : monthOverMonthPercentage < 0 ? (
                <LuArrowDown size={13} style={{ color: trendColor }} />
              ) : null}
              <Text
                fontWeight="700"
                style={{ color: trendColor, fontSize: "14px" }}
              >
                {pct}%
              </Text>
            </Flex>
            <Text
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: trendColor,
                letterSpacing: "0.02em",
              }}
            >
              {monthOverMonthPercentage > 0
                ? "Increase"
                : monthOverMonthPercentage < 0
                  ? "Decrease"
                  : "No change"}
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
