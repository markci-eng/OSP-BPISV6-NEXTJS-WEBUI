"use client";

// The COFP request rail — the left column's card, and what picks the plan
// holder shown beside it.
//
// It reads like the memo rail on the COFP list screen, and on purpose: a title,
// a search field, then a run of rows that scroll INSIDE the card. Capped height
// is the whole point of a rail — a branch with two hundred certificates must not
// make this column taller than the card it sits next to.
//
// The rows are the sibling module's own `CofpRequest` records, so the two
// screens are never listing two different ideas of what a request is.
//
// A ROW IS A NAME AND AN LPA NUMBER, nothing else (user, 2026-09-21). The status,
// the branch and the amount were on it and are not any more: they are all on the
// card the row opens, and a rail that repeats them is four things to read where
// the rail is only ever scanned for one — whose plan this is.
//
// THE ACTION BUTTONS ABOVE THE ROWS ARE TABS (user, 2026-09-22). Pressing one
// does not run anything: it picks which requests the rail lists, and the rows
// under it change to match. Generate is the one picked on arrival.
//
// Generate also puts a SECOND CARD under this one — `CofpDeficiencyListCard`,
// the accounts it cannot raise a certificate on. That list lived in this card
// briefly and is its own now: two jobs, two cards. The page stacks them.

import { useMemo, useState } from "react";
import { Box, Flex, Input, Menu, Portal, Text } from "@chakra-ui/react";
import {
  Ban,
  Check,
  Ellipsis,
  FileCheck,
  FilePlus,
  PackageCheck,
  Printer,
  Repeat,
  Search,
  Send,
  Undo2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PrimarySmButton, SecondarySmButton } from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import type { CofpRequest } from "../../cofp/data/types";
import type { CofpView } from "../data/types";
import { LIST_HEIGHT, ROW_GAP, RequestRow } from "./request-row";

interface CofpAction {
  view: CofpView;
  label: string;
  description: string;
  icon: LucideIcon;
}

// What a certificate can be put through, in the order it moves: raised,
// printed, transmitted, released — then the three ways one comes back. One
// button per {@link CofpView}, and the list each one opens is decided by
// `requestsFor` in the data module, not here.
const COFP_ACTIONS: CofpAction[] = [
  {
    view: "GENERATE",
    label: "Generate",
    description: "Raise certificates for fully paid accounts",
    icon: FilePlus,
  },
  {
    view: "FOR_PRINTING",
    label: "For Printing",
    description: "Certificates queued to be printed",
    icon: Printer,
  },
  {
    view: "PRINTED",
    label: "Printed",
    description: "Certificates already printed",
    icon: FileCheck,
  },
  {
    view: "BATCH_TRANSMITTAL",
    label: "Batch Transmittal",
    description: "Transmit printed certificates to a branch",
    icon: Send,
  },
  {
    view: "RELEASED",
    label: "Released",
    description: "Certificates handed over to the planholder",
    icon: PackageCheck,
  },
  {
    view: "REPLACEMENT",
    label: "Replacement",
    description: "Reissue a lost or damaged certificate",
    icon: Repeat,
  },
  {
    view: "RETURN",
    label: "Return",
    description: "Send a certificate back to the office",
    icon: Undo2,
  },
  {
    view: "CONFISCATED",
    label: "Confiscated",
    description: "Certificates taken back from a planholder",
    icon: Ban,
  },
];

// The rail is 360px wide, so the row has room for two of the eight and hands
// them all to the "More" menu — which holds every one either way, so nothing is
// reachable only at one width.
//
// GENERATE HOLDS THE FIRST SLOT, always: it is the view the screen opens on and
// the one a user comes back to, so it does not move.
const [GENERATE_ACTION, ...OTHER_ACTIONS] = COFP_ACTIONS;

// The second slot is WHICHEVER OTHER VIEW WAS PICKED LAST (user, 2026-09-22) —
// picking one from the menu puts it in the row rather than leaving the row
// showing a view nobody chose. For Printing is what it holds on arrival, the
// step after Generate.
const DEFAULT_SECOND_VIEW = OTHER_ACTIONS[0].view;

const actionFor = (view: CofpView): CofpAction =>
  COFP_ACTIONS.find((action) => action.view === view) ?? GENERATE_ACTION;

export interface CofpRequestListCardProps {
  requests: CofpRequest[];
  /** Which action's list the rows are — the button drawn as pressed. */
  view: CofpView;
  onViewChange: (view: CofpView) => void;
  /** The row drawn as picked. */
  selectedId?: string;
  onSelect: (request: CofpRequest) => void;
}

export function CofpRequestListCard({
  requests,
  view,
  onViewChange,
  selectedId,
  onSelect,
}: CofpRequestListCardProps) {
  const [query, setQuery] = useState("");

  // Which view the second button is. Every view except Generate passes through
  // here, so the row always holds the two views that can be reached without
  // opening the menu — and the picked one is always one of them.
  const [secondView, setSecondView] = useState<CofpView>(DEFAULT_SECOND_VIEW);

  // Picking Generate from the menu leaves the second button alone: it is the
  // first button's own view, and moving it into the second slot would take the
  // row down to one view and put the same one in it twice.
  const pickView = (next: CofpView) => {
    if (next !== GENERATE_ACTION.view) setSecondView(next);
    onViewChange(next);
  };

  const rowActions = [GENERATE_ACTION, actionFor(secondView)];

  // LPA number, name and CFP number — the three things a request is looked up
  // by. Matched on the raw string so a partial LPA finds its row.
  const matches = (request: CofpRequest, needle: string) =>
    [
      request.lpaNo,
      request.planholderName,
      request.cfpNumber,
      request.branchCode,
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return requests;
    return requests.filter((request) => matches(request, needle));
  }, [requests, query]);

  return (
    <Box
      // `white`, the ground the plan holder card is drawn on, rather than the
      // `bg` token this card used to take (user, 2026-09-22). The two sit side
      // by side and `bg` is the PAGE's surface — a card standing on the same
      // colour as the page has no face of its own, which showed as the rail
      // reading flat next to the card beside it. The rows inside were already
      // white, so this is also what stops the card being darker than its own
      // contents.
      bg="white"
      borderWidth="1px"
      borderColor="border.muted"
      // THE SAME CORNER THE PLAN HOLDER CARD TAKES (user, 2026-09-22). It was
      // `2xl`, which put a 16px curve next to that card's 5px one across a
      // 20px gap — two cards in one view that disagreed about what a card is.
      // Spelled as the shared token rather than as 5px, so it keeps agreeing
      // after the next change to it.
      borderRadius={SURFACE_RADIUS}
      shadow="xs"
      p={4}
      display="flex"
      flexDirection="column"
      // No cap of its own any more: the list inside is a fixed five rows, so
      // the card is the height of its own contents whatever the branch holds.
      overflow="hidden"
    >
      {/* The actions stand where the card's heading used to (user, 2026-09-21).
          A rail whose contents are self-evident does not need to be told what it
          is, and the row it makes room for is the one on the COFP list header —
          two of them as buttons, every one of them under "More".

          THE PRESSED ONE IS SOLID, the other outlined: the kit's primary and
          secondary small buttons are the same button in its two variants, so a
          tab strip out of them costs no styling of its own. */}
      <Flex align="center" gap={2} mb={3} flexWrap="wrap" flexShrink={0}>
        {rowActions.map((action) => {
          const Button =
            action.view === view ? PrimarySmButton : SecondarySmButton;
          return (
            <Button
              key={action.view}
              aria-pressed={action.view === view}
              onClick={() => pickView(action.view)}
            >
              <action.icon size={16} />
              {action.label}
            </Button>
          );
        })}

        {/* A DROPDOWN, not the bottom sheet the shared `ActionButtons` opens
            (user, 2026-09-22) — the same call the death claim's rail makes. A
            sheet slides up and takes the window over, which is right for a
            thumb and wrong for a button in a rail with a pointer already on
            it. The menu opens where the button is.

            It never draws as pressed: what is picked from it takes the second
            slot, so the pressed button is always one of the two in the row. */}
        <Menu.Root
          positioning={{ placement: "bottom-start" }}
          onSelect={({ value }) => pickView(value as CofpView)}
        >
          <Menu.Trigger asChild>
            <SecondarySmButton>
              <Ellipsis size={16} />
              More
            </SecondarySmButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="248px">
                {COFP_ACTIONS.map(
                  ({ view: itemView, label, icon: Icon, description }) => {
                    const current = itemView === view;
                    return (
                      <Menu.Item
                        key={itemView}
                        value={itemView}
                        py={2}
                        bg={current ? "#f4faf6" : undefined}
                      >
                        <Flex align="center" gap={2.5} minW={0} flex="1">
                          <Box color={BRAND_COLORS.darkGreen} flexShrink={0}>
                            <Icon size={15} />
                          </Box>
                          <Box minW={0} flex="1">
                            <Text fontSize="sm" color="gray.800">
                              {label}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {description}
                            </Text>
                          </Box>
                          {/* The one the rows are already showing, so a user
                              opening the menu to find out sees it at once. */}
                          {current && (
                            <Box color={BRAND_COLORS.darkGreen} flexShrink={0}>
                              <Check size={15} />
                            </Box>
                          )}
                        </Flex>
                      </Menu.Item>
                    );
                  },
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>

      {/* Same search field the memo rail uses — icon, bare input, clear. */}
      <Flex
        align="center"
        gap={2}
        mb={3}
        px={3}
        h="36px"
        flexShrink={0}
        borderWidth="1px"
        borderColor="border.muted"
        borderRadius="lg"
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
          placeholder="Search LPA, name, or CFP no..."
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
        />
        {query && (
          <Box
            as="button"
            onClick={() => setQuery("")}
            color="gray.400"
            flexShrink={0}
            display="flex"
            aria-label="Clear request search"
            _hover={{ color: "gray.600" }}
          >
            <X size={14} />
          </Box>
        )}
      </Flex>

      {/* THE LIST THE ACTION OPENS, and the only one in this card: the
          accounts with a deficiency are a card of their own below it.

          FIVE ROWS TALL, exactly, whether it holds three or forty — the same
          height the deficiency card's list takes, so the two read as one
          system rather than two lists that happen to sit together. */}
      <Flex
        direction="column"
        gap={`${ROW_GAP}px`}
        h={`${LIST_HEIGHT}px`}
        flexShrink={0}
        overflowY="auto"
      >
        {visible.length === 0 && (
          <Text fontSize="sm" color="gray.400" px={1} py={6} textAlign="center">
            {query
              ? `No request matches “${query}”.`
              : "Nothing to list under this action."}
          </Text>
        )}

        {visible.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            active={request.id === selectedId}
            onClick={() => onSelect(request)}
          />
        ))}
      </Flex>
    </Box>
  );
}

export default CofpRequestListCard;
