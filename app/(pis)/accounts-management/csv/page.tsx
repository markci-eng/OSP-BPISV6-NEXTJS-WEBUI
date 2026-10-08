"use client";

// CSV (Cash Surrender Value) — a master/detail screen laid out like Return of
// Premium: the list on the left, the selected request on the right.

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import {
  InfoCardAccordion,
  Page,
  PrimaryMdButton,
  ProfileHeaderCardSkeleton,
  SecondarySmButton,
} from "osp-ui-kit";
import {
  Calculator,
  CalendarClock,
  FileBadge,
  ReceiptText,
  Save,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { SURFACE_RADIUS } from "../../claims/components/section-card";
import { CollapsibleListLayout } from "../components/collapsible-list-layout";
import { StatementOfAccountDialog } from "../components/statement-of-account-dialog";
import { buildStatementOfAccount } from "../data/statement-of-account";
import {
  RopCofpReplacementDialog,
  type CofpReplacementForm,
} from "../return-of-premium/components/rop-cofp-replacement-dialog";
import {
  RopPhInfoDialog,
  type PhInfoForm,
} from "../return-of-premium/components/rop-ph-info-dialog";
import {
  RopPayoutCard,
  type RopPayoutSelection,
} from "../return-of-premium/components/rop-payout-card";
import { RopPayoutProofCard } from "../return-of-premium/components/rop-payout-proof-card";
import { RopRemarksCard } from "../return-of-premium/components/rop-remarks-card";
import { RopSubmittedDocumentsCard } from "../return-of-premium/components/rop-submitted-documents-card";
import { CsvDetailsCard } from "./components/csv-details-card";
import { CsvListCard } from "./components/csv-list-card";
import { CsvPlanholderCard } from "./components/csv-planholder-card";
import { CSV_LIST_STATUSES, fetchCsvRecords } from "./data/data";
import type { CsvRecord, CsvStatus } from "./data/types";

/**
 * The 30% column, as on Return of Premium (user, 2026-10-08) — the planholder
 * card and the payout details both take it, leaving 70% to the scans beside
 * them. Full width once the panels stack.
 */
const COLUMN_WIDTH = { base: "100%", lg: "30%" } as const;
const COLUMN_MIN_WIDTH = { lg: "280px" } as const;

export default function CsvPage() {
  const [records, setRecords] = useState<CsvRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CsvStatus>(CSV_LIST_STATUSES[0]);
  // Read by the fetch below without making the status a dependency of it —
  // changing the view filters the records on hand, it does not refetch them.
  const statusRef = useRef(status);
  const [phInfoOpen, setPhInfoOpen] = useState(false);
  const [cofpOpen, setCofpOpen] = useState(false);
  const [soaOpen, setSoaOpen] = useState(false);
  // Which payout the Payout Details card is showing, so the Proof of Payout
  // card beside it can show that submission's scan.
  const [payoutSelection, setPayoutSelection] = useState<RopPayoutSelection>({
    onCheque: false,
  });

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchCsvRecords().then((rows) => {
      if (cancelled) return;
      setRecords(rows);
      // Keep the open record across a refresh; otherwise pick the first one.
      setSelectedId((current) => {
        const inView = rows.filter((r) => r.status === statusRef.current);
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

  const inStatus = useMemo(
    () => records.filter((record) => record.status === status),
    [records, status],
  );

  // Switching status opens that view's first record, so the right panel is
  // always one of the rows on the left.
  const changeStatus = (next: CsvStatus) => {
    statusRef.current = next;
    setStatus(next);
    setSelectedId(records.find((record) => record.status === next)?.id);
  };

  const selected = useMemo(
    () => inStatus.find((record) => record.id === selectedId),
    [inStatus, selectedId],
  );

  // The COFP request opens on the planholder as the record now holds it.
  // Memoized because the dialog resets to it whenever it changes — a fresh
  // object each render would wipe the typing.
  const cofpDefaults = useMemo<CofpReplacementForm>(
    () => ({
      lastName: selected?.lastName ?? "",
      firstName: selected?.firstName ?? "",
      middleName: selected?.middleName ?? "",
      birthdate: selected?.birthdate ?? "",
    }),
    [selected],
  );

  // The record's plan over the sample ledger, as on Transfer — CSV carries no
  // payments of its own.
  const soa = useMemo(() => {
    if (!selected) return undefined;
    return buildStatementOfAccount({
      contractNo: selected.lpaNo,
      name: [
        selected.firstName,
        selected.middleName && `${selected.middleName[0]}.`,
        selected.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase(),
      birthDate: selected.birthdate,
      branch: selected.branchCode,
      planType: selected.planDescription.toUpperCase(),
      contractPrice: selected.details.contractPrice,
      newEffectivity: selected.newEffectivityDate,
      accountStatus: selected.accountStatus.toUpperCase(),
      terminationStatus: selected.terminationStatus.toUpperCase(),
      cofpNo: selected.cofpNo ?? "",
    });
  }, [selected]);

  // Held on the page only — nothing is persisted yet, there is no endpoint.
  const savePhInfo = (info: PhInfoForm) => {
    if (!selected) return;
    setRecords((rows) =>
      rows.map((row) =>
        row.id === selected.id
          ? {
              ...row,
              ...info,
              planholderName: `${info.lastName}, ${info.firstName}`,
            }
          : row,
      ),
    );
    toast.success(`PH info for ${selected.lpaNo} updated`);
  };

  return (
    <Page.Root
      title="Cash Surrender Value"
      headerButton="menu"
      px={{ base: 0, lg: "10px" }}
    >
      {/* The COFP request, top right beside the title, as on Return of
          Premium. Off until a record is open. */}
      <Page.ToolContent>
        <Flex align="center" gap={2} wrap="wrap">
          <SecondarySmButton
            onClick={() => setCofpOpen(true)}
            disabled={!selected}
          >
            <FileBadge size={14} />
            COFP Replacement
          </SecondarySmButton>
          {/* Nothing behind it yet — there is no inquiry screen or endpoint. */}
          <SecondarySmButton
            onClick={() =>
              selected && toast.info(`CSV amount inquiry for ${selected.lpaNo}`)
            }
            disabled={!selected}
          >
            <Calculator size={14} />
            CSV Amount Inquiry
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
        {/* The list starts hidden; the toggle brings it back. */}
        <CollapsibleListLayout
          defaultListVisible={false}
          list={
            <CsvListCard
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
          {loading ? (
            <Box w={COLUMN_WIDTH} minW={COLUMN_MIN_WIDTH}>
              <ProfileHeaderCardSkeleton />
            </Box>
          ) : selected ? (
            <Flex direction="column" gap="10px" w="full" minW={0}>
              {/* The ROP row: the planholder card in 30% on the left, Submitted
                  Documents in the rest. Stacks below `lg`. */}
              <Flex
                direction={{ base: "column", lg: "row" }}
                align="stretch"
                gap="10px"
                w="full"
                minW={0}
              >
                {/* The column carries the 30%, not the card. */}
                <Flex
                  direction="column"
                  gap="10px"
                  w={COLUMN_WIDTH}
                  minW={COLUMN_MIN_WIDTH}
                  flexShrink={0}
                >
                  <CsvPlanholderCard
                    record={selected}
                    onEdit={() => setPhInfoOpen(true)}
                  />
                </Flex>
  
                {/* Out of flow on `lg`, as on ROP, so the planholder card sets
                    the row's height and the scan is fitted inside it rather
                    than growing the row with the column's width. */}
                <Box
                  flex="1"
                  minW={0}
                  w={{ base: "full", lg: "auto" }}
                  position={{ base: "static", lg: "relative" }}
                >
                  <Box position={{ base: "static", lg: "absolute" }} inset={0}>
                    {/* ROP's scrolling stack (user, 2026-10-08): the
                        documents are read top to bottom, no next / previous
                        buttons. */}
                    <RopSubmittedDocumentsCard
                      documents={selected.submittedDocuments}
                      emptyMessage="This request has no supporting documents on file yet."
                    />
                  </Box>
                </Box>
              </Flex>
  
              {/* Payout details and their proof in one fold, as on ROP — one
                  surface split 30/70 like the row above: details left,
                  proof right, a rule between that turns horizontal below
                  `lg`. */}
              <InfoCardAccordion
                icon={<Wallet />}
                title="Payout Details and Proof of Payout"
                defaultOpen
              >
                <Flex
                  direction={{ base: "column", lg: "row" }}
                  align="stretch"
                  w="full"
                  minW={0}
                >
                  {/* The details set the fold's height. */}
                  <Box
                    w={COLUMN_WIDTH}
                    flexShrink={0}
                    minW={0}
                    pr={{ base: 0, lg: 4 }}
                  >
                    <RopPayoutCard
                      embedded
                      payouts={selected.payouts}
                      onSelectionChange={setPayoutSelection}
                    />
                  </Box>

                  <Box
                    flexShrink={0}
                    alignSelf="stretch"
                    borderLeftWidth={{ base: 0, lg: "1px" }}
                    borderTopWidth={{ base: "1px", lg: 0 }}
                    borderColor="border.muted"
                    my={{ base: 3, lg: 0 }}
                  />

                  {/* Out of flow on `lg`, so the proof is as tall as the
                      details beside it, not as tall as its scan. */}
                  <Box
                    flex="1"
                    minW={0}
                    position={{ base: "static", lg: "relative" }}
                  >
                    <Box
                      position={{ base: "static", lg: "absolute" }}
                      inset={0}
                      pl={{ base: 0, lg: 4 }}
                    >
                      <RopPayoutProofCard
                        embedded
                        payout={payoutSelection.payout}
                        onCheque={payoutSelection.onCheque}
                      />
                    </Box>
                  </Box>
                </Flex>
              </InfoCardAccordion>

              {/* The plan holder module's trail and the processor's notes on
                  it, under the payout pair as on ROP. Keyed by record, so the
                  notes list opens on its first page for each request. */}
              <RopRemarksCard
                key={selected.id}
                lpaNo={selected.lpaNo}
                planholderName={selected.planholderName}
                remarks={selected.planholderRemarks}
                notes={selected.planholderNotes}
              />

              {/* The surrender and its validation in one fold, as ROP's
                  schedule. Keyed by record, so edits and ticks start clean. */}
              <InfoCardAccordion
                icon={<CalendarClock />}
                title="CSV Details"
                defaultOpen
              >
                <CsvDetailsCard key={selected.id} details={selected.details} />
              </InfoCardAccordion>

              {/* Nothing is persisted yet — there is no endpoint. */}
              <Flex justify="flex-end">
                <PrimaryMdButton
                  onClick={() => toast.success(`${selected.csvNo} changes saved`)}
                >
                  <Save size={16} />
                  Save Changes
                </PrimaryMdButton>
              </Flex>
            </Flex>
          ) : (
            <Box w={COLUMN_WIDTH} minW={COLUMN_MIN_WIDTH}>
              <Flex
                direction="column"
                align="center"
                justify="center"
                gap={2}
                bg="white"
                borderWidth="1px"
                borderColor="border.muted"
                borderRadius={SURFACE_RADIUS}
                shadow="xs"
                py={16}
                px={6}
                textAlign="center"
              >
                <Text fontSize="md" fontWeight="600" color="gray.700">
                  No CSV selected
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Pick a record from the list to see its information.
                </Text>
              </Flex>
            </Box>
          )}
        </CollapsibleListLayout>

        {selected && (
          <RopPhInfoDialog
            // Keyed by record so the form opens on the planholder now shown.
            key={selected.id}
            open={phInfoOpen}
            onOpenChange={setPhInfoOpen}
            lpaNo={selected.lpaNo}
            defaults={{
              lastName: selected.lastName,
              firstName: selected.firstName,
              middleName: selected.middleName,
              birthdate: selected.birthdate,
            }}
            onSave={savePhInfo}
          />
        )}

        <RopCofpReplacementDialog
          open={cofpOpen}
          onOpenChange={setCofpOpen}
          defaults={cofpDefaults}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
