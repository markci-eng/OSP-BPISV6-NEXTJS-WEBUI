"use client";

// The ROP's own details — the card under the planholder card.
//
// IT IS EDIT RITF'S CARD (user, 2026-09-24), not a lookalike: `SectionCard` and
// `InfoRow` are the components that screen renders, moved to
// `accounts-management/components/section-card` so both call the same ones. The
// green-tinted title strip, the dashed leaders, the right-aligned values and
// the em dash for an empty field all come from there rather than being set
// again here.
//
// ONE BLOCK AND 30% OF THE PANEL WIDE (user, 2026-09-24). The width is set by
// the panel rather than here — a card does not decide how much of a page it
// takes — but it is what the rows inside are built to survive: the label
// truncates, the leader keeps a floor, and the pay classes wrap.

import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { SecondarySmButton } from "osp-ui-kit";
import { CreditCard, FileText } from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  InfoRow,
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { RopRecord } from "../data/types";
import { RopPaymentHistoryDialog } from "./rop-payment-history-dialog";

/**
 * MM/DD/YYYY, which is how the ledger prints a date.
 *
 * NOT `formatFiledDate`, the app's usual "Jan 1, 2025". This card shows the
 * account's stored dates, one of which is the `01/01/1900` that PIS uses for
 * "never terminated" — a processor reads that as a number they recognise, and
 * "Jan 1, 1900" reads as a real date somebody typed.
 */
function ledgerDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}

export interface RopDetailsCardProps {
  record: RopRecord;
}

export function RopDetailsCard({ record }: RopDetailsCardProps) {
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);

  // THE PLAN HOLDER CARD'S OWN EDGE (user, 2026-09-24). Its neighbour above
  // is the kit's `ProfileHeaderCard`, whose hairline is a green-tinged gray
  // and whose lift is an ambient glow — both measured off it, which is why
  // they are constants rather than tokens. Against that, this card's default
  // `border.muted` and no shadow read as barely there.
  return (
    <>
      <SectionCard
        icon={<FileText size={14} />}
        title="ROP Details"
        borderColor={KIT_BORDER}
        boxShadow={KIT_SHADOW}
        // Beside the title (user, 2026-09-24) rather than under the rows, where
        // it sat across the run of leaders. Opens the plan's payments in a
        // dialog rather than navigating away from the record.
        action={
          <SecondarySmButton onClick={() => setPaymentHistoryOpen(true)}>
            <CreditCard size={14} />
            Payment History
          </SecondarySmButton>
        }
      >
        <Flex direction="column" gap={1}>
          {/* ONE BLOCK, not the two this was briefly split into (user,
              2026-09-24). The request's own fields and the account's state
              read as one list: they are all answers about the same return, and
              a second title strip between them was a break where there is no
              change of subject.

              The order still runs request-then-account, so the split's reading
              order survives the merge. */}
          {/* NO LPA NUMBER HERE (user, 2026-09-24): the planholder card above
            carries it, under the name and drawn to be found — a number printed
            twice on one screen is a number somebody has to check against
            itself. */}
          <InfoRow label="ROP No." value={record.ropNo} />
          <InfoRow label="ROP Date" value={ledgerDate(record.ropDate)} />
          <InfoRow
            label="New Effectivity Date"
            value={ledgerDate(record.newEffectivityDate)}
          />
          {/* THE ONE VALUE THAT CARRIES COLOUR: verification is the field that
              goes stale, and it is what a processor checks before anything
              else on the card is worth reading. `InfoRow` takes a node, so the
              colour is set on the value rather than by reaching into it. */}
          <InfoRow
            label="Date Verified"
            value={
              <span style={{ color: BRAND_COLORS.errorRed }}>
                {ledgerDate(record.dateVerified)}
              </span>
            }
          />

          <InfoRow label="Acct Status" value={record.accountStatus} />
          <InfoRow
            label="Loan Status"
            value={record.loanStatus === "CLEARED" ? "Cleared" : "Outstanding"}
          />
          <InfoRow label="Termi Status" value={record.terminationStatus} />
          {/* PRINTED AS THE LEDGER STORES IT. "01/01/1900" is the PIS stand-in
              for an account that was never terminated, and it is shown rather
              than blanked because a processor reads it as exactly that — a
              blank would read as a field nobody filled in. */}
          <InfoRow
            label="Termi Stat Date"
            value={ledgerDate(record.terminationStatusDate)}
          />
          {/* THE ONE ROW THAT MAY WRAP: six codes do not fit beside their label
            in a 30% column, and a list is the one kind of value that reads
            fine on two lines. */}
          <InfoRow
            label="Payclass"
            valueWrap
            value={
              <Flex
                as="span"
                align="baseline"
                gap={1.5}
                justify="end"
                wrap="wrap"
              >
                {record.payclasses.map((payclass, i) => (
                  <span
                    key={payclass.code}
                    // The flagged ones stay red — a class that needs looking
                    // at before the return is computed is the other thing on
                    // this card worth stopping on.
                    style={{
                      color: payclass.flagged
                        ? BRAND_COLORS.errorRed
                        : undefined,
                    }}
                  >
                    {payclass.code}
                    {i < record.payclasses.length - 1 && ","}
                  </span>
                ))}
              </Flex>
            }
          />
        </Flex>
      </SectionCard>
      <RopPaymentHistoryDialog
        open={paymentHistoryOpen}
        onOpenChange={setPaymentHistoryOpen}
        lpaNo={record.lpaNo}
        planholderName={record.planholderName}
        payments={record.payments}
      />
    </>
  );
}

export default RopDetailsCard;
