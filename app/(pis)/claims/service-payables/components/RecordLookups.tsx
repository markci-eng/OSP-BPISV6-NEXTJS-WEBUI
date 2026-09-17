"use client";

// THE TWO THINGS A PROCESSOR CONSULTS about the plan in front of them — the
// statement of account, and whatever the plan owes against itself.
//
// THEY MOVED OUT OF THE RAIL (user, 2026-09-17: "we will remove this. We move it
// in the right section"). They were a two-across `ActionButtonRow` at the foot of
// the rail, under the plan holder list and over Terminate — see
// `RecordActions`, which still draws them for the archived workspaces.
//
// WHY THE RAIL WAS THE WRONG PLACE FOR THEM. That column is where the work is
// COMMITTED: a plan holder is picked from the list, and the one button under it
// terminates or verifies the record. Two lookups wedged between those made the
// commit the third thing in a block of three, and read as though consulting the
// SOA were a step on the way to terminating. They are neither a step nor a
// commit — they are readings, and the record column is where the reading
// happens.
//
// THE DEATH CLAIM ALREADY HAD THE ANSWER, which is the whole reason this is the
// shape it is (user: "Same as the Death Claim"). Its own column carries exactly
// this — a pair of `SectionLauncher` cards for Payments and Beneficiaries,
// sitting between the claim's sections because neither is what a claim is
// DECIDED on. Same component, same grid, same place in the column. The two
// screens are worked by the same people in the same sitting, and a lookup that
// is a card on one and a button on the other is two idioms for one act.
//
// IT IS THE CLAIM'S PAYMENTS LOOKUP, NOT A COPY OF IT (user, 2026-09-17:
// "instead of SOA make it payments same as the Death Claim… so if we made
// changes the other one would change too"). `PaymentsLookup` is rendered by both
// screens — the card, the dialog it opens and the ledger inside it, one thing in
// one file.
//
// IT WAS LABELLED "SOA" FOR AN HOUR, which named a drawer rather than the
// lookup, and for a further hour it wore the claim's label while still opening
// that drawer — the same card doing two different things on two screens (user:
// "why does when click it is not similar"). It opens the claim's ledger now.
//
// WHICH LEAVES `SoaDrawer` WITH NO DOOR on this screen. Nothing else opened it,
// so the statement of account — the receipts PLUS the plan's totals — is not
// reachable from the record at the moment. The component is untouched and still
// mounted by both callers, waiting on where it should be reached from.
//
// LOAN DETAILS STANDS WHERE BENEFICIARIES DOES (user: "instead of beneficiary
// the other one would be Loan Details"), and stays here rather than in the
// shared file: there is no second card that is the same on both screens.
//
// LOAN DETAILS COUNTS ZERO, AND WILL UNTIL THERE IS A LOAN TABLE. There is no
// loan anywhere in this data layer — no balance, no ledger, nothing — so the
// card says nothing is on file rather than opening a panel of dashes that would
// read as "this plan has no loan" when the truth is that nobody has been asked.
// The press says the same thing in words. See `openLoanDetails`.

import { useMessageDialog } from "osp-ui-kit";
import { LuHandCoins } from "react-icons/lu";
import { LookupRow, PaymentsLookup } from "../../components/lookup-row";
import { SectionLauncher } from "../../components/section-popup";

export interface RecordLookupsProps {
  /** The plan being read. Its payments are what the Payments card lists. */
  lpaNo: string;
}

export function RecordLookups({ lpaNo }: RecordLookupsProps) {
  const { messageBox } = useMessageDialog();

  /**
   * PLACEHOLDER, and honestly so — moved here with the card, from
   * `RecordActions`.
   *
   * There is no loan anywhere in this data layer, so there is nothing for this
   * to show. What it says is that the data is not here yet, which beats a panel
   * of dashes pretending a plan has no loan.
   */
  const openLoanDetails = () =>
    void messageBox({
      title: "LOAN DETAILS",
      message: `No loan records are on file for ${lpaNo}. Loan details are not wired into this area yet.`,
      confirmText: "OK",
      variant: "information",
      showCancel: false,
    });

  return (
    <LookupRow>
      {/* The claim's card AND the claim's dialog — see `PaymentsLookup`, which
          owns both. It takes no handler: what it opens is part of what it is. */}
      <PaymentsLookup lpaNo={lpaNo} />
      <SectionLauncher
        Icon={LuHandCoins}
        title="Loan Details"
        subtitle="Advances against this plan"
        count={0}
        onClick={openLoanDetails}
      />
    </LookupRow>
  );
}

export default RecordLookups;
