import { Box, Flex, SimpleGrid, Skeleton } from "@chakra-ui/react";

export const ApprovalsTableSkeleton = () => (
  <Flex direction="column" gap={4}>
    <SimpleGrid columns={4} gap={3} display={{ base: "none", md: "grid" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box
          key={i}
          borderRadius="xl"
          border="2px solid"
          borderColor="gray.100"
          p={4}
        >
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Skeleton h="10px" w="80px" mb={2} />
              <Skeleton h="28px" w="50px" mb={2} />
              <Skeleton h="10px" w="70px" />
            </Box>
            <Skeleton w="36px" h="36px" borderRadius="lg" />
          </Flex>
        </Box>
      ))}
    </SimpleGrid>

    <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Skeleton h="20px" w="200px" />
        <Skeleton h="36px" w="220px" borderRadius="md" />
      </Flex>
      <Flex direction="column" gap={4}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Flex key={i} gap={4} align="center">
            <Skeleton h="14px" flex={1} />
            <Skeleton h="14px" flex={1} />
            <Skeleton h="14px" flex={1} />
            <Skeleton h="14px" w="80px" />
          </Flex>
        ))}
      </Flex>
    </Box>
  </Flex>
);
