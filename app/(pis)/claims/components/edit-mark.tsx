"use client";

// THE CLAIMS AREA'S "THIS WAS EDITED" MARK — one look for every edited field,
// a read-only label on the death claim or an input on service payables.
//
// ONE COLOUR, WHOEVER MADE THE EDIT (user, 2026-10-02: "make sure that the
// highlight is the same color"). Orange, at the 600 step so it passes as label
// text on white. Not green: green is the brand and already means "normal" on
// these cards (Insurable, the contact icon, the avatar ring), so a green edit
// disappears into them. Not red: red is danger here (Not Insurable, the revert
// hover). Who made the edit is said in words, in the tooltip and the list.
//
// THE MARK ADDS NO HEIGHT (user, same day: a strip, inline old values and
// tinted inputs made the card "bulky"). A field gets a coloured label and a dot
// after it. The card gets one round pencil icon in its header, beside the
// address/contact icon, only while something on it is edited. That icon
// lists the edits, and picking one scrolls to the field and rings it briefly.
//
// Both triggers of the list are always rendered and switched by CSS at `lg`, as
// `PlanholderCardHeader` does its contact icon — see `InfoLabel` for why.

import { useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Flex,
  HoverCard,
  IconButton,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuPenLine, LuUndo2 } from "react-icons/lu";
import { Tooltip } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { BottomSheet } from "./bottom-sheet";
import { TOOLTIP_SURFACE } from "./tooltip-surface";

/** The token, for Chakra props. */
export const EDIT_COLOR = "orange.600";
/** The same orange as a hex, for the flash, which is drawn outside Chakra. */
export const EDIT_HEX = "#C05621";
/** The pale wash under the flash ring and behind a hovered row. */
export const EDIT_SOFT = "#FFF4EC";

/**
 * The attribute a marked field carries so the header list can find it. The
 * value is the field's key — the same key the list's items carry.
 */
export const EDIT_FIELD_ATTR = "data-edit-field";

/** The dot after an edited label. */
export function EditDot() {
  return (
    <Box
      as="span"
      display="inline-block"
      boxSize="6px"
      borderRadius="full"
      bg={EDIT_COLOR}
      flexShrink={0}
      aria-hidden
    />
  );
}

/**
 * Scroll to an edited field and ring it for a moment.
 *
 * THE VISIBLE ONE. A field can be on the page twice — the desktop's pairs and
 * the phone's rows are both rendered and one is hidden by CSS — so this takes
 * the first that has a box. `fallback` is tried when the field has none showing:
 * a part of the name on a phone, say, lives in the details sheet, and the name
 * in the card header is where it shows instead.
 *
 * The ring goes round the whole label-and-value pair when the mark sits inside
 * one (`InfoLabel` tags itself), so it reads as the field and not the word.
 */
export function flashEditedField(key: string, fallback?: string) {
  const visible = (k: string) =>
    Array.from(
      document.querySelectorAll<HTMLElement>(`[${EDIT_FIELD_ATTR}="${k}"]`),
    ).find((el) => el.getClientRects().length > 0);
  const mark = visible(key) ?? (fallback ? visible(fallback) : undefined);
  if (!mark) return;
  const target = mark.closest<HTMLElement>("[data-info-label]") ?? mark;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });

  const radius = target.style.borderRadius;
  target.style.borderRadius = "6px";
  const ring = `0 0 0 4px ${EDIT_SOFT}, 0 0 0 5px ${EDIT_HEX}`;
  const gone = "0 0 0 4px transparent, 0 0 0 5px transparent";
  target
    .animate(
      [{ boxShadow: ring }, { boxShadow: ring, offset: 0.6 }, { boxShadow: gone }],
      { duration: reduced ? 2400 : 1600, easing: "ease-out" },
    )
    .finished.finally(() => {
      target.style.borderRadius = radius;
    });
}

/**
 * An INPUT that was edited: the field's own label goes orange with the dot after
 * it, and the box takes an orange edge. No tint behind it (user, 2026-10-02).
 *
 * Hovering shows what it was, with Revert while the form still takes edits. The
 * tooltip is the desktop's; a phone has the header's list, since a tooltip over
 * a field being typed into would sit on the keyboard's side of it.
 *
 * The floating-label fields draw their own `<label>`, so the colour and the dot
 * are put on it from out here rather than through a prop they do not have.
 */
export function EditedInput({
  edited,
  markKey,
  title,
  from,
  to,
  by,
  onRevert,
  children,
}: {
  edited: boolean;
  markKey: string;
  title: string;
  from: string;
  to: string;
  by: string;
  onRevert?: () => void;
  children: ReactNode;
}) {
  // ONE SHAPE, EDITED OR NOT. The field becomes edited on the first keystroke;
  // wrapping it only then would remount the input under the cursor and drop
  // the focus. So the wrapper is always there, and the tooltip is held shut
  // and the marks left off while there is nothing to say.
  const [open, setOpen] = useState(false);
  return (
    <Tooltip
      open={edited && open}
      onOpenChange={(e) => setOpen(e.open)}
      interactive
      openDelay={150}
      closeDelay={150}
      positioning={{ placement: "top-start" }}
      contentProps={{ ...TOOLTIP_SURFACE, maxW: "320px", display: { base: "none", lg: "block" } }}
      content={
        <VStack align="stretch" gap={1.5} minW="200px">
          <Flex align="center" justify="space-between" gap={3}>
            <Box minW={0}>
              <Text fontSize="xs" fontWeight="600" color={EDIT_COLOR}>
                {title}
              </Text>
              <Text fontSize="xs" color="gray.700">
                {from ? (
                  <>
                    <Text as="s" color="gray.400">
                      {from}
                    </Text>{" "}
                    → {to || "—"}
                  </>
                ) : (
                  <>added {to}</>
                )}
              </Text>
            </Box>
            {onRevert && (
              <Button
                size="2xs"
                variant="outline"
                flexShrink={0}
                color="gray.700"
                borderColor="gray.200"
                _hover={{ color: BRAND_COLORS.destructiveRed, borderColor: BRAND_COLORS.destructiveRed, bg: "white" }}
                onClick={onRevert}
              >
                <LuUndo2 />
                Revert
              </Button>
            )}
          </Flex>
          <Text fontSize="11px" color="gray.400">
            {by}
          </Text>
        </VStack>
      }
    >
      <Box
        {...{ [EDIT_FIELD_ATTR]: edited ? markKey : undefined }}
        borderRadius="md"
        css={edited ? {
          "& input, & select": { borderColor: `${EDIT_HEX} !important` },
          "& label": { color: `${EDIT_HEX} !important`, fontWeight: 600 },
          "& label::after": {
            content: '""',
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "9999px",
            background: EDIT_HEX,
            marginLeft: "5px",
            verticalAlign: "middle",
          },
        } : undefined}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

/** One edit, as the header's list shows it. */
export interface EditedItem {
  /** The field's key — what `EDIT_FIELD_ATTR` carries on the card. */
  key: string;
  label: string;
  /** The value before the edit; "" when there was none. */
  from: string;
  to: string;
  /** "Processor · J. Cruz · Sep 29, 2026". */
  by: string;
  /** Where to ring instead when the field itself is not on screen. */
  fallbackKey?: string;
}

function EditedList({
  items,
  onPick,
}: {
  items: EditedItem[];
  onPick: (item: EditedItem) => void;
}) {
  return (
    <Flex direction="column">
      {items.map((item) => (
        <Flex
          key={item.key}
          as="button"
          align="flex-start"
          gap={2.5}
          textAlign="left"
          w="full"
          px={2}
          py={{ base: 3, lg: 2 }}
          borderRadius={{ base: 0, lg: "md" }}
          borderBottomWidth={{ base: "1px", lg: 0 }}
          borderColor="gray.100"
          _last={{ borderBottomWidth: 0 }}
          cursor="pointer"
          _hover={{ bg: "gray.50" }}
          onClick={() => onPick(item)}
        >
          <Box mt="7px">
            <EditDot />
          </Box>
          <Box minW={0} flex={1}>
            <Text fontSize={{ base: "sm", lg: "xs" }} fontWeight="600" color={EDIT_COLOR}>
              {item.label}
            </Text>
            <Text fontSize={{ base: "sm", lg: "xs" }} color="gray.700" wordBreak="break-word">
              {item.from ? (
                <>
                  <Text as="s" color="gray.400">
                    {item.from}
                  </Text>{" "}
                  → {item.to || "—"}
                </>
              ) : (
                <>added {item.to}</>
              )}
            </Text>
            <Text fontSize="11px" color="gray.400">
              {item.by}
            </Text>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
}

const ICON_BUTTON_PROPS = {
  size: "xs",
  variant: "outline",
  borderRadius: "full",
  color: EDIT_COLOR,
  borderColor: "gray.200",
  position: "relative",
  overflow: "visible",
  _hover: { bg: "orange.50", borderColor: "orange.100" },
  _expanded: { bg: "orange.50", borderColor: "orange.100" },
  // Pulled into the line, as the contact icon is, so the row keeps its height.
  my: -1.5,
} as const;

/**
 * The header's pencil: a count of the card's edits, and the list of them.
 * Renders nothing when there are none, so an untouched card looks as it always
 * has.
 */
export function EditedFieldsButton({ items }: { items: EditedItem[] }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const has = items.length > 0;

  const label = `${items.length} edited field${items.length === 1 ? "" : "s"}`;
  const count = (
    <Box
      as="span"
      position="absolute"
      top="-5px"
      right="-5px"
      minW="16px"
      h="16px"
      px="4px"
      borderRadius="full"
      bg={EDIT_COLOR}
      color="white"
      fontSize="10px"
      fontWeight="700"
      lineHeight="16px"
      textAlign="center"
      boxShadow="0 0 0 2px white"
    >
      {items.length}
    </Box>
  );
  const pick = (item: EditedItem) => {
    setSheetOpen(false);
    setCardOpen(false);
    // After the sheet has let go of the page, or the scroll fights its close.
    window.setTimeout(() => flashEditedField(item.key, item.fallbackKey), 220);
  };

  // The buttons go when the last edit does; the sheet stays mounted and is shut
  // instead, since a dialog unmounted while open can strand the page.
  return (
    <>
      {/* Phone: tap → sheet. */}
      <IconButton
        {...ICON_BUTTON_PROPS}
        aria-label={label}
        display={has ? { base: "inline-flex", lg: "none" } : "none"}
        onClick={() => setSheetOpen(true)}
      >
        <LuPenLine />
        {count}
      </IconButton>

      {/* Desktop: hover → card, as the contact icon beside it. */}
      <Box display={has ? { base: "none", lg: "block" } : "none"}>
        <HoverCard.Root
          open={cardOpen && has}
          onOpenChange={(e) => setCardOpen(e.open)}
          openDelay={150}
          closeDelay={200}
          positioning={{ placement: "bottom-end" }}
        >
          <HoverCard.Trigger asChild>
            <IconButton {...ICON_BUTTON_PROPS} aria-label={label}>
              <LuPenLine />
              {count}
            </IconButton>
          </HoverCard.Trigger>
          <Portal>
            <HoverCard.Positioner>
              <HoverCard.Content w="300px" p={2}>
                <Text fontSize="xs" fontWeight="700" color="gray.800" px={2} pt={1} pb={1}>
                  Edited fields
                </Text>
                <EditedList items={items} onPick={pick} />
              </HoverCard.Content>
            </HoverCard.Positioner>
          </Portal>
        </HoverCard.Root>
      </Box>

      <BottomSheet title="Edited fields" open={sheetOpen && has} onClose={() => setSheetOpen(false)}>
        <Box bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.200" px={2}>
          <EditedList items={items} onPick={pick} />
        </Box>
      </BottomSheet>
    </>
  );
}
