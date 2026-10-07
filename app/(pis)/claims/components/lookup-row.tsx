"use client";

// THE ROW OF LOOK-UPS a record column carries, and the one card both of them
// have in it.
//
// The death claim and the service record both end up asking the same thing of
// the same plan — what has been PAID on it — and both put that question in the
// same place: a pressable card in the reading column, beside a second lookup
// that differs by screen. The claim's neighbour is Beneficiaries; the service
// record's is Loan Details.
//
// SO THE SHARED PART IS EXTRACTED AND THE DIFFERENT PART IS NOT (user,
// 2026-09-17: "make it also a component so if we made changes the other one
// would change too"). {@link PaymentsLookup} is the card both screens draw,
// whole. {@link LookupRow} is the grid they sit in. The second card stays at the
// call site, because there is no second card that is the same on both screens.
//
// THE CARD OWNS WHAT IT OPENS, and that is the correction (user, 2026-09-17:
// "are you sure it is a component. why does when click it is not similar").
// It did not, for an hour: the icon, the words and the count were shared and the
// PRESS was left to each screen — so the claim opened a paginated ledger of
// receipts and the service record opened the Statement of Account, from one
// card that said the same thing on both. Two behaviours behind one label is
// worse than two labels, because nothing on screen warns you which you are
// about to get.
//
// A component that shares only its appearance is not shared, it is duplicated
// with a common stylesheet. This one holds its own dialog and its own open
// state, so pressing it does one thing everywhere and there is no wiring at a
// call site to get wrong.
//
// WHY THE COUNT IS COMPUTED IN HERE rather than passed, for the same reason. It
// is the one number that could quietly disagree between the two screens: the
// claim counted `getPlanholderPayments(...).length` and the service record
// counted `db.getPayments(...).length`, the same number today only because the
// first maps the second. Two expressions for one fact is how they stop being one
// fact. The card takes the plan number and asks once.

import type { ReactNode } from "react";
import { useState } from "react";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { LuReceipt } from "react-icons/lu";
import { EmptyStateCard } from "osp-ui-kit";
import { db } from "../../data";
import { PlanholderPaymentsTable } from "../planholder/components/PlanholderPaymentsTable";
import {
  PaymentsNoMatch,
  PaymentsSheet,
  PaymentsToolbar,
  usePaymentsLedger,
} from "./payments-ledger";
import { ListPopup, SectionLauncher } from "./section-popup";

/**
 * The grid the look-ups sit in: two across where there is room, stacked where
 * there is not.
 *
 * `auto-fit` with a 240px floor rather than a breakpoint, so it answers to the
 * COLUMN it is dropped in — the claim's reading column and the service record's
 * are different widths, and both get two across without either naming a
 * viewport size.
 */
export function LookupRow({ children }: { children: ReactNode }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(min(240px, 100%), 1fr))"
      gap={3}
    >
      {children}
    </Box>
  );
}

export interface PaymentsLookupProps {
  /** The plan whose receipts are counted and listed. */
  lpaNo: string;
}

/**
 * WHAT HAS BEEN PAID ON THE PLAN — the card, and the ledger behind it.
 *
 * ONE PROP, AND IT IS THE PLAN NUMBER. Everything else about this lookup — the
 * icon, the words, the count, the dialog it opens and the table inside it — is
 * fixed here, which is what makes it the same lookup rather than two that
 * resemble each other. There is nothing for a call site to pass differently and
 * so nothing for the two screens to disagree about.
 *
 * THE DIALOG IS MOUNTED ALWAYS, `open` driving it — never
 * `{open && <SectionPopup/>}`. A dialog mounted at the moment it opens has left
 * this app with the page behind it unclickable. Holding the state in here rather
 * than at the call site is also what stops each screen re-deciding that.
 */
export function PaymentsLookup({ lpaNo }: PaymentsLookupProps) {
  const [open, setOpen] = useState(false);
  const ledger = usePaymentsLedger(lpaNo, open);
  const isPhone = useBreakpointValue({ base: true, lg: false }) ?? false;

  // BOTH ALWAYS MOUNTED, `open` choosing between them — see `SectionPopup`.
  return (
    <>
      <SectionLauncher
        Icon={LuReceipt}
        title="Payments"
        subtitle="Official receipts on record"
        count={db.getPayments(lpaNo).length}
        onClick={() => setOpen(true)}
      />

      {/* The phone's sheet — loads as it scrolls, controls at its foot. */}
      <PaymentsSheet
        ledger={ledger}
        open={open && isPhone}
        onClose={() => setOpen(false)}
      />

      {/* A LIST POP-UP, NOT A LOOK-UP ONE: the rows now change with the search
          and the pay class, so it holds its height. The toolbar rides in the
          header so it stays put while the table scrolls. */}
      <ListPopup
        title="Payments"
        open={open && !isPhone}
        onClose={() => setOpen(false)}
        header={<PaymentsToolbar ledger={ledger} />}
      >
        {ledger.payments.length === 0 ? (
          <EmptyStateCard
            title="No payments yet"
            description="Official receipts posted for this plan will appear here."
          />
        ) : (
          <PlanholderPaymentsTable
            payments={ledger.rows}
            emptyState={<PaymentsNoMatch ledger={ledger} />}
          />
        )}
      </ListPopup>
    </>
  );
}

export default LookupRow;
