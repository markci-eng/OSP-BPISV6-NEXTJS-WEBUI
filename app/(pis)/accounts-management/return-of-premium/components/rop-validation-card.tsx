"use client";

// Validation — beside the ROP Schedule card.
//
// Two checklists of findings, one against the payout and one against the IDs
// and signature. A ticked item is a finding: something wrong with the request,
// not a requirement met. Each list has its own search, because a processor
// looks for a finding by a word in it ("dormant", "notarized") rather than by
// reading down the list.
//
// Ticks are local state only; there is nowhere to persist them to yet. The
// panel keys this card by record, so moving to another request starts clean.

import { useMemo, useState, type ReactNode } from "react";
import { Box, Checkbox, Flex, Input, Text } from "@chakra-ui/react";
import { CircleCheck, Search, ShieldCheck, X } from "lucide-react";

import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import { KIT_BORDER } from "../../components/section-card";
import {
  ID_SIGNATURE_VALIDATION_ITEMS,
  PAYOUT_VALIDATION_ITEMS,
} from "../data/data";

function ValidationList({
  icon,
  title,
  items,
  onCheckedChange,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  /** The ticked items, in list order, whenever a tick changes. */
  onCheckedChange?: (checked: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => item.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const toggle = (item: string) => {
    const next = new Set(checked);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setChecked(next);
    onCheckedChange?.(items.filter((i) => next.has(i)));
  };

  return (
    <Flex
      direction="column"
      flex="1"
      minW={0}
      minH={0}
      bg="white"
      borderWidth="1px"
      borderColor={KIT_BORDER}
      borderRadius={SURFACE_RADIUS}
      overflow="hidden"
    >
      <Flex align="center" gap={2} px={4} pt={3} pb={2}>
        <Box display="flex" flexShrink={0}>
          {icon}
        </Box>
        <Text
          fontSize="xs"
          fontWeight="bold"
          color="gray.800"
          textTransform="uppercase"
          letterSpacing="wide"
          truncate
        >
          {title}
        </Text>
        {checked.size > 0 && (
          <Text
            ml="auto"
            flexShrink={0}
            fontSize="xs"
            fontWeight="600"
            color="red.600"
          >
            {checked.size} flagged
          </Text>
        )}
      </Flex>

      <Box px={4} pb={2}>
        <Flex
          align="center"
          gap={2}
          px={3}
          h="32px"
          borderWidth="1px"
          borderColor="border.muted"
          borderRadius={SURFACE_RADIUS}
          _focusWithin={{
            borderColor: "var(--chakra-colors-primary)",
            boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
          }}
        >
          <Box color="gray.400" flexShrink={0} display="flex">
            <Search size={14} />
          </Box>
          <Input
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search validation..."
            flex="1"
            h="full"
            px={0}
            border="none"
            bg="transparent"
            borderRadius="0"
            fontSize="sm"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
            _focusVisible={{ boxShadow: "none", outline: "none" }}
            aria-label={`Search ${title.toLowerCase()}`}
          />
          {query && (
            <Box
              as="button"
              onClick={() => setQuery("")}
              color="gray.400"
              flexShrink={0}
              display="flex"
              aria-label="Clear search"
              _hover={{ color: "gray.600" }}
            >
              <X size={14} />
            </Box>
          )}
        </Flex>
      </Box>

      {/* Scrolls inside the card: the row's height is set by the ROP Schedule
          card beside it, not by how many findings there are. */}
      <Flex
        direction="column"
        gap={3}
        flex="1"
        minH={0}
        maxH={{ base: "260px", lg: "none" }}
        overflowY="auto"
        px={4}
        py={2}
        borderTopWidth="1px"
        borderTopColor="border.muted"
      >
        {visible.length === 0 ? (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            No matching items.
          </Text>
        ) : (
          visible.map((item) => (
            <Checkbox.Root
              key={item}
              size="sm"
              alignItems="flex-start"
              checked={checked.has(item)}
              onCheckedChange={() => toggle(item)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control mt="2px" />
              <Checkbox.Label fontSize="sm" fontWeight="400" color="gray.700">
                {item}
              </Checkbox.Label>
            </Checkbox.Root>
          ))
        )}
      </Flex>
    </Flex>
  );
}

// No surface of its own: the panel draws the one card this shares with the
// ROP Schedule.
export interface RopValidationFindings {
  payout: string[];
  idSignature: string[];
}

export interface RopValidationCardProps {
  /** Every ticked finding, per list, whenever a tick changes. CSV uses it to
   *  write them into its Notes field. */
  onFindingsChange?: (findings: RopValidationFindings) => void;
}

export function RopValidationCard({
  onFindingsChange,
}: RopValidationCardProps = {}) {
  // The last report from each list, so a tick in one sends both.
  const [findings, setFindings] = useState<RopValidationFindings>({
    payout: [],
    idSignature: [],
  });

  const report = (key: keyof RopValidationFindings, checked: string[]) => {
    const next = { ...findings, [key]: checked };
    setFindings(next);
    onFindingsChange?.(next);
  };

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      gap={4}
      h="full"
      minW={0}
    >
      <ValidationList
        icon={<CircleCheck size={16} color="var(--chakra-colors-blue-600)" />}
        title="Payout Validation"
        items={PAYOUT_VALIDATION_ITEMS}
        onCheckedChange={(checked) => report("payout", checked)}
      />
      <ValidationList
        icon={<ShieldCheck size={16} color="var(--chakra-colors-green-600)" />}
        title="ID/Signature Validation"
        items={ID_SIGNATURE_VALIDATION_ITEMS}
        onCheckedChange={(checked) => report("idSignature", checked)}
      />
    </Flex>
  );
}

export default RopValidationCard;
