"use client";

import { useEffect, useState } from "react";
import { Box, Button, Flex, useBreakpointValue, VStack } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { EmptyStateCard } from "osp-ui-kit";
import { getPlanholderPayments, type PlanholderPayment } from "../../claims-data";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { PlanholderPaymentListDrawer } from "./PlanholderPaymentListDrawer";
import { PlanholderPaymentsTable } from "./PlanholderPaymentsTable";
import { PaymentRow } from "./PaymentRow";

/** Rows shown inline before "View all" opens the full-list drawer. */
const COLLAPSED_LIMIT = 5;

/* ------------------------------ section ------------------------------ */

interface PlanholderPaymentsProps {
  /** The plan whose payment ledger is listed (by LPA number). */
  lpaNo?: string;
}

/**
 * Payments on record for a plan.
 *
 * On a phone it is the same compact row list as Documents: a ledger reads no
 * better in a grid than a stack of receipts does at that width, and there is no
 * room for four columns anyway. The first {@link COLLAPSED_LIMIT} rows are
 * inline and the rest live behind "View all", which opens the full list in its
 * own drawer.
 *
 * From `lg` it is a paged table instead — see {@link PlanholderPaymentsTable}.
 * A receipt is four short fields, which is what a table is for, and the width is
 * there to put them side by side rather than two to a line. The drawer goes with
 * the row list: the pager reaches every receipt without leaving the page.
 *
 * Payments are read-only — there is no add or remove flow here.
 */
export function PlanholderPayments({ lpaNo }: PlanholderPaymentsProps) {
  const [payments, setPayments] = useState<PlanholderPayment[]>([]);
  useEffect(() => {
    setPayments(lpaNo ? getPlanholderPayments(lpaNo) : []);
  }, [lpaNo]);

  /**
   * `lg`, the same width the claim queue swaps its cards for a table at — a
   * table is a table wherever it is, and the two sections should not disagree
   * about where the desktop starts.
   *
   * `false` until it has measured, so the server and the first client render
   * agree; the phone's list is what shows in the meantime.
   */
  const isDesktop =
    useBreakpointValue({ base: false, lg: true }) ?? false;

  // The full-list drawer, opened from "View all" — the row list's overflow, and
  // so the phone's only.
  const [listOpen, setListOpen] = useState(false);

  const count = payments.length;
  // The inline preview; the rest live in the "View all" list drawer.
  const visible = payments.slice(0, COLLAPSED_LIMIT);
  const hidden = count - visible.length;

  return (
    <Box>
      <PlanholderSectionHeader
        title="Payments"
        subtitle="Official receipts on record for this plan"
      />

      <Box>
        {count === 0 ? (
          // The shared empty state — see the note in `PlanholderClaimRequests`.
          <EmptyStateCard
            title="No payments yet"
            description="Official receipts posted for this plan will appear here."
          />
        ) : isDesktop ? (
          <PlanholderPaymentsTable payments={payments} />
        ) : (
          <>
            <VStack align="stretch" gap={2}>
              {visible.map((payment) => (
                <PaymentRow key={payment.orNo} payment={payment} />
              ))}
            </VStack>

            {/* Overflow lives in a dedicated list drawer, the same as
                Documents — the count rides in the button so the section
                heading itself stays quiet. */}
            {hidden > 0 && (
              <Flex justify="center" pt={3}>
                <Button
                  variant="ghost"
                  size="xs"
                  borderRadius="full"
                  color="gray.600"
                  onClick={() => setListOpen(true)}
                >
                  View all {count}
                  <LuChevronRight size={13} />
                </Button>
              </Flex>
            )}
          </>
        )}
      </Box>

      {/* Full-list drawer — every receipt on record, in one scroll. The table's
          pager does that job on a desktop, so this goes with the row list. */}
      {!isDesktop && (
        <PlanholderPaymentListDrawer
          payments={payments}
          open={listOpen}
          onClose={() => setListOpen(false)}
        />
      )}
    </Box>
  );
}

export default PlanholderPayments;
