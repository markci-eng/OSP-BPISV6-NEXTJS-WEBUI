"use client";

// A FIELD NAME THAT SAYS ITS VALUE WAS CORRECTED — the label, never the value.
//
// ONLY THE LABEL IS MARKED (user, 2026-09-29): no fill behind it, and the value
// under it stays set exactly as every other value on the card. The label turns
// the claims area's edit orange and carries a dot after it (see `edit-mark`).
// The dot is a shape, so the field is found by someone who misses the colour.
//
// ONE COLOUR FOR BOTH DESKS (user, 2026-10-02). It used to be orange for the
// processor and green for the verifier; green sank into the brand-green card.
// Who changed it last is now said in words, at the top of the tooltip.
//
// No accept / reject (user, 2026-10-01): the processor and the verifier each
// override (edit it again, which makes it theirs) or revert any change.
//
// HOVER NAMES EXACTLY WHAT CHANGED. Not "the name changed" but "First Name
// Jaun → Juan": the reader should never have to compare two spellings to find
// the letter. A label standing for a derived fact — the ages, which follow the
// birth date — says so rather than pretending it was typed.
//
// ON A PHONE A TAP OPENS A BOTTOM SHEET instead — a tooltip under a thumb is
// the size of the thumb, and Revert inside one is a hard target. Both triggers
// are rendered and switched by CSS at `lg`, as `InfoLabel` does its two shapes.
//
// The tooltip is the claims area's WHITE one — see `tooltip-surface`. It is
// `interactive`, so the pointer can travel from the label into it without it
// closing; the revert itself is confirmed by the caller first.

import { useState, type MouseEvent } from "react";
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { LuPenLine, LuUndo2 } from "react-icons/lu";
import { Tooltip } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { CorrectionStage, PlanholderField } from "../../claim-store";
import { BottomSheet } from "../../components/bottom-sheet";
import { EDIT_COLOR, EDIT_FIELD_ATTR, EditDot } from "../../components/edit-mark";
import { TOOLTIP_SURFACE } from "../../components/tooltip-surface";

/** Kept per stage so a caller can still ask; both desks now share one colour. */
export const STAGE_COLOR: Record<CorrectionStage, string> = {
  process: EDIT_COLOR,
  verification: EDIT_COLOR,
};

const STAGE_HEADING: Record<CorrectionStage, string> = {
  process: "Changed by the processor",
  verification: "Changed by the verifier",
};

/** One line of the tooltip: what changed, from what, to what. */
export interface CorrectionLine {
  /** "First Name", or "Follows Date of Birth" for a derived fact. */
  title: string;
  from: string;
  to: string;
  /** Set when the line is a correction of its own, so it can be reverted. */
  field?: PlanholderField;
}

export interface CorrectionLabelProps {
  label: string;
  /** Which desk changed it last. */
  stage: CorrectionStage;
  lines: CorrectionLine[];
  /** "by J. Cruz · Sep 29, 2026". */
  byline?: string;
  /**
   * What the header's edit list rings when this field is picked — the field's
   * key, or the derived label's ("Age at Death").
   */
  markKey: string;
  /** Given to the processor and the verifier while the claim is theirs. */
  onRevert?: (field: PlanholderField) => void;
  /**
   * Opens the edit form. "Edit" on the reader's own change, "Override" on the
   * other desk's — see `ownStage`.
   */
  onOverride?: () => void;
  /** The reader's desk, to word the override button. */
  ownStage?: CorrectionStage;
}

const ACTION_BUTTON = {
  size: "2xs",
  variant: "outline",
  flexShrink: 0,
  color: "gray.700",
  borderColor: "gray.200",
} as const;

function Lines({
  stage,
  lines,
  byline,
  onRevert,
  onOverride,
  overrideText,
  roomy = false,
}: {
  stage: CorrectionStage;
  lines: CorrectionLine[];
  byline?: string;
  onRevert?: (field: PlanholderField) => void;
  onOverride?: () => void;
  overrideText: string;
  /** The phone sheet: larger type, full-width buttons under the lines. */
  roomy?: boolean;
}) {
  const fs = roomy ? "sm" : "xs";
  const revertable = lines.find((l) => l.field);
  return (
    <VStack align="stretch" gap={roomy ? 3 : 2} minW={roomy ? undefined : "220px"}>
      {!roomy && (
        <Text fontSize="xs" fontWeight="700" color="gray.800">
          {STAGE_HEADING[stage]}
        </Text>
      )}
      {lines.map((line) => (
        <Flex key={line.title} align="center" gap={3} justify="space-between">
          <Box minW={0}>
            <Text fontSize={fs} fontWeight="600" color={EDIT_COLOR}>
              {line.title}
            </Text>
            <Text fontSize={fs} color="gray.700">
              {line.from ? (
                <>
                  <Text as="s" color="gray.400">
                    {line.from}
                  </Text>{" "}
                  → {line.to || "—"}
                </>
              ) : (
                <>added {line.to}</>
              )}
            </Text>
          </Box>
          {!roomy && (onOverride || (onRevert && line.field)) && (
            <Flex gap={1.5} flexShrink={0}>
              {onOverride && line.field && (
                <Button
                  {...ACTION_BUTTON}
                  _hover={{ color: BRAND_COLORS.primaryGreen, borderColor: BRAND_COLORS.primaryGreen, bg: "white" }}
                  onClick={onOverride}
                >
                  <LuPenLine />
                  {overrideText}
                </Button>
              )}
              {onRevert && line.field && (
                <Button
                  {...ACTION_BUTTON}
                  _hover={{ color: BRAND_COLORS.destructiveRed, borderColor: BRAND_COLORS.destructiveRed, bg: "white" }}
                  aria-label={`Revert ${line.title}`}
                  onClick={() => onRevert(line.field!)}
                >
                  <LuUndo2 />
                  Revert
                </Button>
              )}
            </Flex>
          )}
        </Flex>
      ))}
      {byline && (
        <Text fontSize="11px" color="gray.400">
          {roomy
            ? `${STAGE_HEADING[stage]} · ${byline.replace(/^by\s+/, "")}`
            : byline}
        </Text>
      )}
      {roomy && revertable && (onOverride || onRevert) && (
        <Flex gap={2.5} pt={1}>
          {onOverride && (
            <Button flex={1} variant="outline" borderColor="gray.200" color="gray.800" onClick={onOverride}>
              <LuPenLine />
              {overrideText}
            </Button>
          )}
          {onRevert && (
            <Button
              flex={1}
              variant="outline"
              borderColor="gray.200"
              color={BRAND_COLORS.destructiveRed}
              onClick={() => onRevert(revertable.field!)}
            >
              <LuUndo2 />
              Revert
            </Button>
          )}
        </Flex>
      )}
    </VStack>
  );
}

export function CorrectionLabel({
  label,
  stage,
  lines,
  byline,
  markKey,
  onRevert,
  onOverride,
  ownStage,
}: CorrectionLabelProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const heading = STAGE_HEADING[stage];
  const overrideText = ownStage === stage ? "Edit" : "Override";

  // The sheet shuts FIRST and the confirm or the form opens once it has gone:
  // a dialog opened while the sheet is still closing is shut along with it.
  const afterSheet = (next: () => void) => {
    setSheetOpen(false);
    window.setTimeout(next, 260);
  };
  const sheetRevert = onRevert
    ? (field: PlanholderField) => afterSheet(() => onRevert(field))
    : undefined;
  const sheetOverride = onOverride
    ? () => afterSheet(onOverride)
    : undefined;

  const mark = (
    <Flex as="span" display="inline-flex" align="center" gap="5px">
      {label}
      <EditDot />
    </Flex>
  );
  const markProps = {
    as: "span" as const,
    tabIndex: 0,
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "600",
    color: EDIT_COLOR,
    cursor: "pointer",
    "aria-label": `${label} — ${heading}`,
    [EDIT_FIELD_ATTR]: markKey,
    _focusVisible: {
      outline: "2px solid",
      outlineColor: BRAND_COLORS.primaryGreen,
      outlineOffset: "2px",
      borderRadius: "2px",
    },
  };

  return (
    <>
      {/* Desktop: hover → tooltip. */}
      <Box as="span" display={{ base: "none", lg: "inline" }}>
        <Tooltip
          interactive
          openDelay={100}
          closeDelay={150}
          positioning={{ placement: "top-start" }}
          contentProps={{ ...TOOLTIP_SURFACE, maxW: "340px" }}
          content={
            <Lines
              stage={stage}
              lines={lines}
              byline={byline}
              onRevert={onRevert}
              onOverride={onOverride}
              overrideText={overrideText}
            />
          }
        >
          <Text {...markProps}>{mark}</Text>
        </Tooltip>
      </Box>

      {/* Phone: tap → sheet. A real button, like the header's pencil: a tapped
          span opened the sheet and the same tap shut it again. The card under
          it opens its details on a tap, so this one stops there. */}
      <Box
        as="button"
        {...{ type: "button" }}
        display={{ base: "inline", lg: "none" }}
        p={0}
        bg="transparent"
        border={0}
        textAlign="left"
        fontSize="inherit"
        lineHeight="inherit"
        fontWeight="600"
        color={EDIT_COLOR}
        cursor="pointer"
        aria-label={`${label} — ${heading}`}
        {...{ [EDIT_FIELD_ATTR]: markKey }}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          setSheetOpen(true);
        }}
      >
        {mark}
      </Box>

      <BottomSheet title={label} open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Box
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          p={4}
          // A tap inside the sheet bubbles through its portal to the card.
          onClick={(e) => e.stopPropagation()}
        >
          <Lines
            stage={stage}
            lines={lines}
            byline={byline}
            onRevert={sheetRevert}
            onOverride={sheetOverride}
            overrideText={overrideText}
            roomy
          />
        </Box>
      </BottomSheet>
    </>
  );
}

export default CorrectionLabel;
