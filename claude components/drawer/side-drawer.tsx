"use client";

import {
  Badge,
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  HStack,
  Icon,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";
import { RowItem } from "../info-card/row-item";

export type SideDrawerRow = {
  label: string;
  value?: React.ReactNode;
};

export type SideDrawerSection = {
  icon?: IconType;
  title: string;
  subtitle?: string;
  rows: SideDrawerRow[];
};

export type SideDrawerTab = {
  value: string;
  label: string;
  sections: SideDrawerSection[];
};

export type SideDrawerBadge = {
  label: React.ReactNode;
  tone?: "success" | "neutral" | "warning" | "error";
};

export type SideDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Small uppercase label above the title */
  eyebrow?: string;
  title: string;
  badges?: SideDrawerBadge[];
  /** Icon/button rendered next to the close button (top-right) */
  headerAction?: React.ReactNode;
  /**
   * Slot rendered below the badges — use for action buttons.
   * Accepts any React node.
   */
  headerChildren?: React.ReactNode;
  /**
   * When provided, a tab bar is rendered at the top of the body.
   * Each tab carries its own sections — content switches with the active tab.
   */
  tabs?: SideDrawerTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  /** Used when there are no tabs. Ignored when tabs are provided. */
  sections?: SideDrawerSection[];
};

const getBadgeColors = (tone: SideDrawerBadge["tone"] = "neutral") => {
  switch (tone) {
    case "success":
      return { bg: BRAND_COLORS.successBg, color: BRAND_COLORS.primaryGreen };
    case "warning":
      return { bg: BRAND_COLORS.warningBg, color: BRAND_COLORS.warningText };
    case "error":
      return { bg: BRAND_COLORS.errorBg, color: BRAND_COLORS.errorRed };
    default:
      return { bg: BRAND_COLORS.mutedBg, color: BRAND_COLORS.neutralText };
  }
};

const SectionCard = ({ section }: { section: SideDrawerSection }) => (
  <Box
    bg={BRAND_COLORS.white}
    borderRadius="2xl"
    overflow="hidden"
    w="full"
    boxShadow={STANDARD_SHADOWS.level1}
  >
    <Flex align="center" gap="10px" px={4} py={3}>
      {section.icon && (
        <Box
          p={2}
          borderRadius="full"
          bg={BRAND_COLORS.mutedBg}
          color={BRAND_COLORS.neutralText}
          flexShrink={0}
        >
          <Icon as={section.icon} boxSize="18px" />
        </Box>
      )}
      <Box>
        <Text
          fontWeight="700"
          fontSize="15px"
          color={BRAND_COLORS.neutralText}
          lineHeight="1.2"
        >
          {section.title}
        </Text>
        {section.subtitle ? (
          <Text fontSize="12px" color={BRAND_COLORS.grey} mt="2px">
            {section.subtitle}
          </Text>
        ) : null}
      </Box>
    </Flex>

    <Box
      borderTopWidth="1px"
      borderColor={BRAND_COLORS.neutralBorder}
      px={4}
      py={3}
    >
      <VStack align="stretch" gap={1}>
        {section.rows.map((row) => (
          <RowItem key={row.label} label={row.label} value={row.value} />
        ))}
      </VStack>
    </Box>
  </Box>
);

const SideDrawer = ({
  open,
  onOpenChange,
  eyebrow,
  title,
  badges,
  headerAction,
  headerChildren,
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  sections,
}: SideDrawerProps) => {
  const [internalTab, setInternalTab] = useState(tabs?.[0]?.value ?? "");

  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  const handleTabChange = (value: string) => {
    if (controlledActiveTab === undefined) setInternalTab(value);
    onTabChange?.(value);
  };

  const hasTabs = tabs && tabs.length > 0;

  const visibleSections = hasTabs
    ? (tabs.find((t) => t.value === activeTab)?.sections ?? [])
    : (sections ?? []);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement="end"
    >
      <Portal>
        <Drawer.Backdrop bg="blackAlpha.500" />
        <Drawer.Positioner>
          <Drawer.Content
            w={{ base: "100vw", md: "420px" }}
            maxW={{ base: "100vw", md: "420px" }}
            h="100dvh"
            bg={BRAND_COLORS.subtleBg}
            borderLeftRadius={{ base: 0, md: STANDARD_RADIUS.xl }}
            boxShadow={STANDARD_SHADOWS.level4}
          >
            {/* ── HEADER ──────────────────────────────────────────────────
                Vertical stack (column):
                  1. [eyebrow + title]          [headerAction] [×]  (top row)
                  2. [badges]
                  3. [headerChildren / buttons]
            ─────────────────────────────────────────────────────────── */}
            <Drawer.Header
              p={0}
              bg={BRAND_COLORS.white}
              borderBottomWidth="1px"
              borderColor={BRAND_COLORS.neutralBorder}
            >
              <Box
                px={STANDARD_SPACING.sm}
                pt={STANDARD_SPACING.sm}
                pb={STANDARD_SPACING.sm}
              >
                {/* Row 1: eyebrow + title on left, actions on right */}
                <Flex align="flex-start" justify="space-between" gap={2}>
                  <VStack align="start" gap="3px" flex={1} minW={0}>
                    {eyebrow ? (
                      <Text
                        color={BRAND_COLORS.grey}
                        fontSize="11px"
                        fontWeight="700"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                      >
                        {eyebrow}
                      </Text>
                    ) : null}
                    <Drawer.Title
                      color={BRAND_COLORS.neutralText}
                      fontSize="22px"
                      fontWeight="800"
                      lineHeight="1.15"
                    >
                      {title}
                    </Drawer.Title>
                  </VStack>

                  <HStack gap="4px" flexShrink={0} mt="2px">
                    {headerAction}
                    <Drawer.CloseTrigger asChild>
                      <CloseButton
                        size="sm"
                        borderRadius={STANDARD_RADIUS.full}
                        color={BRAND_COLORS.neutralText}
                        _hover={{ bg: BRAND_COLORS.mutedBg }}
                      />
                    </Drawer.CloseTrigger>
                  </HStack>
                </Flex>

                {/* Row 2: badges */}
                {badges && badges.length > 0 ? (
                  <HStack gap="6px" flexWrap="wrap" mt={STANDARD_SPACING.xs}>
                    {badges.map((badge, i) => {
                      const colors = getBadgeColors(badge.tone);
                      return (
                        <Badge
                          key={i}
                          bg={colors.bg}
                          color={colors.color}
                          borderWidth="1px"
                          borderColor={colors.color}
                          borderRadius={STANDARD_RADIUS.full}
                          px="10px"
                          py="4px"
                          fontWeight="700"
                          fontSize="11px"
                          display="flex"
                          alignItems="center"
                          gap="5px"
                        >
                          {badge.label}
                        </Badge>
                      );
                    })}
                  </HStack>
                ) : null}

                {/* Row 3: headerChildren (action buttons) */}
                {headerChildren ? (
                  <Box mt={4} w="full">
                    {headerChildren}
                  </Box>
                ) : null}
              </Box>
            </Drawer.Header>

            {/* ── BODY ────────────────────────────────────────────────────
                Tab bar (if provided) sits flush at the top, then sections.
            ─────────────────────────────────────────────────────────── */}
            <Drawer.Body p={0} overflowY="auto">
              {/* Tab bar — full-width, white, sticky feel */}
              {hasTabs ? (
                <Box
                  bg={BRAND_COLORS.white}
                  borderBottomWidth="1px"
                  borderColor={BRAND_COLORS.neutralBorder}
                  px={STANDARD_SPACING.sm}
                  overflowX="auto"
                  css={{
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                  }}
                >
                  <HStack gap={0}>
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab.value;
                      return (
                        <Button
                          key={tab.value}
                          variant="plain"
                          px={STANDARD_SPACING.sm}
                          py="10px"
                          h="auto"
                          minW="auto"
                          borderBottomWidth="3px"
                          borderBottomColor={
                            isActive ? BRAND_COLORS.primaryGreen : "transparent"
                          }
                          borderRadius="0"
                          color={
                            isActive
                              ? BRAND_COLORS.primaryGreen
                              : BRAND_COLORS.grey
                          }
                          fontWeight="700"
                          fontSize="14px"
                          onClick={() => handleTabChange(tab.value)}
                          flexShrink={0}
                        >
                          {tab.label}
                        </Button>
                      );
                    })}
                  </HStack>
                </Box>
              ) : null}

              {/* Section cards — driven by active tab when tabs are present */}
              <VStack
                align="stretch"
                gap={3}
                px={STANDARD_SPACING.sm}
                pt={STANDARD_SPACING.sm}
                pb={`calc(${STANDARD_SPACING.sm} + env(safe-area-inset-bottom))`}
              >
                {visibleSections.map((section) => (
                  <SectionCard key={section.title} section={section} />
                ))}
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default SideDrawer;
