"use client";

// One territory, and who covers it. The other direction of the same table.
//
// THE QUESTION THIS ANSWERS IS "CENTRAL LUZON IS BACKING UP — WHO IS ON IT?",
// which reading one ladder at a time cannot: a territory's holders are spread
// across as many ladders as there are staff, and nothing in the staff view puts
// them side by side. Same rows underneath, read from the other end.
//
// NO REORDERING HERE, and that is not an omission. A rank belongs to a PERSON's
// ladder — it says where this territory sits among the ones they hold — so
// "move up" would mean reordering somebody's other territories from a screen
// that is not showing them. The rank is displayed because it decides who gets
// work first; changing it is the staff tab's job, and the badge is a link back
// to that decision rather than a control.
//
// WHAT ADDING DOES, said plainly on screen: a territory joins the FOOT of that
// person's ladder, so they pick work from it only once everything above it is
// clear — unless they held nothing, in which case it becomes their primary.
// That is a real consequence of assigning from this side and the one thing a
// supervisor could reasonably get wrong here.

import { Badge, Box, Button, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { NativeSelect } from "@chakra-ui/react";
import { EmptyStateCard } from "osp-ui-kit";
import { X } from "lucide-react";

import { CONTROL_HEIGHT } from "../../components/control-height";
import { FieldLabel } from "../../components/field-label";
import { SectionCard } from "../../components/section-card";
import type { TerritoryStanding } from "../territory-assignment-data";
import type { Assignment, ProcessorId } from "../territory-assignment-store";

export interface TerritoryHoldersProps {
  territory: TerritoryStanding;
  /** Everyone holding it, primaries first. */
  holders: Assignment[];
  /** Everyone who could be added — staff not already on it. */
  available: ProcessorId[];
  onAdd: (processor: ProcessorId) => void;
  onRemove: (processor: ProcessorId) => void;
}

export function TerritoryHolders({
  territory,
  holders,
  available,
  onAdd,
  onRemove,
}: TerritoryHoldersProps) {
  const primaries = holders.filter((h) => h.rank === 1).length;

  return (
    <VStack align="stretch" gap={3}>
      {holders.length === 0 && (
        <EmptyStateCard
          title={`Nobody holds ${territory.description}`}
          description={
            territory.isDormant
              ? "Nothing can reach this queue from here, so it needs no one."
              : "Work here has no one to go to and falls through to overflow."
          }
        />
      )}

      {holders.map((h) => {
        const isPrimary = h.rank === 1;

        return (
          <Flex
            key={h.processor}
            align="center"
            gap={3}
            borderWidth="1px"
            borderColor={isPrimary ? "var(--chakra-colors-primary)" : "gray.200"}
            bg={isPrimary ? "green.50" : "white"}
            borderRadius="lg"
            px={3}
            py={2.5}
          >
            {/* Their rank FOR THIS TERRITORY — where it sits among the ones
                they hold, not their position in this list. */}
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
              {h.rank}
            </Flex>

            <Box minW={0} flex="1">
              <Text fontSize="sm" fontWeight="600" color="gray.800" lineClamp={1}>
                {h.processor}
              </Text>
              <HStack gap={2} mt="2px">
                <Text fontSize="11px" color="gray.500">
                  {isPrimary
                    ? "Starts here every morning"
                    : `Falls back to this at rank ${h.rank}`}
                </Text>
                {isPrimary && (
                  <Badge size="xs" colorPalette="green" variant="subtle">
                    PRIMARY
                  </Badge>
                )}
              </HStack>
            </Box>

            <Button
              size="xs"
              variant="ghost"
              colorPalette="red"
              aria-label={`Remove ${h.processor} from ${territory.description}`}
              onClick={() => onRemove(h.processor)}
              flexShrink={0}
            >
              <X size={14} />
            </Button>
          </Flex>
        );
      })}

      {/* ── Add ── */}
      <Box pt={1}>
        <SectionCard>
          <FieldLabel htmlFor="holders-add">Assign staff</FieldLabel>
          <NativeSelect.Root size="sm" w="full">
            <NativeSelect.Field
              id="holders-add"
              h={CONTROL_HEIGHT}
              value=""
              onChange={(e) => {
                if (e.currentTarget.value) onAdd(e.currentTarget.value);
              }}
            >
              <option value="">
                {available.length === 0
                  ? "Everyone holds this already"
                  : "Select a staff member"}
              </option>
              {available.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </SectionCard>
      </Box>

      {/* What the list above amounts to. Primaries are the number that matters:
          a territory with holders but no primary is covered on paper and
          uncovered in practice, because every one of them reaches it only after
          their own primary runs dry. */}
      <Box borderTopWidth="1px" borderColor="gray.200" pt={3} mt={1}>
        <Text
          fontSize="9px"
          fontWeight="700"
          color="gray.400"
          letterSpacing="0.1em"
          mb={1}
        >
          COVERAGE
        </Text>
        <Text fontSize="xs" color="gray.700">
          {territory.isDormant
            ? "Dormant — nothing raises work here in this queue, so no primary is needed."
            : primaries === 0
              ? holders.length === 0
                ? "No one at all. Everything here falls to overflow."
                : `${holders.length} can reach it, but none as their primary — each gets to it only after their own primary is clear.`
              : `${primaries} ${primaries === 1 ? "person starts" : "people start"} here, ${holders.length - primaries} more as a fallback.`}
        </Text>
      </Box>
    </VStack>
  );
}

export default TerritoryHolders;
