"use client";

// THE PAYMENTS LOOK-UP'S FILTERS — the mock-up as approved (user, 2026-10-02):
// a search on the OR number and a choice of pay class, on the phone and the
// desktop alike, with Print SOA beside them. No payment date (user, same day:
// "remove the payment date").
//
// THE PAY CLASSES ARE THE LEDGER'S OWN — one per class that has a receipt on
// this plan, never the reference table's full list, so a plan with no
// Processing Fee shows no Processing Fee to pick.
//
// THE COUNTS FOLLOW THE SEARCH, as the queue sheet's tabs do: a class reading 0
// because of what was typed says the search found none there, which is true.
//
// THE FILTERS END WITH THE SITTING. Each opening starts at All with no search.
// The table's Rows choice is the one thing remembered — see
// `PlanholderPaymentsTable`.

import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LuPrinter } from "react-icons/lu";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  SecondarySmButton,
} from "osp-ui-kit";
import { getPlanholderPayments, type PlanholderPayment } from "../claims-data";
import { PaymentRow } from "../planholder/components/PaymentRow";
import { PRINT_SOA_LABEL, printSoa } from "./print-soa";
import { QueueSearchSheet } from "./queue-search-sheet";

const ALL = "all";

export interface PayClassOption {
  key: string;
  label: string;
  count: number;
}

/**
 * "DEFFERED COLLECTION" → "Deffered collection". Cased for a control, spelled
 * as the reference table spells it — the row under it shows the same word.
 */
function payClassLabel(payClass: string): string {
  return payClass.charAt(0) + payClass.slice(1).toLowerCase();
}

/**
 * A plan's receipts and the two filters over them.
 *
 * `active` resets the filters each time it turns true — the look-up's `open`.
 * Left out, the filters simply start empty.
 */
export function usePaymentsLedger(lpaNo: string, active = true) {
  const payments = useMemo(() => getPlanholderPayments(lpaNo), [lpaNo]);
  const [query, setQuery] = useState("");
  const [payClass, setPayClass] = useState(ALL);

  useEffect(() => {
    if (!active) return;
    setQuery("");
    setPayClass(ALL);
  }, [active, lpaNo]);

  const searched = useMemo(() => {
    const q = query.trim().toUpperCase();
    return q ? payments.filter((p) => p.orNo.toUpperCase().includes(q)) : payments;
  }, [payments, query]);

  const classes = useMemo<PayClassOption[]>(() => {
    // In the ledger's own order of first appearance — a plan opens with its New
    // Sale, so that is the class after All.
    const order = [...new Set([...payments].reverse().map((p) => p.payClass))];
    return [
      { key: ALL, label: "All", count: searched.length },
      ...order.map((c) => ({
        key: c,
        label: payClassLabel(c),
        count: searched.filter((p) => p.payClass === c).length,
      })),
    ];
  }, [payments, searched]);

  const rows = useMemo(
    () =>
      payClass === ALL
        ? searched
        : searched.filter((p) => p.payClass === payClass),
    [searched, payClass],
  );

  const filtered = query.trim() !== "" || payClass !== ALL;
  const clear = () => {
    setQuery("");
    setPayClass(ALL);
  };

  return {
    lpaNo,
    payments,
    rows,
    classes,
    query,
    setQuery,
    payClass,
    setPayClass,
    filtered,
    clear,
  };
}

export type PaymentsLedger = ReturnType<typeof usePaymentsLedger>;


/** What the list says when the filters leave nothing. */
export function PaymentsNoMatch({ ledger }: { ledger: PaymentsLedger }) {
  return (
    <Flex direction="column" align="center" gap={3} py={10}>
      <Text fontSize="sm" color="gray.500">
        No receipts match
      </Text>
      <SecondarySmButton onClick={ledger.clear}>Clear filters</SecondarySmButton>
    </Flex>
  );
}

/**
 * THE DESKTOP'S ONE ROW: OR search, pay class, and — after a rule, because it
 * is not a filter — Print SOA. It prints the whole statement, whatever is
 * filtered.
 */
export function PaymentsToolbar({ ledger }: { ledger: PaymentsLedger }) {
  return (
    <Flex align="center" gap={3} wrap="wrap">
      <Box flex="0 1 260px" minW="180px">
        <FloatingLabelInput
          label="Search OR number"
          type="search"
          value={ledger.query}
          onValueChange={ledger.setQuery}
        />
      </Box>
      <Box flex="0 0 240px">
        <FloatingLabelSelect
          label="Pay class"
          value={ledger.payClass}
          onValueChange={ledger.setPayClass}
        >
          {ledger.classes.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label} ({c.count})
            </option>
          ))}
        </FloatingLabelSelect>
      </Box>
      <Box
        ml="auto"
        w="1px"
        h="28px"
        bg="gray.200"
        flexShrink={0}
        aria-hidden
      />
      <SecondarySmButton
        h="40px"
        minH="40px"
        flexShrink={0}
        onClick={() => printSoa(ledger.lpaNo)}
      >
        <LuPrinter /> {PRINT_SOA_LABEL}
      </SecondarySmButton>
    </Flex>
  );
}

/**
 * THE PHONE'S PAYMENTS — the queue sheet every list on these screens uses: it
 * loads as you scroll and the pay classes are its tabs (tap one or swipe the
 * list). Print SOA takes the foot, so the tabs and the search sit at the top.
 */
export function PaymentsSheet({
  ledger,
  open,
  onClose,
}: {
  ledger: PaymentsLedger;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <QueueSearchSheet<PlanholderPayment>
      title="Payments"
      open={open}
      onClose={onClose}
      tabs={ledger.classes}
      activeTab={ledger.payClass}
      onTabChange={ledger.setPayClass}
      query={ledger.query}
      onQueryChange={ledger.setQuery}
      placeholder="Search OR number"
      items={ledger.rows}
      getKey={(payment) => payment.orNo}
      renderItem={(payment) => <PaymentRow payment={payment} />}
      empty={
        ledger.payments.length === 0 ? (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={10}>
            No payments yet
          </Text>
        ) : (
          <PaymentsNoMatch ledger={ledger} />
        )
      }
      filterCount={0}
      // The foot's own full-width 44px, as its other controls are.
      action={
        <SecondarySmButton
          w="full"
          h="44px"
          minH="44px"
          onClick={() => printSoa(ledger.lpaNo)}
        >
          <LuPrinter /> {PRINT_SOA_LABEL}
        </SecondarySmButton>
      }
    />
  );
}
