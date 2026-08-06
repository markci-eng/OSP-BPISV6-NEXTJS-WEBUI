"use client";

import { Box, Drawer, Flex, Text } from "@chakra-ui/react";
import { LuChevronLeft } from "react-icons/lu";

/**
 * A drawer header styled after the library page header — `PageScrollShell`
 * (osp-ui-kit) as `Page.Root` renders it on mobile: sticky translucent bar, a
 * green "<" on the left, title over description, and a trailing slot that holds
 * what `Page.ToolContent` would. The library's own back button navigates to the
 * parent route, which is wrong inside an overlay, so this one closes the drawer
 * instead — the look of a page, the behaviour of a drawer.
 *
 * Shared by every full-height drawer in the claims planholder area (the claim
 * request detail, the beneficiary form, the payee form) so they cannot drift
 * apart: one bar, defined once.
 *
 * Renders `Drawer.Title`, so it must sit inside a `Drawer.Root` — unless
 * `asPage` is set, which is how the same bar is reused by content shown IN the
 * page rather than in an overlay (the desktop claim view). There is no drawer
 * around it there, and `Drawer.Title` outside a `Drawer.Root` throws.
 */
export function DrawerPageHeader({
  title,
  description,
  onBack,
  toolContent,
  asPage = false,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  onBack: () => void;
  toolContent?: React.ReactNode;
  /** Render outside a drawer — plain heading text, no `Drawer.Title`. */
  asPage?: boolean;
}) {
  const heading = (
    <Text
      as="h1"
      fontWeight="600"
      fontSize="16.5px"
      lineHeight="1.2"
      color="fg"
      letterSpacing="-0.01em"
      truncate
    >
      {title}
    </Text>
  );

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      flexShrink={0}
      px={2}
      pt="max(env(safe-area-inset-top, 0px), 12px)"
      pb={3}
      bg="bg/80"
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor="blackAlpha.200"
      _dark={{ borderColor: "whiteAlpha.200" }}
    >
      <Flex align="center" gap={2}>
        <Flex
          as="button"
          align="center"
          gap="2px"
          onClick={onBack}
          aria-label="Go back"
          cursor="pointer"
          color="green.600"
          _dark={{ color: "green.400" }}
          fontSize="14px"
          fontWeight="600"
          letterSpacing="0.01em"
          flexShrink={0}
          px={1}
          py={1}
          mr={1}
          borderRadius="md"
          _hover={{ bg: "green.50" }}
          _active={{ transform: "scale(0.93)" }}
          transition="all 0.14s ease"
          userSelect="none"
        >
          <LuChevronLeft size={20} strokeWidth={2.5} />
        </Flex>

        <Box flex="1" minW={0}>
          {asPage ? heading : <Drawer.Title asChild>{heading}</Drawer.Title>}
          {description && (
            <Text fontSize="12.5px" color="fg.muted" mt="2px" truncate>
              {description}
            </Text>
          )}
        </Box>

        {toolContent && <Box mr={3}>{toolContent}</Box>}
      </Flex>
    </Box>
  );
}

export default DrawerPageHeader;
