"use client";

// WHAT THIS SCREEN ADDS AROUND THE PLANHOLDER'S NAME in the profile header
// card (user, 2026-10-06):
//
//   - previous / next plan arrows either side of the name, for a planholder
//     with more than one plan;
//   - a row of status badges under the name block — insurability, account
//     status and termination status of the selected plan.
//
// The kit's `ProfileHeaderCard` takes the name as a plain string and has no
// slot beside or under it, so this finds the name line it drew, puts empty
// slots next to it, and renders into those slots through portals — they stay
// ordinary React children of this screen, with its theme and its state. The
// card draws the name twice (a phone layout and a desktop one, one of them
// hidden by CSS), so both get their slots.
//
// The slots are never children of the name line: the kit sets that line's
// text itself, and anything inside it would be wiped when it does. Laying the
// slots out is the caller's CSS — see the `[data-plan-nav]` rule in
// `planholder-profile-body`.

import { IconButton, Text } from "@chakra-ui/react";
import { useLayoutEffect, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/** The name as the kit prints it — title case — which is what is searched for. */
function asTheKitShowsIt(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The slots put for one name line — one per layout of the card. */
interface NameSlots {
  line: HTMLElement;
  previous?: HTMLElement;
  next?: HTMLElement;
  under?: HTMLElement;
  status?: HTMLElement;
}

function slotElement(
  kind: "previous" | "next" | "under" | "status" | "corner",
): HTMLElement {
  const el = document.createElement("span");
  if (kind === "previous" || kind === "next") {
    el.dataset.planNav = kind;
  } else {
    el.dataset.planSlot = kind;
    el.style.display = "block";
  }
  return el;
}

/**
 * Which of the card's two layouts a name line is in: the child of the card's
 * outer box that holds it. The kit draws the phone layout and the desktop one
 * as siblings there.
 */
function layoutOf(line: HTMLElement, wrapper: HTMLElement): HTMLElement | null {
  const card = wrapper.firstElementChild;
  let el: HTMLElement | null = line;
  while (el && el.parentElement !== card) el = el.parentElement;
  return el;
}

export interface ProfileNamePlanNavProps {
  /**
   * The element wrapping the header card; only its name lines are touched.
   * An element rather than a ref object, so that its arrival re-runs the
   * search — a ref object changing does not re-render anything, and on its
   * first read here it was still empty.
   */
  card: HTMLElement | null;
  /** The name exactly as it was handed to the card. */
  name: string | undefined;
  /** How many plans there are. Fewer than two draws no arrows and no count. */
  planCount: number;
  /**
   * Where the selected plan is among them, from 0 — for the "Plan 2 of 3"
   * count in the card's top-left corner.
   */
  planIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  /** Drawn in the name block under the LPA number line, when given. */
  underLpa?: ReactNode;
  /**
   * Drawn in the Contact Information column, after its contact tiles, when
   * given. The phone layout has no such column — only the address and phone
   * chips under the name — so there it goes after those, at the card's foot.
   */
  status?: ReactNode;
  /** The card's contact column heading, which is how that column is found. */
  contactLabel?: string;
  /**
   * Hides that heading once it has been used to find the column (user,
   * 2026-10-07). Blanking the kit's label instead would leave nothing to
   * find the column by, and the status row would fall to the card's foot.
   */
  hideContactHeading?: boolean;
}

export function ProfileNamePlanNav({
  card,
  name,
  planCount,
  planIndex,
  onPrevious,
  onNext,
  underLpa,
  status,
  contactLabel = "Contact Information",
  hideContactHeading = false,
}: ProfileNamePlanNavProps) {
  const [slots, setSlots] = useState<NameSlots[]>([]);
  const [corner, setCorner] = useState<HTMLElement | null>(null);
  const hasSeveralPlans = planCount > 1;
  const hasUnder = underLpa !== undefined && underLpa !== null;
  const hasStatus = status !== undefined && status !== null;

  // THE PLAN COUNT, in the card's top-left corner (user, 2026-10-06). One
  // slot for the whole card, not one per layout: it is pinned to the card's
  // outer box, which both layouts share. That box is given a positioning
  // context for it, and has it taken back when the count goes.
  useLayoutEffect(() => {
    const box = card?.firstElementChild as HTMLElement | null | undefined;
    if (!box || !hasSeveralPlans) return;
    const before = box.style.position;
    box.style.position = "relative";
    // The phone layout (the box's first child; hidden on desktop) starts its
    // name row at the very top, right where the count sits — it covered the
    // end of the name and the next arrow. That layout is pushed down clear of
    // it; the desktop layout has room up there already.
    const phone = box.firstElementChild as HTMLElement | null;
    const phoneTopBefore = phone?.style.paddingTop ?? "";
    if (phone) phone.style.paddingTop = "44px";
    const el = slotElement("corner");
    Object.assign(el.style, {
      position: "absolute",
      top: "12px",
      // Top-LEFT (user, 2026-10-06; it first sat top-right).
      left: "16px",
      zIndex: "1",
    });
    box.append(el);
    setCorner(el);
    return () => {
      el.remove();
      box.style.position = before;
      if (phone) phone.style.paddingTop = phoneTopBefore;
      setCorner(null);
    };
  }, [card, hasSeveralPlans]);

  useLayoutEffect(() => {
    const root = card;
    if (
      !root ||
      !name ||
      (!hasSeveralPlans && !hasUnder && !hasStatus && !hideContactHeading)
    )
      return;

    const shown = asTheKitShowsIt(name);
    const heading = contactLabel.trim().toLowerCase();
    let created: NameSlots[] = [];
    const parts = (s: NameSlots) =>
      [s.previous, s.next, s.under, s.status].filter(
        (el): el is HTMLElement => !!el,
      );

    // WATCHED, NOT LOOKED FOR ONCE: the kit does not always have its name
    // line in the page on this component's first commit — part of the card
    // can draw a moment later — and it may redraw the line at any time. So
    // every change inside the card is a chance to (re)attach. Attaching is
    // idempotent: a line that already has its slots is left alone, so the
    // slots' own insertion does not set off another round.
    const attach = () => {
      // Hidden on every pass, since the kit may redraw the heading. Hidden
      // rather than removed, so it is still there to find the column by.
      if (hideContactHeading) {
        root.querySelectorAll("p").forEach((p) => {
          if (
            p.textContent?.trim().toLowerCase() === heading &&
            p.style.display !== "none"
          ) {
            p.style.display = "none";
          }
        });
      }

      const kept: NameSlots[] = [];
      created.forEach((s) => {
        if (s.line.isConnected && parts(s).every((el) => el.isConnected)) {
          kept.push(s);
        } else {
          parts(s).forEach((el) => el.remove());
        }
      });
      let changed = kept.length !== created.length;

      root.querySelectorAll("p").forEach((line) => {
        if (line.textContent?.trim() !== shown) return;
        if (line.closest("[data-header-actions]")) return;
        if (kept.some((s) => s.line === line)) return;

        const slot: NameSlots = { line };
        if (hasSeveralPlans) {
          slot.previous = slotElement("previous");
          slot.next = slotElement("next");
          line.before(slot.previous);
          line.after(slot.next);
        }
        if (hasUnder) {
          // Last in the name block, so under the LPA number line.
          slot.under = slotElement("under");
          line.parentElement?.append(slot.under);
        }
        if (hasStatus) {
          const layout = layoutOf(line, root);
          const contactHeading = layout
            ? [...layout.querySelectorAll("p")].find(
                (p) => p.textContent?.trim().toLowerCase() === heading,
              )
            : undefined;
          slot.status = slotElement("status");
          // Desktop: straight after what follows the heading — the tiles,
          // or the kit's "no contact information" line — so before any
          // header actions. Phone: the end of its layout.
          const tiles = contactHeading?.nextElementSibling;
          if (tiles) tiles.after(slot.status);
          else (layout ?? line.parentElement)?.append(slot.status);
        }
        kept.push(slot);
        changed = true;
      });

      created = kept;
      if (changed) setSlots([...kept]);
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      created.forEach((s) => parts(s).forEach((el) => el.remove()));
      setSlots([]);
    };
  }, [
    card,
    name,
    hasSeveralPlans,
    hasUnder,
    hasStatus,
    contactLabel,
    hideContactHeading,
  ]);

  // The card is a hover target; a click on these is not a click on it.
  const press = (go: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    go();
  };

  // On desktop, the size of the ROP list's floating show/hide toggle (user,
  // 2026-10-06; see `collapsible-list-layout`): a 40px button with a 22px
  // chevron drawn at stroke 3. The name column was widened to make room. A
  // phone has no width to give — at that size they broke the name mid-word —
  // so they stay small there.
  const arrow = {
    size: "2xs",
    variant: "ghost",
    rounded: "full",
    css: {
      lg: { width: "40px", height: "40px", minWidth: "40px" },
      "& svg": {
        width: { base: "16px", lg: "22px" },
        height: { base: "16px", lg: "22px" },
        strokeWidth: { lg: 3 },
      },
    },
  } as const;

  return (
    <>
      {slots.map((slot, i) => [
        slot.previous &&
          createPortal(
            <IconButton
              aria-label="Previous plan"
              title="Previous plan"
              {...arrow}
              onClick={press(onPrevious)}
            >
              <LuChevronLeft />
            </IconButton>,
            slot.previous,
            `previous-${i}`,
          ),
        slot.next &&
          createPortal(
            <IconButton
              aria-label="Next plan"
              title="Next plan"
              {...arrow}
              onClick={press(onNext)}
            >
              <LuChevronRight />
            </IconButton>,
            slot.next,
            `next-${i}`,
          ),
        slot.under && createPortal(underLpa, slot.under, `under-${i}`),
        slot.status && createPortal(status, slot.status, `status-${i}`),
      ])}
      {corner &&
        createPortal(
          <Text
            px={3}
            py={1}
            borderRadius="full"
            bg="gray.100"
            color="gray.700"
            fontSize="sm"
            fontWeight="semibold"
            aria-live="polite"
          >
            Plan {planIndex + 1} of {planCount}
          </Text>,
          corner,
        )}
    </>
  );
}

export default ProfileNamePlanNav;
