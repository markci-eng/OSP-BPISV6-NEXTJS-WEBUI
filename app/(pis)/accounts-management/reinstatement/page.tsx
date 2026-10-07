"use client";

// Reinstatement — a master/detail screen laid out like Return of Premium: the
// list on the left, the selected request on the right.

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  Page,
  PrimaryMdButton,
  ProfileHeaderCardSkeleton,
  SecondarySmFlexButton,
} from "osp-ui-kit";
import {
  FileClock,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Save,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { SURFACE_RADIUS } from "../../claims/components/section-card";
import { RopPlanholderCard } from "../return-of-premium/components/rop-planholder-card";
import { RopRemarksCard } from "../return-of-premium/components/rop-remarks-card";
import { ReinstatementListCard } from "./components/reinstatement-list-card";
import { CollapsibleListLayout } from "../components/collapsible-list-layout";
import { StatementOfAccountDialog } from "../components/statement-of-account-dialog";
import { buildStatementOfAccount } from "../data/statement-of-account";
import {
  InfoRow,
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../components/section-card";
import {
  ReinstatementDetailsSection,
  ReinstatementInfoSection,
  ReinstatementTotalPayable,
} from "./components/reinstatement-detail-cards";
import { ReinstatementPaymentsCard } from "./components/reinstatement-payments-card";
import { RemarksHistoryDialog } from "./components/remarks-history-dialog";
import { SubmittedDocumentsCard } from "./components/submitted-documents-card";
import {
  fetchReinstatementRecords,
  REINSTATEMENT_STATUS_BADGE,
  REINSTATEMENT_STATUS_OPTIONS,
} from "./data/data";
import type { ReinstatementRecord, ReinstatementStatus } from "./data/types";

// The planholder card runs the full width of the panel: its facts are laid out
// in one horizontal row, which a 30% column cannot hold.
const COLUMN_WIDTH = "100%";
const COLUMN_MIN_WIDTH = 0;

type HeaderActionKey = "remarks" | "changes" | "soa";

type HeaderAction = {
  key: HeaderActionKey;
  label: string;
  icon: LucideIcon;
  color: string;
};

// Beside the page title. Remarks History and Statement of Account open their
// dialogs; Changes History has no destination yet, so it reports back instead.
const HEADER_ACTIONS: HeaderAction[] = [
  { key: "remarks", label: "Remarks History", icon: MessageSquare, color: "blue.600" },
  { key: "changes", label: "Changes History", icon: FileClock, color: "purple.600" },
  { key: "soa", label: "Statement of Account", icon: FileSpreadsheet, color: "green.600" },
];

export default function ReinstatementPage() {
  const [records, setRecords] = useState<ReinstatementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReinstatementStatus>(
    REINSTATEMENT_STATUS_OPTIONS[0],
  );
  // Read by the fetch below without making the status a dependency of it —
  // changing the view filters the records on hand, it does not refetch them.
  const statusRef = useRef(status);
  const [remarksHistoryOpen, setRemarksHistoryOpen] = useState(false);
  const [soaOpen, setSoaOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchReinstatementRecords().then((rows) => {
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
  const changeStatus = (next: ReinstatementStatus) => {
    statusRef.current = next;
    setStatus(next);
    setSelectedId(records.find((record) => record.status === next)?.id);
  };

  const selected = useMemo(
    () => inStatus.find((record) => record.id === selectedId),
    [inStatus, selectedId],
  );

  // The record's plan and its own payments ledger, over the sample plan.
  const soa = useMemo(() => {
    if (!selected) return undefined;
    const { plan, account } = selected;
    return buildStatementOfAccount({
      contractNo: selected.lpaNo,
      name: selected.planholderName.toUpperCase(),
      birthDate: selected.birthdate,
      branch: plan.originatingBranch,
      planType: plan.planDescription.toUpperCase(),
      contractPrice: plan.contractPrice,
      instAmount: plan.amount,
      insurability: selected.insurability.toUpperCase(),
      newEffectivity: plan.newEffectivityDate,
      dueDate: plan.dueDate,
      accountStatus: account.accountStatus.toUpperCase(),
      terminationStatus: account.terminationStatus.toUpperCase(),
      cofpNo: account.cofpNo ?? "",
      balance: plan.balance,
      payments: selected.payments.map((payment) => ({
        payClass: payment.payClass,
        planCode: payment.planCode,
        orNo: payment.siNo,
        branch: selected.branch,
        orDate: payment.siDate,
        amount: payment.siAmount,
      })),
    });
  }, [selected]);

  return (
    <Page.Root
      title="Re-Instatement"
      headerButton="menu"
      px={{ base: 0, lg: "10px" }}
    >
      <Page.ToolContent>
        {/* Flex buttons fill their cell, so the three share one width. */}
        <Grid
          templateColumns="repeat(3, minmax(0, 1fr))"
          gap={2}
          w={{ base: "full", md: "600px" }}
        >
          {HEADER_ACTIONS.map(({ key, label, icon: Icon, color }) => (
            <SecondarySmFlexButton
              key={key}
              disabled={!selected}
              onClick={() =>
                key === "remarks"
                  ? setRemarksHistoryOpen(true)
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
            <ReinstatementListCard
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
          {/* Details panel — the planholder card, then Plan Details (40%)
              beside Submitted Documents (60%), then payments and remarks. */}
          <Flex direction="column" minW={0}>
            <Box w={COLUMN_WIDTH} minW={COLUMN_MIN_WIDTH}>
              {loading ? (
                <ProfileHeaderCardSkeleton />
              ) : selected ? (
                <Flex direction="column" gap="10px">
                  {/* Planholder info — its own card, above Plan Details. */}
                  <RopPlanholderCard
                    name={selected.planholderName}
                    lpaNo={selected.lpaNo}
                    personId={selected.personId}
                    birthdate={selected.birthdate}
                    insurability={selected.insurability}
                    orientation="horizontal"
                    status={{
                      label: selected.status,
                      type: REINSTATEMENT_STATUS_BADGE[selected.status],
                    }}
                  />

                  {/* Plan Details at 40%, Submitted Documents in the other
                      60% (user, 2026-10-02); stacked below lg. Stretched so
                      the documents card fills to Plan Details' height. */}
                  <Grid
                    templateColumns={{
                      base: "minmax(0, 1fr)",
                      lg: "minmax(0, 40fr) minmax(0, 60fr)",
                    }}
                    gap="10px"
                    alignItems="stretch"
                  >
                    <SectionCard
                      icon={<FileText size={14} />}
                      title="Plan Details"
                      borderColor={KIT_BORDER}
                      boxShadow={KIT_SHADOW}
                    >
                      {/* One compact column: plan info, account details, then
                        the two branches together. */}
                      <Flex direction="column" minW={0}>
                        <ReinstatementInfoSection plan={selected.plan} />
                        <ReinstatementDetailsSection
                          account={selected.account}
                        />
                        <InfoRow
                          label="Originating Branch"
                          value={selected.plan.originatingBranch}
                        />
                        <InfoRow
                          label="Requesting Branch"
                          value={selected.account.requestingBranch}
                        />
                      </Flex>

                      <ReinstatementTotalPayable
                        amount={selected.plan.totalAmountPayable}
                      />
                    </SectionCard>

                    <Box minW={0}>
                      <SubmittedDocumentsCard
                        documents={selected.submittedDocuments}
                      />
                    </Box>
                  </Grid>

                  <ReinstatementPaymentsCard payments={selected.payments} />

                  {/* Keyed by record so the notes list opens on page one. */}
                  <RopRemarksCard
                    key={selected.id}
                    lpaNo={selected.lpaNo}
                    planholderName={selected.planholderName}
                    remarks={selected.planholderRemarks}
                    notes={selected.planholderNotes}
                  />

                  {/* Bottom right under the remarks, as on ROP. Nothing is
                      persisted yet — there is no endpoint. */}
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
              ) : (
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
                    No reinstatement selected
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Pick a record from the list to see its information.
                  </Text>
                </Flex>
              )}
            </Box>
          </Flex>
        </CollapsibleListLayout>
      </Page.MainContent>
    </Page.Root>
  );
}
