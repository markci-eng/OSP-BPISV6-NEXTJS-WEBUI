"use client";

import React from "react";
import {
  Box,
  Drawer,
  Portal,
  HStack,
  VStack,
  Text,
  Separator,
  CloseButton,
  Icon,
} from "@chakra-ui/react";
import { ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import Link from "next/link";

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
  /** Icon bubble background — defaults to subtle gradient */
  iconBg?: string;
  /** Icon fill color — defaults to brand green */
  iconColor?: string;
};

export type QuickActionsHeaderCardProps = {
  /** Short initials shown in the avatar circle (1–3 chars) */
  initials?: string;
  /** Avatar circle background — defaults to green gradient */
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

// ─── Motion ───────────────────────────────────────────────────────────────────

const MotionBox = motion(Box);
const SHEET_CLOSE_THRESHOLD = 120;

// ─── QuickActionsHeaderCard ───────────────────────────────────────────────────

export const QuickActionsHeaderCard = React.memo(
  ({
    initials,
    avatarBg,
    label,
    meta,
    trailing,
  }: QuickActionsHeaderCardProps) => (
    <Box
      p={4}
      borderRadius="2xl"
      bg="rgba(255,255,255,0.80)"
      backdropFilter="blur(14px)"
      border="1px solid rgba(0,0,0,0.055)"
      boxShadow="0 2px 14px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.85) inset"
    >
      <HStack gap={3} align="center">
        <Box
          p={2.5}
          borderRadius="full"
          bg={
            avatarBg ??
            "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
          }
          color="#2e7d32"
          flexShrink={0}
          boxShadow="0 2px 8px rgba(56,142,60,0.20)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {initials ? (
            <Text
              fontSize="14px"
              fontWeight="700"
              color="#2e7d32"
              lineHeight="1"
            >
              {initials}
            </Text>
          ) : (
            <User size={20} />
          )}
        </Box>

        <VStack align="start" gap={0.5} flex={1} minW={0}>
          <Text
            fontWeight="700"
            fontSize="sm"
            lineHeight="1.25"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {label}
          </Text>
          {meta && (
            <Text
              fontSize="xs"
              color="gray.500"
              lineHeight="1.3"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {meta}
            </Text>
          )}
        </VStack>

        {trailing}
      </HStack>
    </Box>
  ),
);

// ─── ActionItem ───────────────────────────────────────────────────────────────

const ActionItem = React.memo(
  ({ action, onClose }: { action: QuickAction; onClose: () => void }) => {
    const handleClick = () => {
      action.onClick?.();
      onClose();
    };

    const inner = (
      <HStack
        px={4}
        py={3.5}
        borderRadius="2xl"
        bg="rgba(255,255,255,0.68)"
        backdropFilter="blur(12px)"
        border="1px solid rgba(0,0,0,0.055)"
        boxShadow="0 1px 4px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.75) inset"
        transition="all 0.18s ease"
        cursor="pointer"
        onClick={handleClick}
        _hover={{
          transform: "translateY(-1px)",
          boxShadow:
            "0 6px 20px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset",
          bg: "rgba(255,255,255,0.90)",
        }}
        _active={{ transform: "scale(0.98)" }}
      >
        <Box
          p={2.5}
          borderRadius="xl"
          bg={
            action.iconBg ??
            "linear-gradient(135deg, #f8fafc 0%, #f1f5f3 70%, #edf2f7 100%)"
          }
          color={action.iconColor ?? "#2e7d32"}
          boxShadow="0 2px 6px rgba(46,125,50,0.10)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={action.icon} boxSize="16px" />
        </Box>

        <Box flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="600">
            {action.label}
          </Text>
          {action.description && (
            <Text
              fontSize="xs"
              color="gray.500"
              lineHeight="1.3"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {action.description}
            </Text>
          )}
        </Box>

        <Box color="gray.300" flexShrink={0}>
          <ChevronRight size={15} />
        </Box>
      </HStack>
    );

    if (action.href) {
      return (
        <Link
          href={action.href}
          onClick={handleClick}
          style={{ textDecoration: "none", display: "block", width: "100%" }}
        >
          {inner}
        </Link>
      );
    }
    return inner;
  },
);

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
        <Drawer.Backdrop
          bg="blackAlpha.400"
          backdropFilter="blur(3px) saturate(150%)"
        />

        <Drawer.Positioner>
          <Drawer.Content asChild borderTopRadius="4xl" bg="transparent" shadow="none">
            <MotionBox
              initial={{ y: 500, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 500, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={(_, info) => {
                const shouldClose =
                  info.velocity.y > 500 ||
                  info.point.y > SHEET_CLOSE_THRESHOLD;
                if (shouldClose) onOpenChange(false);
              }}
              style={{
                position: "relative",
                background: "rgba(248, 249, 251, 0.90)",
                backdropFilter: "blur(36px) saturate(200%)",
                WebkitBackdropFilter: "blur(36px) saturate(200%)",
                borderTopLeftRadius: "28px",
                borderTopRightRadius: "28px",
                maxHeight: "88vh",
                overflow: "hidden",
                boxShadow:
                  "0 -28px 80px rgba(0,0,0,0.20), 0 -1px 0 rgba(255,255,255,0.65) inset",
                borderTop: "1px solid rgba(255,255,255,0.55)",
              }}
            >
              {/* Gradient depth layer */}
              <Box
                position="absolute"
                inset={0}
                bg="linear-gradient(160deg, rgba(255,255,255,0.94) 0%, rgba(243,246,250,0.78) 100%)"
                pointerEvents="none"
                zIndex={0}
              />

              {/* Content */}
              <Box position="relative" zIndex={1}>
                {/* Drag handle */}
                <Box pt={3} pb={1} display="flex" justifyContent="center">
                  <Box
                    w="38px"
                    h="4px"
                    bg="gray.300"
                    borderRadius="full"
                    opacity={0.55}
                  />
                </Box>

                {/* Sheet label */}
                <Box px={6} pt={3} pb={1}>
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.400"
                    letterSpacing="0.10em"
                    textTransform="uppercase"
                  >
                    {title}
                  </Text>
                  {subtitle && (
                    <Text fontSize="xs" color="gray.400" mt={0.5}>
                      {subtitle}
                    </Text>
                  )}
                </Box>

                {/* Header slot (record card) */}
                {headerSlot && (
                  <Box px={4} pt={2} pb={3}>
                    {headerSlot}
                  </Box>
                )}

                <Separator opacity={0.25} />

                {/* Actions */}
                <Drawer.Body px={3} pt={3} pb={2}>
                  <VStack gap={2} align="stretch">
                    {actions.map((action, i) => (
                      <ActionItem
                        key={i}
                        action={action}
                        onClose={() => onOpenChange(false)}
                      />
                    ))}
                  </VStack>
                </Drawer.Body>

                {/* Footer hint */}
                <Box px={6} pt={2} pb={6}>
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    Swipe down to dismiss
                  </Text>
                </Box>
              </Box>

              {/* Close button */}
              <Drawer.CloseTrigger asChild>
                <CloseButton
                  position="absolute"
                  top="12px"
                  right="12px"
                  size="sm"
                  borderRadius="full"
                  bg="rgba(255,255,255,0.85)"
                  backdropFilter="blur(10px)"
                  shadow="md"
                  zIndex={2}
                />
              </Drawer.CloseTrigger>
            </MotionBox>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default BottomQuickActions;
