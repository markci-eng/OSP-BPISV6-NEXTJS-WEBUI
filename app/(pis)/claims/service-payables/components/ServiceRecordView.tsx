"use client";

// One plan holder's service record — the whole view, in one component, used two
// ways.
//
// It is NOT a route. Opening a service record does not navigate: the For Process
// page swaps to this in place, the same way the plan holder page swaps to a
// claim. A route was the first attempt and it was the wrong model — it made a
// billing's plan holders feel like somewhere else to go, when working down them
// is one continuous task on one screen.
//
// TWO WAYS, one component:
//
//   `asPage`  — the desktop swap. A back link, then two columns.
//   otherwise — the body of a drawer, below `xl`, where the page underneath is
//               a single stacked column and the record has nowhere to go but on
//               top of it. Same content, one column, its own header bar.
//
// THE RAIL DOES NOT CHANGE SHAPE between this view and the billing view it
// swapped from. There it is a picker over a territory's chapels; here it is a
// picker over the same chapels with that chapel's PLAN HOLDERS under it. The
// column keeps its job — it is the list being worked through, whichever level
// the page is at — so the swap moves what is in the main column and leaves the
// user's place in the rail intact.

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Checkbox, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { useMessageDialog } from "osp-ui-kit";
import { db } from "../../../data";
import { FieldLabel } from "../../components/field-label";
import { SectionCard } from "../../components/section-card";
import { SectionTitle } from "../../components/section-title";
import {
  BackButton,
  DrawerPageHeader,
} from "../../planholder/components/DrawerPageHeader";
import { PlanholderRemarks } from "../../planholder/components/PlanholderRemarks";
import {
  deceasedName,
  formatCSP,
  isServiceTerminated,
  servicesOf,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import {
  getSavedServiceRecord,
  getVerifiedAccount,
  useServicePayablesStore,
  type ServiceRecordDetails,
} from "../service-payables-store";
import {
  canTerminateInto,
  terminationBlocker,
  useSaveServiceRecord,
} from "../use-save-service-record";
import {
  MAIN_COLUMN_TAIL,
  STACKED_GRID,
  STACKED_ITEM,
  STACKED_LIST_MAX_HEIGHT,
  WORKSPACE_GRID,
  railListBox,
  scrollDetailIntoView,
  workspaceRail,
} from "../workspace-layout";
import { ChapelPicker } from "./ChapelPicker";
import { PlanholderPanel } from "./PlanholderPanel";
import {
  LIST_MAX_HEIGHT,
  PlanholderServiceList,
} from "./PlanholderServiceList";
import { RecordActions } from "./RecordActions";
import { RecordLookups } from "./RecordLookups";
import { type DocumentTab } from "../../components/document-folder";
import { ServiceRecordDocuments } from "./ServiceRecordDocuments";
import { ServiceRecordForm } from "./ServiceRecordForm";
import { ServiceRecordNotes } from "./ServiceRecordNotes";
import { SoaDrawer } from "./SoaDrawer";

/**
 * Tallest the plan holder list may be before it scrolls inside itself, IN THE
 * DRAWER — the workspace's own stacked figure, since the drawer is the stacked
 * layout by another name.
 *
 * A fixed figure is right here because the list is the last thing in an
 * ordinary scrolling column: too tall only means the page is longer.
 */
const STACKED_MAX_HEIGHT = STACKED_LIST_MAX_HEIGHT;

/**
 * Tallest the RAIL may be on a desktop page — a screenful, less where the
 * page's content starts (64px) and the air it is pinned with at both ends.
 *
 * THE RAIL ITSELF NEVER SCROLLS. It is bounded so that everything in it is on
 * screen at once — the chapel picker at the top, the three controls at the
 * bottom — and the LIST is the one thing that gives: it is the only item in the
 * column allowed to shrink, and it scrolls inside itself.
 *
 * That is what the bound is for. The column is `position: sticky`, so a rail
 * taller than the screen has a foot that cannot be reached by scrolling the
 * page — and the foot is where Terminate now lives.
 */
const RAIL_MAX_VIEWPORT = "calc(100vh - 96px)";

/**
 * Tallest the plan holder list may be on a desktop page: ten rows, or the space
 * the rail has left after everything that cannot shrink — whichever is smaller.
 *
 * TWO LIMITS IN TWO PLACES, and they have to be. Ten rows (602px — see
 * `PlanholderServiceList`, which owns the figure because it owns the rows it
 * counts) caps the WRAPPER around the list; the list itself takes `100%` of
 * whatever the wrapper ends up being. Written as one `min(602px, 100%)` on the
 * list it silently does nothing: a percentage max-height resolves against a
 * parent with a definite height, and a flex item sized from its own content has
 * none — so the cap dropped out and a 1080p monitor drew eleven rows.
 *
 * The wrapper is the definite one, so the percentage there is real. A 1080p
 * screen gets its ten rows; a 768px laptop gets fewer, because the controls
 * under the list have to stay on a column that cannot be scrolled to.
 *
 * It was `calc(100vh - 260px)` before either half of that — a share of the
 * viewport, which made the list five plan holders on a laptop and eleven on a
 * monitor, and was a standing guess at the height of the blocks around it.
 */
/** The rail as a page — the workspace's own, on this view's taller bound. */
const RECORD_RAIL = workspaceRail(RAIL_MAX_VIEWPORT);

export interface ServiceRecordViewProps {
  service: ServiceRecord;
  billing: ServiceBilling;
  /** The chapels the picker offers — this territory's, at this stage. */
  billings: ServiceBilling[];
  onSelectService: (serviceId: string) => void;
  onChangeChapel: (billingCode: string) => void;
  onBack: () => void;
  /** Render in the page rather than in a drawer — see the note at the top. */
  asPage?: boolean;
  /**
   * WHAT THE RECORD CAN BE MADE TO DO from here — passed straight through to
   * `RecordActions`, which is where it means something and where it is
   * documented.
   *
   * The QUEUE decides it, not this view: the same record is opened from For
   * Process to terminate a plan and from For Verification to sign off the
   * account that termination created. Defaulted to the first, so the page that
   * has always opened this view keeps the button it has always had.
   */
  action?: "terminate" | "verify" | "approve" | "endorse" | "read";
  /**
   * Which identifier the chapel picker reads its billings by — handed to
   * `ChapelPicker`, where it is documented.
   *
   * SEPARATE FROM {@link action}, though the two travel together today: one says
   * what this screen can DO to the record, the other what a billing is CALLED at
   * the stage it was opened from. A queue that reads records without signing
   * them off — For Approval, when it has a workspace — wants the number leading
   * and no Verify button, and would have to break the pair to get it.
   */
  lead?: "code" | "number";
  /**
   * WHAT GOING BACK RETURNS TO, in words — the label on the rail's back link.
   *
   * The list behind this record is not cut the same way on every queue: For
   * Process picks by TERRITORY and For Verification by STAFF, so "back" lands in
   * a different kind of place and has to say which. Defaults to the billing's
   * territory, which is the older of the two and what every caller wanted before
   * the second queue had a record to open.
   *
   * A NAME AND NOT A CODE. It is read as the end of a sentence — "Back to
   * JOHN REY TAGADTAD" — so it takes whatever the queue calls that place on its
   * own screen, and the caller is the only thing that knows it.
   */
  backTo?: string;
}

export function ServiceRecordView({
  service,
  billing,
  billings,
  onSelectService,
  onChangeChapel,
  onBack,
  asPage = false,
  action = "terminate",
  lead = "code",
  backTo,
}: ServiceRecordViewProps) {
  const saveRecord = useSaveServiceRecord();
  const planholder = db.getPlanholder(service.lpaNo);
  const services = servicesOf(billing);

  /**
   * The plan's own transaction history, as one block — issuance, collections,
   * lapse and reinstatement, transfers, changes to the holder's details.
   *
   * ONE TO A LINE, which is the join the CLAIM uses for its own remarks trail
   * (`claims-data`, where they are `join("\n")`) and the density these were read
   * at before they moved into a panel. `getPlanholderRemarks` in `claims-data`
   * is the same list with a blank line between each, which is the plan holder
   * PROFILE's arrangement — a page with room for it. Here the panel is five
   * rows, and paragraph spacing would put two remarks in it.
   */
  const planRemarks = db
    .getPlanholderRemarks(service.lpaNo)
    .map((remark) => remark.value)
    .join("\n");

  /**
   * THE PLAN IS TERMINATED, so the record is closed.
   *
   * DECIDED ONCE, HERE, and handed to both halves of the view — the form locks
   * its fields, the rail disables Terminate — because they are two views of one
   * fact and a screen that half-locks is worse than one that does not lock at
   * all: a read-only form under a live commit button says the record cannot be
   * changed and then offers to commit it anyway.
   *
   * WHAT TERMINATING WROTE is a `TblClaimsSP` row, built out of this form's own
   * fields — the mortuary, the CSP code, the wreath, the credit of service. That
   * row is the line the chapel is paid from. Once it exists the form is a
   * RECORD of what was posted rather than a draft of what to post, and an edit
   * to it would go nowhere: re-saving would leave the posted line where it is
   * and the two would disagree, with the screen looking like the truth.
   *
   * DOCUMENTS ARE DELIBERATELY NOT LOCKED. A deficiency is a chase, not a hold —
   * it never kept the plan off the billing, and the whole point of that rule is
   * that the plan is terminated and billed WHILE the document is still in the
   * post. Freezing the folder at termination would strand every service whose
   * paperwork arrives afterwards, which is most of them. Nothing in that section
   * changes what was billed. See `RecordActions` for the same split applied to
   * the rail's own controls: what reads stays live, what writes does not.
   */
  //
  // ASKED OF THE BILLING AS WELL AS THE STORE (2026-08-26). It was
  // `isPlanTerminated(service.id)`, which knows only what this session wrote —
  // so every account terminated before the session read as OPEN, and the record
  // opened editable with a live Terminate on a plan that was posted weeks ago.
  // Nothing noticed while this view was only reachable from For Process, where
  // that is the truth; For Verification's rows became clickable and it was not.
  // See {@link isServiceTerminated}.
  const locked = isServiceTerminated(billing, service);
  /**
   * Where going back returns to, in words — see {@link ServiceRecordViewProps.backTo}
   * and the back link in the rail.
   *
   * The territory is the FALLBACK and not the rule: it is what the For Process
   * stack is cut by, and it stands wherever a caller has not said otherwise.
   */
  const backLabel = backTo ?? db.getTerritoryName(billing.territoryCode);

  /** The Statement of Account overlay, opened from the rail. */
  const [soaOpen, setSoaOpen] = useState(false);

  /**
   * The folder's open list, and where the folder IS — the conveyor's own pair,
   * for the Deficient tick on the form. See `showDeficiencies` below, and the
   * page's copy of this, which is the same three lines for the same reason: the
   * tick and the list it points at are in two different components, so the one
   * that holds both has to do the pointing.
   */
  const [docsTab, setDocsTab] = useState<DocumentTab>("documents");
  const documentsRef = useRef<HTMLDivElement>(null);

  /** Open the deficiency list and go to it — the Deficient tick's press. */
  const showDeficiencies = () => {
    setDocsTab("deficiencies");
    // Animated, the conveyor's own. It stops where the page ends — there is
    // no reserve under the folder; see `workspace-layout`.
    scrollDetailIntoView(documentsRef.current, { smooth: true });
  };

  /* --------------------- signing off more than one account --------------------- */

  // THE RAIL IS A MULTI-SELECT ON FOR VERIFICATION (user, 2026-09-03).
  //
  // The record already carried Verify Account — one signature, on whichever plan
  // holder is open — and a verifier working a chapel of five had to open each in
  // turn and press it five times, or leave the record entirely and tick them on
  // the billing's own table back on the card. The second is the selection the
  // user asked not to have to return to; the first is the same act repeated
  // because the screen had no way of expressing "these ones".
  //
  // So the ticks live on the list they are read from. What gathers is the
  // SELECTION; what signs it is the one button at the foot of the rail, which is
  // where every commit on this screen already is — see `RecordActions`.

  /** Subscribed, so a signature written below repaints the rail's marks. */
  const storeVersion = useServicePayablesStore();

  /** Whether this queue has a per-account signature to gather rows for. */
  const signingOff = action === "verify";

  /**
   * The accounts on this billing that may still be signed.
   *
   * `verifiableAccounts`' rule, read here rather than imported, because the list
   * needs it row by row as well as in the aggregate. An account is signed once —
   * `verifyServices` refuses to re-stamp — so a signed one is not a candidate for
   * anything and drops out of the box, the Check all and the count alike.
   */
  const verifiable = useMemo(
    () => (signingOff ? services.filter((s) => !getVerifiedAccount(s.id)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services, signingOff, storeVersion],
  );

  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  /**
   * A SELECTION BELONGS TO ONE BILLING. The chapel picker above changes which
   * accounts the rail is listing without leaving the record, and ticks carried
   * across would be a signature gathered on one chapel and spent on another.
   */
  useEffect(() => setCheckedIds([]), [billing.billingCode]);

  /**
   * THE ACCOUNT BEING READ IS IN THE LIST TO BE SIGNED (user, 2026-09-03).
   *
   * Opening a plan holder ticks them. Without this the button had two subjects —
   * the ticks when there were any, the open record when there were not — so a
   * verifier reading Lucila's record with two OTHER rows ticked was offered
   * "Verify 2 accounts", and the account actually in front of them was the one
   * left out. The one you are looking at is the one you have just decided about;
   * it belongs in the list by default.
   *
   * WHICH ALSO MAKES WORKING DOWN THE RAIL THE WAY TO BUILD THE SELECTION. Read
   * one, click the next, read that — and the ticks accumulate behind you, which
   * is the whole of what the multi-select was asked for. Nothing has to be
   * gathered as a separate pass.
   *
   * ON THE OPEN ACCOUNT CHANGING, not on every render: unticking the row you are
   * reading has to stick, and an effect that re-added it each time would be the
   * screen arguing with the click. Moving away and coming back does tick it
   * again — by then it is a fresh decision about a record being opened again.
   *
   * A SIGNED ACCOUNT IS NOT ADDED. It has no box, and `verifyServices` refuses
   * to re-stamp; a tick on it could only inflate the count over an account the
   * write would then drop.
   */
  useEffect(() => {
    if (!signingOff || getVerifiedAccount(service.id)) return;
    setCheckedIds((prev) =>
      prev.includes(service.id) ? prev : [...prev, service.id],
    );
  }, [signingOff, service.id]);

  /**
   * The ticks that are still real — FILTERED ON READ rather than pruned in an
   * effect. Signing an account takes it out of `verifiable`, and an effect that
   * tidied the state afterwards would leave one render in which the button still
   * counted a row that had just been signed.
   */
  const checked = useMemo(
    () => checkedIds.filter((id) => verifiable.some((s) => s.id === id)),
    [checkedIds, verifiable],
  );

  /** What the button will sign, in the list's own order. */
  const selection = useMemo(
    () => verifiable.filter((s) => checked.includes(s.id)),
    [verifiable, checked],
  );

  const allChecked = verifiable.length > 0 && checked.length === verifiable.length;

  const toggleChecked = (serviceId: string) =>
    setCheckedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );

  /**
   * Check all, or clear — one control doing both, because they are the same
   * question answered from either end and a rail 340px wide has room for one
   * word beside the label.
   *
   * IT TICKS WHAT CAN BE SIGNED, not every row. On a half-worked billing those
   * differ, and "all" meaning "all of the ones that are left" is the only
   * reading that matches what the button underneath will then do.
   */
  const toggleAll = () =>
    setCheckedIds(allChecked ? [] : verifiable.map((s) => s.id));

  /**
   * Commit the record — after asking.
   *
   * WHY THE PROMPT IS HERE AND NOT ON THE BUTTON. Terminate is a real form
   * submit (`form={SERVICE_RECORD_FORM_ID}`), so react-hook-form validates
   * first and only calls this when the form is actually going to save. Asking
   * from the button's own `onClick` would put the question BEFORE validation:
   * the processor would confirm, and only then be shown the fields they still
   * have to fix — which teaches them the dialog is noise.
   *
   * IT NAMES WHAT WILL HAPPEN, not "are you sure". Terminating posts the plan
   * against the billing number, and the two facts a processor checks before
   * letting that happen are WHICH plan and WHICH billing — so both are in the
   * sentence rather than left to the screen behind the dialog.
   *
   * THE WORDING FOLLOWS THE OUTCOME. `RecordActions` only offers this button
   * when the plan can actually be terminated, so the first branch is what is
   * normally seen. The second is not dead: the record saves either way, and a
   * dialog promising a termination that `canTerminateInto` will then decline
   * would be the one place a user checks telling them the opposite of the
   * truth. Same reasoning the toast is built on.
   */
  const { messageBox } = useMessageDialog();

  const handleSave = async (details: ServiceRecordDetails) => {
    const terminates = canTerminateInto(billing, service);
    const who = `${deceasedName(service)} · ${service.lpaNo}`;

    const proceed = await messageBox({
      title: terminates ? "TERMINATE THIS PLAN?" : "SAVE WITHOUT TERMINATING?",
      message: terminates
        ? `${who} will be terminated into billing ${billing.billingNo}, and this service record saved against it.`
        : `${who} — the record will be saved, but the plan will NOT be terminated: ${terminationBlocker(
            billing,
            service,
          )}.`,
      confirmText: terminates ? "Terminate" : "Save",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return;

    saveRecord(billing, service, details);
  };

  const body = (
    <Grid
      // The billing view's own tracks, so the gutter does not move across the
      // swap — and, like them, turned over by the WORKSPACE's width rather than
      // the viewport's. In the drawer there is one column at every width — a
      // side panel is never wide enough for two — so the workspace styles are
      // dropped entirely and the stacked defaults stand.
      css={asPage ? WORKSPACE_GRID : STACKED_GRID}
    >
      {/* Written FIRST so that stacked — the drawer, and the page on a narrow
          screen — the list comes above the record: pick a chapel, pick a plan
          holder, work what they are owed. `order` puts it back on the right
          once there are two columns. */}
      {/* A BOUNDED COLUMN that does not itself scroll — see
          {@link RAIL_MAX_VIEWPORT}. Everything in it is on screen at once, and
          the plan holder list is the only item allowed to give: it shrinks into
          whatever is left and scrolls inside itself.

          Not in the drawer — the rail is a section of an ordinary scrolling
          column there, with nothing to fit inside of. */}
      <GridItem css={asPage ? RECORD_RAIL : STACKED_ITEM}>
        {/* The way back, at the top of the rail — not above the record opposite.
            The claim view's placement, and for its reasons.

            It sits in the STICKY column on purpose: leaving a record is worth
            reaching from anywhere in it, and in the reading column the link
            scrolled away with the profile card and left a long form with no way
            out but the browser's own back. Here it travels with the list, which
            is pinned for the same reason.

            Against the column's RIGHT edge with the arrow AFTER the words, which
            is what turns the chevron around: an arrow is read as pointing the
            way out, and a "<" on the right-hand end would point back into its
            own label. The rail is read to that edge — the picker and every row
            end there — and a control tucked into the left corner would start a
            second edge for one line. Negative margin so the arrow's own padding
            does not inset it.

            IT NAMES WHAT GOING BACK RETURNS TO, which is not the same list on
            every queue — see {@link ServiceRecordViewProps.backTo}. On For
            Process that is a TERRITORY, whose chapels the stack behind is; on
            For Verification it is the STAFF whose billings it is. It used to
            name the territory either way, which on a page cut by staff sent the
            reader back to a place the page had never been.

            It used to name the CHAPEL, before either: the thing being left
            rather than the thing being returned to — and the chapel is already
            named in the picker directly underneath.

            Only in the page. The drawer has its own bar with its own "<". */}
        {asPage && (
          <Box mr="-4px">
            {/* THE BILLING NAMES THE ROW the back link sits in, rather than
                leaving the left of it empty. `SectionTitle`'s action slot is
                built for exactly this — a heading with a control pinned to its
                right — so the two are one row and not two stacked ones.

                This is also the record's heading: it used to sit at the top of
                the main column, above the plan holder, which put the same row's
                worth of type on the page twice over. Here it heads the rail that
                says WHICH record is open, and the main column starts with the
                plan holder the form is about.

                WHAT IT LEADS WITH TURNS ON THE PICKER BELOW IT (user,
                2026-08-27). Where that picker reads billings by NUMBER, the
                number was this row's title and the next control's first word a
                centimetre apart — so the identifier comes off and THE TOTAL
                takes the title, with the period under it. Where the picker reads
                by CODE — For Process — nothing is doubled and nothing changes:
                the identifier leads, the period sits under it, exactly as it
                always has. The heading and the picker are one row apart, so what
                one of them shows has to be decided with the other.

                THE TOTAL LEADS, NOT THE PERIOD (user, 2026-08-27). Both were
                tried in that slot and the money is the one being WORKED: a
                verifier reads down the accounts and checks that they come to
                this figure, where the period is context they take in once on
                arrival. Set as the subtitle it came out at 10px in the caption's
                grey — lighter and smaller than the date above it — and putting
                it in the title is what makes the hierarchy say what the screen
                is for, without a style override on either line. */}
            <SectionTitle
              // SMALLER THAN A SECTION HEADING, because this one shares its row
              // with the way out. At the label's own size the two halves fought
              // over 340px and the link's name lost — see the cap on it below,
              // which this is what lets be generous.
              compact
              title={
                lead === "number"
                  ? formatCSP(billing.totalCSP)
                  : (billing.billingNo ?? billing.billingCode)
              }
              // The PERIOD alone, not the billing code as well. In the main
              // column this line read "BULAN4JUN26 · JUNE 23-30, 2026"; here the
              // chapel picker sits directly underneath showing that same code,
              // so half of it was the next control repeated — and it was the
              // half that pushed the title onto two lines. It is the quiet line
              // under the total on a reading, and under the identifier on the
              // workbench — the same line either way.
              subtitle={billing.periodLabel}
              action={
                <BackButton
                  onBack={onBack}
                  label={`Back to ${backLabel}`}
                  iconPlacement="end"
                >
                  {/* Still capped — the rail is 340px and the two halves of
                      this row compete for it. A long territory —
                      "NATIONAL CAPITAL TERRITORY1" — took 254px of it and broke
                      the heading beside it across two lines, so the label
                      yields first.

                      200px rather than the 150 it was, at 13px rather than 14:
                      the heading beside it went down a size (`compact`), which
                      handed this row about 55px back, and this is where that
                      room is worth spending. At 150/14px even "CENTRAL LUZON
                      TERRITORY 1" truncated — it needed 206 — and a back link
                      that cannot say where it goes is the one control here that
                      has to. The type size also now matches the heading it sits
                      beside, which is what stopped the two reading as two
                      different rows.

                      A STAFF NAME FITS WHERE A TERRITORY DID NOT: the longest
                      in the file — "JOHN MICHAEL GAZA" — is well inside the cap,
                      so the queue that made this label matter is the one that
                      never has to truncate it. The longest territories still
                      clip — and they share the row with an identifier again,
                      which is what the cap was written for; their full text is
                      in the control's `aria-label`. */}
                  <Text as="span" truncate maxW="200px" fontSize="13px">
                    {backLabel}
                  </Text>
                </BackButton>
              }
            />
          </Box>
        )}

        <Box mb={4} flexShrink={0}>
          <ChapelPicker
            value={billing.billingCode}
            options={billings}
            onChange={onChangeChapel}
            lead={lead}
          />
        </Box>

        <Box flexShrink={0}>
          {/* A FIELD LABEL, at the size of the picker's caption directly above
              it — the same change the For Process rail's "Billing Codes" made,
              and for the same reason. This rail is one picker asked in two
              parts: which billing, then which plan holder inside it. The second
              half is not a section of the page that happens to follow the
              first, so it does not wear a section heading over it.

              "Planholders", one word — the spelling this system uses everywhere
              else, and the one "Plan Holders" got wrong.

              THE SUBTITLE IS GONE with the heading, and it repeated what was
              already on screen twice: it read "3 on JUNE 23-30, 2026", where the
              3 is the length of the list immediately below and the period is in
              the heading at the top of this rail — or, in the drawer, in the bar
              across the top of it. */}
          {/* THE LABEL AND THE CHECK ALL SHARE ONE ROW. The control belongs
              over the list rather than under it — it is read before the ticking
              starts, and a rail's last row is already spoken for by the commit.
              `mb={0}` on the label because the row carries the space now. */}
          <Flex align="center" justify="space-between" gap={2} mb={1.5}>
            <FieldLabel mb={0}>Planholders</FieldLabel>

            {/* Only where there is something left to sign. On a billing whose
                accounts are all signed the control could only ever tick
                nothing, and an empty selection with a Check all over it reads
                as a screen that has stopped working rather than as a job
                finished — the rows say that themselves, each wearing Verified. */}
            {signingOff && verifiable.length > 0 && (
              <Checkbox.Root
                size="sm"
                checked={allChecked}
                onCheckedChange={toggleAll}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label
                  fontSize="11px"
                  fontWeight="600"
                  color="gray.600"
                  whiteSpace="nowrap"
                >
                  {/* IT SAYS WHAT PRESSING IT DOES, which is the opposite of
                      what it currently shows. "Check all" with every box
                      already ticked would be a control offering the state it is
                      in. */}
                  {allChecked ? "Clear" : "Check all"}
                </Checkbox.Label>
              </Checkbox.Root>
            )}
          </Flex>
        </Box>

        {/* THE ONE THING IN THE COLUMN THAT GIVES.
            `0 1 auto`: it takes its own height — ten rows at most — and may
            shrink below that when the column is short, which is what keeps
            the controls under it on screen. It may not GROW: stretching it
            on a tall monitor would push those controls to the bottom edge and
            open a gap in the middle of the rail.

            `minH: 0` is not decoration. A flex item's default minimum is its
            CONTENT, so without it a twelve-row list refuses to shrink and the
            column overflows anyway — the exact thing the bound exists to
            prevent. */}
        {/* Both caps live on this WRAPPER rather than on the list — the ten-row
            figure when there are two columns, the stacked figure when there are
            not. See {@link railListBox} for why a percentage on the list alone
            resolved to nothing. */}
        <Box css={asPage ? railListBox(LIST_MAX_HEIGHT) : undefined}>
          <PlanholderServiceList
            services={services}
            selected={service.id}
            onSelect={onSelectService}
            isSaved={(id) => Boolean(getSavedServiceRecord(id))}
            // The rail's multi-select — on For Verification and nowhere else.
            // See the note over `signingOff`.
            selectable={signingOff}
            checkedIds={checked}
            onToggle={toggleChecked}
            isVerified={(id) => Boolean(getVerifiedAccount(id))}
            fills={asPage}
            // In the drawer the list keeps its own cap: there the rail sits
            // ABOVE the record, and ten plan holders would put the form most of
            // a screen down.
            maxHeight={asPage ? undefined : STACKED_MAX_HEIGHT}
          />
        </Box>

        {/* What can be done with the open record, at the FOOT of the column:
            the two lookups and the one control that commits it — see
            `RecordActions` for why the commit lives in this column at all
            rather than in the form's own footer.

            It sat above the plan holder list until now, in the row after the
            chapel picker. Below it, the three controls end the column the way
            a form's footer ends a form: everything above is what you are
            choosing and reading, and the last thing you reach is the thing
            that acts on it.

            `flexShrink: 0`, so the list gives way and these never do — a
            commit that squashes is worse than a list one row shorter. */}
        <Box
          mt={4}
          pt={4}
          // RULED OFF FROM THE LIST. Without the line the three controls read
          // as the end of the list rather than as a block of their own — same
          // width, same column, nothing but a gap between. The rule is what
          // says the list has finished and something else has started, which is
          // the whole point of having moved them down here.
          borderTopWidth="1px"
          borderColor="gray.200"
          flexShrink={0}
        >
          <RecordActions
            service={service}
            billing={billing}
            onOpenSoa={() => setSoaOpen(true)}
            locked={locked}
            // COMMIT ONLY — Loan Details and SOA are cards in the record column
            // now. See `RecordLookups`, and the conveyor's copy of this.
            show="commit"
            action={action}
            // What the rail has gathered, and what to forget once it is signed.
            // Empty on every queue but For Verification, where the block falls
            // back to the open record — see `RecordActionsProps.selection`.
            selection={selection}
            onVerified={() => setCheckedIds([])}
          />
        </Box>
      </GridItem>

      {/* With air under it — this column ends in the deficiency list, a bounded
          scroller that fades at its foot to say there is more below, and a fade
          against the bottom of the screen reads as the page having been cut off
          rather than as a list that scrolls.

          The air is in the GRID and not under the page, because the rail
          opposite is sticky and a reserve outside the grid comes straight off
          its range — see {@link MAIN_COLUMN_TAIL}. That is not academic here:
          this rail is the tall one, and the first thing it loses off the top is
          the way back out of the record. */}
      {/* A STACK OF CARDS, the claim column's rhythm — the conveyor's record
          column took it on 2026-09-11 and this is the same column a stage back,
          rendered into a drawer as well as a page. See the note there. */}
      <GridItem css={asPage ? MAIN_COLUMN_TAIL : STACKED_ITEM}>
        <Flex direction="column" gap={5}>
          {/* Who it is for, then what they are owed. In that order because the
              form is checked AGAINST the plan holder — the dates, the plan and
              the contestability above it are what a processor reads before
              typing anything below it.

              The billing that names this record used to head this column. It
              heads the rail now, in the back link's row — see it there. */}
          <PlanholderPanel service={service} planholder={planholder} />

          {/* THE PLAN'S OWN TRAIL — what has happened to the ACCOUNT: issued,
              collected, lapsed, reinstated, transferred. It sat as a run of
              plain lines at the foot of the card above until now; it is the
              claim column's own section here — `PlanholderRemarks` with the
              notes half switched off, which is the call the death claim makes
              (user, 2026-08-27, and the same component rather than the panel
              underneath it since 2026-09-11).

              DIRECTLY UNDER THE CARD, and not down beside Notes where the claim
              keeps its own pair. On a claim both belong to the claim, so they
              read as one block; here they do not — these remarks are the PLAN
              HOLDER's, which is what the card above is, while the notes below
              are the processor's own working notes on this service. Pairing
              them would say they were two halves of one record. */}
          <SectionCard>
            <PlanholderRemarks
              remarks={planRemarks}
              showNotes={false}
              showSubtitles={false}
            />
          </SectionCard>

          <SectionCard>
            <ServiceRecordForm
              service={service}
              billing={billing}
              onSave={handleSave}
              locked={locked}
              /* Which queue the record was opened from — the heading turns on
                 it. See the prop's own note. */
              action={action}
              /* The Deficient tick opens the folder's deficiency list and
                 scrolls to it — the conveyor's own wiring, kept in step here so
                 the same tick does the same thing in the drawer. */
              onShowDeficiencies={showDeficiencies}
            />
          </SectionCard>

          {/* THE TWO LOOK-UPS, in the death claim's own place in the column —
              after the record they are consulted about, before the notes and
              the folder. See `RecordLookups`. */}
          <RecordLookups lpaNo={service.lpaNo} />

          {/* BETWEEN THE RECORD AND ITS DOCUMENTS, which is where the claim
              puts its own Notes: after the block of fields that IS the record
              and before the paperwork attached to it. Its own section, and not
              a block inside the form — see the note at the top of
              `ServiceRecordNotes` for why that distinction is load-bearing. */}
          <SectionCard>
            <ServiceRecordNotes service={service} />
          </SectionCard>

          {/* `asPage` IS the answer to "is this the two-column page or the
              drawer", so it is told rather than left to work it out from a
              media query of its own — see the prop's note.

              The box around it carries the ref the Deficient tick scrolls to;
              `SectionCard` takes none. */}
          <Box ref={documentsRef}>
            <SectionCard>
              <ServiceRecordDocuments
                service={service}
                isDesktop={asPage}
                tab={docsTab}
                onTabChange={setDocsTab}
              />
            </SectionCard>
          </Box>
        </Flex>
      </GridItem>

      {/* Mounted with the view, driven by `open` — never conditionally, which
          is what strands the page unclickable. */}
      <SoaDrawer
        lpaNo={service.lpaNo}
        planholder={planholder}
        open={soaOpen}
        onClose={() => setSoaOpen(false)}
      />
    </Grid>
  );

  if (!asPage) {
    return (
      // The drawer's own bar — sticky, with the "<" that closes it and the
      // billing named beside it. `DrawerPageHeader` renders `Drawer.Title`
      // unless told otherwise, so this branch must be inside a `Drawer.Root`.
      <>
        <DrawerPageHeader
          title={billing.billingNo ?? billing.billingCode}
          description={`${billing.chapelDesc} · ${billing.periodLabel}`}
          onBack={onBack}
        />
        <Box flex="1" overflowY="auto" px={4} py={5}>
          {body}
        </Box>
      </>
    );
  }

  // The back link is inside `body`, at the top of the rail — see it there.
  return body;
}

export default ServiceRecordView;
