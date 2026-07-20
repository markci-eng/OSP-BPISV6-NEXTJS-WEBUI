"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import {
  LuUsers,
  LuUserCheck,
  LuBriefcase,
  LuUser,
  LuUserPlus,
  LuNetwork,
  LuPrinter,
  LuArrowRight,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import Page from "@/claude components/layout/page/Page";
import { salesAgents } from "@/data/saleforce/sales-agent-data";

/* ── Section landing hub for Sales Agent Management ── */

const MANAGER_POSITIONS = new Set(["RM", "BM", "STL"]);

type StatTile = {
  label: string;
  value: number;
  Icon: IconType;
  color: string;
};

type ActionCard = {
  title: string;
  description: string;
  href: string;
  Icon: IconType;
  color: string;
};

const actions: ActionCard[] = [
  {
    title: "Sales Agent Profile",
    description: "Search and view agent profiles, movements, and referrals.",
    href: "/sales-force/profile",
    Icon: LuUsers,
    color: "#1976D2",
  },
  {
    title: "Re-Organization",
    description: "Reassign agents to a new superior and restructure teams.",
    href: "/sales-force/re-assign",
    Icon: LuNetwork,
    color: "#8E24AA",
  },
  {
    title: "Add New Sales Agent",
    description: "Register a new sales agent and complete their onboarding.",
    href: "/sales-force/new",
    Icon: LuUserPlus,
    color: "#1B9E57",
  },
  {
    title: "Contract and SFID Renewal",
    description: "Print agent contracts and renew SFID cards.",
    href: "/sales-force/sale-force-printing",
    Icon: LuPrinter,
    color: "#F57C00",
  },
];

function StatTileCard({ label, value, Icon, color }: StatTile) {
  return (
    <Box
      p={4}
      borderRadius="2xl"
      bg="white"
      shadow="sm"
      border="1px solid"
      borderColor="gray.100"
    >
      <Flex align="center" gap={3}>
        <Box
          p={2.5}
          borderRadius="xl"
          bg={`${color}18`}
          style={{ color }}
          flexShrink={0}
        >
          <Icon size={20} />
        </Box>
        <Box minW={0}>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="gray.800"
            lineHeight="1"
            fontVariantNumeric="tabular-nums"
          >
            {value.toLocaleString()}
          </Text>
          <Text fontSize="xs" color="gray.500" fontWeight="medium" mt={1}>
            {label}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

function ActionTile({ title, description, href, Icon, color }: ActionCard) {
  const router = useRouter();
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      position="relative"
      p={5}
      borderRadius="2xl"
      bg="white"
      shadow="sm"
      border="1px solid"
      borderColor="gray.100"
      cursor="pointer"
      overflow="hidden"
      transition="all 0.25s ease"
      _hover={{
        transform: "translateY(-3px)",
        shadow: "lg",
        borderColor: `${color}55`,
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: color,
        outlineOffset: "2px",
      }}
    >
      <Flex align="flex-start" justify="space-between" gap={3}>
        <Box
          p={3}
          borderRadius="xl"
          bg={`${color}18`}
          style={{ color }}
          flexShrink={0}
        >
          <Icon size={22} />
        </Box>
        <Flex
          align="center"
          justify="center"
          w="28px"
          h="28px"
          borderRadius="full"
          bg="gray.50"
          color="gray.400"
          flexShrink={0}
          transition="all 0.2s ease"
        >
          <LuArrowRight size={15} />
        </Flex>
      </Flex>

      <Text fontWeight="bold" fontSize="md" color="gray.800" mt={4}>
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500" mt={1} lineHeight="1.45">
        {description}
      </Text>
    </Box>
  );
}

export default function SalesForceLandingPage() {
  const stats = useMemo<StatTile[]>(() => {
    const total = salesAgents.length;
    const active = salesAgents.filter(
      (a) => a.employeeStatus === "Active",
    ).length;
    const managers = salesAgents.filter((a) =>
      MANAGER_POSITIONS.has(a.position),
    ).length;
    const fieldAgents = total - managers;

    return [
      { label: "Total Agents", value: total, Icon: LuUsers, color: "#1976D2" },
      {
        label: "Active",
        value: active,
        Icon: LuUserCheck,
        color: "#1B9E57",
      },
      {
        label: "Managers",
        value: managers,
        Icon: LuBriefcase,
        color: "#8E24AA",
      },
      {
        label: "Field Agents",
        value: fieldAgents,
        Icon: LuUser,
        color: "#F57C00",
      },
    ];
  }, []);

  return (
    <Page.Root
      headerButton="menu"
      title="Sales Agent Management"
      description="Manage sales agent profiles, structure, and documents."
    >
      <Page.MainContent>
        {/* ── Overview stats ── */}
        <Page.Row>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }}>
            {stats.map((stat) => (
              <StatTileCard key={stat.label} {...stat} />
            ))}
          </SimpleGrid>
        </Page.Row>

        {/* ── Quick actions ── */}
        <Page.Row>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
            Quick Actions
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={4}>
            {actions.map((action) => (
              <ActionTile key={action.href} {...action} />
            ))}
          </SimpleGrid>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
