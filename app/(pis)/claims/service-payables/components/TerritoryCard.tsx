"use client";

// One territory, as the dashboard offers it: the amount owed inside it, what
// that amount is made of, and a way in.
//
// The card is the button — the whole surface, lifting and greening its border on
// hover, exactly as the death dashboard's claim cards do. No chevron: the
// cursor already says it is clickable, and the space an arrow would take is
// worth more to the figure.
//
// What leads is the TERRITORY, not the money. A territory is picked by name —
// it is the one thing the user already knows before they arrive — and the
// amount is what tells them whether it is worth opening first. So the name
// takes the heading and the peso figure sits opposite it, which also keeps the
// two off each other's line when the name is "MINDANAO CENTRAL EAST TERRITORY".

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuBuilding2, LuCircleAlert, LuStore } from "react-icons/lu";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  discrepancyLabel,
  formatCSP,
  type TerritorySummary,
} from "../service-payables-data";

/** Accent for the discrepancy count — the same red the overview tile uses. */
const DEFICIENCY_ACCENT = "#e11d48";

/**
 * Accent for the franchise count — the amber this module marks a franchise in
 * everywhere else: the chip on `ChapelBillingCard`, the column on
 * `TerritoryDataTable`.
 */
const FRANCHISE_ACCENT = "#b45309";

/**
 * One count with its icon, along the card's foot.
 *
 * Takes the finished text rather than a count and a noun: "discrepancy" does
 * not pluralise the way "chapel" does, and a component that tried to would only
 * be wrong in a different place.
 */
function Stat({
  Icon,
  text,
  color = "gray.500",
}: {
  Icon: IconType;
  text: string;
  color?: string;
}) {
  return (
    <Flex align="center" gap={1.5} minW={0} color={color}>
      <Box flexShrink={0} display="flex" alignItems="center">
        <Icon size={13} />
      </Box>
      <Text fontSize="11px" fontWeight="600" truncate>
        {text}
      </Text>
    </Flex>
  );
}

/** "1 chapel" / "4 chapels". */
const plural = (count: number, noun: string) =>
  `${count} ${count === 1 ? noun : `${noun}s`}`;

export interface TerritoryCardProps {
  summary: TerritorySummary;
  /**
   * Where the card leads. Omit it and the card is a READING — it still reports
   * the territory, it just stops offering to be pressed: no pointer, no lift,
   * no place in the tab order. A card that looks like a button and does nothing
   * is worse than one that never claimed to be one.
   */
  onClick?: () => void;
}

export function TerritoryCard({ summary, onClick }: TerritoryCardProps) {
  const {
    territoryCode,
    description,
    ownedCount,
    franchiseCount,
    discrepantCount,
    totalCSP,
  } = summary;

  return (
    <Box
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      p={3.5}
      boxShadow="xs"
      /* A COLUMN THAT FILLS ITS CELL, so the foot below can be pinned to the
         bottom of it. The cards sit in a grid that stretches every card in a
         row to the tallest one; what it does NOT do is stretch the card's
         CONTENTS, so a one-line territory name left its rule and its counts
         floating halfway up a card as tall as "MINDANAO CENTRAL EAST
         TERRITORY" beside it, and the row of feet came out ragged.
         `h="100%"` is belt and braces — a grid item already stretches — and is
         what keeps this true if the card is ever wrapped or moved to a flex
         row. */
      display="flex"
      flexDirection="column"
      h="100%"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.18s ease"
      _hover={
        onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: "md",
              borderColor: BRAND_COLORS.primaryGreen,
            }
          : undefined
      }
    >
      {/* THE HEAD TAKES THE SLACK — `flex: 1 1 auto` — rather than the foot
          getting `mt="auto"`. Both put the foot on the floor, but an auto
          margin collapses to nothing on the tallest card in the row, so the gap
          above the rule would be 10px on some cards and 0 on others. Growing
          the head instead leaves that gap exactly where it was set.
          Its own children stay put: `align="flex-start"` was already keeping
          the name and the amount on the top line. */}
      <Flex justify="space-between" align="flex-start" gap={3} flex="1 1 auto">
        <Box minW={0} flex="1">
          {/* The code first, small — it is what the billing codes and claim
              numbers inside are prefixed with, so it is the handle a user
              already has for this territory. */}
          <Text
            fontSize="10px"
            fontWeight="700"
            color={BRAND_COLORS.primaryGreen}
            letterSpacing="0.08em"
          >
            {territoryCode}
          </Text>
          <Text
            fontSize="sm"
            fontWeight="700"
            color="gray.800"
            lineHeight="short"
            mt="1px"
          >
            {description}
          </Text>
        </Box>

        {/* The amount alone. A billing count used to sit under it, and it has
            gone with the column of the same name: a chapel IS a billing at this
            altitude, so the figure only ever repeated the chapel count in the
            foot — or contradicted it, in the one case the dashboard is not the
            place to explain. */}
        <Box textAlign="right" flexShrink={0}>
          <Text
            fontSize="sm"
            fontWeight="800"
            color={BRAND_COLORS.darkGreen}
            whiteSpace="nowrap"
          >
            {formatCSP(totalCSP)}
          </Text>
        </Box>
      </Flex>

      {/* The foot: what the amount is made of. Ruled off, so the figures above
          read as the headline and these as the breakdown — and always on the
          bottom edge of the card, so a row of them reads as one line across.
          `flexShrink={0}`: when the counts wrap to two lines the foot keeps its
          height and the head gives instead, which is the one that has room. */}
      <Flex
        align="center"
        gap={3}
        mt={2.5}
        pt={2}
        flexShrink={0}
        borderTop="1px solid"
        borderColor="gray.100"
        wrap="wrap"
      >
        {/* TWO DISJOINT COUNTS THAT ADD UP (user-confirmed 2026-08-26).
            "Chapels" is `ownedCount`, not the territory's total — the total sat
            here beside the franchise figure, so a territory of three chapels
            all run by franchisees read "3 chapels · 3 franchise" and invited
            the reader to add them into six. Now it reads "3 franchise", and a
            territory of two owned and one franchised reads "2 chapels · 1
            franchise": two figures naming two different sets of chapels, whose
            sum is the territory.
            The TOTAL is not lost — it is the pair, and the table beside this
            view still carries all three as its own sortable columns, which is
            what a table is for. A card has one line of foot. */}
        {ownedCount > 0 && (
          <Stat Icon={LuBuilding2} text={plural(ownedCount, "chapel")} />
        )}
        {/* Each shown only when there are any, which is what makes the pair
            read as a breakdown rather than a form with blanks: an all-owned
            territory says "4 chapels" and nothing else, an all-franchised one
            says "3 franchise". Neither ever reports a zero. */}
        {franchiseCount > 0 && (
          <Stat
            Icon={LuStore}
            text={`${franchiseCount} franchise`}
            color={FRANCHISE_ACCENT}
          />
        )}
        {/* NO SERVICE COUNT (user-confirmed 2026-08-26). How many services a
            territory holds does not decide which one to open — the money above
            already says how big the work is, and the chapel counts say how many
            sittings it is broken into. It was a third figure competing with
            both. The workspace inside counts services, where it is the thing
            being worked. */}
        {/* ONE MARK, and only when there is one to make.
            It counted both kinds in one red figure, on the reasoning that
            "which kind decides nothing until a chapel is open". It decides
            something here too: a discrepancy is a plan that cannot be serviced
            until a record is corrected elsewhere, and a deficiency is a document
            in the post — ordinary work, done inside the billing, and not a fact
            about a TERRITORY. Only the first is reported at this altitude. */}
        {discrepantCount > 0 && (
          <Stat
            Icon={LuCircleAlert}
            text={discrepancyLabel(discrepantCount)}
            color={DEFICIENCY_ACCENT}
          />
        )}
      </Flex>
    </Box>
  );
}

export default TerritoryCard;
