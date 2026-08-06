"use client";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { Flex, Skeleton, Tabs } from "@chakra-ui/react";
import { EmptyStateCard, ErrorStateCard, StaticCard } from "osp-ui-kit";
import { LuChartBar } from "react-icons/lu";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMonthlyNewSales } from "@/app/(bpis)/hooks/useMonthlyNewSales";

/* ─── Monthly new sales chart card (self-contained data fetching) ─── */
export const MonthlySalesCard = () => {
  const [year, setYear] = useState<"2026" | "2025" | "2024">("2026");
  const monthlySales = useMonthlyNewSales(year);

  return (
    <StaticCard
      activeIcon={<LuChartBar size={14} />}
      title="Monthly New Sales"
      subtitle="New plans enrolled per month"
      h={{ xl: "full" }}
    >
      <Flex justify="flex-end" mb={3}>
        <Tabs.Root
          value={year}
          onValueChange={(details) =>
            setYear(details.value as "2026" | "2025" | "2024")
          }
          variant="subtle"
          size="sm"
        >
          <Tabs.List dir="rtl">
            {(["2026", "2025", "2024"] as const).map((y) => (
              <Tabs.Trigger
                key={y}
                value={y}
                px={2.5}
                py={1}
                fontSize="xs"
                borderRadius="md"
                _selected={{
                  bg: "var(--chakra-colors-primary)",
                  color: "white",
                  fontWeight: "semibold",
                }}
              >
                {y}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </Flex>

      {monthlySales.isLoading ? (
        <Skeleton h="330px" borderRadius="lg" />
      ) : monthlySales.error ? (
        <ErrorStateCard onRetry={monthlySales.refetch} h="330px" />
      ) : monthlySales.data.length === 0 ? (
        <EmptyStateCard
          title="No sales data"
          description="There is no recorded new sales data for this year."
          h="330px"
        />
      ) : (
        <ResponsiveContainer width="100%" height={330}>
          <BarChart
            data={monthlySales.data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={BRAND_COLORS.mutedBg}
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
                border: `1px solid ${BRAND_COLORS.mutedBg}`,
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
      )}
    </StaticCard>
  );
};
