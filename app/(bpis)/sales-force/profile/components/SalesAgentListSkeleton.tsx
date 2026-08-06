import { Box, Flex, Skeleton, SkeletonCircle, VStack } from "@chakra-ui/react";

/** Mirrors a single agent card from the mobile list. */
const AgentCardSkeleton = () => (
  <Box
    w="100%"
    p={4}
    borderRadius="2xl"
    bg="white"
    shadow="sm"
    borderWidth={1}
    borderColor="gray.100"
    overflow="hidden"
  >
    <Flex justify="space-between" align="start" mb={3}>
      <Flex align="center" gap={2} flex={1} minW={0}>
        <SkeletonCircle boxSize="36px" flexShrink={0} />
        <Box flex={1} minW={0}>
          <Skeleton h="14px" w="65%" mb={2} />
          <Skeleton h="10px" w="35%" />
        </Box>
      </Flex>
      <Skeleton h="20px" w="64px" borderRadius="full" flexShrink={0} />
    </Flex>

    <Flex gap={2} mb={3}>
      <Skeleton h="22px" w="70px" borderRadius="full" />
      <Skeleton h="22px" w="90px" borderRadius="full" />
    </Flex>

    <Flex justify="space-between" align="center">
      <Skeleton h="10px" w="90px" />
      <Skeleton h="10px" w="10px" />
    </Flex>
  </Box>
);

/** Mirrors a row of the desktop agentColumns table (Agent, Branch, Position,
 * Status, Hire Date). */
const AgentRowSkeleton = () => (
  <Flex align="center" gap={4} px={4} py={3}>
    <Flex align="center" gap={3} flex="2" minW={0}>
      <SkeletonCircle boxSize="32px" flexShrink={0} />
      <Box flex={1} minW={0}>
        <Skeleton h="12px" w="70%" mb={2} />
        <Skeleton h="10px" w="40%" />
      </Box>
    </Flex>
    <Skeleton h="12px" flex="1" />
    <Skeleton h="12px" flex="1" />
    <Skeleton h="20px" w="70px" borderRadius="full" flex="1" />
    <Skeleton h="12px" flex="1" />
  </Flex>
);

/** Loading placeholder for the sales agent list/search results — shown
 * while useInfiniteAgents / useAgentSearch resolve their first page, so the
 * mobile card list and desktop table settle into their final shape instead
 * of popping in under a bare spinner. */
export const SalesAgentListSkeleton = () => (
  <>
    {/* ── Mobile card list ── */}
    <Box display={{ base: "block", md: "none" }}>
      <VStack gap={3}>
        {Array.from({ length: 5 }).map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </VStack>
    </Box>

    {/* ── Desktop table ── */}
    <Box
      display={{ base: "none", md: "block" }}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      overflow="hidden"
    >
      <Flex justify="space-between" align="center" px={4} py={3} borderBottomWidth={1} borderColor="gray.100">
        <Skeleton h="14px" w="140px" />
        <Skeleton h="32px" w="90px" borderRadius="md" />
      </Flex>
      <Flex direction="column" divideY="1px" borderColor="gray.100">
        {Array.from({ length: 8 }).map((_, i) => (
          <AgentRowSkeleton key={i} />
        ))}
      </Flex>
    </Box>
  </>
);
