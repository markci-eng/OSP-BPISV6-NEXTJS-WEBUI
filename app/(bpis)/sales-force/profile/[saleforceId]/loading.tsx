import { Box, Grid, GridItem, Skeleton } from "@chakra-ui/react";

/** Next.js route-level Suspense fallback shown while the server component
 * in page.tsx awaits getAgentProfile(). */
export default function Loading() {
  return (
    <Box p={{ base: 3, md: 6 }}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <GridItem>
          <Skeleton h="140px" borderRadius="xl" mb={4} />
          <Skeleton h="220px" borderRadius="xl" />
        </GridItem>
        <GridItem>
          <Skeleton h="160px" borderRadius="xl" mb={4} />
          <Skeleton h="180px" borderRadius="xl" />
        </GridItem>
      </Grid>
    </Box>
  );
}
