"use client";

import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Separator,
} from "@chakra-ui/react";
import {
  Body,
  H1,
  H3,
  H4,
  PrimaryLgButton,
  SecondaryMdButton,
  Small,
} from "st-peter-ui";
import Page from "@/components/layout/page/Page";
import { OSPBadge } from "@/components/common/badge/badge";
import {
  RiArrowRightLine,
  RiRocketLine,
  RiShieldCheckLine,
  RiSparklingLine,
  RiBarChartBoxLine,
  RiTimeLine,
  RiTeamLine,
  RiCheckLine,
} from "react-icons/ri";
import { IconType } from "react-icons";

export default function HeroPage() {
  return (
    <Page.Root
      title="Hero"
      description="A showcase of the OSP BPIS platform."
    >
      <Page.MainContent>
      {/* Hero banner */}
      <Box
        mt={5}
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        position="relative"
        bgGradient="linear(135deg, var(--chakra-colors-primary), var(--chakra-colors-primary-hover))"
        bg="primary"
        color="white"
      >
        {/* Decorative glow */}
        <Box
          position="absolute"
          top="-80px"
          right="-80px"
          w="320px"
          h="320px"
          borderRadius="full"
          bg="whiteAlpha.200"
          filter="blur(40px)"
        />
        <Box
          position="absolute"
          bottom="-100px"
          left="-60px"
          w="280px"
          h="280px"
          borderRadius="full"
          bg="whiteAlpha.100"
          filter="blur(40px)"
        />

        <Grid
          templateColumns={{ base: "1fr", lg: "1.3fr 1fr" }}
          gap={8}
          p={{ base: 8, md: 14 }}
          alignItems="center"
          position="relative"
        >
          <GridItem>
            <HStack mb={4} gap={2}>
              <OSPBadge type="success" size="md">
                <RiSparklingLine /> New
              </OSPBadge>
              <Small color="whiteAlpha.900">
                v6 — built for the next generation of operations
              </Small>
            </HStack>

            <H1 color="white" lineHeight="1.1">
              Run your operations,
              <br />
              <Box as="span" color="whiteAlpha.800">
                beautifully.
              </Box>
            </H1>

            <Body color="whiteAlpha.900" mt={5} maxW="560px">
              A unified workspace to manage planholders, payments,
              disbursements, and approvals — all in one place. Move faster,
              with fewer clicks.
            </Body>

            <Flex gap={3} mt={8} wrap="wrap">
              <PrimaryLgButton
                bg="white"
                color="primary"
                _hover={{ bg: "whiteAlpha.900" }}
              >
                Get Started <RiArrowRightLine />
              </PrimaryLgButton>
              <SecondaryMdButton
                bg="transparent"
                color="white"
                borderColor="whiteAlpha.700"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                View Documentation
              </SecondaryMdButton>
            </Flex>

            <HStack mt={8} gap={6} wrap="wrap">
              <Stat label="Active Accounts" value="12.1k" />
              <Separator
                orientation="vertical"
                height="40px"
                borderColor="whiteAlpha.400"
              />
              <Stat label="Transactions / day" value="3.4k" />
              <Separator
                orientation="vertical"
                height="40px"
                borderColor="whiteAlpha.400"
              />
              <Stat label="Uptime" value="99.99%" />
            </HStack>
          </GridItem>

          {/* Decorative preview card */}
          <GridItem display={{ base: "none", lg: "block" }}>
            <Box
              bg="whiteAlpha.200"
              backdropFilter="blur(12px)"
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor="whiteAlpha.300"
              transform="rotate(-1.5deg)"
              boxShadow="2xl"
            >
              <HStack gap={2} mb={4}>
                <Box w="10px" h="10px" borderRadius="full" bg="red.300" />
                <Box w="10px" h="10px" borderRadius="full" bg="yellow.300" />
                <Box w="10px" h="10px" borderRadius="full" bg="green.300" />
              </HStack>

              <Stack gap={3}>
                <PreviewRow label="New Sales" value="+842" trend="up" />
                <PreviewRow label="Collections" value="₱ 4.2M" trend="up" />
                <PreviewRow label="Lapsed Accounts" value="-128" trend="down" />
                <PreviewRow label="Approvals Pending" value="14" trend="flat" />
              </Stack>
            </Box>
          </GridItem>
        </Grid>
      </Box>

      {/* Feature grid */}
      <Box mt={10}>
        <H3 color="gray.solid">Why teams choose OSP</H3>
        <Body color="gray.fg" mt={2}>
          Everything you need to operate at scale — without the busywork.
        </Body>

        <Grid
          mt={6}
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={4}
        >
          <FeatureCard
            Icon={RiRocketLine}
            title="Fast by default"
            description="Optimized workflows so processing takes seconds, not minutes."
          />
          <FeatureCard
            Icon={RiShieldCheckLine}
            title="Secure by design"
            description="Enterprise-grade security and audit trails for every transaction."
          />
          <FeatureCard
            Icon={RiSparklingLine}
            title="Delightfully modern"
            description="A clean, intuitive interface built around the way you work."
          />
          <FeatureCard
            Icon={RiBarChartBoxLine}
            title="Insightful"
            description="Real-time dashboards bring your KPIs into focus."
          />
          <FeatureCard
            Icon={RiTimeLine}
            title="Always on"
            description="99.99% uptime with redundant infrastructure across regions."
          />
          <FeatureCard
            Icon={RiTeamLine}
            title="Built for teams"
            description="Granular roles, approvals, and collaboration baked in."
          />
        </Grid>
      </Box>

      {/* CTA strip */}
      <Box
        mt={10}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
        p={{ base: 6, md: 8 }}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "1fr auto" }}
          gap={6}
          alignItems="center"
        >
          <GridItem>
            <H4 color="gray.solid">Ready to get started?</H4>
            <Body color="gray.fg" mt={2}>
              Hop into the dashboard and explore what your team can do today.
            </Body>

            <HStack mt={4} gap={5} wrap="wrap">
              <CheckPoint label="No setup required" />
              <CheckPoint label="Single sign-on" />
              <CheckPoint label="24/7 support" />
            </HStack>
          </GridItem>
          <GridItem>
            <Flex gap={3} justify={{ base: "flex-start", md: "flex-end" }}>
              <PrimaryLgButton>
                Open Dashboard <RiArrowRightLine />
              </PrimaryLgButton>
            </Flex>
          </GridItem>
        </Grid>
      </Box>
      </Page.MainContent>
    </Page.Root>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <H4 color="white">{value}</H4>
      <Small color="whiteAlpha.800">{label}</Small>
    </Box>
  );
}

function PreviewRow({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
}) {
  const color =
    trend === "up" ? "green.200" : trend === "down" ? "red.200" : "whiteAlpha.700";
  return (
    <Flex
      justify="space-between"
      align="center"
      bg="whiteAlpha.200"
      px={4}
      py={3}
      borderRadius="md"
    >
      <Small color="whiteAlpha.900">{label}</Small>
      <Small color={color} fontWeight="bold">
        {value}
      </Small>
    </Flex>
  );
}

function FeatureCard({
  Icon,
  title,
  description,
}: {
  Icon: IconType;
  title: string;
  description: string;
}) {
  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      p={6}
      borderTop="3px solid"
      borderColor="primary"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
    >
      <Flex
        align="center"
        justify="center"
        w="44px"
        h="44px"
        borderRadius="md"
        bg="primary-disabled"
        mb={4}
      >
        <Icon size={22} color="var(--chakra-colors-primary)" />
      </Flex>
      <H4 color="gray.solid">{title}</H4>
      <Body color="gray.fg" mt={2}>
        {description}
      </Body>
    </Box>
  );
}

function CheckPoint({ label }: { label: string }) {
  return (
    <Flex align="center" gap={2}>
      <Flex
        align="center"
        justify="center"
        w="20px"
        h="20px"
        borderRadius="full"
        bg="primary"
        color="white"
      >
        <RiCheckLine size={14} />
      </Flex>
      <Small color="gray.fg">{label}</Small>
    </Flex>
  );
}
