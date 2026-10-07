"use client";

// THE CONVEYOR'S RAIL, FOLDED (user, 2026-10-05, option A of the mock-up).
//
// Death Claim and Service Payables both work beside a rail of controls. Folded,
// that rail becomes a 56px strip and the record column takes the width back:
//
//   · the QUEUE is two icons, For Process and Verify — one click switches,
//     a white pill slides to the one being worked — and a search icon that
//     opens the queue list straight away (user, 2026-10-05: "when the search
//     icon is click then it should be search instead of viewing the whole
//     component").
//   · a block that is CONSULTED (the actions, the billing, the history)
//     becomes one icon that opens a FLYOUT beside it — the same content the
//     phone puts in a sheet, so nothing is rebuilt for this.
//   · a control that is PRESSED ON EVERY ACCOUNT stays a direct button —
//     Service's Prev · Jump · Next, and the billing commit.
//
// THE TOGGLE IS ON THE SPINE (user, 2026-10-05) — a line down the conveyor's
// far left with the button at its middle; see `RailSpine`. A top-left button
// and an edge handle on the gutter were both tried and dropped.
//
// Desktop only. Below `lg` the rail is already stacked and the phone has its
// own strip — see `MobileQuickAccess`. Whether it is folded is remembered —
// see `useRailCollapsed`.

import {
  Children,
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Box,
  chakra,
  CloseButton,
  Flex,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { Tooltip } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CONVEYOR_SPINE_ROOM, CONVEYOR_VIEW_MAX } from "./conveyor-columns";
import { CARD_SHAPE, INSET_RADIUS, KIT_BORDER, SURFACE_RADIUS } from "./section-card";

/** The pale green an icon sits on while hovered or while its flyout is open. */
const ICON_ACTIVE_BG = "#eaf5ee";

/** Ease-out with no overshoot — slides and fades. */
const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";
/** A little overshoot — what makes a released press read as a pop. */
const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/*
 * THE KEYFRAMES, INSERTED BY HAND — Chakra v3's `css` prop emits a nested
 * `@keyframes` with its steps dropped, so anything that animates in this area
 * writes its own (see `BillingAccordionCard`). Module scope so the rule is in
 * the document before the first strip renders; guarded by id.
 */
const KEYFRAMES_ID = "claims-rail-strip-keyframes";
if (typeof document !== "undefined" && !document.getElementById(KEYFRAMES_ID)) {
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = [
    "@keyframes railStripIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}",
    "@keyframes railFadeIn{from{opacity:0}to{opacity:1}}",
    "@keyframes railTick{50%{transform:scale(1.3)}}",
  ].join("");
  document.head.appendChild(style);
}

const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)";

/** One item of the strip sliding in — its delay is set per item, inline. */
const STRIP_ITEM = {
  animation: `railStripIn 0.26s ${EASE_OUT} both`,
  [REDUCED_MOTION]: { animation: "none" },
} as const;

/**
 * The expanded rail's blocks fade in once the column has opened — they
 * mount at the narrow width, so they wait out most of the slide first.
 */
export const RAIL_FADE_IN = {
  animation: `railFadeIn 0.2s ${EASE_OUT} 0.12s both`,
  [REDUCED_MOTION]: { animation: "none" },
} as const;

/**
 * A number that changed — the account position, a count. Key the element on
 * the value so a new one is a new element and the tick replays.
 */
export const RAIL_TICK = {
  display: "inline-block",
  animation: `railTick 0.3s ${EASE_OUT}`,
  [REDUCED_MOTION]: { animation: "none" },
} as const;

/** The column sliding open and shut — spread into the grid's own styles. */
export const RAIL_TRACK_TRANSITION = {
  transition: `grid-template-columns 0.28s ${EASE_OUT}`,
  [REDUCED_MOTION]: { transition: "none" },
} as const;

/**
 * The strip itself — one card, the icons down its middle. They arrive one
 * after another, 28ms apart: each child is wrapped and given its own delay
 * INLINE, since an `:nth-child` rule is unsafe under server rendering.
 */
export function RailStrip({ children }: { children: ReactNode }) {
  return (
    <Flex
      direction="column"
      align="center"
      gap={1}
      py={2}
      bg="white"
      {...CARD_SHAPE}
    >
      {Children.toArray(children).map((child, i) => (
        <Flex
          key={i}
          direction="column"
          align="center"
          gap={1}
          style={{ animationDelay: `${i * 28}ms` }}
          css={STRIP_ITEM}
        >
          {child}
        </Flex>
      ))}
    </Flex>
  );
}

/** A hairline between groups of icons. */
export function RailStripDivider() {
  return (
    <Box
      aria-hidden
      w="28px"
      h="1px"
      my={1}
      flexShrink={0}
      bg={KIT_BORDER}
    />
  );
}

/**
 * The block's name on hover, to the right of the icon. The kit's dark chip:
 * a one-line hint, which is what it is for — see `tooltip-surface`.
 *
 * ON A WRAPPER, NEVER ON THE BUTTON. The popover finds its trigger by its
 * `data-scope` / `data-part` / `data-ownedby` attributes, and a tooltip
 * trigger on the same element overwrites all three with its own — the
 * popover then has no anchor and opens at the window's top-left corner
 * (2026-10-05, the Billing flyout). The span takes the tooltip's attributes
 * and the button keeps the popover's.
 */
export function RailHint({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) {
  return (
    <Tooltip
      content={label}
      openDelay={150}
      closeDelay={0}
      positioning={{ placement: "right", gutter: 10 }}
    >
      <Box as="span" display="flex">
        {children}
      </Box>
    </Tooltip>
  );
}

/**
 * A count over the icon's corner that is information, not a demand — the
 * queue's size, the history's total. Red is `CountBubble`'s, and only for
 * something still waiting on the reader.
 */
export function RailCount({ count }: { count: number }) {
  return (
    <Box
      as="span"
      minW="18px"
      h="18px"
      px="4px"
      borderRadius="full"
      bg="white"
      borderWidth="1px"
      borderColor={KIT_BORDER}
      color="gray.700"
      fontSize="10px"
      fontWeight="700"
      lineHeight="16px"
      textAlign="center"
      fontVariantNumeric="tabular-nums"
      aria-hidden
    >
      {count}
    </Box>
  );
}

/**
 * Pressing in, and springing back past where it started — every button in
 * the strip shares it, so a click always answers the same way.
 */
const PRESS = {
  transition: `background 0.15s ease, color 0.15s ease, transform 0.22s ${EASE_SPRING}`,
  _active: { transform: "scale(0.88)", transitionDuration: "0.06s" },
  [REDUCED_MOTION]: { transition: "background 0.15s ease, color 0.15s ease" },
} as const;

export interface RailStripButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  icon: IconType;
  /** What it is — the screen reader's name for it; the hint shows it too. */
  label: string;
  /** Over the top-right corner — `RailCount`, or a `CountBubble`. */
  badge?: ReactNode;
  /** Its flyout is open. */
  active?: boolean;
}

/** One icon of the strip — 40px, the pointer target the rail's buttons had. */
export const RailStripButton = forwardRef<
  HTMLButtonElement,
  RailStripButtonProps
>(function RailStripButton(
  { icon: Icon, label, badge, active = false, ...rest },
  ref,
) {
  return (
    <chakra.button
      ref={ref}
      type="button"
      aria-label={label}
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSize="40px"
      flexShrink={0}
      borderRadius={SURFACE_RADIUS}
      bg={active ? ICON_ACTIVE_BG : "transparent"}
      color={active ? BRAND_COLORS.darkGreen : "gray.600"}
      cursor="pointer"
      _hover={{ bg: ICON_ACTIVE_BG, color: BRAND_COLORS.darkGreen }}
      _disabled={{
        opacity: 0.35,
        cursor: "not-allowed",
        transform: "none",
        _hover: { bg: "transparent", color: "gray.600" },
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "1px",
      }}
      css={PRESS}
      {...rest}
    >
      <Icon size={18} />
      {badge && (
        <Box position="absolute" top="-3px" right="-3px" display="flex">
          {badge}
        </Box>
      )}
    </chakra.button>
  );
});

/** One queue the strip can switch to. */
export interface RailStage {
  key: string;
  label: string;
  count: number;
  icon: IconType;
}

/** 40px icon + 4px gap: how far the pill travels per stage. */
const STAGE_STEP = 44;

/**
 * THE QUEUE AS ICONS — one per stage, in a track, with a white pill that
 * slides to the one being worked. One click switches; the count rides on each
 * icon so the choice between them is still made on the numbers.
 *
 * WITH ONE STAGE it is the same track holding one icon — the queue named, not
 * a switch with nothing to switch to; see `StageTabs`.
 */
export function RailStagePair({
  stages,
  active,
  onChange,
}: {
  stages: RailStage[];
  active: string;
  onChange: (key: string) => void;
}) {
  const index = Math.max(
    0,
    stages.findIndex((stage) => stage.key === active),
  );
  return (
    <Flex
      role="tablist"
      aria-label="Queue"
      aria-orientation="vertical"
      position="relative"
      direction="column"
      gap="4px"
      p="3px"
      bg="gray.100"
      borderRadius={SURFACE_RADIUS}
    >
      <Box
        aria-hidden
        position="absolute"
        top="3px"
        left="3px"
        boxSize="40px"
        bg="white"
        borderRadius={INSET_RADIUS}
        boxShadow="xs"
        transform={`translateY(${index * STAGE_STEP}px)`}
        css={{
          transition: `transform 0.28s ${EASE_OUT}`,
          [REDUCED_MOTION]: { transition: "none" },
        }}
      />
      {stages.map((stage, i) => (
        <RailHint key={stage.key} label={`${stage.label} · ${stage.count}`}>
          <chakra.button
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${stage.label}, ${stage.count}`}
            onClick={() => onChange(stage.key)}
            position="relative"
            zIndex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="40px"
            borderRadius={INSET_RADIUS}
            bg="transparent"
            color={i === index ? BRAND_COLORS.darkGreen : "gray.500"}
            cursor="pointer"
            _hover={i === index ? undefined : { color: "gray.800" }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: BRAND_COLORS.primaryGreen,
              outlineOffset: "1px",
            }}
            css={PRESS}
          >
            <stage.icon size={18} />
            <Box position="absolute" top="-5px" right="-5px" display="flex">
              <RailCount count={stage.count} />
            </Box>
          </chakra.button>
        </RailHint>
      ))}
    </Flex>
  );
}

/**
 * The commit, kept in the strip as a filled icon — it is never behind a click.
 * Same green as the rail's full-width button; a press sends a ring out.
 */
export function RailStripCommit({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: IconType;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <RailHint label={label}>
      <chakra.button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxSize="40px"
        flexShrink={0}
        borderRadius={SURFACE_RADIUS}
        bg={BRAND_COLORS.primaryGreen}
        color="white"
        cursor="pointer"
        _hover={{ bg: BRAND_COLORS.darkGreen }}
        _disabled={{
          opacity: 0.45,
          cursor: "not-allowed",
          _hover: { bg: BRAND_COLORS.primaryGreen },
        }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: BRAND_COLORS.darkGreen,
          outlineOffset: "2px",
        }}
        css={{
          transition: `background 0.15s ease, transform 0.22s ${EASE_SPRING}, box-shadow 0.45s ${EASE_OUT}`,
          boxShadow: "0 0 0 0 rgba(16, 148, 72, 0)",
          _active: {
            transform: "scale(0.88)",
            boxShadow: "0 0 0 6px rgba(16, 148, 72, 0.25)",
            transitionDuration: "0.06s",
          },
          [REDUCED_MOTION]: { transition: "background 0.15s ease" },
        }}
      >
        <Icon size={18} />
      </chakra.button>
    </RailHint>
  );
}

/**
 * The surface a flyout opens on — the phone sheet's grey, so the white cards
 * and grouped lists the rail already draws sit on it the way they sit in the
 * sheet.
 */
export const RAIL_FLYOUT_CONTENT = {
  w: "340px",
  maxW: "calc(100vw - 32px)",
  maxH: "calc(100vh - 112px)",
  overflowY: "auto",
  bg: BRAND_COLORS.subtleBg,
  borderRadius: SURFACE_RADIUS,
  p: 3,
} as const;

/**
 * An icon that opens its block beside the strip. Closes on a click outside,
 * Esc, or the cross; `children` is handed `close` for a row that moves on
 * (opens a list, swaps the record) and should take the flyout down with it.
 */
export function RailFlyout({
  icon,
  label,
  badge,
  children,
}: {
  icon: IconType;
  label: string;
  badge?: ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: "right-start", gutter: 12 }}
      lazyMount
      unmountOnExit
    >
      <RailHint label={label}>
        <Popover.Trigger asChild>
          <RailStripButton
            icon={icon}
            label={label}
            badge={badge}
            active={open}
          />
        </Popover.Trigger>
      </RailHint>
      <Portal>
        <Popover.Positioner>
          <Popover.Content {...RAIL_FLYOUT_CONTENT}>
            <Flex align="center" justify="space-between" mb={2}>
              <Popover.Title asChild>
                <Text fontSize="sm" fontWeight="700" color="gray.800">
                  {label}
                </Text>
              </Popover.Title>
              <Popover.CloseTrigger asChild>
                <CloseButton size="xs" />
              </Popover.CloseTrigger>
            </Flex>
            {children(close)}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

/** The spine's button — wide enough for the panel icon to read. */
const SPINE_KNOB = 26;

/**
 * THE SPINE — a line down the conveyor's far left with the fold's button on
 * it, at the MIDDLE (user, 2026-10-05: "at left most create a line then place
 * the minimize button on it … middle is the best"). The panel icon, not an
 * arrow: it says "panel" in both states, closing or opening.
 *
 * AS TALL AS THE RAIL, NEVER TALLER THAN THE SCREEN (user, 2026-10-05: "dynamic
 * from the total height of the conveyor if the height is not more than the
 * display height"). It is placed INSIDE the rail's sticky box, hanging out to
 * its left by {@link CONVEYOR_SPINE_ROOM} into the page's gutter — the rail
 * itself stays aligned with the page title — so its height
 * is the rail's — the expanded column or the folded strip, whichever is
 * showing — with no measuring; capped at {@link CONVEYOR_VIEW_MAX}. The rail
 * is sticky, so the line pins with it and the button never scrolls away.
 *
 * The parent must be the rail's positioned box and must not clip — on Service
 * that is the shell, not the scrolling body. One element in both states, so
 * the icon change animates in place.
 */
export function RailSpine({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const label = collapsed ? "Expand panel" : "Collapse panel";
  const Icon = collapsed ? LuPanelLeftOpen : LuPanelLeftClose;
  return (
    <Box
      hideBelow="lg"
      position="absolute"
      top={0}
      left={`calc(-1 * ${CONVEYOR_SPINE_ROOM})`}
      w={`${SPINE_KNOB}px`}
      h="100%"
      maxH={CONVEYOR_VIEW_MAX}
      css={{
        // The line answers a hover anywhere on the spine, so it reads as one
        // control with the button rather than as a border.
        "&:hover [data-spine-line]": { bg: BRAND_COLORS.primaryGreen },
      }}
    >
      <Box position="relative" h="100%">
        <Box
          data-spine-line=""
          aria-hidden
          position="absolute"
          top={0}
          bottom={0}
          left={`${SPINE_KNOB / 2 - 1}px`}
          w="2px"
          borderRadius="full"
          bg={KIT_BORDER}
          css={{ transition: "background 0.2s ease" }}
        />
        <Box
          position="absolute"
          left={0}
          top={`calc(50% - ${SPINE_KNOB / 2}px)`}
        >
          <RailHint label={label}>
            <chakra.button
              type="button"
              aria-label={label}
              aria-expanded={!collapsed}
              onClick={onToggle}
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxSize={`${SPINE_KNOB}px`}
              borderRadius="full"
              borderWidth="1px"
              borderColor={KIT_BORDER}
              bg="white"
              color="gray.500"
              boxShadow="0 1px 4px rgba(0, 0, 0, 0.12)"
              cursor="pointer"
              _hover={{
                color: BRAND_COLORS.darkGreen,
                borderColor: BRAND_COLORS.primaryGreen,
              }}
              _focusVisible={{
                outline: "2px solid",
                outlineColor: BRAND_COLORS.primaryGreen,
                outlineOffset: "2px",
              }}
              css={PRESS}
            >
              {/* Keyed on the state, so the new icon pops in. */}
              <Box key={String(collapsed)} display="flex" css={RAIL_TICK}>
                <Icon size={14} />
              </Box>
            </chakra.button>
          </RailHint>
        </Box>
      </Box>
    </Box>
  );
}
