"use client";

// WHICH QUEUE THE PAGE IS SERVING, over the field that searches it.
//
// THE SLOT DEGRADES RATHER THAN DISAPPEARING. A processor owns one queue, so
// there is nothing to switch between and a one-segment switch is not a switch —
// it is a pressable-looking control that does nothing, which is worse than a
// label. With one stage this renders the stage's NAME and its count; with two it
// renders tabs. Same slot, same place, same meaning: what am I working, and how
// much of it is left.
//
// THE COUNT LIVES HERE AND NOWHERE ELSE. It was briefly in the page header —
// "Next in queue · 36 left" — and was removed with that line, because a number a
// processor cannot act on is chrome. On this row it is next to the control that
// acts on it, and for a supervisor with two stages it is the whole basis of the
// choice between them.
//
// AND THE CARD IS BACK, for the reason it went: a field standing alone is a
// control and an edge around one control makes furniture of it. Two things —
// a stage row and a field — are a block, and every other block in this rail has
// an edge.

import { Box, Flex, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  CARD_SHAPE,
  INSET_RADIUS,
  SURFACE_RADIUS,
} from "../../components/section-card";
import { SearchBar } from "../../components/search-bar";

/** One queue the page can serve. */
export interface Stage {
  key: string;
  /** Short enough for a tab — "For Process", "Verify". */
  label: string;
  /** How many claims are still waiting in it. */
  count: number;
}

function StageTab({
  stage,
  active,
  onSelect,
}: {
  stage: Stage;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Flex
      as="button"
      onClick={onSelect}
      aria-pressed={active}
      align="center"
      justify="center"
      gap={1.5}
      flex="1"
      py="5px"
      // Inset 3px inside the track — see `INSET_RADIUS`.
      borderRadius={INSET_RADIUS}
      bg={active ? "white" : "transparent"}
      boxShadow={active ? "xs" : undefined}
      cursor="pointer"
      transition="background-color 120ms ease"
      _hover={active ? undefined : { bg: "blackAlpha.50" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "2px",
      }}
    >
      <Text
        fontSize="xs"
        fontWeight={active ? "700" : "600"}
        color={active ? BRAND_COLORS.darkGreen : "gray.600"}
        truncate
      >
        {stage.label}
      </Text>
      <Text
        fontSize="xs"
        fontWeight="600"
        color={active ? BRAND_COLORS.darkGreen : "gray.400"}
      >
        {stage.count}
      </Text>
    </Flex>
  );
}

export function StageCard({
  stages,
  active,
  onStageChange,
  query,
  onQueryChange,
  onSearch,
}: {
  /** The queues this user owns. One for a processor; two for a supervisor. */
  stages: Stage[];
  active: string;
  onStageChange: (key: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  /** Running the search — the magnifier, and Enter. */
  onSearch: () => void;
}) {
  const current = stages.find((stage) => stage.key === active) ?? stages[0];
  const single = stages.length < 2;

  return (
    <Box {...CARD_SHAPE} bg="white" px={4} py={3}>
      {single ? (
        // ONE STAGE — a heading, not a control. See the note at the top.
        <Flex align="baseline" justify="space-between" gap={3} mb={2.5}>
          <Text
            fontSize="10px"
            fontWeight="700"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="gray.400"
            truncate
          >
            {current?.label}
          </Text>
          <Text fontSize="xs" fontWeight="700" color="gray.600" flexShrink={0}>
            {current?.count}
          </Text>
        </Flex>
      ) : (
        // TWO OR MORE — tabs, in a track, so the pair reads as one choice
        // rather than as two buttons that happen to be adjacent.
        <Flex
          gap={1}
          p="3px"
          mb={2.5}
          bg="gray.100"
          borderRadius={SURFACE_RADIUS}
          role="tablist"
          aria-label="Queue"
        >
          {stages.map((stage) => (
            <StageTab
              key={stage.key}
              stage={stage}
              active={stage.key === current?.key}
              onSelect={() => onStageChange(stage.key)}
            />
          ))}
        </Flex>
      )}

      {/* THE AREA'S OWN FIELD — the kit's `LookupField` trigger to the number,
          which is why it matches the plan holder lookup a column away. The
          magnifier is a button because this search GOES somewhere: it opens the
          queue on what was typed. */}
      <SearchBar
        value={query}
        onChange={onQueryChange}
        label="Search the queue"
        placeholder="Search by claim no., LPA, or name"
        onSearch={onSearch}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSearch();
          }
        }}
      />
    </Box>
  );
}

export default StageCard;
