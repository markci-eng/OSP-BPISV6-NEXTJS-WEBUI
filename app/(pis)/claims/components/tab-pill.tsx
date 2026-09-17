"use client";

// A tab that IS its section's title — the pill the two-list sections switch on.
//
// Deliberately not a title with tabs under it. A section called Documents whose
// first tab is also called Documents names the same thing twice, eighteen pixels
// apart, and says there are two things there. So the tabs ARE the heading:
// whichever is on reads as the title of what is under it, and the one beside it
// is where the rest of the section went. It also saves the line the subtitle
// used, which in a bounded column is a row of the list.
//
// IN THE CLAIMS COMPONENTS FOLDER since 2026-09-11, and it was drawn inside
// `PlanholderDocuments` before that. The service record's documents section took
// the same heading on the same day — the death claim and the service payable are
// worked by the same people and list the same kind of thing — and a pill drawn in
// two files is a pill that drifts. This is `SectionTitle`'s counterpart: that one
// is the heading for a section with one list, this is the heading for a section
// with two.
//
// THE COUNT RIDES INSIDE THE PILL rather than in a badge of its own: two pills,
// two badges and an Add button come to more controls than a 380px column has room
// for, and the number is what a reader is checking the tab for anyway.

import { Box, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface TabPillProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

export function TabPill({ label, count, active, onClick }: TabPillProps) {
  return (
    <Box
      role="tab"
      aria-selected={active}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      flexShrink={0}
      px={2.5}
      py="5px"
      borderRadius="lg"
      borderWidth="1px"
      cursor="pointer"
      transition="all 0.15s ease"
      bg={active ? "#f4faf6" : "white"}
      borderColor={active ? BRAND_COLORS.darkGreen : "gray.200"}
      _hover={{ borderColor: active ? BRAND_COLORS.darkGreen : "gray.300" }}
    >
      <Text
        fontSize="xs"
        fontWeight="600"
        lineHeight="1.3"
        whiteSpace="nowrap"
        color={active ? BRAND_COLORS.darkGreen : "gray.600"}
      >
        {label}
        <Text as="span" ml={1.5} color={active ? "green.600" : "gray.400"}>
          {count}
        </Text>
      </Text>
    </Box>
  );
}

export default TabPill;
