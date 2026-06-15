"use client";

import React from "react";
import {
  Box,
  Drawer,
  Portal,
  HStack,
  VStack,
  Flex,
  Icon,
  CloseButton,
  Text,
} from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import type { IconType } from "react-icons";
import Link from "next/link";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuickAction = {
  /** React Icons icon component */
  icon: IconType;
  /** Primary action label */
  label: string;
  /** Optional supporting text below the label */
  description?: string;
  /** Called when the item is tapped (can be combined with href) */
  onClick?: () => void;
  /** Wrap the item in a Next.js Link */
  href?: string;
  /** Icon bubble background — defaults to brand muted gray */
  iconBg?: string;
  /** Icon fill color — defaults to brand neutral text */
  iconColor?: string;
};

export type QuickActionsHeaderCardProps = {
  /** Short initials shown in the avatar circle (1–3 chars) */
  initials?: string;
  /** Avatar circle background — defaults to brand dark green */
  avatarBg?: string;
  /** Bold primary label (e.g. a name or record title) */
  label: string;
  /** Dimmer supporting line (e.g. "ID #SP-10293 · Life Plan") */
  meta?: string;
  /** Optional trailing slot (e.g. a badge or icon) */
  trailing?: React.ReactNode;
};

export type BottomQuickActionsProps = {
  /** Controls open state */
  open: boolean;
  /** Called on close or backdrop tap */
  onOpenChange: (open: boolean) => void;
  /** Sheet heading — defaults to "Quick actions" */
  title?: string;
  /** Muted subtext below the title */
  subtitle?: string;
  /**
   * Optional context card rendered between the title bar and the action list.
   * Use `QuickActionsHeaderCard` for the standard "acting on which record" pattern,
   * or pass any ReactNode.
   */
  headerSlot?: React.ReactNode;
  /** The ordered list of actions */
  actions: QuickAction[];
};

// ─── Design tokens ────────────────────────────────────────────────────────────

const SHEET_BG = BRAND_COLORS.white;
const DRAG_COLOR = BRAND_COLORS.neutralBorder;
const ITEM_BG = BRAND_COLORS.white;
const ITEM_HOVER_BG = BRAND_COLORS.subtleBg;
const ITEM_ACTIVE_BG = BRAND_COLORS.mutedBg;
const ITEM_BORDER = BRAND_COLORS.neutralBorder;
const DEFAULT_ICON_BG = BRAND_COLORS.mutedBg;
const DEFAULT_ICON_COLOR = BRAND_COLORS.neutralText;
const AVATAR_DEFAULT_BG = BRAND_COLORS.darkGreen;
const HEADER_CARD_BG = BRAND_COLORS.subtleBg;
const HEADER_CARD_BORDER = BRAND_COLORS.neutralBorder;
const TITLE_COLOR = BRAND_COLORS.neutralText;
const SUBTITLE_COLOR = BRAND_COLORS.grey;
const LABEL_COLOR = BRAND_COLORS.neutralText;
const DESC_COLOR = BRAND_COLORS.grey;
const CHEVRON_COLOR = BRAND_COLORS.ashWhite;

// ─── QuickActionsHeaderCard ───────────────────────────────────────────────────

/**
 * Convenience header card for showing which record the actions apply to.
 * Pass this to `BottomQuickActions` via the `headerSlot` prop.
 */
export const QuickActionsHeaderCard = React.memo(
  ({
    initials,
    avatarBg = AVATAR_DEFAULT_BG,
    label,
    meta,
    trailing,
  }: QuickActionsHeaderCardProps) => (
    <HStack
      gap={STANDARD_SPACING.sm}
      px={STANDARD_SPACING.sm}
      py="13px"
      bg={HEADER_CARD_BG}
      borderRadius={STANDARD_RADIUS.lg}
      borderWidth="1px"
      borderColor={HEADER_CARD_BORDER}
    >
      {initials && (
        <Flex
          w="40px"
          h="40px"
          borderRadius={STANDARD_RADIUS.full}
          bg={avatarBg}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Text
            fontSize="14px"
            fontWeight="700"
            color={BRAND_COLORS.white}
            lineHeight="1"
          >
            {initials}
          </Text>
        </Flex>
      )}
      <Box flex="1" minW={0}>
        <Text
          fontSize="15px"
          fontWeight="700"
          color={TITLE_COLOR}
          lineHeight="1.25"
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        >
          {label}
        </Text>
        {meta && (
          <Text
            fontSize="12px"
            color={SUBTITLE_COLOR}
            mt="2px"
            lineHeight="1.4"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            {meta}
          </Text>
        )}
      </Box>
      {trailing}
    </HStack>
  ),
);

// ─── Action item ──────────────────────────────────────────────────────────────

const ITEM_TRANSITION = {
  transition: "background 0.15s ease, transform 0.1s ease",
};

const ActionItem = React.memo(({ action }: { action: QuickAction }) => {
  const iconBg = action.iconBg ?? DEFAULT_ICON_BG;
  const iconColor = action.iconColor ?? DEFAULT_ICON_COLOR;

  const inner = (
    <HStack
      gap={STANDARD_SPACING.sm}
      px={STANDARD_SPACING.sm}
      py="14px"
      bg={ITEM_BG}
      borderRadius={STANDARD_RADIUS.lg}
      borderWidth="1px"
      borderColor={ITEM_BORDER}
      cursor="pointer"
      role="button"
      tabIndex={0}
      userSelect="none"
      boxShadow={STANDARD_SHADOWS.level1}
      onClick={action.onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") action.onClick?.();
      }}
      _hover={{ bg: ITEM_HOVER_BG }}
      _active={{ bg: ITEM_ACTIVE_BG, transform: "scale(0.99)" }}
      style={ITEM_TRANSITION}
    >
      <Flex
        w="40px"
        h="40px"
        borderRadius={STANDARD_RADIUS.md}
        bg={iconBg}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Icon as={action.icon} boxSize="20px" color={iconColor} />
      </Flex>

      <Box flex="1" minW={0}>
        <Text
          fontSize="15px"
          fontWeight="600"
          color={LABEL_COLOR}
          lineHeight="1.25"
        >
          {action.label}
        </Text>
        {action.description && (
          <Text
            fontSize="12px"
            color={DESC_COLOR}
            mt="2px"
            lineHeight="1.4"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            {action.description}
          </Text>
        )}
      </Box>

      <Icon
        as={LuChevronRight}
        boxSize="18px"
        color={CHEVRON_COLOR}
        flexShrink={0}
      />
    </HStack>
  );

  if (action.href) {
    return (
      <Link
        href={action.href}
        style={{ textDecoration: "none", display: "block" }}
      >
        {inner}
      </Link>
    );
  }
  return inner;
});

// ─── BottomQuickActions ───────────────────────────────────────────────────────

export const BottomQuickActions = ({
  open,
  onOpenChange,
  title = "Quick actions",
  subtitle,
  headerSlot,
  actions,
}: BottomQuickActionsProps) => {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="lg"
            borderBottomRadius="0"
            bg={SHEET_BG}
            maxW="480px"
            mx="auto"
            pb={`calc(${STANDARD_SPACING.sm} + env(safe-area-inset-bottom))`}
            boxShadow={STANDARD_SHADOWS.level4}
          >
            {/* Drag handle */}
            <Flex justify="center" pt="10px" pb="4px">
              <Box
                w="36px"
                h="4px"
                borderRadius={STANDARD_RADIUS.full}
                bg={DRAG_COLOR}
              />
            </Flex>

            {/* Header: title + subtitle + close button */}
            <Drawer.Header
              px={STANDARD_SPACING.sm}
              pt="12px"
              pb="0"
              borderBottomWidth="0"
            >
              <Flex align="flex-start" justify="space-between" gap="12px">
                <Box flex="1" minW={0}>
                  <Drawer.Title
                    fontSize="18px"
                    fontWeight="700"
                    color={TITLE_COLOR}
                    lineHeight="1.25"
                    letterSpacing="-0.02em"
                  >
                    {title}
                  </Drawer.Title>
                  {subtitle && (
                    <Text
                      fontSize="13px"
                      color={SUBTITLE_COLOR}
                      mt="3px"
                      fontWeight="400"
                      lineHeight="1.4"
                    >
                      {subtitle}
                    </Text>
                  )}
                </Box>
                <Drawer.CloseTrigger asChild mt="2px" flexShrink={0}>
                  <CloseButton
                    size="sm"
                    color={BRAND_COLORS.neutralText}
                    borderRadius={STANDARD_RADIUS.full}
                    _hover={{ bg: BRAND_COLORS.mutedBg }}
                  />
                </Drawer.CloseTrigger>
              </Flex>
            </Drawer.Header>

            {/* Body: optional header card + action list */}
            <Drawer.Body
              px={STANDARD_SPACING.sm}
              pt={STANDARD_SPACING.sm}
              pb="4px"
            >
              {headerSlot && <Box mb={STANDARD_SPACING.xs}>{headerSlot}</Box>}

              <VStack gap={STANDARD_SPACING.xs} align="stretch">
                {actions.map((action, i) => (
                  <ActionItem key={i} action={action} />
                ))}
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default BottomQuickActions;
