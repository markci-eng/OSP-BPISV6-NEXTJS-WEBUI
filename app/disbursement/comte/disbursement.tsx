"use client";

import {
  Box,
  Flex,
  Grid,
  HStack,
  Progress,
  Separator,
  Text,
} from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { LuChevronRight, LuSlidersHorizontal } from "react-icons/lu";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Body, PrimaryMdFlexButton } from "st-peter-ui";

import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { OSPBadge } from "@/components/common/badge/badge";
import { employeeLookup } from "@/components/common/employee-lookup/data/employee-lookup";
import type { EmployeeLookupType } from "@/components/common/employee-lookup/employee-lookup.type";
import {
  LookupField,
  type LookupColumn,
} from "@/components/common/reusable-lookup/LookUpField";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import type { RowAction } from "@/components/common/reusable-tableV2/types";
import InfoItem from "@/components/common/info-item/info-item";
import Page from "@/claude components/layout/page/Page";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";

import { DepositHdr } from "@/app/payment/data/payment.types";
import { drsItems, tableItems } from "@/app/payment/data/paymentDetails";

/* ------------------------------------------------------------------ */
/* Local view-model                                                     */
/* ------------------------------------------------------------------ */
type DisbursementType = "COM" | "TE";

type EligibleRecord = (typeof tableItems)[number];

type DisbursementItem = EligibleRecord & {
  _key: string;
  type: DisbursementType;
  release: number;
};

const TYPE_OPTIONS: { value: DisbursementType; label: string; hint: string }[] =
  [
    { value: "COM", label: "Commission", hint: "Agent commission release" },
    {
      value: "TE",
      label: "Transportation Exp.",
      hint: "Reimbursable TE claims",
    },
  ];

const EMPLOYEE_COLUMNS: LookupColumn<EmployeeLookupType>[] = [
  { key: "salesForceID", header: "Sales Force ID", enableSorting: true },
  { key: "lastName", header: "Last Name" },
  { key: "firstName", header: "First Name" },
  { key: "middleName", header: "Middle Name" },
  { key: "positionCode", header: "Position", enableColumnFilter: true },
  { key: "branch", header: "Branch", enableColumnFilter: true },
];

const EMPLOYEE_SEARCH_KEYS: (keyof EmployeeLookupType)[] = [
  "salesForceID",
  "lastName",
  "firstName",
  "middleName",
  "branch",
];

const employeeDisplay = (e: EmployeeLookupType) =>
  `${e.lastName}, ${e.firstName} ${e.middleName} · ${e.salesForceID}`;

const DRS_COLUMNS: LookupColumn<DepositHdr>[] = [
  { key: "name", header: "Reference No" },
  {
    key: "Amount",
    header: "Available Balance",
    render: (_v, row) => peso(parsePeso(row.Amount)),
  },
  { key: "BankBranch", header: "Bank Branch", enableColumnFilter: true },
  { key: "AccountNo", header: "Account No" },
];

const DRS_SEARCH_KEYS: (keyof DepositHdr)[] = [
  "name",
  "AccountNo",
  "BankBranch",
];

const drsDisplay = (d: DepositHdr) =>
  `${d.name} · ${peso(parsePeso(d.Amount))}`;

const peso = (n: number) =>
  "₱" +
  n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const parsePeso = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

const eligibleRowId = (row: EligibleRecord) => `${row.LPANo}-${row.SI}`;

const ELIGIBLE_COLUMNS: ColumnDef<EligibleRecord, any>[] = [
  { accessorKey: "LPANo", header: "LPA#" },
  { accessorKey: "name", header: "Full Name" },
  { accessorKey: "SI", header: "Sales Invoice" },
  {
    accessorKey: "SIAmount",
    header: "Amount",
    cell: ({ row }) => peso(parsePeso(row.original.SIAmount)),
  },
];

export default function Disbursement() {
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeLookupType | null>(null);
  const [selectedDrs, setSelectedDrs] = useState<DepositHdr | null>(null);
  const [selectedType, setSelectedType] = useState<DisbursementType | "">("");

  const [addedItems, setAddedItems] = useState<DisbursementItem[]>([]);
  const [selectedEligible, setSelectedEligible] = useState<EligibleRecord[]>(
    [],
  );
  const [eligibleKey, setEligibleKey] = useState(0);
  const [setupOpen, setSetupOpen] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("selectedDRS");
    if (data) {
      const parsed: DepositHdr = JSON.parse(data);
      setSelectedDrs(parsed);
      sessionStorage.removeItem("selectedDRS");
    }
  }, []);

  const ready = Boolean(selectedDrs && selectedType);

  // Auto-collapse setup when all fields are filled
  useEffect(() => {
    if (ready) setSetupOpen(false);
  }, [ready]);

  const eligibleRecords = useMemo(() => {
    if (!ready) return [];
    const taken = new Set(addedItems.map((i) => eligibleRowId(i)));
    return tableItems.filter((r) => !taken.has(eligibleRowId(r)));
  }, [ready, addedItems]);

  /* ----------------------------- actions ----------------------------- */
  const resetWorkflow = () => {
    setAddedItems([]);
    setEligibleKey((k) => k + 1);
  };

  const changeType = (type: DisbursementType) => {
    setSelectedType(type);
    setEligibleKey((k) => k + 1);
  };

  const handleAddToList = (rows: EligibleRecord[]) => {
    if (!selectedType) return;
    setAddedItems((prev) => {
      const existing = new Set(prev.map((i) => eligibleRowId(i)));
      const next = rows
        .filter((r) => !existing.has(eligibleRowId(r)))
        .map<DisbursementItem>((r) => ({
          ...r,
          _key: eligibleRowId(r),
          type: selectedType,
          release: parsePeso(r.SIAmount),
        }));
      return [...prev, ...next];
    });
    setEligibleKey((k) => k + 1);
  };

  const removeItem = (item: DisbursementItem) =>
    setAddedItems((prev) => prev.filter((i) => i._key !== item._key));

  const handleAddSelected = () => {
    if (!ready || selectedEligible.length === 0) return;
    handleAddToList(selectedEligible);
    setSelectedEligible([]);
  };

  /* ----------------------------- totals ------------------------------ */
  const totals = useMemo(() => {
    const com = addedItems
      .filter((i) => i.type === "COM")
      .reduce((s, i) => s + i.release, 0);
    const te = addedItems
      .filter((i) => i.type === "TE")
      .reduce((s, i) => s + i.release, 0);
    const balance = selectedDrs ? parsePeso(selectedDrs.Amount) : 0;
    const disburse = com + te;
    return { com, te, balance, disburse, remaining: balance - disburse };
  }, [addedItems, selectedDrs]);

  const over = totals.remaining < 0;
  const canSave = addedItems.length > 0 && !over;
  const allocatedPct =
    totals.balance > 0
      ? Math.min(100, Math.round((totals.disburse / totals.balance) * 100))
      : 0;

  const handleSave = () => {
    if (!canSave) {
      toast.error(
        over
          ? "Selected amount exceeds the available balance."
          : "Add at least one record to release.",
      );
      return;
    }
    toast.success(
      `${addedItems.length} record${addedItems.length > 1 ? "s" : ""} released · ${peso(totals.disburse)} disbursed from ${selectedDrs?.name}`,
    );
    resetWorkflow();
    setSelectedType("");
  };

  /* --------------------------- table config -------------------------- */
  const listColumns = useMemo<ColumnDef<DisbursementItem, any>[]>(
    () => [
      { accessorKey: "LPANo", header: "LPA#" },
      { accessorKey: "name", header: "Full Name" },
      { accessorKey: "SI", header: "Reference" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <OSPBadge type={row.original.type === "COM" ? "success" : "info"}>
            {row.original.type === "COM" ? "Commission" : "TE"}
          </OSPBadge>
        ),
      },
      {
        accessorKey: "release",
        header: "Release Amount",
        cell: ({ row }) => peso(row.original.release),
      },
    ],
    [],
  );

  const listRowActions: RowAction<DisbursementItem>[] = [
    {
      id: "remove",
      label: "Remove",
      icon: Trash2,
      variant: "destructive",
      onClick: removeItem,
    },
  ];

  /* ------------------------------- view ------------------------------ */
  return (
    <Page.Root
      title="Disbursement"
      description="Manage Commission and Transportation Expense releases"
      headerButton="menu"
    >
      <Page.MainContent
        flex="1"
        minH="calc(100% - var(--sticky-header-h, 0px))"
      >
        {/* SETUP — employee → remittance slip → disbursement type */}
        <Page.Row>
          <InfoCardAccordion
            icon={<LuSlidersHorizontal size={18} />}
            title="Disbursement Setup"
            subtitle="Select employee, remittance slip, and disbursement type"
            isOpen={setupOpen}
            onToggle={() => setSetupOpen((v) => !v)}
          >
            <Flex
              align={{ base: "stretch", xl: "flex-end" }}
              gap={{ base: 4, xl: 5 }}
              direction={{ base: "column", xl: "row" }}
            >
              {/* Employee */}
              <Box flex="1" minW={0}>
                <LookupField<EmployeeLookupType>
                  label="Employee"
                  modalTitle="Search Employee"
                  placeholder="Search Sales Force ID or employee name…"
                  columns={EMPLOYEE_COLUMNS}
                  dataSource={employeeLookup}
                  searchKeys={EMPLOYEE_SEARCH_KEYS}
                  renderDisplay={employeeDisplay}
                  value={selectedEmployee}
                  onSelect={(emp) => {
                    setSelectedEmployee(emp);
                    resetWorkflow();
                  }}
                />
              </Box>

              <CommandSep />

              {/* Remittance slip */}
              <Box flex="1" minW={0}>
                <LookupField<DepositHdr>
                  label="Remittance Slip"
                  modalTitle="Search Remittance Slip"
                  placeholder="Search reference no, account, or branch…"
                  columns={DRS_COLUMNS}
                  dataSource={drsItems}
                  searchKeys={DRS_SEARCH_KEYS}
                  renderDisplay={drsDisplay}
                  value={selectedDrs}
                  onSelect={(drs) => {
                    setSelectedDrs(drs);
                    resetWorkflow();
                  }}
                />
              </Box>

              <CommandSep />

              {/* Disbursement type */}
              <Box flex="1.4" minW={0}>
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  gap={3}
                  align="stretch"
                >
                  {TYPE_OPTIONS.map((opt) => {
                    const active = selectedType === opt.value;
                    const disabled = !selectedDrs;
                    return (
                      <Box
                        as="button"
                        key={opt.value}
                        flex="1"
                        minW={0}
                        textAlign="left"
                        p={3}
                        borderWidth="1.5px"
                        borderRadius="lg"
                        bg={active ? "green.50" : "white"}
                        borderColor={
                          active ? "var(--chakra-colors-primary)" : "gray.200"
                        }
                        boxShadow={
                          active
                            ? "0 0 0 3px var(--chakra-colors-primary-disabled)"
                            : "xs"
                        }
                        cursor={disabled ? "not-allowed" : "pointer"}
                        opacity={disabled ? 0.5 : 1}
                        pointerEvents={disabled ? "none" : undefined}
                        transition="all 0.14s"
                        _hover={
                          disabled || active
                            ? undefined
                            : { borderColor: "green.300", bg: "green.50" }
                        }
                        aria-disabled={disabled}
                        aria-pressed={active}
                        onClick={() => !disabled && changeType(opt.value)}
                      >
                        <Flex
                          align="center"
                          justify="space-between"
                          gap={2}
                          mb={0.5}
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                              active
                                ? "var(--chakra-colors-primary)"
                                : "gray.700"
                            }
                            lineClamp={1}
                          >
                            {opt.label}
                          </Text>
                          <OSPBadge type={active ? "success" : undefined}>
                            {selectedDrs ? tableItems.length : 0}
                          </OSPBadge>
                        </Flex>
                        <Text fontSize="xs" color="gray.500" lineClamp={1}>
                          {opt.hint}
                        </Text>
                      </Box>
                    );
                  })}
                </Flex>
              </Box>
            </Flex>
          </InfoCardAccordion>
        </Page.Row>

        {/* WORKFLOW */}
        {!selectedDrs ? (
          <Page.Row>
            <EmptyStateCard
              title="No Remittance Slip Selected"
              description="Choose an employee and remittance slip above to begin."
            />
          </Page.Row>
        ) : (
          <Flex direction="column" flex="1" minH={0} gap={5}>
            {/* SIDE-BY-SIDE TABLES */}
            <Grid
              templateColumns={{
                base: "minmax(0, 1fr)",
                xl: "repeat(2, minmax(0, 1fr))",
              }}
              gap={5}
              flex="1"
              minH={0}
              alignItems="stretch"
            >
              {/* Subject for Release */}
              <Box
                minW={0}
                w="full"
                h="full"
                minH={0}
                display="flex"
                flexDirection="column"
                css={{
                  "& > div": {
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  },
                }}
              >
                <DataTable<EligibleRecord>
                  key={`eligible-${selectedDrs?.id}-${selectedType}-${eligibleKey}`}
                  title="Subject for Release"
                  data={ready ? eligibleRecords : []}
                  columns={ELIGIBLE_COLUMNS}
                  getRowId={(row) => eligibleRowId(row)}
                  onSelectionChange={setSelectedEligible}
                  headerActions={
                    <HStack
                      gap={2}
                      justify="flex-end"
                      w={{ base: "full", md: "max-content" }}
                      ml="auto"
                    >
                      <PrimaryMdFlexButton
                        h="36px"
                        flexShrink={0}
                        whiteSpace="nowrap"
                        onClick={handleAddSelected}
                        disabled={!ready || selectedEligible.length === 0}
                      >
                        Add to List
                      </PrimaryMdFlexButton>
                    </HStack>
                  }
                  features={{
                    search: true,
                    sorting: true,
                    selection: true,
                    columnToggle: true,
                    filtering: false,
                    draggable: false,
                    detailSidebar: false,
                  }}
                  emptyState={
                    <EmptyStateCard
                      title={
                        selectedType
                          ? "No eligible records"
                          : "Choose a disbursement type"
                      }
                      description={
                        selectedType
                          ? "Everything available for this type is already on your list."
                          : "Pick Commission or Transportation Expense to load eligible records."
                      }
                      border="none"
                    />
                  }
                />
              </Box>

              {/* Disbursement List */}
              <Box
                minW={0}
                w="full"
                h="full"
                minH={0}
                display="flex"
                flexDirection="column"
                css={{
                  "& > div": {
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  },
                }}
              >
                <DataTable<DisbursementItem>
                  title="Disbursement List"
                  data={addedItems}
                  columns={listColumns}
                  getRowId={(row) => row._key}
                  rowActions={listRowActions}
                  features={{
                    search: true,
                    sorting: true,
                    selection: false,
                    columnToggle: false,
                    filtering: false,
                    draggable: false,
                    detailSidebar: false,
                  }}
                  mobileConfig={{
                    viewMode: "card",
                    primaryField: "name",
                    secondaryField: "LPANo",
                    badgeField: "release",
                    visibleFields: ["SI", "type"],
                    labelMap: { SI: "Reference", type: "Type" },
                    valueFormatter: {
                      release: (v) => peso(Number(v)),
                      type: (v) => (v === "COM" ? "Commission" : "TE"),
                    },
                  }}
                  emptyState={
                    <EmptyStateCard
                      title="No records added yet"
                      description={`Select eligible records above and choose "Add to List".`}
                      border="none"
                    />
                  }
                />
              </Box>
            </Grid>

            {/* STICKY FOOTER SUMMARY BAR */}
            <Box
              position="sticky"
              bottom={{ base: "-20px", lg: "-56px" }}
              zIndex={2}
              flexShrink={0}
              mt="auto"
              mx={{ base: "-16px", lg: "-44px" }}
              px={{ base: "16px", lg: "44px" }}
              pt={2}
              pb={{ base: "20px", lg: "56px" }}
              bg="#fafafaff"
            >
              <Card.Root>
                <Card.MainContent>
                  <Flex
                    align={{ base: "stretch", lg: "center" }}
                    direction={{ base: "column", lg: "row" }}
                    gap={{ base: 4, lg: 6 }}
                  >
                    {/* Stats */}
                    <HStack gap={{ base: 4, md: 6 }} flexWrap="wrap">
                      <InfoItem label="Balance" value={peso(totals.balance)} />
                      <Stat
                        label="Total Com"
                        value={peso(totals.com)}
                        dot="green.500"
                      />
                      <Stat
                        label="Total TE"
                        value={peso(totals.te)}
                        dot="blue.500"
                      />
                      <Separator
                        orientation="vertical"
                        height="8"
                        hideBelow="md"
                      />
                      <InfoItem
                        label="To Disburse"
                        value={peso(totals.disburse)}
                        color="green.600"
                      />
                      <InfoItem
                        label="Remaining"
                        value={peso(totals.remaining)}
                        color={over ? "red.600" : "green.600"}
                      />
                    </HStack>

                    {/* Allocation progress */}
                    <Box
                      flex="1"
                      minW={{ base: "full", lg: "160px" }}
                      maxW={{ lg: "320px" }}
                    >
                      <Progress.Root
                        value={allocatedPct}
                        size="sm"
                        colorPalette={
                          over ? "red" : allocatedPct >= 90 ? "orange" : "green"
                        }
                      >
                        <Progress.Track borderRadius="full">
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                      <Flex justify="space-between" mt={1}>
                        <Body fontSize="xs" color="gray.500">
                          {allocatedPct}% of balance allocated
                        </Body>
                        <Body
                          fontSize="xs"
                          color={over ? "red.500" : "gray.500"}
                        >
                          {over
                            ? `Over by ${peso(Math.abs(totals.remaining))}`
                            : `${peso(totals.remaining)} left`}
                        </Body>
                      </Flex>
                    </Box>

                    {/* Action */}
                    <HStack
                      ml={{ lg: "auto" }}
                      justify={{ base: "space-between", lg: "flex-end" }}
                      gap={3}
                      w={{ base: "full", lg: "auto" }}
                    >
                      {over && (
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="red.500"
                          whiteSpace="nowrap"
                        >
                          Over balance
                        </Text>
                      )}
                      <Box w={{ base: "full", lg: "auto" }} minW={{ lg: "44" }}>
                        <PrimaryMdFlexButton
                          onClick={handleSave}
                          disabled={!canSave}
                        >
                          Save &amp; Release
                        </PrimaryMdFlexButton>
                      </Box>
                    </HStack>
                  </Flex>
                </Card.MainContent>
              </Card.Root>
            </Box>
          </Flex>
        )}
      </Page.MainContent>
    </Page.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                               */
/* ------------------------------------------------------------------ */

function CommandSep() {
  return (
    <Box color="gray.300" alignSelf="center" hideBelow="xl">
      <LuChevronRight size={18} />
    </Box>
  );
}

function Stat({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot: string;
}) {
  return (
    <HStack gap={2} align="start">
      <Box w="8px" h="8px" mt="6px" borderRadius="sm" bg={dot} flexShrink={0} />
      <InfoItem label={label} value={value} />
    </HStack>
  );
}
