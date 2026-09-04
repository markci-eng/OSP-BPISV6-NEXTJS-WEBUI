"use client";

// One billing of a Service Payables queue, as an accordion card.
//
// CLOSED, it is a row of the queue: whose billing it is, what state it is in,
// and what it comes to. OPEN, it is the billing itself — the same plan-holder
// table `BillingDetail` draws, discrepancies included, and the billing's one
// action in a bar at the foot.
//
// TWO STAGES USE IT, AND THEY ARE NOT THE SAME SCREEN (2026-08-26). For Process
// is MAKING a billing: the foot carries Create/Edit and the head counts
// terminations. For Verification is CHECKING one — it exists, its plans are
// terminated — so every row gets a tick box, the foot reports who put it through
// and carries Verify, and the head states the money and the account count. That
// split is `action`.
//
// ROWS OPEN A RECORD IN BOTH, and that is `onOpenService`, which is a separate
// prop for a reason worth stating. It briefly carried both jobs — given, the
// card was a workbench; omitted, a reading — and that held only for as long as
// For Verification's rows were inert. The moment a verifier could click one to
// read the claim, the card would have flipped back to offering Create Billing.
// Opening a record and being a workbench are different facts.
//
// AN IDENTIFIER LEADS, AND WHICH ONE DEPENDS ON THE STAGE (`lead`). It is what
// this row IS — the thing quoted on a voucher, read down a phone and pasted into
// an email — so it is the largest and heaviest thing on the head, and everything
// else on the card is subordinate to it. The card briefly led with the chapel
// instead and that was wrong: the chapel is how you recognise the billing, not
// what the billing is.
//
// On For Process that identifier is the CODE, because most billings in that
// queue have no number yet and the code is the only thing every row is
// guaranteed to have. Creating the billing mints the NUMBER, and from then on
// the number is what the billing is known by outside this system — so on For
// Verification the two swap places. Neither is ever dropped; the one that does
// not lead is on the line beneath.
//
// WHAT MAKES THIRTEEN CODES TELLABLE APART is weighting, not hierarchy. Every
// billing in a territory is normally the same cut of the same month, so the codes
// differ only in their first six characters: twelve of Central Luzon 1's thirteen
// read "…3JUL26". Drawn at one weight that is thirteen near-identical strings and
// the eye has to parse a prefix out of each. Split (see `splitBillingCode`), the
// handle keeps full contrast and the shared tail drops back to a hint — the
// difference reads first, and the whole code is still there to be quoted.
//
// THE SUBTITLE IS THE CHAPEL, and once the billing is created, its NUMBER too.
// Neither restates the line above: the number is minted and cannot be derived at
// all, and the chapel name is not reliably derivable either — most handles are a
// truncation you can read through (ANGELE, BALANG, GUAGUA) but several are not:
// CENBUL is BALIUAG, ILDEFO is SAN ILDEFONSO, JOSENU is SAN JOSE NUEVA ECIJA.
// What the subtitle no longer carries is the PERIOD — "JULY 16-22, 2026" restates
// the cut already in the code and was identical on every card in the stack, so it
// distinguished nothing.
//
// NO ACCENT DOWN THE EDGE. A coloured strip said the card's state a second time,
// louder than the chips that already say it, and on a stack where most cards are
// in the same state it drew a line beside every row to distinguish none of them.
// State is in the chips, which appear only when they are true.
//
// This replaced the two-column rail-and-detail arrangement on For Process. The
// rail existed so the chapel list could stay on screen while one billing was
// worked beside it; the accordion keeps the whole queue on screen by making
// every billing its own section, so "which chapel am I on" is answered by where
// the open card sits in the stack rather than by a highlight in a second
// column.
//
// WHAT DID NOT CHANGE: a plan holder's row opens their service record, through
// the same no-billing-number warning `BillingDetail` gives — the page still
// decides whether that means a swap or a drawer. The table, its columns and its
// summary row are `BillingDetail`'s own exports, so the two presentations
// cannot drift apart.

import { useCallback, useRef, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, useMessageDialog } from "osp-ui-kit";
import {
  LuChevronRight,
  LuCircleAlert,
  LuCircleCheck,
  LuPrinter,
  LuStore,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { alignHeadersRight } from "../../components/table-align";
import {
  deceasedName,
  discrepancyLabel,
  formatCSP,
  splitBillingCode,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import {
  canApproveBilling,
  canVerify,
  canVerifyBilling,
  useApproveBilling,
  useVerifyAccounts,
  useVerifyBilling,
  verifiableAccounts,
} from "../use-verify-accounts";
import { BillingAction } from "./BillingAction";
import {
  HELD_ROW_CSS,
  VERIFIED_ROW_CSS,
  VERIFY_TABLE_LAYOUT,
  billingRows,
  groupServiceColumns,
  rowsSummaryLabel,
  serviceColumns,
  verifiedRows,
} from "./BillingDetail";

/** The same red every discrepancy in this module is drawn in. */
const DISCREPANCY_ACCENT = "#e11d48";

/**
 * The card unfolding — the panel growing from nothing to its own height.
 *
 * THE RESTING STATE IS OPEN, and the animation only says where it came FROM.
 * That is the whole design of this, and it is what makes it safe: `animation`
 * with the default `fill-mode: none` leaves the element at its own base style
 * whenever the animation does not run. So a browser that refuses to animate —
 * or a document that is not compositing, where the frame loop is suspended —
 * shows a fully open panel with no motion, which is the correct thing to show.
 *
 * FRAMER MOTION WAS TRIED FIRST and is the wrong tool for exactly that reason,
 * even though this app animates with it elsewhere. `initial={{height: 0}}`
 * writes `height: 0px` as an INLINE style and waits for the frame loop to take
 * it back off; where that loop never ticks, the panel is not merely
 * un-animated, it is invisible, with its content laid out and clipped to
 * nothing. Measured on this page: `style="overflow: hidden; height: 0px"` over
 * a 330px table. An animation that hides the content when it fails is worse
 * than no animation at all.
 *
 * `grid-template-rows: 0fr → 1fr` is what animates to a height nobody has
 * measured. A `max-height` transition wants a number picked in advance: too
 * small cuts off a twelve-row chapel, too large spends most of the animation
 * travelling through empty space so the panel appears to pause before it moves.
 *
 * A KEYFRAME AND NOT A TRANSITION, because the panel is mounted by the same
 * click that opens it: a transition needs the element to exist at its start
 * value and then change, and React renders it straight at the end value.
 *
 * OPENING ONLY. Closing is instant, and deliberately — see the note where the
 * panel is rendered.
 */
const PANEL_UNFOLD = {
  display: "grid",
  gridTemplateRows: "1fr",
  animation: "billingPanelUnfold 0.24s ease-out",
  // A reader who has asked for less motion gets the panel, immediately.
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
} as const;

/**
 * The clipper inside {@link PANEL_UNFOLD}.
 *
 * A grid row shorter than its content does not hide the overflow by itself, so
 * without this the full-height table is on screen from the first frame and only
 * the box around it grows. `minHeight: 0` is the other half: a grid item's
 * default `min-height: auto` refuses to be smaller than its content, which
 * would pin the row open and cancel the animation entirely.
 */
const PANEL_CLIP = { overflow: "hidden", minHeight: 0 } as const;

/**
 * The keyframes, INSERTED BY HAND, and this is not a stylistic choice.
 *
 * Chakra v3's `css` prop silently drops the STEPS of a nested `@keyframes`
 * object: it emits the at-rule and leaves it empty. Verified against the
 * rendered stylesheet, and it is not new — `servicePayablesSwapIn` on the For
 * Process page has been emitting `@keyframes servicePayablesSwapIn { }` since it
 * was written, so the record swap's fade has never actually faded. Anything
 * animated in this module has to avoid that path until it is fixed.
 *
 * At module scope rather than in an effect so the rule is in the document
 * before the first panel can render, and guarded by id so the thirteen cards on
 * a territory insert it once between them.
 */
const UNFOLD_KEYFRAMES_ID = "service-payables-billing-panel-unfold";

if (typeof document !== "undefined") {
  if (!document.getElementById(UNFOLD_KEYFRAMES_ID)) {
    const style = document.createElement("style");
    style.id = UNFOLD_KEYFRAMES_ID;
    style.textContent = `@keyframes billingPanelUnfold{from{grid-template-rows:0fr;opacity:0}60%{opacity:1}to{grid-template-rows:1fr;opacity:1}}`;
    document.head.appendChild(style);
  }
}

/**
 * One small state marker on the card's head — the billing number once minted,
 * the franchise mark, the held counts. The same construction as the franchise
 * chip on `ChapelBillingCard`, generalised over its colours.
 */
function Chip({
  children,
  fg,
  bg,
  borderColor,
  icon,
}: {
  children: React.ReactNode;
  fg: string;
  bg: string;
  borderColor: string;
  icon?: React.ReactNode;
}) {
  return (
    <Flex
      display="inline-flex"
      align="center"
      gap={1}
      px={1.5}
      py="1px"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      bg={bg}
    >
      {icon && (
        <Box color={fg} display="flex">
          {icon}
        </Box>
      )}
      <Text fontSize="10px" fontWeight="700" color={fg} whiteSpace="nowrap">
        {children}
      </Text>
    </Flex>
  );
}

/** "1 account" / "3 accounts" — the word the source system counts these in. */
const accountsLabel = (count: number) =>
  `${count} ${count === 1 ? "account" : "accounts"}`;

/**
 * One table in the panel, with the band that introduces it.
 *
 * A DECLARED TYPE rather than one inferred off the array literal, because the
 * literal comes out of a ternary whose two arms are different shapes — TypeScript
 * would hand back a union of two array types, which `.map` cannot be called on
 * without narrowing that says nothing a reader needs. See `sections`.
 */
interface PanelSection {
  key: string;
  rows: ServiceRecord[];
  columns: ColumnDef<ServiceRecord>[];
  /** Whether this table carries tick boxes — true of exactly one, or none. */
  selectable: boolean;
  /** The strip above it, on every table but the first. */
  band: {
    label: string;
    /** What the group comes to, at the right of the strip. */
    note: string;
    bg: string;
    border: string;
    fg: string;
    icon: React.ReactNode;
  } | null;
}

export interface BillingAccordionCardProps {
  billing: ServiceBilling;
  /**
   * Whether this card is expanded. The page owns which one is — and only one
   * ever is, so opening this card closed whichever was open before.
   */
  open: boolean;
  onToggle: () => void;
  /**
   * Open one plan holder's service record — handed up, exactly as
   * `BillingDetail` hands it up, because only the page knows whether that means
   * a swap or a drawer.
   *
   * OMITTED WHERE A ROW LEADS NOWHERE: the rows then drop their pointer cursor
   * rather than looking like a way in that answers nothing.
   *
   * IT NO LONGER DECIDES WHAT THE CARD IS (2026-08-26). It used to: given, the
   * card was a workbench; omitted, a reading. That held for exactly as long as
   * For Verification's rows were inert — the moment a verifier could click one
   * to read the claim, the card would have flipped back to offering Create
   * Billing and counting terminations. Opening a record and being a workbench
   * are two different facts and they are two props now; see {@link action}.
   */
  onOpenService?: (service: ServiceRecord) => void;
  /**
   * Which identifier heads the card. `"code"` is For Process's and the default;
   * `"number"` is every stage after it. See the note at the top.
   *
   * A card asked to lead with a number it has not got falls back to the code —
   * a head with a blank line where its title goes is worse than the wrong half
   * of a pair leading.
   */
  lead?: "code" | "number";
  /**
   * WHAT THIS CARD IS FOR — which decides its head's emphasis and everything in
   * the bar at its foot.
   *
   *   `"billing"`  For Process. The billing is being MADE: the foot carries
   *                Create/Edit, the head counts terminations and marks the one
   *                completed under an open record.
   *   `"verify"`   For Verification. The billing is being CHECKED: every row
   *                gets a tick box, the foot reports who put the billing
   *                through and carries Verify, and the head states the money
   *                and the account count rather than hinting at them.
   *   `"approve"`  For Approval. The billing is being JUDGED, and it is the
   *                BILLING that is (user, 2026-08-27: "no checkbox in the
   *                table, since the approval is for billing"). Everything the
   *                verify card draws is drawn, minus the tick boxes: the
   *                accounts were read and signed one stage back by somebody
   *                else, and an approver is not being asked to read them again
   *                — they either put the document through or do not. So the
   *                rows are a READING, and the foot carries Approve.
   *   `"endorse"`  For Endorsement. The approve card MINUS ITS BUTTON, for as
   *                long as the endorsement's act is undescribed (user,
   *                2026-08-27). Same rows, same marker column, same provenance,
   *                same Print — only the green button is withheld, because the
   *                billing here is already approved and the only act this card
   *                knows how to offer would approve it again.
   *
   * A NAMED JOB AND NOT A HANDFUL OF BOOLEANS, because the differences are not
   * independent — a card with Create Billing in its foot and tick boxes in its
   * table is not a screen anybody wants, and three separate flags is three ways
   * to build one by accident. It also reads at the call site as the thing it
   * actually is: `action="verify"` says which queue this card belongs to.
   *
   * THE TICKS LIVE AND DIE WITH THE OPEN CARD, which is the kit's shape rather
   * than a decision: `DataTable` owns its selection and offers no controlled
   * prop to put one back, so folding the card unmounts the table and clears
   * them. Holding a copy in the page would only let this component and the table
   * disagree on the next unfold, which is worse than an honest reset.
   */
  action?: "billing" | "verify" | "approve" | "endorse";
}

export function BillingAccordionCard({
  billing,
  open,
  onToggle,
  onOpenService,
  lead = "code",
  action = "billing",
}: BillingAccordionCardProps) {
  /** The billing is being made — For Process. See {@link action}. */
  const building = action === "billing";
  /** The billing is being checked — For Verification. */
  const verifying = action === "verify";
  /** The billing is being judged — For Approval. */
  const approving = action === "approve";
  /** The billing has been approved and is waiting to be endorsed. */
  const endorsing = action === "endorse";
  /**
   * Whether this card is a READING of a finished billing rather than a
   * workbench — true of every stage past For Process.
   *
   * WHAT THEY SHARE is everything except the tick boxes and the button: the
   * head states the money and the account count, the panel groups its rows,
   * the foot names who put the billing through. So the shared half asks this,
   * and only the places that actually differ ask which queue it is.
   */
  const reading = verifying || approving || endorsing;
  const { messageBox } = useMessageDialog();

  /**
   * Whether the no-billing-number warning has been given for this card.
   *
   * `BillingDetail`'s rule, held per card instead of per code: the warning is
   * about the BILLING, so it is asked once and not once per row. A ref rather
   * than state for the same reason it is one there — nothing on screen changes
   * when it is written.
   */
  const warned = useRef(false);

  /**
   * Open a plan holder's record — after a word, when the billing has no number.
   * See the note on `BillingDetail.openService`, which this is verbatim: the
   * same fact delivered before the work rather than at the disabled button.
   */
  /**
   * The rows ticked on this billing, by id.
   *
   * THE SETTER BAILS OUT WHEN NOTHING CHANGED, and that is not an optimisation.
   * `DataTable` hands its selection up through `onSelectionChange` with a fresh
   * ARRAY every time it runs, so a setter that stored it unconditionally would
   * queue a re-render on every render — a loop the table would keep feeding.
   * Comparing the ids and returning the previous array when they match is what
   * makes the callback safe to be called as often as the kit likes.
   */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectionChange = useCallback((rows: ServiceRecord[]) => {
    const next = rows.map((row) => row.id);
    setSelectedIds((prev) =>
      prev.length === next.length && prev.every((id, i) => id === next[i])
        ? prev
        : next,
    );
  }, []);

  /**
   * Bumped to CLEAR THE TICKS after a verification goes through — it is the
   * table's `key`, so raising it builds a fresh one with an empty selection.
   *
   * A remount and not a call, because `DataTable` owns its selection and offers
   * nothing to reset it with. Left alone, the rows just signed off would stay
   * ticked under their own green checks and the bar would go on offering to
   * verify accounts that no longer can be — the button would filter them out and
   * do nothing, which is the shape of a control people learn to distrust.
   *
   * Only ever bumped on SUCCESS. A cancelled dialog leaves the selection exactly
   * as the verifier built it, which is the whole point of cancelling.
   */
  const [tableEpoch, setTableEpoch] = useState(0);

  const verifyAccounts = useVerifyAccounts();
  const verifyBillingNo = useVerifyBilling();
  const approveBillingNo = useApproveBilling();

  const openService = async (service: ServiceRecord) => {
    if (!onOpenService) return;

    if (!billing.billingNo && !warned.current) {
      const proceed = await messageBox({
        title: "NO BILLING NUMBER YET",
        message:
          `${billing.billingCode} has not been created, so it carries no billing number — ` +
          `and a plan can only be terminated into a billing that has one. You can still open ` +
          `${deceasedName(service)}'s record and save what you enter; terminating waits until ` +
          `the billing is created. Continue?`,
        confirmText: "Continue",
        cancelText: "Cancel",
        variant: "confirmation",
      });
      if (!proceed) return;
      warned.current = true;
    }
    onOpenService(service);
  };

  const created = Boolean(billing.billingNo);
  /** Every plan holder — billable, then held. See `billingRows`. */
  const rows = billingRows(billing);

  /**
   * The accounts on this billing a verifier may still sign — the denominator of
   * everything the bar at the foot says, and the only rows that carry a tick box
   * at all.
   */
  const verifiable = verifying ? verifiableAccounts(billing) : [];

  /**
   * What is ticked AND still needs signing — what the Verify button will
   * actually change.
   *
   * NOT SIMPLY WHAT IS TICKED, and it is counted off {@link verifiable} rather
   * than filtered out of the rows for two reasons that used to be one. Select-all
   * ticks the rows already verified along with the rest, so the raw count and the
   * number of signatures about to be written come apart the moment a billing is
   * half done — measured: the button offered "Verify 4 accounts" over a dialog
   * that correctly said three. The dialog was right, so the button is counted the
   * same way.
   *
   * IT ALSO DROPS THE HELD ROWS, which the old filter did not: it excluded what
   * was already verified and let a discrepancy through, so ticking a held row and
   * pressing Verify would have signed for a service that is not on the billing
   * and not in its money. `verifiableAccounts` is the rule for what may be signed
   * — one rule, read here and in the hook that writes.
   *
   * DECLARED HERE, under `rows`, and not up with the selection state it reads:
   * this runs during render rather than in a callback, so `rows` has to exist
   * first. The compiler caught it.
   */
  const pendingSelected = verifiable.filter((service) =>
    selectedIds.includes(service.id),
  );

  /**
   * Whether the click now being handled began inside a row's TICK BOX.
   *
   * THE KIT'S SELECTION CELL DOES NOT STOP THE ROW'S OWN CLICK. Its mobile card
   * and accordion variants both give their checkbox an `onClick` that calls
   * `stopPropagation`; the desktop table's cell does not (read off the bundle,
   * then measured — ticking a row opened that plan holder's record and took the
   * whole page with it). So every tick threw the verifier out of the list they
   * were ticking, and the half-built selection went with the unmounted table.
   *
   * READ IN THE ROW HANDLER RATHER THAN STOPPED ON THE WAY UP, which was the
   * first attempt and is worth recording. A listener inside the table can catch
   * the click before it reaches React's root and `stopPropagation` it, which
   * does silence the row — and silences the tick with it: the checkbox's own
   * `onCheckedChange` is a React prop, so it is dispatched from that same root.
   * Measured: the input went checked in the DOM and the table's model never
   * heard, leaving a ticked row the Verify button could not see.
   *
   * So nothing is stopped. The capture pass records WHERE the click started,
   * `onRowClick` runs afterwards and declines. `onClickCapture` is React's own
   * and fires before any handler below it, so the flag is always written before
   * it is read.
   *
   * FOUND BY THE CHECKBOX AND NOT BY POSITION. "First cell" is the selection
   * column only while there IS one — on For Process the first cell is the plan
   * holder, and a rule about position would have made that name the one place a
   * row could not be opened from.
   */
  const fromTickBox = useRef(false);

  const noteClickOrigin = (event: React.MouseEvent) => {
    const cell = (event.target as HTMLElement | null)?.closest("td");
    fromTickBox.current = Boolean(
      cell?.querySelector('input[type="checkbox"]'),
    );
  };

  /** Sign off what is ticked, then clear the ticks if anything was written. */
  const handleVerify = async () => {
    if (await verifyAccounts(billing, pendingSelected)) {
      setSelectedIds([]);
      setTableEpoch((epoch) => epoch + 1);
    }
  };

  /**
   * Sign the BILLING — the act that sends it to For Approval.
   *
   * Nothing to clear afterwards: the billing leaves this queue on the write, so
   * the card and its selection go with it.
   */
  const handleVerifyBilling = () => void verifyBillingNo(billing);

  /**
   * Approve the billing — the act that sends it to For Endorsement.
   *
   * Nothing to clear, for the reason its verify counterpart has nothing: the
   * billing leaves this queue on the write, and the card goes with it.
   */
  const handleApprove = () => void approveBillingNo(billing);

  /**
   * PRINT — HONESTLY UNWIRED, which is the same answer Loan Details gives on the
   * record. There is no print pipeline in this app: no template, no document
   * service, nothing to send. A button that opened the browser's own print
   * dialog on a card inside a scrolling accordion would produce a page of
   * furniture and no billing, which is worse than saying so.
   */
  const handlePrint = () =>
    messageBox({
      title: "PRINT BILLING",
      message: `${
        billing.billingNo ?? billing.billingCode
      } — printing is not wired into this area yet. The billing sheet has no template or document service behind it.`,
      confirmText: "OK",
      variant: "information",
      showCancel: false,
    });
  const billable = billing.services.length;
  const discrepant = billing.discrepant.length;

  /**
   * THE PANEL'S TABLES, in the order they are stacked.
   *
   * ONE ON A WORKBENCH, and two or three on a reading — which is the answer to
   * "a signed-off account still comes back ticked under Select all"
   * (user, 2026-08-27), and it had to be a structural one. The kit takes
   * `enableRowSelection` as a single boolean for the whole table (read off the
   * bundle) and offers nothing per row: select-all reaches EVERY row in a
   * table's data, so a row that must never be ticked cannot be in the table that
   * has tick boxes. Dimming the box only stopped the pointer; the header reached
   * past it into the model.
   *
   * SO THE TICK BOXES DEFINE THE FIRST TABLE. It holds exactly what may be
   * signed — `verifiableAccounts`, the same rule the button and the write read —
   * which makes the kit's select-all mean "all outstanding", the thing a
   * verifier wanted it to mean in the first place. What is signed and what is
   * held follow underneath, in tables of their own, banded and unselectable.
   *
   * THEY STILL READ AS ONE TABLE: the same five columns in the same places, one
   * set of headings over the first, a marker column standing where the tick box
   * stands. See `VERIFY_TABLE_LAYOUT` and `groupServiceColumns`.
   *
   * Empty groups are dropped, so an untouched billing is a single table exactly
   * as before, and a billing held entirely by discrepancies opens straight into
   * its held group with the headings above it.
   */
  /**
   * The accounts signed off IN THIS SESSION — the verify queue's own group, and
   * only its own.
   *
   * NOT ASKED ON FOR APPROVAL, which would otherwise put the same account in two
   * tables. That queue lists every account in its first section (see below), so
   * a billing verified and then approved in one sitting would find its accounts
   * in `verifiedRows` as well and draw them twice. It also has nothing to say
   * there: every account on that queue is verified by definition, and a band
   * marking all of them marks none — the rule the chips on the head are built
   * on.
   */
  const signed = verifying ? verifiedRows(billing) : [];

  const sections: PanelSection[] = reading
    ? [
        {
          key: "accounts",
          /**
           * WHAT THE FIRST TABLE HOLDS, and the queues want different things.
           * Verification is working THROUGH the accounts, so it lists the ones
           * still to sign and moves each into the group below as it goes. The
           * queues after it are not working through anything — the accounts
           * were read and signed at Verification — so they list them all, once,
           * and let the reader read.
           */
          rows: verifying ? verifiable : billing.services,
          /**
           * AND EVERY LATER QUEUE'S TABLE WEARS THE MARKER COLUMN, where
           * verification's wears the tick boxes. Both are six columns wide,
           * which is what keeps this table's grid identical to the held group's
           * beneath it — see `VERIFY_TABLE_LAYOUT`, whose widths are counted
           * from the first column in. The marker earns its place as more than a
           * spacer: every account past Verification IS verified, so the tick it
           * draws on each row is true, and the alert it draws on a held one is
           * the same mark the group below carries.
           */
          columns: verifying ? serviceColumns : groupServiceColumns,
          selectable: verifying,
          band: null,
        },
        {
          key: "verified",
          rows: signed,
          columns: groupServiceColumns,
          selectable: false,
          band: {
            label: "Verified",
            note: `${accountsLabel(signed.length)} · ${formatCSP(
              signed.reduce((total, service) => total + service.csp, 0),
            )}`,
            bg: "#dcfce7",
            border: "#86efac",
            fg: BRAND_COLORS.darkGreen,
            icon: <LuCircleCheck size={12} />,
          },
        },
        {
          key: "held",
          rows: billing.discrepant,
          columns: groupServiceColumns,
          selectable: false,
          band: {
            label: "Held by a discrepancy",
            // NO SUBTOTAL, because there is none to give: a held service is not
            // on the billing and not in its money, so a figure here would invite
            // the reader to add it to the total at the foot.
            note: `${accountsLabel(discrepant)} · not billed`,
            bg: "#fff1f2",
            border: "#fecdd3",
            fg: DISCREPANCY_ACCENT,
            icon: <LuCircleAlert size={12} />,
          },
        },
      ].filter((section) => section.rows.length > 0)
    : [
        {
          key: "all",
          rows,
          columns: serviceColumns,
          selectable: false,
          band: null,
        },
      ];

  /** The code, split so its shared tail can be dimmed. */
  const code = splitBillingCode(billing.billingCode, billing.chapelCode);

  /** Whether a row goes anywhere — see {@link onOpenService}. */
  const clickable = Boolean(onOpenService);

  /** The number leads, where the stage asks for it and the billing has one. */
  const numberLeads = lead === "number" && created;

  /**
   * The line under the money.
   *
   * ON A WORKBENCH IT IS WHAT IS LEFT TO DO, not what is in the billing. It used
   * to be the service count, which the table's own summary row says again the
   * moment the card is opened. A count also answers a question nobody asks of a
   * closed card: the one actually being asked is "does this need me", and
   * progress is what answers it. "Not created" leads for an uncreated billing
   * because it is the blocker — no number means nothing under it can be
   * terminated at all, whatever the counts.
   *
   * ON A READING IT IS THE NUMBER OF ACCOUNTS (user, 2026-08-26), which with the
   * billing number and the money is one of the three things that head is FOR.
   * "Accounts" is the word the source system uses — `TblClaimsBilling` has a
   * `NoOfAccount` column — and what it counts is the plans TERMINATED into the
   * number, so it is read off `terminatedCount` and not off the row count. The
   * two differ exactly when a service is held by a discrepancy: that row is on
   * the billing and on screen, but it was never terminated and it is not in the
   * money beside it, so counting it here would put an account against an amount
   * that does not include it.
   *
   * IT REPLACED THE PERIOD, which was briefly here on the reasoning that a
   * billing number encodes a year and a sequence rather than a cut. That was
   * half right: the CODE on the line below encodes the cut — `BROOKE3MAY26` is
   * the third cut of May — so the period was never actually missing from the
   * head, only spelled differently. Saying it twice cost the slot the count
   * needed.
   */
  const accounts = billing.terminatedCount;

  const progress = reading
    ? `${accounts} ${accounts === 1 ? "account" : "accounts"}`
    : !created
      ? "Not created"
      : billable === 0
        ? "Nothing billable"
        : `${billing.terminatedCount} of ${billable} terminated`;

  /**
   * The billing COMPLETED under the user this visit — every plan terminated,
   * so it has moved to Processed, and the page is keeping it on screen for a
   * final check rather than snatching it away. See the `billings` rule on the
   * For Process page; this card only ever sees a processed billing that way.
   *
   * NOT ON A READING, where every card in the stack is processed by definition
   * — a chip on all of them would mark none of them, which is the rule the rest
   * of this head is built on.
   */
  const completed = building && billing.stage === "processed";

  return (
    <Box
      borderWidth="1px"
      borderColor={open ? "gray.300" : "gray.200"}
      borderRadius="xl"
      bg="white"
      boxShadow={open ? "sm" : "xs"}
      overflow="hidden"
      transition="border-color 0.15s ease, box-shadow 0.15s ease"
    >
      {/* THE HEAD IS ONE BUTTON, the whole row — a bigger target than a caret
          alone, and what an accordion's row is expected to be. */}
      <Flex
        as="button"
        onClick={onToggle}
        aria-expanded={open}
        w="full"
        align="center"
        gap={3}
        px={4}
        py={3}
        textAlign="left"
        cursor="pointer"
        _hover={{ bg: "gray.50" }}
        transition="background 0.12s ease"
      >
        <Box
          flexShrink={0}
          color={open ? BRAND_COLORS.primaryGreen : "gray.400"}
          transform={open ? "rotate(90deg)" : undefined}
          transition="transform 0.14s ease"
          display="flex"
        >
          <LuChevronRight size={15} />
        </Box>

        <Box minW={0} flex="1">
          {numberLeads ? (
            <>
              {/* THE BILLING NUMBER — what this row is, once there is one.
                  Whole and at one weight, unlike the code: it is nine
                  characters, and what varies down a list of them is the tail, so
                  there is no shared head to drop back the way `splitBillingCode`
                  drops a code's period. */}
              <Text
                fontSize="sm"
                fontWeight="700"
                color="gray.800"
                truncate
                letterSpacing="0.01em"
              >
                {billing.billingNo}
              </Text>
              {/* THE CODE, then the CHAPEL — the two things that say which
                  billing this is without repeating the number above. The code
                  keeps its split here too, at the smaller size: down a staff's
                  list the periods are as identical as they are on For Process,
                  and the handle is what a reader recognises the chapel by
                  before the name has been read. */}
              <Text fontSize="11px" color="gray.500" mt="1px" truncate>
                <Text as="span" fontWeight="700" color="gray.600">
                  {code.handle}
                </Text>
                <Text as="span" fontWeight="600" color="gray.400">
                  {code.period}
                </Text>
                {" · "}
                {billing.chapelDesc}
              </Text>
            </>
          ) : (
            <>
              {/* THE CODE — what this row is, and so the head's title. Whole,
                  but weighted: the handle at full contrast, the cut-month-year
                  that every card in the stack shares dropped back to a hint.
                  Copying it or reading it aloud still gets all of it. */}
              <Text fontSize="sm" truncate letterSpacing="0.01em">
                <Text as="span" fontWeight="700" color="gray.800">
                  {code.handle}
                </Text>
                <Text as="span" fontWeight="600" color="gray.400">
                  {code.period}
                </Text>
              </Text>
              {/* THE CHAPEL, and the NUMBER once it exists — the two things that
                  say which billing this is without repeating the code above.
                  The number leads the pair: it is the identity this billing is
                  quoted by outside this system the moment it is minted. */}
              <Text fontSize="11px" color="gray.500" mt="1px" truncate>
                {billing.billingNo && (
                  <Text
                    as="span"
                    fontWeight="600"
                    color={BRAND_COLORS.primaryGreen}
                  >
                    {billing.billingNo}
                    {" · "}
                  </Text>
                )}
                {billing.chapelDesc}
              </Text>
            </>
          )}
        </Box>

        {/* The card's state, said in marks rather than sentences. Each appears
            only when it is true of THIS billing — a chip every card carried
            would say nothing on any of them. */}
        <Flex
          gap={1.5}
          wrap="wrap"
          justify="flex-end"
          flexShrink={1}
          display={{ base: "none", sm: "flex" }}
        >
          {billing.isFranchise && (
            <Chip
              fg="#b45309"
              bg="#fffbeb"
              borderColor="#fde68a"
              icon={<LuStore size={11} />}
            >
              {billing.isManualFranchise
                ? "Franchise · endorsed on paper"
                : "Franchise"}
            </Chip>
          )}
          {/* Finished this visit — every plan terminated, kept on the page for
              a final check. Leads the green chips because it supersedes what
              the number alone says. */}
          {completed && (
            <Chip
              fg="white"
              bg={BRAND_COLORS.primaryGreen}
              borderColor={BRAND_COLORS.primaryGreen}
              icon={<LuCircleCheck size={11} />}
            >
              Processed
            </Chip>
          )}
          {/* The number USED TO BE A CHIP HERE. It is in the subtitle now,
              beside the chapel — a minted billing number is part of what this
              billing IS, not a state marker sitting among franchise marks and
              alerts, and having it in both places was the same fact twice on
              one line. */}
          {/* THE ONE ALARM ON THIS CARD, and it is only an alarm because it is
              alone. A grey "1 deficiency" chip used to sit beside it, built the
              same way at the same size — so the red one read as one status pill
              among several rather than as the exception it is. The deficiency
              chip is gone: a deficiency is a WAIT, not a verdict, it clears
              itself when the document arrives, and it is already said on the
              row it belongs to once the card is open. What is left here is the
              kind somebody outside this module has to act on. */}
          {discrepant > 0 && (
            <Chip
              fg={DISCREPANCY_ACCENT}
              bg="#fff1f2"
              borderColor="#fecdd3"
              icon={<LuCircleAlert size={11} />}
            >
              {discrepancyLabel(discrepant)}
            </Chip>
          )}
        </Flex>

        {/* THE RIGHT OF THE HEAD, and how loud it is depends on what the card
            is for.

            ON A WORKBENCH IT IS THE QUIET SIDE. Both lines are REFERENCE — what
            the billing comes to, and how far through it is — and neither is what
            a processor is scanning for, which is the code on the left, so
            neither may compete with it. The money was heavy and brand-green here
            once and won every glance on the card.

            ON A READING IT IS HALF THE POINT (user, 2026-08-26). The three
            things a verifier reads off a closed card are the billing number, the
            number of accounts and the total — the number is the title opposite
            and these two are the other two, so they are stated rather than
            hinted: the amount at full contrast, the count in a real type size
            under it instead of the 10px grey a hint wears. */}
        <Box textAlign="right" flexShrink={0}>
          <Text
            fontSize="sm"
            fontWeight={reading ? "700" : "500"}
            color={reading ? "gray.800" : "gray.600"}
            whiteSpace="nowrap"
          >
            {formatCSP(billing.totalCSP)}
          </Text>
          {/* WHAT IS LEFT TO DO, or HOW MANY ACCOUNTS — see `progress`. One
              weight and one colour whatever the state: on a workbench it is a
              hint about whether the card is worth opening, and a hint that
              shouts in some rows and not others reads as a warning in the ones
              that shout. */}
          <Text
            fontSize={reading ? "11px" : "10px"}
            fontWeight={reading ? "600" : undefined}
            color={reading ? "gray.500" : "gray.400"}
            whiteSpace="nowrap"
          >
            {progress}
          </Text>
        </Box>
      </Flex>

      {/* THE PANEL, and it UNFOLDS ON OPEN — see `PANEL_UNFOLD`.
          CLOSING IS INSTANT, which is not an omission. Two things already move
          when a card closes: the stack shows one billing at a time, so closing
          here happens because something else is opening, and the page scrolls
          to whatever that is. An outgoing card easing its own height down at
          the same time would be a third motion, and worse, it would be one the
          scroll cannot see — the scroll measures the page on the render after
          the click, and a card still animating its way to nothing would still
          be occupying the height it is giving up, so every jump would land
          short by whatever was left of it. */}
      {open && (
        <Box css={PANEL_UNFOLD}>
        <Box css={PANEL_CLIP}>
        <Box borderTopWidth="1px" borderColor="gray.100">
          {rows.length === 0 ? (
            /* NOTHING AT ALL — every kind of held service is a row now, so an
               empty table means an empty billing. `BillingDetail`'s wording. */
            <Box py={8} px={4} textAlign="center">
              <Text fontSize="sm" fontWeight="600" color="gray.600">
                No services on this billing yet
              </Text>
              <Text fontSize="xs" color="gray.400" mt={1}>
                Plan holders appear here as they are endorsed or keyed in.
              </Text>
            </Box>
          ) : (
            // FLUSH TO THE CARD, not a card-in-card: the accordion card is the
            // surface, so the kit table's own rounded inner surface is squared
            // off. Same override `BillingDetail` uses, with 0 for its radius.
            <Box
              // Records whether the click started in a tick box, for the row
              // handler below to read — see `fromTickBox`.
              onClickCapture={noteClickOrigin}
              css={{
                // THE CSP HEADING, FOUND FROM THE END — see the note on the
                // same rule in `BillingDetail`, which this shares a table with.
                ...alignHeadersRight(":last-of-type"),
                // The band behind the accounts already signed off — only where
                // signing is the job. Spread BEFORE the held one so that a row
                // carrying both marks reads as held, which is the rule the cell
                // itself follows.
                ...(reading ? VERIFIED_ROW_CSS : {}),
                // The tint behind the rows that cannot be serviced — the same
                // one the workspace table uses, so a discrepancy looks the same
                // wherever the billing is opened.
                ...HELD_ROW_CSS,
                // ONE GRID ACROSS THE STACK, where the stack is several tables
                // — see `VERIFY_TABLE_LAYOUT`. Not on a workbench, which is one
                // table and sizes itself.
                ...(reading ? VERIFY_TABLE_LAYOUT : {}),
                "& > *": { borderRadius: "0 !important" },
                // The kit gives every row a pointer cursor whether or not it
                // was handed an `onRowClick`, so rows that lead nowhere still
                // LOOK clickable. `BillingDetail` puts it back the same way.
                ...(clickable ? {} : { "& tbody tr": { cursor: "default" } }),
              }}
            >
              {sections.map((section, index) => (
                <Box
                  key={section.key}
                  // THE HEADINGS RUN ONCE, over whichever table comes first.
                  // Every table below shares its grid exactly, so a second and
                  // third set would be the same five words repeated down the
                  // panel to label columns the reader is already under.
                  //
                  // On the WRAPPER and not on the table: `DataTable` is a plain
                  // component and takes `className`, not Chakra's `css` — a
                  // `css` passed to it goes nowhere at all.
                  css={
                    index > 0 ? { "& thead": { display: "none" } } : undefined
                  }
                >
                  {/* WHAT THE GROUP IS, banded across the table's width — the
                      "separate box" a signed-off account was asked for, and the
                      thing a tint alone could not say. It carries the group's
                      own count and, where the money is the group's, its
                      subtotal. The working rows get no band: they are the
                      table, and a heading over the top of a list is only needed
                      once something else has been cut away from it. */}
                  {section.band && (
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={3}
                      px={4}
                      py={1.5}
                      bg={section.band.bg}
                      borderTopWidth="1px"
                      borderBottomWidth="1px"
                      borderColor={section.band.border}
                    >
                      <Flex align="center" gap={1.5} color={section.band.fg}>
                        {section.band.icon}
                        <Text fontSize="11px" fontWeight="700">
                          {section.band.label}
                        </Text>
                      </Flex>
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color={section.band.fg}
                        whiteSpace="nowrap"
                      >
                        {section.band.note}
                      </Text>
                    </Flex>
                  )}

                  <DataTable<ServiceRecord>
                    // Rebuilt after a verification, to clear the ticks it
                    // signed — see `tableEpoch`. Constant otherwise, so nothing
                    // else here remounts.
                    key={tableEpoch}
                    columns={section.columns}
                    data={section.rows}
                    getRowId={(row) => row.id}
                    // Only where there IS a record to work — see
                    // `onOpenService`. A click that began in the row's tick box
                    // is not one: it was aimed at the selection, and the kit
                    // lets it through to here as well. See `fromTickBox`.
                    onRowClick={
                      clickable
                        ? (service) => {
                            if (fromTickBox.current) return;
                            void openService(service);
                          }
                        : undefined
                    }
                    // The ticks, lifted so the bar at the foot can count them.
                    // Only on the section that HAS them.
                    onSelectionChange={
                      section.selectable ? handleSelectionChange : undefined
                    }
                    size="sm"
                    // WHAT THE BILLING COMES TO, on the LAST table so it lands
                    // at the foot of everything rather than in the middle of it.
                    // The figures are the billing's own — see `rowsSummaryLabel`
                    // and the note below — so they describe the whole stack and
                    // not the section they happen to sit under.
                    summaryRows={
                      index === sections.length - 1
                        ? [
                            {
                              id: "totals",
                              label: rowsSummaryLabel(billing),
                              values: {
                                csp: () => (
                                  <Flex justify="flex-end">
                                    <Text
                                      fontSize="xs"
                                      fontWeight="700"
                                      color="gray.900"
                                      whiteSpace="nowrap"
                                    >
                                      {formatCSP(billing.totalCSP)}
                                    </Text>
                                  </Flex>
                                ),
                              },
                            },
                          ]
                        : undefined
                    }
                    features={{
                      search: false,
                      filtering: false,
                      // Held services sit last because they are held — see the
                      // note in `BillingDetail`, where the same table is drawn.
                      sorting: false,
                      pagination: false,
                      columnToggle: false,
                      // THE TICK BOX, and ONLY on the working section — which
                      // is the whole reason this panel is more than one table.
                      // See `sections`. No `bulkActions` beside it,
                      // deliberately: this card already ends in a bar, and a
                      // second one carrying BUTTONS would be two places
                      // claiming to act on the same rows, with the kit's
                      // sitting inside the table where the For Process card's
                      // action is not.
                      //
                      // WITHHOLDING THEM DOES NOT WITHHOLD THE BAR, which is
                      // what this note used to say. The kit raises its "N
                      // selected · Clear" strip above the table on any
                      // selection, actions or none (measured). What is avoided
                      // is a second set of BUTTONS; the count it carries is the
                      // raw one, which is why the foot names what its own
                      // figures are counted over.
                      selection: section.selectable,
                      detailSidebar: false,
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* THE FOOT OF THE PANEL — an ACTION BAR on a workbench, a REPORT on
              a reading.

              The action version is always beside the rows it acts on, which is
              what the rail's pinned button was for and what a card per billing
              gives without pinning anything.

              The reading version has no button by design: past For Process the
              billing exists, its plans are terminated, and the next thing to
              happen to it belongs to Verify rather than to this screen. What
              the bar is worth keeping for is PROVENANCE — who put the billing
              through — which is the one fact about it that is nowhere else on
              the card and the first thing a verifier checks. */}
          <Flex
            align="center"
            justify="space-between"
            gap={3}
            wrap="wrap"
            px={4}
            py={3}
            bg="gray.50"
            borderTopWidth="1px"
            borderColor="gray.100"
          >
            {building ? (
              <>
                <Text
                  fontSize="11px"
                  color={completed ? BRAND_COLORS.darkGreen : "gray.500"}
                  fontWeight={completed ? "600" : undefined}
                >
                  {completed
                    ? `All ${billable} ${
                        billable === 1 ? "plan" : "plans"
                      } terminated — moved to Processed. Kept here for a final check until you leave.`
                    : billing.terminatedCount > 0
                      ? `${billing.terminatedCount} of ${billable} ${
                          billable === 1 ? "plan" : "plans"
                        } terminated`
                      : created
                        ? "Open a planholder to save their record and terminate the plan."
                        : "No billing number yet — create the billing to terminate its plans."}
                </Text>
                <Box minW="180px">
                  <BillingAction billing={billing} />
                </Box>
              </>
            ) : (
              <Flex align="center" gap={2} wrap="wrap">
                {/* WHAT IS TICKED, and only once anything is — see `action`.
                    A "0 of 3 selected" standing on every card would report the
                    resting state of a control as though it were news, which is
                    the same rule the chips on the head are built on.

                    IT LEADS THE BAR when it is there. The count answers "where
                    have I got to on this billing", which is a live question a
                    verifier is asking of THIS card; the provenance behind it is
                    a fact they read once.

                    BOTH FIGURES ARE COUNTED OVER WHAT CAN BE SIGNED — see
                    `pendingSelected`. They used to be the raw selection over
                    every row in the table, which on a half-done billing reported
                    a number the button beside it disagreed with: select-all on
                    five rows where two are verified and one is held said "5 of
                    5 selected" next to a button offering to verify two.

                    AND IT SAYS "OUTSTANDING" FOR THAT REASON. The kit raises a
                    bar of its own above the table the moment anything is ticked
                    — "4 selected", with a Clear beside it — and it does so
                    whether or not `bulkActions` are passed, contrary to the note
                    under `selection` below. Two bare counts of "selected" that
                    disagree would read as one of them being wrong; naming the
                    denominator is what makes them two different true statements,
                    one about tick boxes and one about signatures. */}
                {pendingSelected.length > 0 && (
                  <Text
                    fontSize="11px"
                    fontWeight="700"
                    color={BRAND_COLORS.darkGreen}
                  >
                    {`${pendingSelected.length} of ${verifiable.length} outstanding selected`}
                  </Text>
                )}

                <Text fontSize="11px" color="gray.500">
                  {/* PROVENANCE. It opened with the terminated count until the
                      head took that figure over as "N accounts" (2026-08-26) —
                      and the table's own summary row directly above this bar was
                      already a third telling of it. What is left is the one fact
                      about a billing at this stage that appears nowhere else on
                      the card and is the first thing a verifier checks.

                      The processor is named even though the page is filtered to
                      one: a card is quoted, screenshotted and scrolled past on
                      its own, and the filter is two controls away in another
                      column. */}
                  {billing.processedBy ? (
                    <>
                      {"Put through by "}
                      <Text as="span" fontWeight="700" color="gray.700">
                        {billing.processedBy}
                      </Text>
                    </>
                  ) : (
                    "Put through before this system recorded who did it"
                  )}
                </Text>
              </Flex>
            )}

            {/* THE READING'S ACTIONS, in the slot the workbench keeps
                Create/Edit in, so the two cards end the same way.

                ONE PRIMARY AT A TIME, AND WHICH ONE IS THE STATE OF THE CARD
                (user, 2026-08-27). While accounts are unread it is VERIFY N
                ACCOUNTS; once every one of them is read that button has nothing
                left to act on and is replaced by VERIFY BILLING NO., which is
                the act that sends the billing to For Approval. They are never
                both drawn: the first is about rows, the second about the
                document those rows are on, and offering both would ask the
                verifier to work out which of two green buttons they meant.

                THE BILLING ONE DID NOT EXIST until the two acts were separated.
                Signing the last account used to post the billing by itself — see
                `getServiceBillings` — so there was no state in which a card sat
                here fully read, and nothing for a second button to do.

                ON FOR APPROVAL THERE IS NO SUCH STATE TO BE IN. That queue has
                one act and it is on the billing, so the card goes straight to
                its primary — no counting, nothing to select, nothing to wait
                for. See `canApproveBilling`, which is shorter than its verify
                counterpart by exactly the accounts. */}
            {reading && (
              <Flex align="center" gap={2} flexShrink={0}>
                {/* PRINT, AND IT IS A GHOST — the quiet one of the pair. It
                    takes nothing back and changes nothing; a solid button beside
                    the signature would compete with it for the press that
                    matters. Drawn in every state, because a verifier prints a
                    billing to read it against the chapel's paperwork BEFORE
                    signing as often as after. */}
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.600"
                  borderRadius="lg"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => void handlePrint()}
                >
                  <LuPrinter size={13} />
                  Print Billing
                </Button>

                {endorsing ? (
                  /* NOTHING YET — see `action`. For Endorsement is the approve
                     card while its own act is being decided, and Print above is
                     the whole of what this foot offers until then. Withholding
                     the button rather than drawing a disabled one: disabled says
                     "not now, and here is what is missing", and what is missing
                     here is a process rather than anything the reader could
                     supply. */
                  null
                ) : approving ? (
                  /* THE APPROVAL, and the only button this queue has. It names
                     the BILLING NUMBER for the reason Verify Billing does: that
                     is what is being signed and what the signature is quoted
                     against. Nothing disables it — there is no selection to
                     make and no reading to finish, which is what "the approval
                     is for billing" means at the level of a control. */
                  canApproveBilling(billing) && (
                    <Button
                      size="xs"
                      bg={BRAND_COLORS.primaryGreen}
                      color="white"
                      borderRadius="lg"
                      flexShrink={0}
                      _hover={{ bg: BRAND_COLORS.darkGreen }}
                      onClick={() => void handleApprove()}
                    >
                      <LuCircleCheck size={13} />
                      {`Approve ${billing.billingNo ?? billing.billingCode}`}
                    </Button>
                  )
                ) : canVerify(billing) ? (
                  /* DISABLED RATHER THAN HIDDEN while nothing is selected,
                     because what it needs is a selection and a control that
                     vanishes cannot say so. The label carries the count for the
                     same reason: it is the difference between "press this" and
                     "press this, and here is exactly what it will sign". */
                  <Button
                    size="xs"
                    bg={BRAND_COLORS.primaryGreen}
                    color="white"
                    borderRadius="lg"
                    flexShrink={0}
                    _hover={{ bg: BRAND_COLORS.darkGreen }}
                    disabled={pendingSelected.length === 0}
                    onClick={() => void handleVerify()}
                  >
                    <LuCircleCheck size={13} />
                    {pendingSelected.length === 0
                      ? "Verify"
                      : `Verify ${pendingSelected.length} ${
                          pendingSelected.length === 1 ? "account" : "accounts"
                        }`}
                  </Button>
                ) : (
                  /* EVERY ACCOUNT READ. The button names the BILLING NUMBER
                     rather than a count, because that is what is being signed
                     and what the signature will be quoted against — and it needs
                     no selection, so nothing disables it. See
                     `canVerifyBilling`, which is also what keeps it from being
                     drawn on a billing with nothing billable at all. */
                  canVerifyBilling(billing) && (
                    <Button
                      size="xs"
                      bg={BRAND_COLORS.primaryGreen}
                      color="white"
                      borderRadius="lg"
                      flexShrink={0}
                      _hover={{ bg: BRAND_COLORS.darkGreen }}
                      onClick={() => void handleVerifyBilling()}
                    >
                      <LuCircleCheck size={13} />
                      {`Verify ${billing.billingNo ?? billing.billingCode}`}
                    </Button>
                  )
                )}
              </Flex>
            )}
          </Flex>
        </Box>
        </Box>
        </Box>
      )}
    </Box>
  );
}

export default BillingAccordionCard;
