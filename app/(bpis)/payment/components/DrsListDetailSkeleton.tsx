import { Box, Flex, Grid, GridItem, Skeleton, Stack } from "@chakra-ui/react";

/** Skeleton for the shared list+detail master-detail layout used by the
 * DRS/deposit viewer pages. */
export const DrsListDetailSkeleton = () => (
  <Grid
    gap={6}
    templateColumns={{ lg: "380px 1fr", xl: "420px 1fr" }}
    templateRows="minmax(0, 1fr)"
    alignItems="stretch"
    h="full"
    minH={0}
  >
    <GridItem minW={0} p={2}>
      <Flex direction="column" h="full">
        <Skeleton h="20px" w="60%" mb={3} />
        <Skeleton h="40px" borderRadius="md" mb={3} />
        <Stack gap={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              borderRadius="xl"
              borderWidth="1.5px"
              borderColor="gray.100"
              p={4}
            >
              <Flex justify="space-between" mb={2}>
                <Skeleton h="14px" w="50%" />
                <Skeleton h="20px" w="60px" borderRadius="full" />
              </Flex>
              <Skeleton h="12px" w="40%" />
            </Box>
          ))}
        </Stack>
      </Flex>
    </GridItem>
    <GridItem minW={0} py={2}>
      <Flex direction="column" gap={4} h="full">
        <Skeleton h="90px" borderRadius="xl" />
        <Skeleton h="200px" borderRadius="xl" flex={1} />
      </Flex>
    </GridItem>
  </Grid>
);
