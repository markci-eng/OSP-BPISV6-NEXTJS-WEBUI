import { Box, Flex, Grid, GridItem, Skeleton } from "@chakra-ui/react";

/** Loading placeholder for a single LPANumberButton card in the plan list. */
const LPACardSkeleton = () => (
  <Box
    borderRadius="xl"
    borderWidth={1}
    borderColor="gray.100"
    boxShadow="sm"
    px={4}
    pt={3}
    pb={4}
  >
    <Flex align="flex-start" justify="space-between" gap={2} mb={2}>
      <Box flex={1}>
        <Skeleton h="13px" w="60%" mb={2} />
        <Skeleton h="11px" w="45%" />
      </Box>
      <Skeleton h="18px" w="60px" borderRadius="full" flexShrink={0} />
    </Flex>
    <Skeleton h="10px" w="70%" mb={3} />
    <Flex justify="space-between" mb={1}>
      <Skeleton h="10px" w="40%" />
      <Skeleton h="10px" w="15%" />
    </Flex>
    <Skeleton h="3px" borderRadius="full" mb={3} />
    <Flex justify="space-between">
      <Skeleton h="10px" w="35%" />
      <Skeleton h="10px" w="25%" />
    </Flex>
  </Box>
);

/** Loading placeholder for ListOfPlans — mirrors its master (LPA list) /
 * detail (plan tabs) grid so the section doesn't reflow once plans load. */
export const ListOfPlansSkeleton = () => (
  <Box my={{ base: 0, lg: 5 }}>
    <Grid templateColumns="repeat(4, 1fr)" gap={2}>
      {/* Plan list column */}
      <GridItem colSpan={{ base: 4, lg: 1 }}>
        <Skeleton h="40px" borderRadius="md" mb={3} />
        <Flex direction="column" gap={2}>
          <LPACardSkeleton />
          <LPACardSkeleton />
        </Flex>
      </GridItem>

      {/* Detail panel — desktop only */}
      <GridItem colSpan={3} display={{ base: "none", lg: "block" }}>
        <Box p={3} border="1px solid" borderColor="gray.200">
          <Flex align="center" justify="space-between">
            <Flex gap={2} my={2} align="center">
              <Skeleton boxSize="40px" borderRadius="md" />
              <Box>
                <Skeleton h="9px" w="70px" mb={2} />
                <Skeleton h="20px" w="130px" mb={2} />
                <Flex gap={2}>
                  <Skeleton h="20px" w="70px" borderRadius="full" />
                  <Skeleton h="20px" w="110px" borderRadius="full" />
                </Flex>
              </Box>
            </Flex>
            <Skeleton h="32px" w="120px" borderRadius="md" />
          </Flex>
          <Box borderTopWidth={1} borderColor="gray.100" mt={2} pt={4}>
            <Flex direction="column" gap={2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Flex
                  key={i}
                  align="center"
                  gap={2}
                  p={1}
                  borderRadius="2xl"
                  borderWidth={1}
                  borderColor="gray.100"
                >
                  <Skeleton boxSize={9} borderRadius="full" m={2} />
                  <Box>
                    <Skeleton h="13px" w="120px" mb={1} />
                    <Skeleton h="10px" w="90px" />
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Box>
      </GridItem>
    </Grid>
  </Box>
);
