import { Box, Flex, Grid } from "@chakra-ui/react";
import { DashboardHeaderMobile } from "@/components/dashboard/DashboardHeaderMobile";
import { SectionLabel } from "@/components/dashboard/SectionLabel";
import { AccountOverviewSection } from "@/components/dashboard/AccountOverviewSection";
import { EfficiencySection } from "@/components/dashboard/EfficiencySection";
import { LeaderboardCard } from "@/components/dashboard/LeaderboardCard";
import { MonthlySalesCard } from "@/components/dashboard/MonthlySalesCard";

export default function Dashboard() {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      gap={{ base: 4, md: 6 }}
      px={2}
      style={{
        paddingBottom: "calc(108px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* ── MOBILE HOME HEADER (login-page style, scrolls with content) ── */}
      <DashboardHeaderMobile />

      {/* ── Account Overview ── */}
      <Flex direction="column" gap={3} mt={{ base: 0, lg: 4 }}>
        <SectionLabel
          title="Account Overview"
          subtitle="Month-over-month account metrics"
        />
        <AccountOverviewSection />
      </Flex>

      {/* ── Efficiency ── */}
      <Flex direction="column" gap={3}>
        <SectionLabel
          title="Efficiency"
          subtitle="Quota vs. collection performance"
        />
        <EfficiencySection />
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
          <LeaderboardCard />
          <MonthlySalesCard />
        </Grid>
      </Flex>
    </Box>
  );
}
