"use client";

// Master/detail layout shared by the accounts-management screens (Return of
// Premium, Reinstatement): the list on the left, the selected record on the
// right, and a floating button on the seam between the sidebar and the list
// that slides the list out of view and back.

import { useState, type ReactNode } from "react";
import { Box, Grid } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// How long the list takes to slide out of, or back into, view.
const LIST_SLIDE_MS = 350;
const LIST_SLIDE = `${LIST_SLIDE_MS}ms ease-in-out`;

type CollapsibleListLayoutProps = {
  /** The list card, shown in the left column. */
  list: ReactNode;
  /** The details panel, shown in the right column. */
  children: ReactNode;
  /** Whether the list starts shown on desktop. Defaults to true. */
  defaultListVisible?: boolean;
};

export function CollapsibleListLayout({
  list,
  children,
  defaultListVisible = true,
}: CollapsibleListLayoutProps) {
  // Hiding the list gives the details panel the full width.
  const [listVisible, setListVisible] = useState(defaultListVisible);

  return (
    // Hiding the list slides it out while its column and the gap shrink to
    // nothing. Both states keep two tracks so the browser can animate between
    // them. The grid is a size container so the list can hold its open width
    // while its column narrows.
    <Grid
      templateColumns={{
        base: "minmax(0, 1fr)",
        lg: listVisible
          ? "minmax(0, 26fr) minmax(0, 74fr)"
          : "minmax(0, 0fr) minmax(0, 100fr)",
      }}
      rowGap={5}
      columnGap={{ base: 5, lg: listVisible ? 5 : 0 }}
      alignItems="start"
      position="relative"
      containerType="inline-size"
      transition={`grid-template-columns ${LIST_SLIDE}, column-gap ${LIST_SLIDE}`}
      _motionReduce={{ transition: "none" }}
    >
      {/* Floating list toggle on the seam between the sidebar and the list.
          The rail spans the grid's height so the button can stick in view
          while the details panel scrolls. Desktop only: below lg the list is
          stacked above the details, so there is nothing to make room for. */}
      <Box
        display={{ base: "none", lg: "block" }}
        position="absolute"
        top={0}
        bottom={0}
        left="-20px"
        w="40px"
        zIndex={2}
        pointerEvents="none"
      >
        <Box
          as="button"
          aria-label={listVisible ? "Hide list" : "Show list"}
          aria-expanded={listVisible}
          title={listVisible ? "Hide list" : "Show list"}
          onClick={() => setListVisible((visible) => !visible)}
          position="sticky"
          top="45vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxSize="40px"
          borderRadius="full"
          bg="green.600"
          color="white"
          borderWidth="3px"
          borderColor="white"
          boxShadow="0 4px 12px rgba(22, 101, 52, 0.35)"
          cursor="pointer"
          pointerEvents="auto"
          transition="background 0.15s, transform 0.15s"
          _hover={{ bg: "green.700", transform: "scale(1.1)" }}
          _focusVisible={{ outline: "2px solid", outlineColor: "green.500" }}
        >
          {listVisible ? (
            <ChevronLeft size={22} strokeWidth={3} />
          ) : (
            <ChevronRight size={22} strokeWidth={3} />
          )}
        </Box>
      </Box>

      {/* Hidden rather than unmounted, so the list keeps its scroll position
          when it is shown again. Sticky on desktop so the list stays in reach
          while the details beside it are scrolled. Below lg there is no
          toggle, so the list always shows — even if it was hidden on desktop
          before the window was narrowed. */}
      <Box
        position={{ base: "static", lg: "sticky" }}
        top={{ lg: 4 }}
        overflow="clip"
        overflowClipMargin="8px"
      >
        {/* Pinned to the open column's width (26 of 100 parts, after the 20px
            gap) so the card slides instead of squashing. Made invisible only
            once it has slid out, so it drops out of the tab order without
            cutting the animation short. */}
        <Box
          w={{ base: "full", lg: "calc((100cqw - 20px) * 0.26)" }}
          transform={{
            lg: listVisible ? "translateX(0)" : "translateX(calc(-100% - 24px))",
          }}
          opacity={{ base: 1, lg: listVisible ? 1 : 0 }}
          visibility={{
            base: "visible",
            lg: listVisible ? "visible" : "hidden",
          }}
          transition={
            listVisible
              ? `transform ${LIST_SLIDE}, opacity ${LIST_SLIDE}, visibility 0s`
              : `transform ${LIST_SLIDE}, opacity ${LIST_SLIDE}, visibility 0s linear ${LIST_SLIDE_MS}ms`
          }
          _motionReduce={{ transition: "none" }}
        >
          {list}
        </Box>
      </Box>

      {children}
    </Grid>
  );
}
