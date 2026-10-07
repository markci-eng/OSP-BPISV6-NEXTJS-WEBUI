"use client";

// THE ACCOUNT STEPPER — how the processor moves through a billing's accounts
// now that the planholder list is out of the rail (user, 2026-09-25).
//
// BUILT FOR 50–100 ACCOUNTS A BILLING (user, 2026-09-25). A first version drew
// one tick per account and did not survive that: the summary below is the same
// height whatever the billing's size.
//
//   THE BAR     how far — done, then viewed, then the rest.
//   THE CHIPS   a count per state; pressing one opens Jump filtered to it —
//               and "35 / 87" on the right. Who the account is belongs to the
//               record column, not here.
//   THE ROW     Prev · Jump · Next, walking the billing IN ORDER, done
//               accounts included. Jump is the full list, filtered and
//               searchable.
//   UNVIEWED    straight to the next account nobody has opened.
//
// KEYS: `[` previous, `]` next, `J` jump, `N` next unviewed. Ignored while
// typing in a field or inside a dialog.
//
// PREV / NEXT ARE KEYED ON THEIR DISABLED STATE. The kit's buttons keep their
// first styling when `disabled` flips on a mounted button (see the franchise
// controls in the page) — remounting on the flip is what makes the colour
// follow.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react";
import { SecondarySmButton } from "osp-ui-kit";
import {
  LuArrowRight,
  LuCheck,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuListFilter,
  LuSkipForward,
} from "react-icons/lu";
import {
  ActionGroup,
  ActionListRow,
} from "../../death-claim/conveyor/claim-actions";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  KIT_BORDER,
  SURFACE_RADIUS,
} from "../../components/section-card";
import { toaster } from "../../components/toaster";
import {
  SHELL_NAV_HEIGHT,
  SHELL_NAV_HIDE_EASE,
  SHELL_NAV_SHOW_EASE,
  useShellNavHidden,
} from "../../components/use-shell-nav-hidden";
import {
  CountBubble,
  QUICK_BAR_ROOM,
} from "../../death-claim/conveyor/mobile-quick-access";
import {
  RAIL_TICK,
  RailHint,
  RailStripButton,
} from "../../components/rail-strip";
import {
  SHEET_HEIGHT,
  SHEET_MIN_HEIGHT,
} from "../../components/sheet-height";
import {
  type BillingStage,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import {
  accountMark,
  accountMarkLabel,
  isUnviewed,
  type AccountMark,
} from "./account-mark";
import {
  AccountJumpList,
  type AccountJumpListProps,
  type JumpFilter,
} from "./account-jump-list";

/** The billing commit each stage's last-account notice points to. */
const STAGE_COMMIT: Partial<Record<BillingStage, string>> = {
  "for-process": "Process Billing",
  processed: "Verify Billing",
};

/** Which state chips show, in reading order. */
const CHIP_ORDER: AccountMark[] = ["untouched", "opened", "done", "held"];

/** The bar's colour for each state — the icon colours in the Jump list. */
const MARK_FILL: Record<AccountMark, string> = {
  untouched: "var(--chakra-colors-gray-200)",
  opened: "#9fd4b5",
  done: BRAND_COLORS.primaryGreen,
  held: "#b45309",
};

/** The chip under the name. */
const MARK_CHIP: Record<AccountMark, { bg: string; color: string }> = {
  untouched: { bg: "gray.100", color: "gray.500" },
  opened: { bg: "#eaf5ee", color: BRAND_COLORS.darkGreen },
  done: { bg: BRAND_COLORS.primaryGreen, color: "white" },
  held: { bg: "#fdf3e4", color: "#b45309" },
};

/**
 * Whether a key press belongs to something else — a field being typed in, or a
 * dialog (a confirmation must not have the record change behind it).
 */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
    target.closest('[role="dialog"], [role="alertdialog"]') !== null
  );
}

export interface AccountStepperProps
  extends Pick<
    AccountJumpListProps,
    "selectable" | "checkedIds" | "onToggle"
  > {
  billing: ServiceBilling;
  services: ServiceRecord[];
  stage: BillingStage;
  currentId?: string;
  onOpen: (serviceId: string) => void;
  /** Off while the record column is being replaced, so a key cannot land mid-swap. */
  disabled?: boolean;
}

/**
 * THE BAR — done, then opened-not-done, then the rest. One element whatever
 * the billing's size. Shared by the rail's stepper and the phone's row, so the
 * two cannot draw progress two ways.
 */
function ProgressTrack({
  done,
  viewed,
  total,
}: {
  done: number;
  viewed: number;
  total: number;
}) {
  const pct = (n: number) => (total ? `${(n / total) * 100}%` : "0%");
  return (
    <Flex
      flex="1"
      minW={0}
      h="6px"
      borderRadius="full"
      bg={MARK_FILL.untouched}
      overflow="hidden"
      role="img"
      aria-label={`${viewed} of ${total} viewed`}
    >
      <Box w={pct(done)} bg={MARK_FILL.done} transition="width 0.3s ease" />
      <Box
        w={pct(viewed - done)}
        bg={MARK_FILL.opened}
        transition="width 0.3s ease"
      />
    </Flex>
  );
}

/** Where the open account is, and how far the billing has got. */
export interface AccountTally {
  /** The open account's index — 0 when none is open. */
  at: number;
  total: number;
  counts: Record<AccountMark, number>;
  viewed: number;
  /** The next account nobody has opened, after this one and wrapping round; -1 when none. */
  nextUnviewed: number;
}

/**
 * ONE PASS OVER THE BILLING, for the bar, the chips and Next unviewed — shared
 * by the rail's stepper, the phone's row and the phone's Actions sheet, so the
 * three cannot count two ways.
 *
 * "Not opened" counts a discrepancy nobody has opened yet — Process Billing
 * wants those viewed too — so the chips can overlap: a discrepancy is in its
 * own chip AND, until opened, in Not opened.
 */
export function tallyAccounts(
  billing: ServiceBilling,
  services: ServiceRecord[],
  stage: BillingStage,
  currentId?: string,
): AccountTally {
  const at = Math.max(
    0,
    services.findIndex((s) => s.id === currentId),
  );
  const total = services.length;
  const counts: Record<AccountMark, number> = {
    untouched: 0,
    opened: 0,
    done: 0,
    held: 0,
  };
  let viewed = 0;
  for (const service of services) {
    const m = accountMark(billing, service, stage);
    if (m === "held") counts.held += 1;
    if (m === "done") counts.done += 1;
    if (m === "opened") counts.opened += 1;
    if (isUnviewed(billing, service, stage)) counts.untouched += 1;
    else viewed += 1;
  }
  let nextUnviewed = -1;
  for (let k = 1; k <= total; k += 1) {
    const i = (at + k) % total;
    if (isUnviewed(billing, services[i], stage)) {
      nextUnviewed = i;
      break;
    }
  }
  return { at, total, counts, viewed, nextUnviewed };
}

/**
 * THE CHIPS — one per state that has anyone in it; each opens Jump on that
 * filter. The position sits on the right of the same row.
 *
 * NO PLANHOLDER LINE (user, 2026-09-25): the name, LPA and state are the record
 * column's first card, so this only says WHERE in the billing the open account
 * is. Shared by the rail's stepper and the phone's billing card.
 */
export function AccountStateChips({
  stage,
  tally: { at, total, counts },
  onFilter,
}: {
  stage: BillingStage;
  tally: AccountTally;
  onFilter: (filter: JumpFilter) => void;
}) {
  return (
    <Flex align="center" justify="space-between" gap={2}>
      <Flex gap={1} wrap="wrap" minW={0}>
        {CHIP_ORDER.filter((m) => counts[m] > 0).map((m) => (
          <Flex
            key={m}
            as="button"
            onClick={() => onFilter(m)}
            align="center"
            gap={1}
            px="7px"
            lineHeight="20px"
            borderRadius="full"
            fontSize="10.5px"
            fontWeight="600"
            bg={MARK_CHIP[m].bg}
            color={MARK_CHIP[m].color}
            cursor="pointer"
            _hover={{ filter: "brightness(0.96)" }}
            title={`Show ${accountMarkLabel(m, stage).toLowerCase()} accounts`}
          >
            {accountMarkLabel(m, stage)}
            <Text as="span" fontFamily="mono" fontWeight="700">
              {counts[m]}
            </Text>
          </Flex>
        ))}
      </Flex>
      <Text
        flexShrink={0}
        fontSize="12px"
        fontFamily="mono"
        color="gray.500"
        whiteSpace="nowrap"
        title={`Account ${at + 1} of ${total}`}
      >
        <Text as="span" fontWeight="600" color="gray.800">
          {at + 1}
        </Text>{" "}
        / {total}
      </Text>
    </Flex>
  );
}

/**
 * WHAT THE STEPPER DOES, apart from how it is drawn — the walk, Jump's open
 * state, the keys and the last-account notice. Shared by the rail's stepper
 * and the folded rail's strip, so a folded rail still answers `[ ] J N` and
 * still says when the last account is reached.
 */
function useAccountStepper({
  billing,
  services,
  stage,
  currentId,
  onOpen,
  disabled = false,
}: AccountStepperProps) {
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpFilter, setJumpFilter] = useState<JumpFilter>("all");

  /** Open Jump on a filter — "all" from the button and `J`, a state from a chip. */
  const openJump = (filter: JumpFilter = "all") => {
    setJumpFilter(filter);
    setJumpOpen(true);
  };

  const tally = tallyAccounts(billing, services, stage, currentId);
  const { at, total, nextUnviewed } = tally;
  const current = services[at];
  const atStart = at <= 0;
  const atEnd = at >= total - 1;

  const go = (index: number) => {
    const target = services[index];
    if (!target || target.id === currentId || disabled) return;
    onOpen(target.id);
  };

  // LAST IN THE QUEUE (user, 2026-09-29): arriving on the billing's last
  // account says so, since Next goes quiet there, and says whether anything
  // behind it is still unviewed. Once per arrival: the ref stops a re-render
  // (or Strict Mode's second effect run) from notifying twice.
  //
  // The current account is left out of the unviewed count. The page marks it
  // opened in its own effect, which runs after this one.
  const lastNotified = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!currentId || total < 2 || !atEnd) {
      lastNotified.current = undefined;
      return;
    }
    if (lastNotified.current === currentId) return;

    const left = services.filter(
      (s) => s.id !== currentId && isUnviewed(billing, s, stage),
    );
    const commit = STAGE_COMMIT[stage];
    const first = left.length ? services.indexOf(left[0]) : -1;
    // ONE TICK LATER, not inside the effect: the toaster flushes React
    // synchronously, which React refuses mid-commit ("flushSync was called
    // from inside a lifecycle method").
    const notice = {
      type: left.length ? "warning" : "success",
      title: "Last account in the queue",
      description: left.length
        ? `${left.length} of ${total} still not viewed. Next unviewed is #${first + 1}.`
        : `All ${total} accounts viewed.${commit ? ` ${commit} when ready.` : ""}`,
      action: left.length
        ? { label: `Go to #${first + 1}`, onClick: () => onOpen(left[0].id) }
        : undefined,
    };
    // Marked as notified when it FIRES, so a cleared timer (Strict Mode's
    // first run) leaves the second run free to schedule it again.
    const timer = window.setTimeout(() => {
      lastNotified.current = currentId;
      toaster.create(notice);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentId, atEnd, total, services, billing, stage]);

  useEffect(() => {
    const onKey =(event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTyping(event.target)) return;
      if (event.key === "[") {
        event.preventDefault();
        go(at - 1);
      } else if (event.key === "]") {
        event.preventDefault();
        go(at + 1);
      } else if (event.key === "j" || event.key === "J") {
        event.preventDefault();
        if (jumpOpen) setJumpOpen(false);
        else openJump();
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        if (nextUnviewed >= 0) go(nextUnviewed);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return {
    tally,
    current,
    atStart,
    atEnd,
    go,
    jumpOpen,
    setJumpOpen,
    jumpFilter,
    openJump,
  };
}

type Stepper = ReturnType<typeof useAccountStepper>;

/**
 * Jump's popover, around whatever trigger the caller draws — the rail's
 * "Jump to account" field, or the strip's icon. `children` must contain the
 * `Popover.Trigger`.
 */
function AccountJumpPopover({
  step,
  billing,
  services,
  stage,
  currentId,
  onOpen,
  disabled = false,
  selectable,
  checkedIds,
  onToggle,
  placement,
  children,
}: AccountStepperProps & {
  step: Stepper;
  placement: "bottom-start" | "right-start";
  children: ReactNode;
}) {
  return (
    <Popover.Root
      open={step.jumpOpen}
      onOpenChange={(e) => (e.open ? step.openJump() : step.setJumpOpen(false))}
      positioning={{ placement, sameWidth: false, gutter: 12 }}
      lazyMount
      unmountOnExit
    >
      {children}
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="380px"
            maxW="calc(100vw - 32px)"
            borderRadius={SURFACE_RADIUS}
            overflow="hidden"
          >
            <AccountJumpList
              key={step.jumpFilter}
              initialFilter={step.jumpFilter}
              billing={billing}
              services={services}
              stage={stage}
              currentId={currentId}
              onPick={(id) => {
                step.setJumpOpen(false);
                if (id !== currentId && !disabled) onOpen(id);
              }}
              selectable={selectable}
              checkedIds={checkedIds}
              onToggle={onToggle}
            />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

export function AccountStepper(props: AccountStepperProps) {
  const { stage, disabled = false } = props;
  const step = useAccountStepper(props);
  const { tally, current, atStart, atEnd, go, jumpOpen, openJump } = step;
  const { at, total, counts, viewed, nextUnviewed } = tally;

  if (!current) return null;

  const stepButton = {
    h: "30px",
    minH: "30px",
    minW: 0,
    px: 2.5,
    fontSize: "12px",
    borderRadius: "lg",
    flexShrink: 0,
    gap: 1,
  } as const;

  return (
    <Box flexShrink={0}>
      {/* THE BAR — see `ProgressTrack`. */}
      <ProgressTrack done={counts.done} viewed={viewed} total={total} />

      <Box mt={2}>
        <AccountStateChips stage={stage} tally={tally} onFilter={openJump} />
      </Box>

      {/* THE ROW */}
      <Flex mt={2.5} gap={1.5}>
        <SecondarySmButton
          key={atStart ? "prev-off" : "prev-on"}
          {...stepButton}
          disabled={atStart || disabled}
          onClick={() => go(at - 1)}
          aria-label="Previous account"
          title="Previous account  ["
        >
          <LuChevronLeft size={14} />
          Prev
        </SecondarySmButton>

        <AccountJumpPopover {...props} step={step} placement="bottom-start">
          <Popover.Trigger asChild>
            <Flex
              as="button"
              flex="1"
              minW={0}
              h="30px"
              px={2.5}
              align="center"
              justify="space-between"
              gap={1.5}
              borderWidth="1px"
              borderColor={jumpOpen ? BRAND_COLORS.primaryGreen : KIT_BORDER}
              borderRadius="lg"
              bg="white"
              fontSize="12px"
              fontWeight="500"
              color="gray.700"
              cursor="pointer"
              _hover={{ borderColor: BRAND_COLORS.primaryGreen }}
              title="Jump to an account  J"
            >
              <Text truncate>Jump to account</Text>
              <LuChevronDown size={13} />
            </Flex>
          </Popover.Trigger>
        </AccountJumpPopover>

        <SecondarySmButton
          key={atEnd ? "next-off" : "next-on"}
          {...stepButton}
          disabled={atEnd || disabled}
          onClick={() => go(at + 1)}
          aria-label="Next account"
          title={atEnd ? "Last account in the queue" : "Next account  ]"}
        >
          Next
          <LuChevronRight size={14} />
        </SecondarySmButton>
      </Flex>

      {/* NEXT UNVIEWED — on a 100-account billing, stepping one at a time past
          what is already seen is the slow part; this goes straight to what is
          left. Keyed on whether anything is left, for the kit's restyle bug. */}
      <SecondarySmButton
        key={nextUnviewed >= 0 ? "unviewed-on" : "unviewed-off"}
        {...stepButton}
        mt={1.5}
        w="full"
        disabled={nextUnviewed < 0 || disabled}
        onClick={() => go(nextUnviewed)}
        title="Next account nobody has opened  N"
      >
        {nextUnviewed >= 0 ? (
          <>
            Next unviewed
            <Text as="span" fontFamily="mono" fontWeight="500">
              #{nextUnviewed + 1}
            </Text>
            <LuArrowRight size={13} />
          </>
        ) : (
          <>
            <LuCheck size={13} />
            All accounts viewed
          </>
        )}
      </SecondarySmButton>
    </Box>
  );
}

/**
 * THE STEPPER IN THE FOLDED RAIL (user, 2026-10-05) — Prev, where you are,
 * Jump, Next and Next unviewed, each pressed straight from the strip. The
 * accounts card is NOT folded into an icon of its own: "clicking the button
 * then that was just a time that the user will view the icon" — the walk is
 * what the strip is for.
 *
 * Jump's red count is the accounts nobody has opened, which is what the commit
 * waits on; the bar and the chips are the expanded rail's.
 */
export function AccountStepperStrip(props: AccountStepperProps) {
  const { disabled = false } = props;
  const step = useAccountStepper(props);
  const { tally, current, atStart, atEnd, go } = step;
  const { at, total, counts, nextUnviewed } = tally;

  if (!current) return null;

  return (
    <Flex
      role="group"
      aria-label="Accounts"
      direction="column"
      align="center"
      gap="2px"
      py={1}
      bg={BRAND_COLORS.subtleBg}
      borderRadius={SURFACE_RADIUS}
    >
      <RailHint label="Previous account  [">
        <RailStripButton
          icon={LuChevronLeft}
          label="Previous account"
          disabled={atStart || disabled}
          onClick={() => go(at - 1)}
        />
      </RailHint>

      <Text
        fontSize="11px"
        fontFamily="mono"
        fontWeight="600"
        color="gray.600"
        lineHeight="1"
        py="3px"
        whiteSpace="nowrap"
        title={`Account ${at + 1} of ${total}`}
      >
        {/* Keyed on the position, so each move replays the tick. */}
        <Text as="span" key={at} css={RAIL_TICK}>
          {at + 1}/{total}
        </Text>
      </Text>

      <AccountJumpPopover {...props} step={step} placement="right-start">
        <RailHint label="Jump to account  J">
          <Popover.Trigger asChild>
            <RailStripButton
              icon={LuListFilter}
              label={
                counts.untouched > 0
                  ? `Jump to account, ${counts.untouched} not opened`
                  : "Jump to account"
              }
              active={step.jumpOpen}
              badge={
                counts.untouched > 0 ? (
                  // Keyed on the count, so the badge ticks as it drops.
                  <Box key={counts.untouched} display="flex" css={RAIL_TICK}>
                    <CountBubble count={counts.untouched} />
                  </Box>
                ) : undefined
              }
            />
          </Popover.Trigger>
        </RailHint>
      </AccountJumpPopover>

      <RailHint label={atEnd ? "Last account in the queue" : "Next account  ]"}>
        <RailStripButton
          icon={LuChevronRight}
          label="Next account"
          disabled={atEnd || disabled}
          onClick={() => go(at + 1)}
        />
      </RailHint>

      <RailHint
        label={
          nextUnviewed >= 0
            ? `Next unviewed #${nextUnviewed + 1}  N`
            : "All accounts viewed"
        }
      >
        <RailStripButton
          icon={nextUnviewed >= 0 ? LuSkipForward : LuCheck}
          label={
            nextUnviewed >= 0
              ? `Next unviewed, #${nextUnviewed + 1}`
              : "All accounts viewed"
          }
          disabled={nextUnviewed < 0 || disabled}
          onClick={() => go(nextUnviewed)}
        />
      </RailHint>
    </Flex>
  );
}

/**
 * 44px on a phone — Death Claim's answer-row size (user, 2026-10-02, option A
 * of the Service mock-up): secondaries 44px, the full-width commit 48px.
 */
const PHONE_BUTTON = {
  h: "44px",
  minH: "44px",
  px: 3,
  fontSize: "13px",
  borderRadius: "lg",
  gap: 1,
  flexShrink: 0,
} as const;

/**
 * The phone's version — Prev · Jump to account · Next, in a row at the end of
 * the record (user, 2026-09-25, reshaped 2026-09-30). This is how the reader
 * moves on from where the reading ends.
 *
 * JUMP IN THE MIDDLE, NOT A COUNT (user, 2026-09-30): choosing an account is
 * one of the most used moves, so it rides with Prev and Next. It opens the
 * page's `AccountJumpSheet` — the same one the Actions sheet opens.
 *
 * THE COMMIT — Process or Verify Billing — is a full-width button under the
 * row on every account (user, 2026-10-01). Next no longer turns into it on the
 * last account; it simply stops there.
 */
export function AccountStepperBar({
  billing,
  services,
  stage,
  currentId,
  onOpen,
  onJump,
  disabled = false,
  commit,
}: Pick<
  AccountStepperProps,
  "billing" | "services" | "stage" | "currentId" | "onOpen" | "disabled"
> & {
  /** Opens the page's Jump sheet on All. */
  onJump: () => void;
  /** The billing's commit, under the row. Absent where there is none. */
  commit?: { label: string; onCommit: () => void };
}) {
  const navHidden = useShellNavHidden();
  const { at, total, counts, viewed } = tallyAccounts(
    billing,
    services,
    stage,
    currentId,
  );
  if (total < 1) return null;
  const atEnd = at >= total - 1;

  const go = (index: number) => {
    const target = services[index];
    if (target && !disabled) onOpen(target.id);
  };

  return (
    <>
      {/* AT THE END OF THE RECORD, NOT FLOATING (user, 2026-10-01: "since the
          service has next and prev, we will fixed it at the bottom of the main
          content"). The quick bar took the bottom of the screen — see
          `MobileQuickAccess` — so this row is where the reading ends, and
          scrolls with it. Jump stays in the middle (option A of the mock-up). */}
      {/* `mt={5}`: the record's own gap between cards — its column is a plain
          block, so nothing else spaces this row off the card above it. */}
      {/* A GRID, NOT A FLEX: Prev and Next share the width with Jump (1 : 1.75
          : 1) instead of shrinking to their labels — about 83px each on a 375px
          phone where they were 64px. 1.75 and not less: "Jump to account" needs
          101px of text, and 1.65 left it 100 — measured, it cut to "accou…". */}
      <Box
        hideFrom="lg"
        display="grid"
        gridTemplateColumns="1fr 1.75fr 1fr"
        alignItems="center"
        gap={2}
        mt={5}
      >
        <SecondarySmButton
          key={at <= 0 ? "bar-prev-off" : "bar-prev-on"}
          {...PHONE_BUTTON}
          disabled={at <= 0 || disabled}
          onClick={() => go(at - 1)}
          aria-label="Previous account"
        >
          <LuChevronLeft size={14} />
          Prev
        </SecondarySmButton>

        <Flex
          as="button"
          onClick={onJump}
          minW={0}
          h="44px"
          px={2.5}
          align="center"
          justify="space-between"
          gap={1.5}
          borderWidth="1px"
          borderColor={KIT_BORDER}
          borderRadius="lg"
          bg="white"
          fontSize="13px"
          fontWeight="500"
          color="gray.700"
          cursor="pointer"
          aria-haspopup="dialog"
          aria-label="Jump to account"
        >
          <Text truncate>Jump to account</Text>
          <LuChevronDown size={13} />
        </Flex>

        {/* Keyed on its disabled state, for the kit's restyle-in-place bug —
            see the note at the top of this file. */}
        <SecondarySmButton
          key={atEnd ? "bar-next-off" : "bar-next-on"}
          {...PHONE_BUTTON}
          disabled={atEnd || disabled}
          onClick={() => go(at + 1)}
          aria-label="Next account"
        >
          Next
          <LuChevronRight size={14} />
        </SecondarySmButton>
      </Box>

      {/* THE PROGRESS, BETWEEN THE ROW AND THE COMMIT (user, 2026-10-01: "add
          the progress bar between or above the next and process buttons") —
          the rail's bar, and where in the billing this account is. Read just
          before committing, which is when "how much is left" matters. */}
      <Flex hideFrom="lg" align="center" gap={3} mt={3}>
        <ProgressTrack done={counts.done} viewed={viewed} total={total} />
        <Text
          flexShrink={0}
          fontSize="12px"
          fontFamily="mono"
          color="gray.500"
          whiteSpace="nowrap"
          title={`Account ${at + 1} of ${total}`}
        >
          <Text as="span" fontWeight="600" color="gray.800">
            {at + 1}
          </Text>{" "}
          / {total}
        </Text>
      </Flex>

      {/* THE COMMIT IN THE PAGE TOO, ON EVERY ACCOUNT (user, 2026-10-01: "the
          Process billing and verify should be also in the main content. Lets
          remove the dynamic of the next button"). Next is always Next; the
          commit is its own full-width button under the row. It keeps its own
          check — an unviewed account still stops it. */}
      {commit && (
        <Button
          hideFrom="lg"
          w="full"
          h="48px"
          mt={3}
          fontSize="14px"
          borderRadius="lg"
          bg={BRAND_COLORS.primaryGreen}
          color="white"
          _hover={{ bg: BRAND_COLORS.darkGreen }}
          disabled={disabled}
          onClick={commit.onCommit}
        >
          {commit.label}
        </Button>
      )}

      {/* ROOM UNDER IT for the quick bar, and for the shell's navigation only
          while that is up — so the row always ends just above the bar: never
          under it, and never over an empty band. */}
      <Box
        hideFrom="lg"
        aria-hidden
        flexShrink={0}
        h={
          navHidden
            ? QUICK_BAR_ROOM
            : `calc(${QUICK_BAR_ROOM} + ${SHELL_NAV_HEIGHT})`
        }
        transition={`height ${navHidden ? SHELL_NAV_HIDE_EASE : SHELL_NAV_SHOW_EASE}`}
      />
    </>
  );
}

/**
 * THE PHONE'S JUMP SHEET, held by the page rather than by the row (user,
 * 2026-10-01): the row's Jump, the billing card's chips and the Actions sheet
 * all open it, so it is one sheet with one owner. `filter` is what it opens on
 * — All, or the chip that was pressed — and `null` is closed.
 *
 * NEXT UNVIEWED FIRST — after an out-of-turn pick, the way back to the unopened
 * ones — over the same `AccountJumpList` the desktop popover shows.
 */
export function AccountJumpSheet({
  billing,
  services,
  stage,
  currentId,
  onOpen,
  disabled = false,
  filter,
  onClose,
}: Pick<
  AccountStepperProps,
  "billing" | "services" | "stage" | "currentId" | "onOpen" | "disabled"
> & {
  filter: JumpFilter | null;
  onClose: () => void;
}) {
  // Kept after closing so the list does not change filters mid-slide. Set
  // while rendering, not in an effect, so the sheet's first frame is already
  // on the chip that was pressed.
  const [shown, setShown] = useState<JumpFilter>("all");
  if (filter && filter !== shown) setShown(filter);

  const { nextUnviewed } = tallyAccounts(billing, services, stage, currentId);

  const pick = (id: string) => {
    onClose();
    if (id !== currentId && !disabled) onOpen(id);
  };

  return (
    // Mounted always, `open` driving it — see `SectionPopup`.
    <Drawer.Root
      open={filter !== null}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="2xl"
            bg={BRAND_COLORS.subtleBg}
            // AS TALL AS THE BILLING'S ACCOUNTS NEED, between the two
            // bounds — the list reserves its own room; see `AccountJumpList`.
            minH={`${SHEET_MIN_HEIGHT}px`}
            maxH={SHEET_HEIGHT}
            pb="env(safe-area-inset-bottom, 0px)"
          >
            <Drawer.Header
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={4}
              pt={3}
              pb={2}
            >
              <Drawer.Title fontSize="md" fontWeight="700" color="gray.800">
                Jump to account
              </Drawer.Title>
              <Drawer.CloseTrigger asChild position="static">
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            {/* A COLUMN, so the list below can stretch into whatever the
                sheet's floor leaves and that space still swipes. */}
            <Drawer.Body
              px={4}
              pt={1}
              pb={5}
              overflowY="auto"
              display="flex"
              flexDirection="column"
            >
              {/* Keyed on whether anything is left, for the restyle bug. */}
              <SecondarySmButton
                key={nextUnviewed >= 0 ? "jump-unviewed-on" : "jump-unviewed-off"}
                {...PHONE_BUTTON}
                w="full"
                h="36px"
                minH="36px"
                disabled={nextUnviewed < 0 || disabled}
                onClick={() => pick(services[nextUnviewed].id)}
              >
                {nextUnviewed >= 0 ? (
                  <>
                    Next unviewed
                    <Text as="span" fontFamily="mono" fontWeight="500">
                      #{nextUnviewed + 1}
                    </Text>
                    <LuArrowRight size={13} />
                  </>
                ) : (
                  <>
                    <LuCheck size={13} />
                    All accounts viewed
                  </>
                )}
              </SecondarySmButton>

              {/* BARE, NO CARD (user, 2026-10-01: "remove it in the card
                  same as the history") — the sheet is the surface. Keyed on
                  the filter so a chip's press opens on that chip. */}
              <Box mt={3} flex="1" display="flex" flexDirection="column">
                <AccountJumpList
                  key={shown}
                  initialFilter={shown}
                  billing={billing}
                  services={services}
                  stage={stage}
                  currentId={currentId}
                  onPick={pick}
                />
              </Box>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

/**
 * THE PHONE'S ACTIONS SHEET (user, 2026-10-01: "in the action drawer… the
 * same approach as the death claim which is everything is a list"). The
 * billing moved into the record, so the quick access's first slot holds the
 * moves a processor reaches for while reading: Jump to account and Next
 * unviewed.
 *
 * ONE GROUP NOW, WITH ROOM FOR MORE — the user expects actions not yet thought
 * of; they go here as further `ActionListRow`s, grouped the way Death Claim's
 * are.
 */
export function AccountActions({
  services,
  tally,
  disabled = false,
  onJump,
  onOpen,
}: {
  services: ServiceRecord[];
  tally: AccountTally;
  disabled?: boolean;
  onJump: () => void;
  onOpen: (serviceId: string) => void;
}) {
  const { nextUnviewed } = tally;
  return (
    <Flex direction="column" gap={3}>
      <ActionGroup title="Accounts">
        <ActionListRow
          label="Jump to account"
          icon={LuListFilter}
          detail={services.length}
          onClick={onJump}
        />
        <ActionListRow
          label={nextUnviewed >= 0 ? "Next unviewed" : "All accounts viewed"}
          icon={nextUnviewed >= 0 ? LuSkipForward : LuCheck}
          detail={nextUnviewed >= 0 ? `#${nextUnviewed + 1}` : undefined}
          disabled={nextUnviewed < 0 || disabled}
          onClick={() => onOpen(services[nextUnviewed].id)}
        />
      </ActionGroup>
    </Flex>
  );
}

