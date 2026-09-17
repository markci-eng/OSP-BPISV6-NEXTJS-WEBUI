"use client";

// One person's territories, in the order they are tried.
//
// BUTTONS, NOT DRAG. `@dnd-kit` is a dependency and nothing in `app/` uses it
// yet; this list is at most thirteen rows and the moves it needs are "up one",
// "down one" and "make this the primary". Explicit controls do all three, work
// from the keyboard without a sensor to configure, and can be read by somebody
// who has never been told the rows are draggable. Drag can be layered on top of
// these later — it would call the same three store functions.
//
// PROMOTING IS ITS OWN CONTROL, not a matter of dragging to the top. Rank 1 is
// where somebody's work comes from every morning; ranks 2 and below only matter
// on the days the rank above runs dry. Those are different decisions and the
// row spells them differently.

import { Badge, Box, Button, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { NativeSelect } from "@chakra-ui/react";
import { EmptyStateCard } from "osp-ui-kit";
import { ArrowUp, ArrowDown, X } from "lucide-react";

import { CONTROL_HEIGHT } from "../../components/control-height";
import { FieldLabel } from "../../components/field-label";
import { SectionCard } from "../../components/section-card";
import type { TerritoryStanding } from "../territory-assignment-data";
import type { Assignment, ProcessorId } from "../territory-assignment-store";

export interface TerritoryLadderProps {
  processor: ProcessorId;
  ladder: Assignment[];
  /** Every territory, so a row can show its backlog and the picker its options. */
  standings: TerritoryStanding[];
  /** One line saying what this ladder would hand the processor right now. */
  preview: string;
  onAdd: (territoryCode: string) => void;
  onRemove: (territoryCode: string) => void;
  onMove: (territoryCode: string, direction: -1 | 1) => void;
}

export function TerritoryLadder({
  processor,
  ladder,
  standings,
  preview,
  onAdd,
  onRemove,
  onMove,
}: TerritoryLadderProps) {
  const byCode = new Map(standings.map((s) => [s.territoryCode, s]));
  const held = new Set(ladder.map((a) => a.territoryCode));
  const available = standings.filter((s) => !held.has(s.territoryCode));

  return (
    <VStack align="stretch" gap={3}>
      {/* THE KIT'S EMPTY STATE, not a warning of this screen's own. It was a
          dashed orange panel here, which said "something is wrong" — and an
          unassigned person is an ordinary state on a screen whose whole job is
          assigning them, not a fault. The kit also owns what an empty list
          looks like across the app, and this screen has no reason to disagree
          with the others. */}
      {ladder.length === 0 && (
        <EmptyStateCard
          title={`${processor} holds no territory`}
          description="They would sign in to an empty queue. The first territory added becomes their primary."
        />
      )}

      {ladder.map((a, i) => {
        const standing = byCode.get(a.territoryCode);
        const isPrimary = a.rank === 1;

        return (
          <Flex
            key={a.territoryCode}
            align="center"
            gap={3}
            borderWidth="1px"
            borderColor={isPrimary ? "var(--chakra-colors-primary)" : "gray.200"}
            bg={isPrimary ? "green.50" : "white"}
            borderRadius="lg"
            px={3}
            py={2.5}
          >
            {/* The rank is the whole point of the row, so it reads as a number
                rather than as a position in a list. */}
            <Flex
              w="22px"
              h="22px"
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius="md"
              bg={isPrimary ? "var(--chakra-colors-primary)" : "gray.100"}
              color={isPrimary ? "white" : "gray.600"}
              fontSize="11px"
              fontWeight="700"
            >
              {a.rank}
            </Flex>

            <Box minW={0} flex="1">
              <Text fontSize="sm" fontWeight="600" color="gray.800" lineClamp={1}>
                {standing?.description ?? a.territoryCode}
              </Text>
              <HStack gap={2} mt="2px">
                <Text fontSize="11px" color="gray.500">
                  {standing?.waitingCount ?? 0} waiting
                </Text>
                {isPrimary && (
                  <Badge size="xs" colorPalette="green" variant="subtle">
                    PRIMARY
                  </Badge>
                )}
                {standing?.isDormant && (
                  <Badge size="xs" colorPalette="gray" variant="subtle">
                    DORMANT
                  </Badge>
                )}
              </HStack>
            </Box>

            {/* Up, down, remove. Promoting to rank 1 is the arrow pressed until
                it gets there — at most a dozen ranks, and the same control the
                rest of the reordering uses. */}
            <HStack gap={1} flexShrink={0}>
              <Button
                size="xs"
                variant="ghost"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => onMove(a.territoryCode, -1)}
              >
                <ArrowUp size={14} />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                aria-label="Move down"
                disabled={i === ladder.length - 1}
                onClick={() => onMove(a.territoryCode, 1)}
              >
                <ArrowDown size={14} />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                colorPalette="red"
                aria-label="Remove territory"
                onClick={() => onRemove(a.territoryCode)}
              >
                <X size={14} />
              </Button>
            </HStack>
          </Flex>
        );
      })}

      {/* ── Add ──
          IN A CARD, because it is not another rung. The rows above it are a
          ranked list of what this person already holds; this is the one control
          that changes the list's membership rather than its order, and left
          bare under them it read as a fourth row with a dropdown in it. */}
      <Box pt={1}>
        <SectionCard>
          <FieldLabel htmlFor="ladder-add">Add a territory</FieldLabel>
          <NativeSelect.Root size="sm" w="full">
            <NativeSelect.Field
              id="ladder-add"
              h={CONTROL_HEIGHT}
              value=""
              onChange={(e) => {
                if (e.currentTarget.value) onAdd(e.currentTarget.value);
              }}
            >
              <option value="">
                {available.length === 0
                  ? "Holds every territory"
                  : "Select a territory"}
              </option>
            {/* HOW MANY STAFF HOLD IT, not how much is waiting in it. The
                question being answered at this control is "who should take
                this?", and a backlog figure does not help answer it — it is the
                same number whether five people are on the territory or nobody
                is.

                It also puts the coverage gap where the decision is made: a
                territory reading "0 assigned" has nobody on it at all, which is
                the strongest reason on this list to pick it. */}
              {available.map((s) => (
                <option key={s.territoryCode} value={s.territoryCode}>
                  {s.description} ({s.primaries.length + s.fallbacks.length}{" "}
                  assigned{s.isDormant ? ", dormant" : ""})
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </SectionCard>
      </Box>

      {/* ── What this ladder actually does ──
          A rank order does not explain itself. This line is the consequence:
          which territory the next pull comes out of, and what was empty above
          it. */}
      <Box
        borderTopWidth="1px"
        borderColor="gray.200"
        pt={3}
        mt={1}
      >
        <Text
          fontSize="9px"
          fontWeight="700"
          color="gray.400"
          letterSpacing="0.1em"
          mb={1}
        >
          AT SIGN-IN
        </Text>
        <Text fontSize="xs" color="gray.700">
          {preview}
        </Text>
      </Box>
    </VStack>
  );
}

export default TerritoryLadder;
