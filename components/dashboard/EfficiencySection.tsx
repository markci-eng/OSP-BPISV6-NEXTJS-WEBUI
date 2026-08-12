"use client";
import { Box, Flex, Grid, Separator, Text } from "@chakra-ui/react";
import { ErrorStateCard, StaticCard, Small } from "osp-ui-kit";
import { Cell, Pie, PieChart } from "recharts";
import { LuTrendingUp, LuUsers, LuZap } from "react-icons/lu";
import { RowItem } from "@/components/info-card/row-item";
import { useDashboardOverview } from "@/app/(bpis)/hooks/useDashboardOverview";
import type { QuotaAndCollections } from "@/app/(bpis)/api/dashboard.types";
import { EfficiencySkeleton } from "./DashboardSkeleton";

export const EfficiencySection = () => {
  const overview = useDashboardOverview();

  if (overview.isLoading) return <EfficiencySkeleton />;
  if (overview.error) return <ErrorStateCard onRetry={overview.refetch} />;

  return <EfficiencyContent data={overview.data!.quotaAndCollections} />;
};

const money = (n: number) =>
  "₱ " +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ─── Efficiency cards ─── */
const EfficiencyContent = ({ data }: { data: QuotaAndCollections }) => (
  <Grid
    templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
    gap={4}
    alignItems="stretch"
  >
    {/* Quota & Collection amounts */}
    <Box>
      <StaticCard
        activeIcon={<LuTrendingUp size={14} />}
        title="Quota & Collection"
        subtitle="Amount targets"
        h={{ lg: "full" }}
      >
        <RowItem label="Comm. Quota" value={money(data.comQuota)} />
        <RowItem label="Comm. Collection" value={money(data.comCollection)} />
        <Separator my={1} borderColor="gray.50" />
        <RowItem label="Non-Comm. Quota" value={money(data.nComQuota)} />
        <RowItem
          label="Non-Comm. Collection"
          value={money(data.nComCollection)}
        />
        <Separator my={2} />
        <CardTotal
          label="Total collected of quota"
          collected={data.comCollection + data.nComCollection}
          total={data.comQuota + data.nComQuota}
          isAmount
        />
      </StaticCard>
    </Box>

    {/* Accounts due & collected */}
    <Box>
      <StaticCard
        activeIcon={<LuUsers />}
        title={"Accounts Due & Collected"}
        subtitle={"Account count targets"}
        h={{ lg: "full" }}
      >
        <RowItem label="Comm. Accounts Due" value={data.comAcctDue} />
        <RowItem
          label="Comm. Accounts Collected"
          value={data.comAcctCollection}
        />
        <Separator my={1} borderColor="gray.50" />
        <RowItem label="Non-Comm. Accounts Due" value={data.nComAcctDue} />
        <RowItem
          label="Non-Comm. Accounts Collected"
          value={data.nComAcctCollection}
        />
        <Separator my={2} />
        <CardTotal
          label="Total collected of due"
          collected={data.comAcctCollection + data.nComAcctCollection}
          total={data.comAcctDue + data.nComAcctDue}
        />
      </StaticCard>
    </Box>

    {/* Efficiency donuts */}
    <Box>
      <StaticCard
        activeIcon={<LuZap />}
        title={"Efficiency Rates"}
        subtitle={"Collection efficiency"}
        h={{ lg: "full" }}
      >
        <Grid templateColumns="repeat(2, 1fr)" px={2} pb={2}>
          <EfficiencyDonutChart
            title="ADE Com"
            quota={data.comAcctDue}
            collection={data.comAcctCollection}
            passingRate={50}
          />
          <EfficiencyDonutChart
            title="ADE NCom"
            quota={data.nComAcctDue}
            collection={data.nComAcctCollection}
            passingRate={50}
          />
          <EfficiencyDonutChart
            title="CVE Com"
            quota={data.comQuota}
            collection={data.comCollection}
            passingRate={50}
          />
          <EfficiencyDonutChart
            title="CVE NCom"
            quota={data.nComQuota}
            collection={data.nComCollection}
            passingRate={50}
          />
        </Grid>
      </StaticCard>
    </Box>
  </Grid>
);

/* ─── Card total footer ─── */
const CardTotal = ({
  label,
  collected,
  total,
  isAmount = false,
}: {
  label: string;
  collected: number;
  total: number;
  isAmount?: boolean;
}) => {
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
  const fmt = (n: number) => (isAmount ? money(n) : n.toLocaleString());

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={3}
      mt={2}
      px={3}
      py={4}
      borderRadius="lg"
      bg="gray.50"
    >
      <Box minW={0}>
        <Text fontSize="xs" color="gray.500" lineHeight="1.2">
          {label}
        </Text>
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color="gray.700"
          lineHeight="1.3"
          mt={0.5}
        >
          {fmt(collected)}{" "}
          <Text as="span" color="gray.400" fontWeight="medium">
            / {fmt(total)}
          </Text>
        </Text>
      </Box>
      <Text
        fontSize="lg"
        fontWeight="bold"
        color="var(--chakra-colors-primary)"
        flexShrink={0}
      >
        {pct}%
      </Text>
    </Flex>
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
