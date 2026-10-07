"use client";

// Return of Premium — a master/detail screen.
//
// LIST LEFT, INFORMATION RIGHT. The rail is a quarter of the width and the
// profile takes the rest, because the rail is scanned and the profile is read.
// Below `lg` the two stack with the list first: on a phone you pick before you
// read, and a profile above the list would bury the thing you came to pick
// from.
//
// SELECTION IS HELD BY ID, not by holding the record itself, which is what lets
// it survive a refresh: the list comes back as new objects, and an id still
// finds the row the user had open where an object identity would not.

import { useEffect, useMemo, useRef, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { Page, SecondarySmButton } from "osp-ui-kit";
import { FileBadge, ReceiptText } from "lucide-react";

import { CollapsibleListLayout } from "../components/collapsible-list-layout";
import { StatementOfAccountDialog } from "../components/statement-of-account-dialog";
import { buildStatementOfAccount } from "../data/statement-of-account";
import { RopInformationPanel } from "./components/rop-information-panel";
import { RopListCard } from "./components/rop-list-card";
import { fetchRopRecords, ROP_SCHEDULE_STATUS_OPTIONS } from "./data/data";
import type { RopRecord, RopScheduleStatus } from "./data/types";

export default function ReturnOfPremiumPage() {
  const [records, setRecords] = useState<RopRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState("");
  const [cofpOpen, setCofpOpen] = useState(false);
  const [soaOpen, setSoaOpen] = useState(false);
  const [status, setStatus] = useState<RopScheduleStatus>(
    ROP_SCHEDULE_STATUS_OPTIONS[0],
  );
  // Read by the fetch below without making the status a dependency of it —
  // changing the view filters the records on hand, it does not refetch them.
  const statusRef = useRef(status);

  // The list, and the first record picked with it.
  //
  // `cancelled` guards the state write: a user who leaves before the records
  // land would otherwise set state on a page that is gone.
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchRopRecords().then((rows) => {
      if (cancelled) return;
      setRecords(rows);
      // PRESERVE THE OPEN RECORD ACROSS A REFRESH, and fall back to the first
      // one — on the first load there is nothing to preserve, which is what
      // makes this the "load the first ROP automatically" rule as well.
      setSelectedId((current) => {
        const inView = rows.filter((r) => r.schedule.status === statusRef.current);
        return current && inView.some((r) => r.id === current)
          ? current
          : inView[0]?.id;
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // The records under the status the list header is on.
  const inStatus = useMemo(
    () => records.filter((record) => record.schedule.status === status),
    [records, status],
  );

  // SWITCHING STATUS OPENS THAT VIEW'S FIRST RECORD, so the profile on the
  // right is always one of the rows on the left rather than one left behind
  // in a view the user has stepped away from.
  const changeStatus = (next: RopScheduleStatus) => {
    statusRef.current = next;
    setStatus(next);
    setSelectedId(
      records.find((record) => record.schedule.status === next)?.id,
    );
  };

  const selected = useMemo(
    () => inStatus.find((record) => record.id === selectedId),
    [inStatus, selectedId],
  );

  // The record's plan and its own payments ledger, over the sample plan. ROP
  // carries no branch, so that comes from the sample; so does the ledger
  // where the record has no payments on file.
  const soa = useMemo(() => {
    if (!selected) return undefined;
    const { schedule } = selected;
    return buildStatementOfAccount({
      contractNo: selected.lpaNo,
      name: selected.planholderName.toUpperCase(),
      birthDate: selected.birthdate,
      contractPrice: schedule.contractPrice,
      newEffectivity: selected.newEffectivityDate,
      accountStatus: selected.accountStatus.toUpperCase(),
      terminationStatus: selected.terminationStatus.toUpperCase(),
      ...(selected.payments.length > 0 && {
        payments: selected.payments.map((payment) => ({
          payClass: payment.payclass,
          planCode: schedule.planCode,
          orNo: payment.siNo,
          branch: "",
          orDate: payment.siDate,
          amount: payment.siAmount,
        })),
      }),
    });
  }, [selected]);

  return (
    // NO DESCRIPTION AND NO BREADCRUMB (user, 2026-09-23). Both stood above
    // the panels and both were a line of chrome the screen does not need: the
    // title says what the module is, and the trail under it said the same
    // thing again. Removing the pair lifts the list and the profile by roughly
    // 60px, which is a row of the list.
    <Page.Root
      title="Return of Premium"
      headerButton="menu"
      // TIGHTER THAN THE SHELL'S OWN INSET (user, 2026-09-23), the same 10px
      // the COFP screen takes. `Page.Root` sets `px: { base: 0, lg: "44px" }`
      // and spreads what it is given after its own values, so this overrides
      // it. Mobile keeps the shell's flush edge — 360px of screen has none to
      // give.
      px={{ base: 0, lg: "10px" }}
    >
      {/* THE COFP REQUEST, top right beside the title (user, 2026-10-02) —
          it was in the ROP Schedule fold's body. `ToolContent` is the kit's
          slot at the end of the title row. Off until a record is open, since
          the request is for that record's planholder. */}
      <Page.ToolContent>
        <Flex align="center" gap={2} wrap="wrap">
          <SecondarySmButton
            onClick={() => setCofpOpen(true)}
            disabled={!selected}
          >
            <FileBadge size={14} />
            COFP Replacement
          </SecondarySmButton>
          <SecondarySmButton
            onClick={() => setSoaOpen(true)}
            disabled={!selected}
          >
            <ReceiptText size={14} />
            Statement of Account
          </SecondarySmButton>
        </Flex>

        {soa && (
          <StatementOfAccountDialog
            open={soaOpen}
            onOpenChange={setSoaOpen}
            soa={soa}
          />
        )}
      </Page.ToolContent>

      <Page.MainContent>
        {/* 26% / 74% on desktop, stacked below it, with a floating button
            that slides the list out so the profile can take the full width.
            The layout keeps the list sticky on desktop so it stays in reach
            while the profile beside it is scrolled. */}
        <CollapsibleListLayout
          list={
            <RopListCard
              records={inStatus}
              status={status}
              onStatusChange={changeStatus}
              selectedId={selectedId}
              onSelect={(record) => setSelectedId(record.id)}
              query={query}
              onQueryChange={setQuery}
              loading={loading}
            />
          }
        >
          <Flex direction="column" minW={0}>
            <RopInformationPanel
              record={selected}
              loading={loading}
              cofpOpen={cofpOpen}
              onCofpOpenChange={setCofpOpen}
            />
          </Flex>
        </CollapsibleListLayout>
      </Page.MainContent>
    </Page.Root>
  );
}
