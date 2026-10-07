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

import { IconButton } from "@chakra-ui/react";
import { useLayoutEffect, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/** The name as the kit prints it — title case — which is what is searched for. */
function asTheKitShowsIt(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The slots put around one name line. */
interface NameSlots {
  previous?: HTMLElement;
  next?: HTMLElement;
  below?: HTMLElement;
}

function slotElement(kind: "previous" | "next" | "below"): HTMLElement {
  const el = document.createElement("span");
  if (kind === "below") {
    el.dataset.planStatus = "";
    el.style.display = "block";
  } else {
    el.dataset.planNav = kind;
  }
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
  /** How many plans there are. Fewer than two draws no arrows. */
  planCount: number;
  onPrevious: () => void;
  onNext: () => void;
  /** Drawn under the name block — the LPA number line — when given. */
  below?: ReactNode;
}

export function ProfileNamePlanNav({
  card,
  name,
  planCount,
  onPrevious,
  onNext,
  below,
}: ProfileNamePlanNavProps) {
  const [slots, setSlots] = useState<NameSlots[]>([]);
  const hasSeveralPlans = planCount > 1;
  const hasBelow = below !== undefined && below !== null;

  useLayoutEffect(() => {
    const root = card;
    if (!root || !name || (!hasSeveralPlans && !hasBelow)) return;

    const shown = asTheKitShowsIt(name);
    let created: NameSlots[] = [];
    const parts = (s: NameSlots) =>
      [s.previous, s.next, s.below].filter((el): el is HTMLElement => !!el);

    // WATCHED, NOT LOOKED FOR ONCE: the kit does not always have its name
    // line in the page on this component's first commit — part of the card
    // can draw a moment later — and it may redraw the line at any time. So
    // every change inside the card is a chance to (re)attach. Attaching is
    // idempotent: a line that already has its slots is left alone, so the
    // slots' own insertion does not set off another round.
    const attach = () => {
      const kept = created.filter((s) =>
        parts(s).every((el) => el.isConnected),
      );
      let changed = kept.length !== created.length;

      root.querySelectorAll("p").forEach((line) => {
        if (line.textContent?.trim() !== shown) return;
        if (line.closest("[data-header-actions]")) return;
        const block = line.parentElement;
        if (!block) return;
        if (kept.some((s) => parts(s).some((el) => el.parentElement === block)))
          return;

        const slot: NameSlots = {};
        if (hasSeveralPlans) {
          slot.previous = slotElement("previous");
          slot.next = slotElement("next");
          line.before(slot.previous);
          line.after(slot.next);
        }
        if (hasBelow) {
          // Last in the name block, so after the LPA line under the name.
          slot.below = slotElement("below");
          block.append(slot.below);
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
  }, [card, name, hasSeveralPlans, hasBelow]);

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
        slot.below && createPortal(below, slot.below, `below-${i}`),
      ])}
    </>
  );
}

export default ProfileNamePlanNav;
