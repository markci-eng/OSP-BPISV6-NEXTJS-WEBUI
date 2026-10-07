"use client";

// Transfer — a master/detail screen laid out like Return of Premium: the list
// rail on the left (with the floating hide/show toggle), the selected request
// on the right.

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
import { TransferListCard } from "./components/transfer-list-card";
import { TransfereeCard } from "./components/transferee-card";
import { TransferorCard } from "./components/transferor-card";
import { fetchTransferRecords, TRANSFER_STATUS_OPTIONS } from "./data/data";
import type { TransferRecord, TransferStatus } from "./data/types";

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
      title="Transfer"
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
        <CollapsibleListLayout
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
          <Flex direction="column" gap={4} minW={0}>
            {loading ? (
              <Text fontSize="sm" color="gray.400" py={4}>
                Loading…
              </Text>
            ) : selected ? (
              // One card per party, the transferor first: who is giving the
              // plan up, then who is taking it on.
              <>
                <TransferorCard
                  transferor={selected.transferor}
                  lpaNo={selected.lpaNo}
                  personId={selected.personId}
                  documents={selected.transferorSubmittedIds}
                />
                <TransfereeCard
                  transferee={selected.transferee}
                  lpaNo={selected.lpaNo}
                  personId={selected.personId}
                  documents={selected.transfereeSubmittedIds}
                />
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
              </>
            ) : (
              <Text fontSize="sm" color="gray.400" py={4}>
                Select a transfer request from the list.
              </Text>
            )}
          </Flex>
        </CollapsibleListLayout>
      </Page.MainContent>
    </Page.Root>
  );
}
