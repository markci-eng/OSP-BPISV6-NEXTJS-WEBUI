"use client";

import { Box, Flex, Grid, GridItem, Skeleton } from "@chakra-ui/react";
import {
  LuBriefcase,
  LuClock,
  LuMapPin,
  LuPhone,
  LuUser,
} from "react-icons/lu";
import { StaticCard, Page, ProfileHeaderCardSkeleton } from "osp-ui-kit";
import { ListOfPlansSkeleton } from "@/components/plan-management/planholder-profile/sections/list-of-plans-skeleton";

/** Row of label/value skeleton pairs used inside the info cards below. */
const FieldSkeletons = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Box key={i}>
        <Skeleton h="9px" w="60%" mb={2} />
        <Skeleton h="13px" w="80%" />
      </Box>
    ))}
  </>
);

/** Single request card placeholder, shaped like ProgressCard. */
const PendingRequestSkeleton = () => (
  <Box
    borderRadius="xl"
    borderWidth={1}
    borderColor="gray.200"
    px={4}
    pt={3}
    pb={4}
  >
    <Flex align="flex-start" justify="space-between" gap={2} mb={3}>
      <Flex align="center" gap={2.5} minW={0} flex={1}>
        <Skeleton boxSize="28px" borderRadius="lg" flexShrink={0} />
        <Box minW={0} flex={1}>
          <Skeleton h="13px" w="55%" mb={2} />
          <Skeleton h="10px" w="75%" />
        </Box>
      </Flex>
      <Skeleton h="18px" w="60px" borderRadius="full" flexShrink={0} />
    </Flex>
    <Skeleton h="6px" borderRadius="full" mb={3} />
    <Flex justify="space-between">
      <Skeleton h="10px" w="30%" />
      <Skeleton h="10px" w="25%" />
    </Flex>
  </Box>
);

/** Compact address card placeholder, mirrors AddressCard's header + body. */
const AddressCardSkeleton = () => (
  <Box
    borderRadius="xl"
    borderWidth={1}
    borderColor="gray.100"
    overflow="hidden"
  >
    <Flex align="center" gap={3} px={4} pt={4} pb={3}>
      <Skeleton boxSize="36px" borderRadius="lg" flexShrink={0} />
      <Box flex={1}>
        <Skeleton h="13px" w="50%" mb={2} />
        <Skeleton h="10px" w="65%" />
      </Box>
    </Flex>
    <Box borderTopWidth={1} borderColor="gray.100" px={4} py={3}>
      <Skeleton h="12px" w="80%" mb={2} />
      <Skeleton h="12px" w="60%" />
    </Box>
  </Box>
);

/** Next.js route-level Suspense fallback shown while the server component
 * in page.tsx awaits getPlanholderProfile(). Mirrors PlanholderPage's real
 * layout so sections settle into place instead of jumping once data loads. */
export default function Loading() {
  return (
    <Page.Root
      headerButton="back-mobile"
      title="Planholder Profile"
      description="Clear Access to Every Planholder Detail."
    >
      <Page.ToolContent>
        <Flex display={{ base: "none", lg: "flex" }} align="center" gap={2}>
          <Skeleton h="32px" w="80px" borderRadius="md" />
          <Skeleton h="32px" w="80px" borderRadius="md" />
          <Skeleton h="32px" w="36px" borderRadius="md" />
        </Flex>
        <Box display={{ base: "block", lg: "none" }}>
          <Skeleton h="32px" w="36px" borderRadius="md" />
        </Box>
      </Page.ToolContent>

      <Page.MainContent>
        <Grid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={5}
          alignItems="start"
        >
          {/* Left column — identity & details */}
          <GridItem>
            <Flex direction="column" gap={4}>
              <ProfileHeaderCardSkeleton />

              {/* Plans + pending requests — mobile only, matches PlanholderPage's Show(isMobile) */}
              <Box display={{ base: "block", lg: "none" }}>
                <ListOfPlansSkeleton />
              </Box>
              <Box display={{ base: "block", lg: "none" }}>
                <StaticCard
                  activeIcon={<LuClock size={16} />}
                  title="Pending Request(s)"
                  subtitle="Loading requests…"
                >
                  <PendingRequestSkeleton />
                </StaticCard>
              </Box>

              <StaticCard
                activeIcon={<LuUser size={16} />}
                title="Personal Information"
                subtitle="Loading details…"
              >
                <Grid
                  display={{ base: "none", lg: "grid" }}
                  py={2}
                  templateColumns="repeat(4, 1fr)"
                  gap={1}
                  gapY={2}
                >
                  <FieldSkeletons count={8} />
                </Grid>
                <Grid
                  display={{ base: "grid", lg: "none" }}
                  py={2}
                  templateColumns="1fr"
                  gap={2}
                >
                  <FieldSkeletons count={5} />
                </Grid>
              </StaticCard>

              <Box display={{ base: "block", lg: "none" }}>
                <StaticCard
                  activeIcon={<LuMapPin size={16} />}
                  title="Address Information"
                  subtitle="Loading addresses…"
                >
                  <Grid
                    gap={4}
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                  >
                    <AddressCardSkeleton />
                    <AddressCardSkeleton />
                  </Grid>
                </StaticCard>
              </Box>
            </Flex>
          </GridItem>

          {/* Right column — activity & admin */}
          <GridItem>
            <Flex direction="column" gap={4}>
              <Box display={{ base: "none", lg: "block" }}>
                <StaticCard
                  activeIcon={<LuClock size={16} />}
                  title="Pending Request(s)"
                  subtitle="Loading requests…"
                >
                  <PendingRequestSkeleton />
                </StaticCard>
              </Box>

              <Box display={{ base: "block", lg: "none" }}>
                <StaticCard
                  activeIcon={<LuPhone size={16} />}
                  title="Contact Information"
                  subtitle="Loading contacts…"
                >
                  <Flex direction="column" gap={2}>
                    <FieldSkeletons count={3} />
                  </Flex>
                </StaticCard>
              </Box>

              <StaticCard
                activeIcon={<LuBriefcase size={16} />}
                title="Employment Information"
                subtitle="Loading details…"
              >
                <Grid
                  display={{ base: "none", lg: "grid" }}
                  templateColumns="repeat(2, 1fr)"
                  gap={2}
                >
                  <FieldSkeletons count={4} />
                </Grid>
                <Grid
                  display={{ base: "grid", lg: "none" }}
                  templateColumns="1fr"
                  gap={2}
                >
                  <FieldSkeletons count={4} />
                </Grid>
              </StaticCard>
            </Flex>
          </GridItem>
        </Grid>

        {/* Plans section — full width, desktop only (mobile version rendered above) */}
        <Box display={{ base: "none", lg: "block" }}>
          <ListOfPlansSkeleton />
        </Box>
      </Page.MainContent>
    </Page.Root>
  );
}
