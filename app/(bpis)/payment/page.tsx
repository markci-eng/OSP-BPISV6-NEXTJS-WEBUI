"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import {
  LuFiles,
  LuCircleCheck,
  LuClock,
  LuBanknote,
  LuPencilLine,
  LuFileText,
  LuFileCheck,
  LuReceipt,
  LuArrowRight,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import Page from "@/claude components/layout/page/Page";
import { drsItems } from "@/app/(bpis)/payment/data/paymentDetails";

/* ── Section landing hub for Payment ── */

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
    title: "Encode Payment",
    description: "Record installment payments against a planholder's plan.",
    href: "/payment/encode-payment",
    Icon: LuPencilLine,
    color: "#1B9E57",
  },
  {
    title: "View DRS",
    description: "Review Daily Remittance Slips and their commission details.",
    href: "/payment/view-drs",
    Icon: LuFileText,
    color: "#1976D2",
  },
  {
    title: "Encode Validated Deposit Slip",
    description: "Enter validated bank deposit slips for reconciliation.",
    href: "/payment/encodevalidated-deposit",
    Icon: LuBanknote,
    color: "#8E24AA",
  },
  {
    title: "View Encoded Deposit Slip",
    description: "Browse previously encoded deposit slips and their status.",
    href: "/payment/viewvalidated-deposit",
    Icon: LuFileCheck,
    color: "#F57C00",
  },
  {
    title: "Request Credit Memo",
    description: "File a credit memo request for payment adjustments.",
    href: "/payment/credit-memo",
    Icon: LuReceipt,
    color: "#E53E3E",
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

export default function PaymentLandingPage() {
  const stats = useMemo<StatTile[]>(() => {
    const total = drsItems.length;
    const validated = drsItems.filter((d) => d.Status === "Validated").length;
    const pending = drsItems.filter((d) => d.Status === "Pending").length;
    const forDeposit = drsItems.filter(
      (d) => d.Status === "For Deposit",
    ).length;

    return [
      {
        label: "Deposit Slips",
        value: total,
        Icon: LuFiles,
        color: "#1976D2",
      },
      {
        label: "Validated",
        value: validated,
        Icon: LuCircleCheck,
        color: "#1B9E57",
      },
      { label: "Pending", value: pending, Icon: LuClock, color: "#F57C00" },
      {
        label: "For Deposit",
        value: forDeposit,
        Icon: LuBanknote,
        color: "#8E24AA",
      },
    ];
  }, []);

  return (
    <Page.Root
      headerButton="menu"
      title="Payment"
      description="Encode payments, manage deposit slips, and request credit memos."
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
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            {actions.map((action) => (
              <ActionTile key={action.title} {...action} />
            ))}
          </SimpleGrid>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
