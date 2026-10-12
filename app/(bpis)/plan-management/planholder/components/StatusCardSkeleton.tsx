import { Box, Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";

/** Placeholder in the shape of osp-ui-kit's `MetricCard`. */
export function StatusCardSkeleton() {
  return (
    <Flex
      direction="column"
      gap={3}
      p={{ base: 5, md: 6 }}
      borderRadius="card"
      boxShadow="card"
      bg="surface"
      h="full"
    >
      {/* Label */}
      <Skeleton height="14px" width="90px" borderRadius="sm" />

      <Flex align="center" gap={4}>
        {/* Icon */}
        <SkeletonCircle size="64px" flexShrink={0} />

        {/* Value */}
        <Box>
          <Skeleton height="32px" width="80px" borderRadius="md" />
        </Box>
      </Flex>
    </Flex>
  );
}
