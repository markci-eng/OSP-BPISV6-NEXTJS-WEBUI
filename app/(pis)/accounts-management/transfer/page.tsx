"use client";

// Transfer — a master/detail screen laid out like Return of Premium: the list
// rail on the left (with the floating hide/show toggle), the selected request
// on the right.
//
// THE REQUEST (user, 2026-10-08) is three columns: the transferor's and the
// transferee's details side by side, each party's Valid ID card under its
// details, and the Document Viewer pinned at the right beside both. The
// remarks and Save run under the two parties.

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Page, PrimaryMdButton, SecondarySmFlexButton } from "osp-ui-kit";
import {
  FileClock,
  FileSpreadsheet,
  History,
  MessageSquare,
  Save,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CollapsibleListLayout } from "../components/collapsible-list-layout";
import { StatementOfAccountDialog } from "../components/statement-of-account-dialog";
import { buildStatementOfAccount } from "../data/statement-of-account";
import { RemarksHistoryDialog } from "../reinstatement/components/remarks-history-dialog";
import { RopRemarksCard } from "../return-of-premium/components/rop-remarks-card";
import { RopHistoryDialog } from "./components/rop-history-dialog";
import { TransferDocumentViewerCard } from "./components/transfer-document-viewer-card";
import { TransferListCard } from "./components/transfer-list-card";
import { TransferValidIdCard } from "./components/transfer-valid-id-card";
import { TransfereeCard } from "./components/transferee-card";
import { TransferorCard } from "./components/transferor-card";
import { fetchTransferRecords, TRANSFER_STATUS_OPTIONS } from "./data/data";
import type {
  TransferDocument,
  TransferRecord,
  TransferStatus,
} from "./data/types";

type Party = "transferor" | "transferee";

// The panel's breakpoints, measured on the panel rather than the window: it is
// narrower with the list shown than hidden. From PARTIES_WIDE the parties sit
// side by side; from THREE_UP the Document Viewer joins them as a third column.
const PARTIES_WIDE = "@container (min-width: 720px)";
const THREE_UP = "@container (min-width: 1100px)";

type HeaderActionKey = "remarks" | "changes" | "soa" | "rop";

type HeaderAction = {
  key: HeaderActionKey;
  label: string;
  icon: LucideIcon;
  color: string;
};

// Beside the page title, as on Reinstatement. Remarks History, Statement of
// Account and ROP History open their dialogs; Changes History has no
// destination yet, so it reports back instead. ROP History is Transfer's own
// addition to Reinstatement's three.
const HEADER_ACTIONS: HeaderAction[] = [
  { key: "remarks", label: "Remarks History", icon: MessageSquare, color: "blue.600" },
  { key: "changes", label: "Changes History", icon: FileClock, color: "purple.600" },
  { key: "soa", label: "Statement of Account", icon: FileSpreadsheet, color: "green.600" },
  { key: "rop", label: "ROP History", icon: History, color: "orange.600" },
];

export default function TransferPage() {
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TransferStatus>(
    TRANSFER_STATUS_OPTIONS[0],
  );
  // Read by the fetch without making status a dependency of it — changing the
  // view filters the records on hand, it does not refetch them.
  const statusRef = useRef(status);
  const [remarksHistoryOpen, setRemarksHistoryOpen] = useState(false);
  const [ropHistoryOpen, setRopHistoryOpen] = useState(false);
  const [soaOpen, setSoaOpen] = useState(false);
  // What the processor has marked verified or unverified this session, over
  // what the record came with. Keyed `${recordId}:${party}` for IDs and by
  // document id for files. Nothing is persisted yet — there is no endpoint.
  const [verifiedOverrides, setVerifiedOverrides] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchTransferRecords().then((rows) => {
      if (cancelled) return;
      setRecords(rows);
      // Keep the open record across a refresh; otherwise open the first one.
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

  // Switching status opens that view's first record.
  const changeStatus = (next: TransferStatus) => {
    statusRef.current = next;
    setStatus(next);
    setSelectedId(records.find((record) => record.status === next)?.id);
  };

  const selected = useMemo(
    () => inStatus.find((record) => record.id === selectedId),
    [inStatus, selectedId],
  );

  const isIdVerified = (record: TransferRecord, party: Party) =>
    verifiedOverrides[`${record.id}:${party}`] ??
    (party === "transferor"
      ? record.transferorIdVerified
      : record.transfereeIdVerified);

  const setIdVerified = (
    record: TransferRecord,
    party: Party,
    verified: boolean,
  ) => {
    setVerifiedOverrides((current) => ({
      ...current,
      [`${record.id}:${party}`]: verified,
    }));
    const who = party === "transferor" ? "Transferor" : "Transferee";
    if (verified) toast.success(`${who} ID verified`);
    else toast.info(`${who} ID marked not verified`);
  };

  const isDocumentVerified = (document: TransferDocument) =>
    verifiedOverrides[document.id] ?? document.verified;

  const setDocumentVerified = (
    document: TransferDocument,
    verified: boolean,
  ) => {
    setVerifiedOverrides((current) => ({ ...current, [document.id]: verified }));
    if (verified) toast.success(`${document.label} marked verified`);
    else toast.info(`${document.label} marked for review`);
  };

  // The transferor's plan, over the sample ledger — Transfer carries no
  // payments of its own.
  const soa = useMemo(() => {
    if (!selected) return undefined;
    const { transferor: t } = selected;
    return buildStatementOfAccount({
      contractNo: selected.lpaNo,
      name: [t.firstName, t.middleName && `${t.middleName[0]}.`, t.lastName]
        .filter(Boolean)
        .join(" ")
        .toUpperCase(),
      birthDate: t.dateOfBirth,
      branch: t.originatingBranch,
      salesAgent: t.salesAgent1,
      salesAgent2: t.salesAgent2,
      planType: t.planType.toUpperCase(),
      insurability: t.insurable ? "INSURABLE" : "NOT INSURABLE",
      newEffectivity: t.newEffectivityDate,
      dueDate: t.dueDate,
      accountStatus: t.accountStatus.toUpperCase(),
      terminationStatus: t.terminationStatus.toUpperCase(),
    });
  }, [selected]);

  return (
    <Page.Root
      title="Transfer of Rights"
      headerButton="menu"
      px={{ base: 0, lg: "10px" }}
    >
      <Page.ToolContent>
        {/* Flex buttons fill their cell, so the four share one width. Two to a
            row on a phone, where four across would cut every label short. */}
        <Grid
          templateColumns={{
            base: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          }}
          gap={2}
          w={{ base: "full", md: "800px" }}
        >
          {HEADER_ACTIONS.map(({ key, label, icon: Icon, color }) => (
            <SecondarySmFlexButton
              key={key}
              disabled={!selected}
              onClick={() =>
                key === "remarks"
                  ? setRemarksHistoryOpen(true)
                  : key === "rop"
                    ? setRopHistoryOpen(true)
                    : key === "soa"
                      ? setSoaOpen(true)
                      : toast.info(
                        `${label} for ${selected?.lpaNo} is not available yet.`,
                      )
              }
            >
              <Box as="span" color={color} display="inline-flex">
                <Icon size={16} />
              </Box>
              {label}
            </SecondarySmFlexButton>
          ))}
        </Grid>

        {selected && (
          <RemarksHistoryDialog
            open={remarksHistoryOpen}
            onOpenChange={setRemarksHistoryOpen}
            lpaNo={selected.lpaNo}
            planholderName={selected.planholderName}
            remarks={selected.remarksHistory}
          />
        )}
        {selected && (
          <RopHistoryDialog
            open={ropHistoryOpen}
            onOpenChange={setRopHistoryOpen}
            lpaNo={selected.lpaNo}
            planholderName={selected.planholderName}
            history={selected.ropHistory}
          />
        )}
        {soa && (
          <StatementOfAccountDialog
            open={soaOpen}
            onOpenChange={setSoaOpen}
            soa={soa}
          />
        )}
      </Page.ToolContent>

      <Page.MainContent>
        {/* The list starts hidden on Transfer; the toggle brings it back. */}
        <CollapsibleListLayout
          defaultListVisible={false}
          list={
            <TransferListCard
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
          {/* A SIZE CONTAINER, so the columns follow the panel's width —
              the list beside it takes a quarter of the page when shown. */}
          <Box containerType="inline-size" minW={0}>
            {loading ? (
              <Text fontSize="sm" color="gray.400" py={4}>
                Loading…
              </Text>
            ) : selected ? (
              <Grid
                templateColumns="minmax(0, 1fr)"
                gap={4}
                alignItems="start"
                css={{
                  [THREE_UP]: {
                    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
                  },
                }}
              >
                <Flex direction="column" gap={4} minW={0}>
                  {/* THE PARTIES, the transferor first: who is giving the
                      plan up, then who is taking it on. Stacked, each party's
                      ID follows its own details; side by side, the details
                      share a row and the IDs the row under it, so each pair
                      ends level. */}
                  <Grid
                    gap={4}
                    templateColumns="minmax(0, 1fr)"
                    templateAreas={`"transferor" "transferorId" "transferee" "transfereeId"`}
                    css={{
                      [PARTIES_WIDE]: {
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gridTemplateAreas: `"transferor transferee" "transferorId transfereeId"`,
                      },
                    }}
                  >
                    <Box gridArea="transferor" minW={0}>
                      <TransferorCard
                        transferor={selected.transferor}
                        lpaNo={selected.lpaNo}
                        personId={selected.personId}
                      />
                    </Box>
                    <Box gridArea="transferee" minW={0}>
                      <TransfereeCard
                        transferee={selected.transferee}
                        lpaNo={selected.lpaNo}
                        personId={selected.personId}
                      />
                    </Box>
                    <Box gridArea="transferorId" minW={0}>
                      <TransferValidIdCard
                        title="Transferor Valid ID"
                        party={selected.transferor}
                        documents={selected.transferorSubmittedIds}
                        verified={isIdVerified(selected, "transferor")}
                        onVerifiedChange={(verified) =>
                          setIdVerified(selected, "transferor", verified)
                        }
                      />
                    </Box>
                    <Box gridArea="transfereeId" minW={0}>
                      <TransferValidIdCard
                        title="Transferee Valid ID"
                        party={selected.transferee}
                        documents={selected.transfereeSubmittedIds}
                        verified={isIdVerified(selected, "transferee")}
                        onVerifiedChange={(verified) =>
                          setIdVerified(selected, "transferee", verified)
                        }
                      />
                    </Box>
                  </Grid>

                  {/* Keyed by record so the notes list opens on page one. */}
                  <RopRemarksCard
                    key={selected.id}
                    lpaNo={selected.lpaNo}
                    planholderName={selected.planholderName}
                    remarks={selected.planholderRemarks}
                    notes={selected.planholderNotes}
                  />
                  {/* Bottom right under the remarks, as on Reinstatement.
                      Nothing is persisted yet — there is no endpoint. */}
                  <Flex justify="flex-end">
                    <PrimaryMdButton
                      onClick={() =>
                        toast.success(`${selected.lpaNo} changes saved`)
                      }
                    >
                      <Save size={16} />
                      Save Changes
                    </PrimaryMdButton>
                  </Flex>
                </Flex>

                {/* THE DOCUMENT VIEWER, pinned while the parties scroll past
                    it — the form is read against them. Below THREE_UP it
                    follows the parties, full width, and does not pin. */}
                <Box
                  minW={0}
                  css={{ [THREE_UP]: { position: "sticky", top: "16px" } }}
                >
                  <TransferDocumentViewerCard
                    documents={selected.documents}
                    isVerified={isDocumentVerified}
                    onVerifiedChange={setDocumentVerified}
                    lpaNo={selected.lpaNo}
                  />
                </Box>
              </Grid>
            ) : (
              <Text fontSize="sm" color="gray.400" py={4}>
                Select a transfer request from the list.
              </Text>
            )}
          </Box>
        </CollapsibleListLayout>
      </Page.MainContent>
    </Page.Root>
  );
}
