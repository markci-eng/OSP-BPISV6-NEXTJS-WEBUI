import { Box, Flex, Grid, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { StaticCard } from "osp-ui-kit";
import {
  LuChartBar,
  LuTrendingUp,
  LuTrophy,
  LuUsers,
  LuZap,
} from "react-icons/lu";

/* ─── Account overview tiles ─── */
export const AccountOverviewSkeleton = () => (
  <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
    {Array.from({ length: 4 }).map((_, i) => (
      <Box
        key={i}
        borderRadius="3xl"
        border="2px solid"
        borderColor="gray.100"
        p={4}
      >
        <Flex align="center" gap={2} mb={3}>
          <Skeleton w="33px" h="33px" borderRadius="lg" />
          <Skeleton h="14px" w="70px" />
        </Flex>
        <Skeleton h="40px" w="80px" mb={3} />
        <Flex
          justify="space-between"
          pt={2.5}
          borderTop="1px solid"
          borderColor="gray.100"
        >
          <Box>
            <Skeleton h="9px" w="60px" mb={1} />
            <Skeleton h="12px" w="50px" />
          </Box>
          <Skeleton h="28px" w="56px" borderRadius="full" />
        </Flex>
      </Box>
    ))}
  </SimpleGrid>
);

/* ─── Efficiency cards ─── */
export const EfficiencySkeleton = () => (
  <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={4}>
    <StaticCard
      activeIcon={<LuTrendingUp size={14} />}
      title="Quota & Collection"
      subtitle="Amount targets"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Flex key={i} justify="space-between" py={2}>
          <Skeleton h="12px" w="45%" />
          <Skeleton h="12px" w="25%" />
        </Flex>
      ))}
      <Skeleton h="52px" mt={2} borderRadius="lg" />
    </StaticCard>

    <StaticCard
      activeIcon={<LuUsers />}
      title="Accounts Due & Collected"
      subtitle="Account count targets"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Flex key={i} justify="space-between" py={2}>
          <Skeleton h="12px" w="55%" />
          <Skeleton h="12px" w="15%" />
        </Flex>
      ))}
      <Skeleton h="52px" mt={2} borderRadius="lg" />
    </StaticCard>

    <StaticCard
      activeIcon={<LuZap />}
      title="Efficiency Rates"
      subtitle="Collection efficiency"
    >
      <Grid templateColumns="repeat(2, 1fr)" px={2} pb={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Flex key={i} direction="column" align="center" gap={2} py={3}>
            <Skeleton w="80px" h="80px" borderRadius="full" />
            <Skeleton h="10px" w="60px" />
          </Flex>
        ))}
      </Grid>
    </StaticCard>
  </Grid>
);

/* ─── Sales agent leaderboard card ─── */
export const LeaderboardCardSkeleton = () => (
  <StaticCard
    activeIcon={<LuTrophy />}
    title="Sales Agent Leaderboard"
    subtitle="Ranked by new sales this month"
    h={{ xl: "full" }}
  >
    <Flex justify="flex-end" mb={3}>
      <Skeleton h="28px" w="150px" borderRadius="md" />
    </Flex>
    <Flex direction="column" px={4} py={2}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Flex
          key={i}
          align="center"
          gap={3}
          py={2.5}
          borderBottom="1px solid"
          borderColor="gray.50"
        >
          <Skeleton w="22px" h="22px" borderRadius="full" />
          <Skeleton w="32px" h="32px" borderRadius="full" />
          <Box flex={1}>
            <Skeleton h="12px" w="70%" mb={1} />
            <Skeleton h="10px" w="40%" />
          </Box>
          <Skeleton w="72px" h="4px" borderRadius="full" />
        </Flex>
      ))}
    </Flex>
  </StaticCard>
);

/* ─── Monthly new sales chart card ─── */
export const MonthlySalesCardSkeleton = () => (
  <StaticCard
    activeIcon={<LuChartBar size={14} />}
    title="Monthly New Sales"
    subtitle="New plans enrolled per month"
    h={{ xl: "full" }}
  >
    <Flex justify="flex-end" mb={3}>
      <Skeleton h="28px" w="180px" borderRadius="md" />
    </Flex>
    <Skeleton h="330px" borderRadius="lg" />
  </StaticCard>
);
