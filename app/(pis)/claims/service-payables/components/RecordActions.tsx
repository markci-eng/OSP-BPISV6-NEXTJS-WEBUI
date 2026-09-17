"use client";

// What can be DONE with the open service record, as the block at the FOOT of
// the rail: the two lookups the old screen carried, and the one action that
// commits the record.
//
// AT THE FOOT, under the plan holder list rather than above it. The three
// controls end the column the way a form's footer ends a form — everything
// above them is what you are choosing and reading, and the last thing you reach
// is the thing that acts on it.
//
// THE BUTTON IS CALLED "TERMINATE", not "Save Service Record" as the old screen
// called it. It does both — it commits the record AND terminates the plan into
// the billing — and the name is the half that matters: saving a form is what a
// user does to a screen, terminating a plan is what they came to do to the
// business.
//
// EXCEPT ON A RECORD OPENED FROM FOR VERIFICATION, where it is called VERIFY
// ACCOUNT and does that instead (user, 2026-08-27) — see {@link action}. The
// record opens the same way from both queues, and until now it ended in the same
// button both times: a greyed-out "Terminated", correct but useless, on a screen
// the verifier had opened in order to DO something. The one thing they are there
// to do was two clicks back on the card behind it, and the record — which is
// where the account is actually read against the chapel's paperwork — could not
// sign what it had just been used to check.
//
// SO THE SAME SLOT CARRIES THE STAGE'S OWN COMMIT. What that slot means is
// constant: the one thing this screen can do to the record in front of it. Which
// act that is belongs to the queue the record was opened from, and the queue is
// the only thing that knows it — hence a prop, defaulted to the older of the two.
//
// AND THAT ONE SLOT TAKES A SELECTION (user, 2026-09-03). Ticks in the rail's
// plan holder list turn Verify Account into "Verify 4 accounts" — same hook,
// same dialog, same write, a different subject — so a verifier signs a whole
// chapel from the record they read it in, rather than going back to the table on
// the billing's card to tick there. Still ONE button, because a second would be
// a second way to write the same fact. See {@link RecordActionsProps.selection}.
//
// WHICH MEANS IT IS NEVER PRESSABLE WHEN IT CANNOT DO BOTH. Every reason a save
// might refuse to terminate is answered here rather than after the fact: a
// discrepancy replaces the button with the move that DOES exist (Resolve), and a
// billing with no number leaves it in place but disabled, with the reason under
// it. No button on this block half does the thing it is named after.
//
// WHY IT IS NOT IN THE FORM. It used to sit in the form's own footer, which is
// where a form's submit belongs — and that put it at the far end of a page
// carrying a profile card, eighteen plan details, fourteen fields and two
// document lists. The one thing a processor is on this screen to do was the one
// thing they had to scroll to reach. Here it is beside the list they are working
// down, pinned with it, in view the whole time the form is being filled.
//
// It is still a real submit. The form is a real `<form>` with an id, and this
// button carries `form={SERVICE_RECORD_FORM_ID}` — the HTML association, so the
// button submits the form from outside it and react-hook-form's validation runs
// exactly as it would from within. No callback is threaded through the view.
//
// IT ASKS BEFORE IT COMMITS, and the question is NOT raised here. Terminating
// posts a plan against a billing number, so the processor is asked to confirm
// it — in `ServiceRecordView`'s save handler, which is downstream of the
// validation this button triggers. Asking from an `onClick` here would put the
// question before the form is known to be valid, and confirm-then-fix is how a
// dialog gets trained into noise. See the note on `handleSave` there.
//
// LOAN DETAILS AND SOA are the old screen's `[-] Loan Details` / `[-] SOA`
// toggles. They expanded panels inside the PH Info block there; they open
// overlays here, because the record beside them is a form being filled in and
// pushing every field half a screen down to read a payment history loses the
// user's place to answer a question they asked in passing.
//
// A DEFICIENCY IS A CHASE, NOT A VERDICT, and it does not hold the plan
// (2026-08-25). The plan is serviceable, the folder is short a requirement, and
// the two facts are independent: a missing copy of the LPA is not grave. So the
// controls are View and Send — the old screen's own pair, for reading what is
// missing and chasing it — and they sit ABOVE Terminate rather than instead of
// it. The plan is terminated and billed while the document is still in the post.
//
// It used to replace Terminate, which said the opposite: that a folder short a
// photocopy stopped a chapel being paid for a funeral it had already conducted.
//
// THERE IS NO "MARK COMPLIED". There was, and it was the wrong shape for the
// fact: compliance is a state of the folder, not a judgement a processor makes,
// so it belongs to the documents the claim requires rather than to a button.
//
// A DISCREPANCY IS THE VERDICT, and it is the ONLY hold on this screen. An
// account that violates the rules should not have been served at all: it does
// not become serviceable when its paperwork arrives, and there is nothing to
// send for, because nothing is missing. When a service carries one the only move
// offered is Resolve — no Terminate, and no View / Send either, since a notice
// asking the branch for something would be asking for the wrong thing.
//
// This is the one state on the record that is a notification in the real sense:
// somebody has to be told, because the answer is outside this module — the plan
// itself has to be corrected.
//
// It used to be shown anyway, disabled in effect: it stayed on screen, saved
// the record and silently declined to terminate, with a caption underneath
// explaining that it had not done the thing it was named after. Two buttons
// that both work beat one button that half does.
//
// A BILLING WITH NO NUMBER LOCKS THE BUTTON INSTEAD — the other reason a plan
// cannot be terminated, and the only one that is not about the plan holder. A
// terminated plan is posted against the billing number; there is nothing to post
// against until the billing is created, so Terminate is disabled and a line
// under it names the billing code that is waiting on a number.
//
// Disabled and not replaced, unlike the discrepancy, because there is no other
// move to put in its place: a discrepancy is resolved from THIS screen, while
// the billing is created one screen back. A substitute button here would either
// duplicate that control or be a second name for the same submit.
//
// It is also checked LAST even though `terminationBlocker` reads it first — the
// state that carries its own control must not be hidden behind the one whose
// answer is not on this screen.
//
// WHAT COUNTS AS HELD is `getRaisedDeficiencies` — the deficiency on record
// plus anything raised by hand. Deliberately NOT the requirement checklist in
// the Documents section; see the note on that function for why an unmet
// requirement is a different fact from a raised deficiency.

import { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useMessageDialog } from "osp-ui-kit";
import {
  LuCircleCheck,
  LuEye,
  LuHandCoins,
  LuReceiptText,
  LuSend,
  LuTriangleAlert,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { db, formatFiledDate } from "../../../data";
import { ActionButtonRow } from "../../components/action-button-row";
import { toaster } from "../../components/toaster";
import {
  DISCREPANCY_HOLDS_TERMINATION,
  DISCREPANCY_KIND_LABELS,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import {
  getRaisedDeficiencies,
  getServiceNotice,
  markNoticeSent,
  useServiceDocumentsStore,
} from "../service-documents-store";
import {
  getVerifiedAccount,
  useServicePayablesStore,
} from "../service-payables-store";
import {
  canApproveBilling,
  useApproveBilling,
  useVerifyAccounts,
} from "../use-verify-accounts";
import { DiscrepancyDrawer } from "./DiscrepancyDrawer";
import { SERVICE_RECORD_FORM_ID } from "./ServiceRecordForm";

export interface RecordActionsProps {
  service: ServiceRecord;
  /**
   * The billing the record sits on.
   *
   * Back after having been removed once — see the note below — and now read for
   * two things, neither of which is a caption:
   *
   *   `billingNo`  whether this plan can be terminated at all. No number, no
   *                Terminate button; see the branch that replaces it.
   *   the stage    where a CORRECTED discrepancy is billed depends on whether
   *                this billing has gone to accounting, and only the billing
   *                knows that. See `correctionRouteFor`.
   */
  billing: ServiceBilling;
  onOpenSoa: () => void;
  /**
   * The plan has already been TERMINATED into this billing — the record is
   * closed and there is nothing left on this block to commit.
   *
   * THE THIRD REASON TERMINATE CANNOT BE PRESSED, and the only one that is about
   * something having already happened rather than something being in the way.
   * The other two are obstacles: a discrepancy replaces the button, a billing
   * with no number disables it until one is created. This one is done — pressing
   * it again would write a second `TblClaimsSP` row for a plan that is already on
   * the billing, or overwrite the line the chapel is being paid from with
   * whatever the form happens to say now.
   *
   * WHAT IT DOES NOT LOCK is Loan Details, SOA and the discrepancy's View. Those
   * read; they change nothing, and a processor checking what was posted against a
   * closed record is exactly who needs them.
   *
   * IT DOES NOT LOCK VERIFY EITHER. Every account on the For Verification queue
   * is terminated by definition, so a block that read `locked` as "nothing left
   * to do here" would disable the one control that stage exists for. `locked` is
   * about the RECORD — the form is closed, the posted line stands — and signing
   * off does not touch either. See {@link action}.
   */
  locked?: boolean;
  /**
   * WHICH COMMIT THIS BLOCK OFFERS — the one thing the open record can be made
   * to do, which depends on the queue it was opened from.
   *
   *   `"terminate"`  For Process, and the default. Submits the form, which saves
   *                  the record and terminates the plan into the billing.
   *   `"verify"`     For Verification. The plan is already terminated and the
   *                  form is read-only; what is left is the verifier's signature
   *                  against the account.
   *   `"approve"`    For Approval. NOTHING — and that is not an oversight. What
   *                  an approver signs is the BILLING, which is done from the
   *                  card in the stack; the record is opened to READ an account,
   *                  and there is no act on this screen to offer. A block that
   *                  invented one would be inventing a per-account approval the
   *                  business does not have.
   *   `"endorse"`    For Endorsement. NOTHING either, and for now not even the
   *                  billing's act — the endorsement has not been described yet
   *                  (user, 2026-08-27). The record is a pure reading, exactly
   *                  as approval's was before its button was put back here.
   *   `"read"`       NOTHING, and for a different reason from the two above:
   *                  those are stages whose act has not been described, this is
   *                  a record that is not at the stage the screen is showing.
   *                  A billing opened out of one of the conveyor's lists — an
   *                  endorsed one, say — is READ in the queue a processor
   *                  happens to be standing in, and every act this block could
   *                  draw would be that queue's act applied to a document that
   *                  left it. See `reading` on the conveyor page.
   *
   *                  IT IS NOT `"endorse"` REUSED. The two render the same
   *                  nothing today, and naming this one after a stage would tie
   *                  "a record being read out of a list" to whatever For
   *                  Endorsement grows a button for.
   *
   * WHEN THE ENDORSEMENT IS DESCRIBED, this is one of the two places it belongs
   * — the other being the foot of `BillingAccordionCard` — and the approve
   * branch below is the worked example of doing it as one act in two places.
   *
   * A NAMED ACT RATHER THAN A `canVerify` FLAG, for the reason `action` on the
   * accordion card is one: they are alternatives and never several at once, and
   * a handful of booleans is a way to end up with a screen offering none of them
   * or all of them.
   */
  action?: "terminate" | "verify" | "approve" | "endorse" | "read";
  /**
   * The accounts TICKED IN THE RAIL, which the Verify button signs instead of
   * the open one (user, 2026-09-03).
   *
   * WHY THE BUTTON TAKES A SELECTION AT ALL. Verifying is a signature and
   * nothing else — no fields, no form — so signing five accounts is one decision
   * expressed once, and a verifier who has read down a chapel's plan holders is
   * expressing exactly that. Without this the only multi-select was the table on
   * the billing's card, two clicks behind the record: they had to leave what
   * they were reading to act on it.
   *
   * IT DOES NOT ADD A SECOND BUTTON. This block's whole rule is that it offers
   * ONE act — the one thing this screen can do to what is in front of it — and
   * two Verifies, one for the open record and one for the ticks, would be two
   * ways of writing the same fact with a rule needed between them.
   *
   * SO THIS IS THE BUTTON'S ONLY SUBJECT, and there is no fallback to the open
   * record behind it. There does not need to be: the rail ticks an account as it
   * is opened, so reading a record and pressing Verify signs that record, which
   * is what it always did. What changed is that the count is now honest when the
   * verifier has gathered more than the one they are looking at — before, ticking
   * two others left the open account out of a "Verify 2 accounts" it was standing
   * in the middle of.
   *
   * Empty means empty: every account signed, or a verifier who has cleared the
   * rail. The button is dead either way, because there is nothing to sign.
   *
   * SAME HOOK, SAME DIALOG, SAME WRITE as the card's — `useVerifyAccounts`
   * already takes a list, and this is the third caller to hand it one.
   */
  selection?: ServiceRecord[];
  /**
   * Told when a signature actually landed, so the rail can drop the ticks it
   * gathered. Only on success — a cancelled dialog leaves the selection where
   * the verifier left it, which is the rule the card's own table follows.
   */
  onVerified?: () => void;
  /**
   * Told when an APPROVAL landed, and only on success.
   *
   * `onVerified`'s counterpart one stage on, and added for the conveyor
   * (2026-09-11). The workspace this block was written for needed no such
   * callback: approving moves the billing out of the queue, its list loses it,
   * and the page's own effect closes the record — the note beside the button
   * says so. A page that serves ONE billing has no list to lose it from, so it
   * has to be told, or the next billing arrives without the beat that says one
   * thing was replaced by another.
   *
   * Optional, and the archived screens pass nothing. They still behave exactly
   * as they did.
   */
  onApproved?: () => void;
  /**
   * WHICH HALF OF THIS BLOCK TO DRAW — added for the conveyor (2026-09-11),
   * where the two halves live in different columns.
   *
   *   `all`      both, in one block. Every caller before the conveyor, and the
   *              default, so the archived screens are untouched.
   *   `lookups`  Loan Details and SOA only — the two things that READ. They
   *              stay in the rail because they are consulted WHILE working down
   *              the accounts, and a lookup that moved to the foot of a
   *              3,600px record would be a lookup nobody finds.
   *   `commit`   everything that WRITES, and everything that explains why it
   *              cannot: the stage's button, the discrepancy's View/Send pair
   *              that stands in its place, and the captions under it. This half
   *              goes to the last row of the record, because that is where the
   *              decision is actually taken.
   *
   * THE SPLIT IS BY WHAT A CONTROL DOES, not by where it happens to fit. A
   * reading and a commit are different kinds of act, and once they are in two
   * columns the line has to be drawn somewhere defensible.
   *
   * ONE COMPONENT STILL DECIDES WHAT MAY BE DONE. Rendering it twice with two
   * values is not two sources of truth: every rule about discrepancies,
   * deficiencies, locks and stages is still asked and answered here once.
   */
  show?: "all" | "lookups" | "commit";
  /**
   * The explanatory lines UNDER the commit — "terminated into B26…", "waiting on
   * 1 requirement", "has no billing number yet", the verifier's signature line.
   *
   * OFF ON THE CONVEYOR (user, 2026-09-11: "remove all the warning below the
   * left section so the height would not be affected"), and the reason is the
   * rail rather than the sentences. Each of these appears and disappears with
   * the ACCOUNT — one plan is terminated, the next is not; one is short a
   * document, the next is not — so the block under the button changed height
   * every time the conveyor brought the next account, and a `position: sticky`
   * column that changes height re-pins as you work. On a screen whose whole
   * point is that the next account arrives in the same place, the furniture
   * moving underneath it is the one thing that must not happen.
   *
   * NOTHING IS LOST THAT THE SCREEN DOES NOT SAY TWICE. The lock is visible —
   * the form's fields are read-only and the button reads "Terminated"; the
   * outstanding requirement is on the Deficiency list in the record, which is
   * where it is worked; and the billing always has a number now that
   * `useAutoBilling` mints one, so that last line cannot fire at all.
   *
   * On by default: the archived workspaces have a rail that is not a conveyor,
   * where an account is opened deliberately and stays put.
   */
  captions?: boolean;
  /**
   * The smaller lookup buttons — the death claim's rail size (user,
   * 2026-09-11: "make this the same size as the buttons of the death claim").
   *
   * ONLY THE HEIGHT. They stay two across at the rail's full width, which is
   * what the user asked for and is right: two buttons have room for their
   * labels beside an icon, where the claim's rail fits three to a row and needs
   * every cell it can get. What was out of step was the SIZE — a 32px button
   * here against a 26px one there, in two rails a processor uses in the same
   * sitting.
   */
  compact?: boolean;
  /**
   * Another commit stands UNDER this block, and it is the larger of the two — so
   * this one is drawn as an outline button and gives the solid fill to it (user,
   * 2026-09-11: "the verified account would be a outline button then the verified
   * billing would be the primary button").
   *
   * IT IS A REAL ORDER, NOT A PREFERENCE ABOUT COLOUR. For Verification has two
   * signatures on one screen and they are not peers: signing an ACCOUNT is done
   * once per plan holder and changes nothing outside the billing, while Verify
   * Billing is the act that ends the visit and sends the document to For
   * Approval. Two solid greens in one column said they were the same size of
   * decision, and the one the eye landed on first was the smaller.
   *
   * IT ALSO FIXES WHAT THE FILLED BUTTON WAS SAYING WHEN IT WAS DEAD. Once the
   * open account is signed the button reads "Verified" and is disabled — so the
   * strongest mark in the rail was a green block for something already done,
   * sitting above the live control the verifier actually needed next.
   *
   * ONLY THE VERIFY BRANCH HONOURS IT, because that is the only stage where two
   * commits share a column: Terminate is alone on For Process, Approve is alone
   * on For Approval (its own button is IN this block), and For Endorsement has
   * no commit at all. A caller that passes this on any other stage would be
   * asking for a screen with no primary action, so those branches ignore it.
   *
   * THE TERMINATE BRANCH HONOURED IT FOR ONE AFTERNOON (2026-09-15), for a paper
   * franchise's Close Entry, and it was a misreading twice over: that act is a
   * LOCK on which accounts exist rather than a rival commit, and it comes and
   * goes while the record is on screen — so the flag changed under a mounted
   * button and the styling did not follow. Close Entry is drawn as an outline
   * beside Add Planholder now, and this branch is filled, always.
   *
   * Off by default — the archived workspaces put Verify Billing on the billing's
   * own card, a column away, where nothing is competing with it.
   */
  subordinate?: boolean;
}

/*
 * A `canTerminate` FLAG used to come in beside the billing, and it is not back.
 * The question is asked of the billing here instead — `billingNo`, one field —
 * so there is no second source of truth for it to disagree with. What a save is
 * ALLOWED to terminate is still decided in `useSaveServiceRecord`; what this
 * component decides is which button to draw, and both read the same rule off
 * the same object.
 */
export function RecordActions({
  service,
  billing,
  onOpenSoa,
  locked = false,
  action = "terminate",
  selection = [],
  onVerified,
  onApproved,
  show = "all",
  captions = true,
  compact = false,
  subordinate = false,
}: RecordActionsProps) {
  const { messageBox } = useMessageDialog();

  // Subscribe: raising or withdrawing a deficiency in the Documents section
  // below has to flip these buttons without anything being threaded between
  // the two components.
  useServiceDocumentsStore();
  // And to the payables store, so the signature written by the button below
  // turns the button itself the moment it lands. The page above this one
  // re-derives on the same version, but a block that owns a control must not
  // depend on somebody else's subscription to show that control's own effect.
  useServicePayablesStore();

  /** Signing off, rather than terminating — see {@link RecordActionsProps.action}. */
  const verifying = action === "verify";
  /** Approving the billing this account sits on — see the button below. */
  const approving = action === "approve";
  /**
   * Reading an approved billing's account on For Endorsement — no commit of any
   * kind, until the endorsement is described. See {@link RecordActionsProps.action}.
   */
  const endorsing = action === "endorse";
  /**
   * The record is being READ off a list rather than worked at a stage — see
   * {@link RecordActionsProps.action}. Grouped with the endorsement branch
   * below, which is the other one that offers nothing.
   */
  const readingOnly = action === "read";
  const approveBilling = useApproveBilling();
  const verifyAccounts = useVerifyAccounts();

  /**
   * The signature against this account, if there is one.
   *
   * WHAT MAKES VERIFY UNPRESSABLE, and the only thing that does — the act is
   * written once and `verifyServices` refuses to re-stamp, so a second press
   * could only either do nothing or rewrite the audit trail with today's date.
   */
  const verified = getVerifiedAccount(service.id);

  /**
   * WHAT VERIFY SIGNS: THE TICKS, AND ONLY THE TICKS.
   *
   * It used to fall back to the open record when nothing was ticked, which gave
   * one button two subjects — and the fallback is not needed any more: the rail
   * ticks the account being read the moment it is opened, so the ordinary state
   * of this screen is a selection of exactly that one. See the effect in
   * `ServiceRecordView`.
   *
   * The fallback was also a way to sign a record the verifier had deliberately
   * UNTICKED. With one subject that cannot happen: what the button does is
   * always what the rail shows.
   */
  const selectedCount = selection.length;

  /**
   * Whether the selection is just the record on screen — the ordinary case, and
   * the one that keeps the button's old name. "Verify 1 account" over a rail
   * showing one tick on the open row would be counting out loud for no reason.
   */
  const soloOpen = selectedCount === 1 && selection[0]?.id === service.id;

  /**
   * Sign, and tell the rail if anything was written.
   *
   * The hook resolves to whether the verifier went through with it, which is
   * what keeps a cancelled dialog from quietly clearing a selection somebody
   * spent a minute building.
   */
  const signOff = async () => {
    if (await verifyAccounts(billing, selection)) onVerified?.();
  };

  const personId = db.getPlanholder(service.lpaNo)?.personId ?? "";
  /**
   * How many requirements this service is still short — a count and nothing
   * more, since 2026-08-25.
   *
   * It used to decide which controls the panel offered. It decides a SENTENCE
   * now: the deficiency is complied with in the Documents section, not from
   * here, and it holds nothing while it waits.
   */
  const outstanding = getRaisedDeficiencies(personId, service).length;
  const notice = getServiceNotice(service.id);

  /** Where a notice goes: the branch that handled the claim. */
  const branchCode = service.servicingBranchCode;
  const branchName = db.getBranch(branchCode)?.description ?? branchCode;

  const [discrepancyOpen, setDiscrepancyOpen] = useState(false);

  const discrepancy = service.discrepancy;

  /**
   * Whether the billing has a number, and therefore whether this plan can be
   * terminated INTO anything.
   *
   * The first condition in `terminationBlocker`, asked here so the button cannot
   * be pressed while it is unmet — see where Terminate is drawn. Checked LAST of
   * the three, though: a discrepancy or a deficiency is about this plan holder
   * and is answered from this screen, while a missing billing number is answered
   * one screen back and would otherwise hide the two controls that still work.
   */
  const created = Boolean(billing.billingNo);

  /**
   * Send the notice — the discrepancy, out to the branch that filed the claim.
   *
   * Confirmed first, and the confirmation NAMES THE BRANCH — this is the one
   * control on the record that reaches outside it, and "sent to the wrong
   * branch" is not something the user can take back from here.
   *
   * WHAT IT DOES NOT DO is fix anything. The account is corrected in a module
   * that does not exist yet; this records that the branch has been told.
   */
  const sendNotice = async () => {
    if (!discrepancy) return;

    const confirmed = await messageBox({
      title: notice ? "RESEND DISCREPANCY" : "SEND DISCREPANCY",
      message: `Send the discrepancy on ${service.lpaNo} — ${
        DISCREPANCY_KIND_LABELS[discrepancy.kind]
      } — to ${branchName}?${
        notice
          ? ` A notice was already sent on ${formatFiledDate(notice.sentAtISO)}.`
          : ""
      }`,
      confirmText: notice ? "Resend" : "Send",
      variant: "confirmation",
    });
    if (!confirmed) return;

    markNoticeSent(service.id, branchCode, 1);
    toaster.create({
      type: "success",
      title: `Discrepancy sent to ${branchName}`,
      // Said in the toast as well as in the drawer: this is a stand-in for an
      // outbound channel that is not wired up, and a bare "sent" would let a
      // processor believe the branch has it.
      description: `${service.lpaNo} · recorded in this session only`,
    });
  };

  /**
   * PLACEHOLDER, and honestly so.
   *
   * There is no loan anywhere in this data layer — no balance, no ledger, no
   * table — so there is nothing for this to show. The button exists because the
   * old screen carried it and it is being kept in the layout; what it says is
   * that the data is not here yet, which is better than a panel of dashes
   * pretending a plan has no loan when the truth is that nobody asked.
   */
  const openLoanDetails = () =>
    void messageBox({
      title: "LOAN DETAILS",
      message: `No loan records are on file for ${service.lpaNo}. Loan details are not wired into this area yet.`,
      confirmText: "OK",
      variant: "information",
      showCancel: false,
    });

  /** See {@link RecordActionsProps.show}. */
  const drawLookups = show !== "commit";
  const drawCommit = show !== "lookups";

  return (
    // THE COMMIT'S OWN TOP MARGIN IS THE LOOKUPS' GAP. Each of the three
    // buttons carries `mt={2}` to sit clear of the row above it; drawn on their
    // own that row is not there, and the margin becomes a stray line of nothing
    // at the top of the block. Zeroed on whatever lands first rather than
    // unpicked from three buttons, so the `all` layout stays exactly as it was.
    <Box
      css={
        drawLookups ? undefined : { "& > :first-child": { marginTop: 0 } }
      }
    >
      {/* Two across, and the row takes the rail's full width rather than the
          component's 420px default — at 340px the default never binds, and
          saying so keeps the two buttons the same width as the picker above and
          the button below. */}
      {drawLookups && (
        <ActionButtonRow
          columns={2}
          maxW="100%"
          compact={compact}
          actions={[
            {
              label: "Loan Details",
              icon: LuHandCoins,
              onClick: openLoanDetails,
            },
            { label: "SOA", icon: LuReceiptText, onClick: onOpenSoa },
          ]}
        />
      )}

      {/* THE VIEW · SEND PAIR IS OFF (user, 2026-09-15: "remove the view and
          send for now. then add the terminate button since what if that it is
          not yet terminated") — so a discrepant account falls through to the
          ordinary commit below and CAN be terminated.

          WHY IT WAS THERE, because the reasoning still stands and is only
          stranded: a discrepancy is an account that should never have been
          served, and the only answer is a correction made outside this module.
          The module that makes it does not exist, so the pair had become the
          only thing this screen could offer such an account — for ever. A
          workflow whose single move is to resend the same notice is not one.

          THE CONDITION IS KEPT, BEHIND THE FLAG, because the rule was confirmed
          twice and is waiting rather than overturned. See
          {@link DISCREPANCY_HOLDS_TERMINATION}, which also carries the warning
          that goes with this: a terminated discrepant account is still OFF the
          billing's total. */}
      {!drawCommit ? null : DISCREPANCY_HOLDS_TERMINATION && discrepancy ? (
        /* HELD BY A DISCREPANCY, and the two moves that exist for one are READ
           IT and TELL SOMEBODY (user-confirmed 2026-08-25).

           NO TERMINATE: the account violates the rules and should not have been
           served, so there is nothing to bill and nothing this screen can commit.

           NO RESOLVE EITHER, which is the correction to what stood here. A
           "Resolve Discrepancy" button recorded a fix that this workspace cannot
           actually make — the account is put right in a module that has not been
           built. Claiming it here would have let a processor mark an unfixed
           account fixed, and the billing would have taken it back on that word.

           So: View, and Send to the branch that filed the claim. The same pair
           the old screen carried, pointed at the thing that actually holds a
           service. */
        <>
          {/* The gap is the LOOKUPS' — so it goes when they do. Split across two
              columns this pair is the first thing in its block, and a top margin
              there would be a stray line of nothing above the only control. */}
          <Flex gap={2} mt={drawLookups ? 2 : 0}>
            <Button
              flex="1"
              minW={0}
              variant="outline"
              borderColor="gray.200"
              borderRadius="lg"
              color="gray.700"
              onClick={() => setDiscrepancyOpen(true)}
            >
              <LuEye size={14} />
              <Text as="span" truncate>
                View
              </Text>
            </Button>
            <Button
              flex="1"
              minW={0}
              variant="outline"
              borderColor="gray.200"
              borderRadius="lg"
              color="gray.700"
              onClick={() => void sendNotice()}
            >
              <LuSend size={14} />
              <Text as="span" truncate>
                {notice ? "Resend" : "Send"}
              </Text>
            </Button>
          </Flex>

          {/* NO ALERT LINE UNDER THE BUTTONS (user-confirmed 2026-08-25). One
              stood here, restating the kind, the reason and where the notice had
              got to. It was a notification of the discrepancy inside the item —
              and the discrepancy has a notification of its own now: View reads
              it out in full, Send tells the branch. Saying it a third time in
              amber beneath the two controls that do it was noise on top of the
              row's own mark in the table above. */}
        </>
      ) : (
        /* NOT HELD — which is every service that does not carry a discrepancy,
           outstanding paperwork included. The record's one commit, under the
           lookups that inform it.

           A DEFICIENCY ADDS NO CONTROL HERE (2026-08-25). It is compliance with
           the requirements, worked in the Documents section below where the
           documents themselves are: raised there, cleared there by the file
           arriving. It does not hold the plan, it does not replace this button
           and it does not need one of its own — a missing copy of the LPA is not
           grave. What it gets is the line underneath, so a processor terminating
           the plan knows what is still owed to the folder.

           LOCKED UNTIL THE BILLING HAS A NUMBER. A terminated plan is posted
           against the billing number, so with no number there is nothing to post
           against — the first condition `terminationBlocker` reads, and the
           button cannot be pressed while it is unmet.

           DISABLED RATHER THAN REPLACED, because there is no other move on this
           screen: the billing is created one screen back. So the button stays
           where it is, unpressable, and the line under it says what is missing. */
        <>
          {endorsing || readingOnly ? (
            /* A PURE READING, from either of the two directions that produce
               one: For Endorsement, whose act has not been described, and a
               record opened out of a list, which is not at this stage at all.
               Both offer nothing rather than guessing at it. See
               {@link RecordActionsProps.action}. */
            null
          ) : approving ? (
            /* THE BILLING'S APPROVAL, FROM INSIDE ONE OF ITS ACCOUNTS (user,
               2026-08-27). This block was empty here for a day: what an approver
               signs is the BILLING, and the card in the stack carries that, so
               the record was left as a pure reading.

               What that missed is where the DECISION is actually taken. An
               approver opens an account to check it — the CSP against the
               contract, the dates, the documents — and the moment they are
               satisfied they are looking at this screen, not at the stack two
               clicks behind it. Sending them back to press a button they could
               have pressed here is asking them to re-find the billing they never
               left.

               IT IS THE SAME ACT, NOT A SECOND ONE. Same hook, same dialog, same
               write as the card's — `useApproveBilling` — so the two are one
               button in two places rather than two ways to approve. What it
               signs is the billing named in the picker above, which is the
               billing this account is on.

               NOTHING SENDS THE READER BACK, and nothing has to. Approving moves
               the billing out of this queue, so the list under the page loses it,
               the open record's billing stops resolving, and the workspace's own
               effect closes the record — landing exactly where the user asked to
               land, on the list of billing numbers. See `ProcessorWorkspace`. */
            canApproveBilling(billing) && (
              <Button
                w="full"
                mt={2}
                bg={BRAND_COLORS.primaryGreen}
                color="white"
                borderRadius="lg"
                _hover={{ bg: BRAND_COLORS.darkGreen }}
                onClick={async () => {
                  if (await approveBilling(billing)) onApproved?.();
                }}
              >
                {/* NO ICON (user, 2026-09-14: "remove the icons in the
                    buttons"). A tick beside the word Approve says the word
                    again, and the rail's commits are now plain labels
                    throughout — Terminate never had one, and Verify Billing
                    never had one. See the verify branch below. */}
                {`Approve ${billing.billingNo ?? billing.billingCode}`}
              </Button>
            )
          ) : verifying ? (
            /* THE VERIFIER'S SIGNATURE, in the slot the processor's Terminate
               occupies — see the note at the top of this file.

               NOT A FORM SUBMIT, which is the one structural difference between
               the two. Terminate submits the record because terminating IS
               saving it; verifying writes a signature against the account and
               touches no field on the form — which is read-only here in any
               case, the plan having been terminated at the stage before. So this
               is a plain `onClick`, and the confirmation it raises can live in
               the handler rather than downstream of a validation pass.

               IT ASKS FIRST, in `useVerifyAccounts` — the same hook and the same
               dialog the card's own Verify button raises, so signing one account
               from its record and signing it from the stack are the same act
               with the same wording, and neither is a second way of writing the
               same fact. */
            <>
              <Button
                w="full"
                mt={2}
                borderRadius="lg"
                // OUTLINE WHEN THE BILLING'S OWN SIGNATURE IS UNDER IT — see
                // {@link RecordActionsProps.subordinate}, where the order of the
                // two acts is argued.
                //
                // THE KIT'S OUTLINE, AND SO THE KIT'S GREEN (user, 2026-09-11:
                // "the outline button would be the same as the osp-uikit which
                // the same color of the green"). It was drawn in gray first —
                // the hairline the lookups above it use — and gray says
                // "secondary control", where `SecondaryMdButton` says
                // "secondary ACTION": label and border both in #109448, which is
                // `primaryGreen` and the exact colour measured off the kit's own
                // button (rgb(16, 148, 72)). A signature is an act, and the
                // outline that means an act in this design system is the green
                // one.
                //
                // THE COLOURS ARE THE KIT'S, THE GEOMETRY IS THE RAIL'S. The
                // kit's button is a fixed 40px with a 5px corner and 14px/400
                // type; every button in this column is `lg`-cornered and sized
                // by `compact` to the death claim's rail. Borrowing the whole
                // component would have made the one green-outlined button the
                // one button in the rail that is a different shape.
                {...(subordinate
                  ? {
                      variant: "outline" as const,
                      bg: "white",
                      borderColor: BRAND_COLORS.primaryGreen,
                      color: BRAND_COLORS.primaryGreen,
                      // The green wash this app hovers green-edged things with
                      // — the document rows and the chapel rows already use it.
                      _hover: { bg: "#f4faf6" },
                    }
                  : {
                      bg: BRAND_COLORS.primaryGreen,
                      color: "white",
                      _hover: { bg: BRAND_COLORS.darkGreen },
                    })}
                // NOTHING TICKED, NOTHING TO SIGN — which is now the ONE reason
                // this button is dead, and it covers the two that used to be
                // separate. An account already signed has no tick box, so it
                // cannot be in the selection; a verifier who has cleared the
                // rail has said they are not signing anything yet. Both arrive
                // here as an empty selection, and the caption under the button
                // says which of the two it is.
                disabled={selectedCount === 0}
                onClick={() => void signOff()}
              >
                {/* NO ICON (user, 2026-09-14: "remove the icons in the
                    buttons"). The tick was doing least of all on this one: the
                    button already says Verified in the past tense once the
                    account is signed, so the glyph beside it was the same fact
                    a third time — after the word and after the mark on the
                    row. */}
                {/* IT NAMES ITS SUBJECT. A selection wider than the record on
                    screen is counted, because a bare "Verify Account" over four
                    ticks would be the one control here saying the wrong thing
                    about what it is about to do. The open record on its own
                    keeps the plain name — see `soloOpen`.

                    PAST TENSE WHEN IT IS PAST, the rule Terminate follows below:
                    a greyed "Verify Account" reads as "not yet", and this is the
                    opposite of that. */}
                {selectedCount === 0
                  ? verified
                    ? "Verified"
                    : "Verify Account"
                  : soloOpen
                    ? "Verify Account"
                    : `Verify ${selectedCount} ${
                        selectedCount === 1 ? "account" : "accounts"
                      }`}
              </Button>

              {/* WHO SIGNED IT AND WHEN — the two fields the act is recorded
                  with, and the reason the button above is disabled. A verifier
                  coming back to a half-done billing reads this to find out
                  whether the account was theirs. */}
              {captions && verified && (
                <Flex align="flex-start" gap={1.5} color="gray.500" mt={2}>
                  <Box color={BRAND_COLORS.primaryGreen} flexShrink={0} mt="2px">
                    <LuCircleCheck size={12} />
                  </Box>
                  <Text fontSize="11px" lineHeight="1.5">
                    Verified by{" "}
                    <Text as="span" fontWeight="700" color="gray.700">
                      {verified.verifiedBy}
                    </Text>{" "}
                    on {formatFiledDate(verified.dateVerified)}. An account is
                    signed off once.
                  </Text>
                </Flex>
              )}
            </>
          ) : (
            <Button
              type="submit"
              form={SERVICE_RECORD_FORM_ID}
              w="full"
              mt={2}
              borderRadius="lg"
              // ALWAYS THE FILLED BUTTON, and `subordinate` is deliberately not
              // read here — see {@link RecordActionsProps.subordinate}, which
              // says why only the verify branch honours it.
              //
              // IT BRIEFLY DID, for a paper franchise's Close Entry (2026-09-15),
              // and both halves of that were wrong. Close Entry is a LOCK on the
              // list of accounts, not a second commit competing with this one, so
              // there was never a decision here to be the smaller half of. And
              // the flag flipped WHILE THE BUTTON WAS ON SCREEN — closing the
              // entry takes the lock away — which left the element rendering with
              // the style it first mounted with: an outline Terminate standing
              // alone in the column with nothing to be subordinate to.
              //
              // The rail's rule is simpler for it: the green fill is the COMMIT,
              // and the entry controls around it are outlines.
              bg={BRAND_COLORS.primaryGreen}
              color="white"
              _hover={{ bg: BRAND_COLORS.darkGreen }}
              disabled={!created || locked}
            >
              {/* IT SAYS "TERMINATED" WHEN IT IS. A disabled button still has to
                  say which of the two things it means — not yet, or already —
                  and a greyed "Terminate" reads as the first when this is the
                  second. Past tense is the whole difference. */}
              {locked ? "Terminated" : "Terminate"}
            </Button>
          )}

          {/* ALREADY DONE, and the line says so with the number it was posted
              against — the same shape as the two obstacle notes below and above,
              because a disabled button always owes the reader a reason.

              It also says what the record is now, which is the part a processor
              acts on: the fields are read-only from here, and correcting one
              means going after the posted line rather than re-saving the form.

              IT STANDS ON A VERIFIER'S SCREEN TOO, where the button above is not
              the one it explains: every account on that queue is terminated, and
              this is what answers "why can I not edit any of these fields". It
              gives way once the account is signed off, the line above having
              taken over the space with the newer of the two facts. */}
          {captions && locked && !verified && (
            <Flex align="flex-start" gap={1.5} color="gray.500" mt={2}>
              <Box color={BRAND_COLORS.primaryGreen} flexShrink={0} mt="2px">
                <LuCircleCheck size={12} />
              </Box>
              <Text fontSize="11px" lineHeight="1.5">
                This plan is terminated into{" "}
                <Text as="span" fontWeight="700" color="gray.700">
                  {billing.billingNo}
                </Text>
                . The record is closed and its fields are read-only.
              </Text>
            </Flex>
          )}

          {/* WHAT IS OUTSTANDING, said under the commit rather than over it —
              which is the whole of what a deficiency does to this panel. The
              plan is on the billing and can be terminated now; the folder is
              still short something, and it is completed in the Documents
              section, not from here.

              THE SENTENCE TURNS ONCE THE PLAN IS TERMINATED. "can be terminated"
              is an instruction, and repeating it at a plan that already has been
              would be the panel telling the processor to do the thing it has
              just disabled the button for. What is still true is that the folder
              is short something — a document chased after the termination, which
              is the ordinary case and the reason a deficiency never held the
              plan in the first place. */}
          {captions && outstanding > 0 && (
            <Flex align="flex-start" gap={1.5} color="gray.500" mt={2}>
              <Box color="#b45309" flexShrink={0} mt="2px">
                <LuTriangleAlert size={12} />
              </Box>
              <Text fontSize="11px" lineHeight="1.5">
                Waiting on {outstanding}{" "}
                {outstanding === 1 ? "requirement" : "requirements"} —{" "}
                {locked
                  ? "the plan is terminated and billed; the folder is still completed in Documents below."
                  : "the plan is on the billing and can be terminated; the folder is completed in Documents below."}
              </Text>
            </Flex>
          )}

          {/* ONLY WHEN IT IS LOCKED. A disabled control with no reason beside it
              is the one thing worse than a control that half works — and every
              other state on this screen already explains itself, so this one
              does too. Nothing is written under the button when it works. */}
          {captions && !created && (
            <Flex align="flex-start" gap={1.5} color="gray.500" mt={2}>
              <Box color="#b45309" flexShrink={0} mt="2px">
                <LuTriangleAlert size={12} />
              </Box>
              <Text fontSize="11px" lineHeight="1.5">
                <Text as="span" fontWeight="700" color="gray.700">
                  {billing.billingCode}
                </Text>{" "}
                has no billing number yet — nothing for a terminated plan to be
                posted against. Create the billing first.
              </Text>
            </Flex>
          )}
        </>
      )}

      {/* Mounted with the block and driven by `open`, NEVER conditionally —
          including not on `discrepancy`, which is why the drawer takes an
          optional one. An overlay unmounted while it is closing can leave
          `pointer-events: none` on <body> and strand the whole page. */}
      <DiscrepancyDrawer
        service={service}
        discrepancy={discrepancy}
        notice={notice}
        branchName={branchName}
        open={discrepancyOpen}
        onClose={() => setDiscrepancyOpen(false)}
      />
    </Box>
  );
}

export default RecordActions;
