import { Box, Flex, Skeleton, SkeletonCircle, VStack } from "@chakra-ui/react";

/** Mirrors a single planholder card from the mobile list — header (avatar +
 * name/personId + status badge), quick-info chips, plan detail rows, contact
 * number, and footer. */
const PlanholderCardSkeleton = () => (
  <Box
    w="100%"
    p={4}
    borderRadius="2xl"
    bg="white"
    shadow="sm"
    overflow="hidden"
  >
    {/* HEADER */}
    <Flex justify="space-between" align="start" mb={3}>
      <Flex align="center" gap={2} flex={1} minW={0}>
        <SkeletonCircle boxSize="34px" flexShrink={0} />
        <Box flex={1} minW={0}>
          <Skeleton h="14px" w="60%" mb={2} />
          <Skeleton h="10px" w="35%" />
        </Box>
      </Flex>
      <Flex align="center" gap={2} flexShrink={0}>
        <SkeletonCircle boxSize="8px" />
        <Skeleton h="20px" w="64px" borderRadius="full" />
      </Flex>
    </Flex>

    {/* QUICK INFO CHIPS */}
    <Flex gap={2} mb={3}>
      <Skeleton h="22px" w="96px" borderRadius="full" />
      <Skeleton h="22px" w="80px" borderRadius="full" />
    </Flex>

    {/* PLAN DETAIL */}
    <VStack align="start" gap={2} px={2} mb={3}>
      <Skeleton h="12px" w="55%" />
      <Skeleton h="12px" w="70%" />
    </VStack>

    {/* CONTACT NUMBER */}
    <Skeleton h="12px" w="45%" mb={3} />

    {/* FOOTER */}
    <Flex justify="space-between" align="center">
      <Skeleton h="10px" w="110px" />
      <Skeleton h="10px" w="10px" />
    </Flex>
  </Box>
);

/** Mirrors a row of the desktop planholderColumns table (Planholder, LPA
 * Number, Plan, Branch, Status, Effectivity). */
const PlanholderRowSkeleton = () => (
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
    <Skeleton h="12px" flex="1" />
    <Skeleton h="20px" w="70px" borderRadius="full" flex="1" />
    <Skeleton h="12px" flex="1" />
  </Flex>
);

/** Loading placeholder for the planholder search results — shown while
 * useInfinitePlanholders / usePlanholderSearch resolve their first page, so
 * the mobile card list and desktop table settle into their final shape
 * instead of popping in under a bare spinner. */
export const PlanholderListSkeleton = () => (
  <>
    {/* ── Mobile card list ── */}
    <Box display={{ base: "block", md: "none" }} w="full">
      {/* Mobile search bar */}
      <Skeleton h="40px" w="full" borderRadius="lg" mb={3} />

      <VStack gap={3}>
        {Array.from({ length: 5 }).map((_, i) => (
          <PlanholderCardSkeleton key={i} />
        ))}
      </VStack>
    </Box>

    {/* ── Desktop data table ── */}
    <Box
      display={{ base: "none", md: "block" }}
      w="full"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      overflow="hidden"
    >
      <Flex
        justify="space-between"
        align="center"
        px={4}
        py={3}
        borderBottomWidth={1}
        borderColor="gray.100"
      >
        <Skeleton h="32px" w="240px" borderRadius="md" />
        <Skeleton h="32px" w="90px" borderRadius="md" />
      </Flex>
      <Flex direction="column" divideY="1px" borderColor="gray.100">
        {Array.from({ length: 8 }).map((_, i) => (
          <PlanholderRowSkeleton key={i} />
        ))}
      </Flex>
    </Box>
  </>
);
