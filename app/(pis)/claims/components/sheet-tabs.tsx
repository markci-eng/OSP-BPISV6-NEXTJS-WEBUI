"use client";

// THE PHONE SHEETS' TAB STRIP — the pills a bottom sheet switches its list on.
//
// Lifted out of `QueueSearchSheet` when the Planholder Detail sheet took tabs
// too (user, 2026-10-02: option B), so the two strips cannot drift.
//
// THE TABS FILL THE ROW WHEN THEY FIT, AND SCROLL WHEN THEY DO NOT (user,
// 2026-10-01: "make the width of the tabs dynamic to occupy the whole row", then
// "keep the scrolling row" for Service's six). Each grows to share the row and
// never shrinks below its label. The one on show is kept in view — after a
// swipe it may be off the strip.

import { useEffect, useRef } from "react";
import { chakra, Flex, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface SheetTab {
  key: string;
  label: string;
  /** Shown beside the label when given — a list's count. */
  count?: number;
}

export function SheetTabs({
  label,
  tabs,
  active,
  onChange,
}: {
  /** Names the strip for a screen reader. */
  label: string;
  tabs: SheetTab[];
  active?: string;
  onChange?: (key: string) => void;
}) {
  const refs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (!active) return;
    refs.current.get(active)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  return (
    <Flex
      role="tablist"
      aria-label={label}
      gap={1.5}
      overflowX="auto"
      mx={-4}
      px={4}
      css={{
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <chakra.button
            key={tab.key}
            ref={(el: HTMLButtonElement | null) => {
              if (el) refs.current.set(tab.key, el);
              else refs.current.delete(tab.key);
            }}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange?.(tab.key)}
            flex="1 0 auto"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
            h="36px"
            px={3}
            borderWidth="1px"
            borderRadius="full"
            borderColor={on ? BRAND_COLORS.darkGreen : "gray.200"}
            bg={on ? "#f4faf6" : "white"}
            color={on ? BRAND_COLORS.darkGreen : "gray.600"}
            fontSize="12.5px"
            fontWeight="600"
            whiteSpace="nowrap"
            cursor="pointer"
          >
            {tab.label}
            {tab.count !== undefined && (
              <Text
                as="span"
                fontSize="11px"
                fontWeight="700"
                color={on ? "green.600" : "gray.400"}
              >
                {tab.count}
              </Text>
            )}
          </chakra.button>
        );
      })}
    </Flex>
  );
}

export default SheetTabs;
