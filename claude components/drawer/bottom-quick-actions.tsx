"use client";

import React from "react";
import {
  Box,
  CloseButton,
  Drawer,
  HStack,
  Icon,
  Portal,
  Separator,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuickAction = {
  icon: IconType;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  iconBg?: string;
  iconColor?: string;
};

export type QuickActionsHeaderCardProps = {
  initials?: string;
  avatarBg?: string;
  label: string;
  meta?: string;
  trailing?: React.ReactNode;
};

export type BottomQuickActionsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  headerSlot?: React.ReactNode;
  actions?: QuickAction[];
  children?: React.ReactNode;
};

// ─── Motion ───────────────────────────────────────────────────────────────────

const MotionBox = motion(Box);
const SHEET_CLOSE_THRESHOLD = 120;

// ─── QuickActionsHeaderCard ───────────────────────────────────────────────────

export const QuickActionsHeaderCard = React.memo(
  ({ initials, avatarBg, label, meta, trailing }: QuickActionsHeaderCardProps) => (
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
          bg={avatarBg ?? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"}
          color="#2e7d32"
          flexShrink={0}
          boxShadow="0 2px 8px rgba(56,142,60,0.20)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {initials ? (
            <Text fontSize="14px" fontWeight="700" color="#2e7d32" lineHeight="1">
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
          boxShadow: "0 6px 20px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset",
          bg: "rgba(255,255,255,0.90)",
        }}
        _active={{ transform: "scale(0.98)" }}
      >
        <Box
          p={2.5}
          borderRadius="xl"
          bg={action.iconBg ?? "linear-gradient(135deg, #f8fafc 0%, #f1f5f3 70%, #edf2f7 100%)"}
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
  children,
}: BottomQuickActionsProps) => {
  const isDesktop = useBreakpointValue({ base: false, md: true }) ?? false;

  const motionInitial = isDesktop ? { x: 400, opacity: 0 } : { y: 500, opacity: 0 };
  const motionAnimate = isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 };
  const motionExit = isDesktop ? { x: 400, opacity: 0 } : { y: 500, opacity: 0 };

  const dragProps = isDesktop
    ? {
        drag: "x" as const,
        dragDirectionLock: true,
        dragConstraints: { left: 0, right: 0 },
        dragElastic: { left: 0, right: 0.35 },
        onDragEnd: (_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
          if (info.velocity.x > 500 || info.offset.x > SHEET_CLOSE_THRESHOLD) {
            onOpenChange(false);
          }
        },
      }
    : {
        drag: "y" as const,
        dragDirectionLock: true,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.35 },
        onDragEnd: (_: unknown, info: { velocity: { y: number }; point: { y: number } }) => {
          if (info.velocity.y > 500 || info.point.y > SHEET_CLOSE_THRESHOLD) {
            onOpenChange(false);
          }
        },
      };

  const containerStyle: React.CSSProperties = isDesktop
    ? {
        position: "relative",
        background: "rgba(248, 249, 251, 0.92)",
        backdropFilter: "blur(36px) saturate(200%)",
        WebkitBackdropFilter: "blur(36px) saturate(200%)",
        width: "400px",
        maxWidth: "90vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "-28px 0 80px rgba(0,0,0,0.18), -1px 0 0 rgba(255,255,255,0.65) inset",
        borderLeft: "1px solid rgba(255,255,255,0.55)",
      }
    : {
        position: "relative",
        background: "rgba(248, 249, 251, 0.90)",
        backdropFilter: "blur(36px) saturate(200%)",
        WebkitBackdropFilter: "blur(36px) saturate(200%)",
        borderTopLeftRadius: "28px",
        borderTopRightRadius: "28px",
        maxHeight: "88vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -28px 80px rgba(0,0,0,0.20), 0 -1px 0 rgba(255,255,255,0.65) inset",
        borderTop: "1px solid rgba(255,255,255,0.55)",
      };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement={isDesktop ? "end" : "bottom"}
    >
      <Portal>
        <Drawer.Backdrop
          bg="blackAlpha.400"
          backdropFilter="blur(3px) saturate(150%)"
        />

        <Drawer.Positioner>
          <Drawer.Content asChild bg="transparent" shadow="none">
            <MotionBox
              initial={motionInitial}
              animate={motionAnimate}
              exit={motionExit}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              {...dragProps}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={containerStyle}
            >
              {/* Gradient depth layer */}
              <Box
                position="absolute"
                inset={0}
                bg={
                  isDesktop
                    ? "linear-gradient(200deg, rgba(255,255,255,0.94) 0%, rgba(243,246,250,0.78) 100%)"
                    : "linear-gradient(160deg, rgba(255,255,255,0.94) 0%, rgba(243,246,250,0.78) 100%)"
                }
                pointerEvents="none"
                zIndex={0}
              />

              {/* Content */}
              <Box
                position="relative"
                zIndex={1}
                display="flex"
                flexDirection="column"
                flex={1}
                minH={0}
              >
                {/* Drag handle */}
                {isDesktop ? (
                  <Box
                    position="absolute"
                    left="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    w="4px"
                    h="40px"
                    bg="gray.300"
                    borderRadius="full"
                    opacity={0.45}
                    pointerEvents="none"
                  />
                ) : (
                  <Box pt={3} pb={1} display="flex" justifyContent="center">
                    <Box w="38px" h="4px" bg="gray.300" borderRadius="full" opacity={0.55} />
                  </Box>
                )}

                {/* Sheet label */}
                <Box px={6} pt={isDesktop ? 5 : 3} pb={1}>
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

                <Separator opacity={0.25} />

                {/* Actions or arbitrary body content */}
                <Drawer.Body
                  px={3}
                  pt={3}
                  pb={2}
                  flex={1}
                  minH={0}
                  overflowY="auto"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  {children ? (
                    children
                  ) : (
                    <VStack gap={2} align="stretch">
                      {headerSlot && (
                        <Box px={1} pb={2}>
                          {headerSlot}
                        </Box>
                      )}
                      {(actions ?? []).map((action, i) => (
                        <ActionItem
                          key={i}
                          action={action}
                          onClose={() => onOpenChange(false)}
                        />
                      ))}
                    </VStack>
                  )}
                </Drawer.Body>

                {/* Footer hint */}
                <Box px={6} pt={2} pb={isDesktop ? 8 : 6}>
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    {isDesktop ? "Swipe right to dismiss" : "Swipe down to dismiss"}
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
