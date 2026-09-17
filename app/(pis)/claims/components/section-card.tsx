"use client";

// The card a section sits in.
//
// Some sections draw no edge of their own — a heading over a list, with the
// heading doing the dividing. That works in a long scroll of nothing but bands.
// It stops working the moment a card lands next to one: the profile header and
// the plan details arrive as cards already, and a bare section between two of
// them reads as content that has fallen out of one.
//
// So the card is drawn HERE, around them, rather than inside each section. The
// sections stay bands, and the COLUMN decides whether they are carded — which
// is why this is applied per section at the call site and not baked in.
//
// IT IS NO LONGER THE DEATH CLAIM'S ALONE (user, 2026-09-16). The plan holder
// profile carded its Remarks and its folder for the same reason, once the two
// look-ups beside them became cards too. If a third column wants a different
// rhythm it simply does not reach for this.

import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";

/**
 * The card's own padding, and the value the table bleed is measured against.
 *
 * Held as a CSS VARIABLE rather than repeated, because `flushTable` below has
 * to cancel exactly this much and no other amount. Two numbers that must stay
 * equal are one number.
 *
 * It matches `PlanholderInfoCard` — the plan details card directly above these
 * in the column — so the two do not sit at different insets.
 */
const PADDING = { base: "16px", md: "20px" };

/**
 * Card width under which a table inside is let out to the edges.
 *
 * THE LEDGER'S FOUR COLUMNS WANT ABOUT 441px. Add this card's 20px a side and
 * a table needs roughly 483 before it can be inset at all; under that it falls
 * back to its own horizontal scrollbar and cuts the amounts mid-figure —
 * "₱1,140." with the centavos over the edge. Money is the one column that must
 * not be the one that clips.
 *
 * 500 leaves a little headroom over that 483. At `xl` this column is about
 * 460px, so the ledger goes edge to edge there; from about 1400px up there is
 * room for the inset and it takes it. Either way nothing scrolls sideways.
 */
const FLUSH_TABLE_BELOW = "500px";

/**
 * THE CARD SHAPE FOR THIS WHOLE AREA. One corner, one hairline, one lift —
 * and it is a VALUE rather than four props typed out per card, so that changing
 * a card changes every card.
 *
 * THE RADIUS IS THE KIT'S (user, 2026-09-16: "make the card a component… we
 * only change one component"). This was `xl` — 12px — while the kit's own cards
 * (`Page`'s, the plan holder header, the plan details, the request deck) turn at
 * 5, and the two sat side by side in the same column. A raw value and not a
 * token, because that is what the kit uses: there is no 5px step on the radius
 * scale, so `xl` is 12 and the nearest token under it is 8. The number IS the
 * shape.
 *
 * EVERY CARD SPREADS THIS, none restates it. If you find yourself writing
 * `borderRadius` on a card, that card has left the system — spread `CARD_SHAPE`
 * instead, or use {@link SectionCard}, which is this shape with the padding.
 *
 * A SURFACE DRAWN INSIDE A CARD TAKES {@link SURFACE_RADIUS} TOO — the search
 * field and the tab track in the conveyor's stage card, which stood at 8px
 * inside a 5px card and read as rounder than the thing containing them. Rows
 * and pills in a LIST are not surfaces and keep their own corners; the test is
 * whether it draws an edge the card's edge is visible next to.
 */
export const SURFACE_RADIUS = "5px";

/**
 * The corner of something drawn INSIDE a surface that is inset from its edge —
 * a tab sitting in a track, with the track's own padding between the two.
 *
 * Concentric: an inner corner equals the outer one minus the gap, or the two
 * curves do not run parallel and the inner one bulges. The tracks here inset
 * their tabs by 3px, so 5 − 3 = 2. It is a small number because the gap is
 * nearly the whole radius, which is the honest answer at this size.
 */
export const INSET_RADIUS = "2px";

/**
 * The kit card's hairline — a green-tinged gray, not a neutral one.
 *
 * `gray.200` stood here and computes to `rgb(228, 228, 231)`, which carries a
 * faint BLUE cast; the kit's is `rgb(227, 232, 229)`, the same value with the
 * tint moved to green. Side by side at one pixel it is not a colour you name,
 * it is a colour you notice: two cards in a column whose edges do not agree.
 */
const KIT_BORDER = "#e3e8e5";

/**
 * The kit card's lift — an ambient glow rather than a drop.
 *
 * No offset and a 30px blur, in a NAVY at a tenth opacity. Chakra's `xs` is the
 * other idea entirely: two tight neutral shadows, 1px down, which reads as the
 * card sitting ON the page. This reads as the page glowing under it, and it is
 * what every kit card on these screens already does.
 */
const KIT_SHADOW = "0 0 30px 0 rgba(1, 41, 112, 0.1)";

/*
 * BOTH VALUES ARE MEASURED, not matched by eye — read off the plan holder
 * header card's computed style in the running app (user, 2026-09-16: "make the
 * border similar to this and the shadow"). The kit builds that surface inside
 * `ProfileHeaderCard` and does not export it on its own, which is why these are
 * numbers here and not a token. If the kit ever lifts it out, this becomes that.
 */
export const CARD_SHAPE = {
  borderRadius: SURFACE_RADIUS,
  borderWidth: "1px",
  borderColor: KIT_BORDER,
  boxShadow: KIT_SHADOW,
} as const;

export interface SectionCardProps {
  children: ReactNode;
  /**
   * Let a TABLE inside run to the card's edges when the card is too narrow to
   * hold it inset — see {@link FLUSH_TABLE_BELOW}. The heading keeps its
   * padding either way.
   *
   * `:has(table)` and not a child index, so the rule states its own condition:
   * it reaches the ledger and nothing else in the section. Below `lg` the
   * payments section is a list of rows rather than a table — there is no
   * `table` to match, so those rows keep the padding they should have. A
   * browser without `:has` simply gets the inset table, which is the same thing
   * every wider card shows.
   */
  flushTable?: boolean;
}

export function SectionCard({ children, flushTable = false }: SectionCardProps) {
  return (
    <Box
      {...CARD_SHAPE}
      bg="white"
      p={PADDING}
      css={
        flushTable
          ? {
              // The card measures itself, so the query below reads THIS box's
              // width rather than the window's — which is the distinction that
              // matters in a column whose width has nothing to do with the
              // viewport's. Same technique as `PlanholderProfileHeader`.
              containerType: "inline-size",
              "--section-card-pad": PADDING.base,
              "@media (min-width: 48em)": {
                "--section-card-pad": PADDING.md,
              },
              "& > div > div:has(table)": {
                [`@container (max-width: ${FLUSH_TABLE_BELOW})`]: {
                  marginInline: "calc(-1 * var(--section-card-pad))",
                },
              },
            }
          : undefined
      }
    >
      {children}
    </Box>
  );
}

/**
 * Brings a card the KIT drew the rest of the way into {@link CARD_SHAPE}.
 *
 * The plan holder header and the plan details arrive as cards already — they do
 * not need `SectionCard` around them — but they are the kit's card, and the
 * details card carries no hairline at all: a card with no edge between two that
 * have one.
 *
 * IT IS MOSTLY THE HAIRLINE NOW. It used to be a real reshape — 5px corners
 * pulled up to the 12 this file drew — and since `CARD_SHAPE` took the kit's
 * radius the corner already agrees. What is left is the border and the lift,
 * which is little but not nothing, and it stays spelled as the shared shape so
 * that it keeps agreeing after the next change.
 *
 * RESHAPED HERE RATHER THAN IN THE KIT, and rather than in the components that
 * render them. Those are shared with the plan holder page, and a card's edge is
 * a fact about the COLUMN it stands in, not about the component.
 *
 * THE SELECTOR IS A DEPTH, and it is exact rather than blanket. Both components
 * are built the same way — a root that lays the section out, holding the one
 * element that is the card — so the card is always this wrapper's grandchild.
 * Reaching one level deeper would round the rule under the details heading
 * along with it, and there is no honest way to ask CSS for "the element that
 * looks like a card", so the shape of the thing being reshaped is stated here
 * instead. If either component grows a wrapper, this stops applying — visibly,
 * as a card with no edge in a column of carded sections.
 */
export function KitCardShape({ children }: { children: ReactNode }) {
  return <Box css={{ "& > div > div": CARD_SHAPE }}>{children}</Box>;
}

export default SectionCard;
