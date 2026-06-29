"use client";

import {
  Box,
  Flex,
  Grid,
  HStack,
  IconButton,
  Input,
  Progress,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LuArrowLeftRight,
  LuCheck,
  LuChevronRight,
  LuClipboardList,
  LuFileText,
  LuFilter,
  LuPlus,
  LuSearch,
  LuSlidersHorizontal,
  LuTriangleAlert,
  LuUser,
  LuWallet,
  LuX,
} from "react-icons/lu";
import { CheckCircle2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Body, PrimaryMdFlexButton } from "st-peter-ui";
import FormSteps from "@/claude components/FormSteps";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

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

import { DepositHdr } from "@/app/(bpis)/payment/data/payment.types";
import { drsItems, tableItems } from "@/app/(bpis)/payment/data/paymentDetails";

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

/* ------------------------------------------------------------------ */
/* Utilities                                                            */
/* ------------------------------------------------------------------ */
function readCookieVal(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop()!.split(";").shift() ?? "");
  return null;
}

/* ------------------------------------------------------------------ */
/* Mobile search input                                                  */
/* ------------------------------------------------------------------ */
function MobileSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <HStack gap={0} w="full">
      <Box
        flex={1}
        border="1.5px solid"
        borderColor="gray.200"
        borderRightWidth="0"
        borderLeftRadius="lg"
        bg="white"
        boxShadow="xs"
        overflow="hidden"
        transition="border-color 0.15s, box-shadow 0.15s"
        _hover={{ borderColor: "gray.300" }}
        _focusWithin={{
          borderColor: "var(--chakra-colors-primary)",
          boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
        }}
        minH="10"
        display="flex"
        alignItems="center"
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          border="none"
          bg="transparent"
          boxShadow="none"
          borderRadius="0"
          px={3}
          fontSize="sm"
          color="gray.700"
          _placeholder={{ color: "gray.400" }}
          _focus={{ boxShadow: "none", outline: "none" }}
        />
        {value && (
          <Flex align="center" pr={2} flexShrink={0}>
            <IconButton
              aria-label="Clear search"
              variant="ghost"
              size="xs"
              borderRadius="full"
              color="gray.400"
              _hover={{ bg: "gray.100", color: "gray.600" }}
              onClick={() => onChange("")}
            >
              <LuX size={12} />
            </IconButton>
          </Flex>
        )}
      </Box>

      <IconButton
        aria-label="Search"
        bg="var(--chakra-colors-primary)"
        color="white"
        borderLeftRadius="0"
        borderRightRadius="lg"
        h="10"
        minW="10"
        flexShrink={0}
        _hover={{ opacity: 0.88 }}
        _active={{ opacity: 0.75 }}
      >
        <Search size={15} />
      </IconButton>
    </HStack>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile checkbox                                                       */
/* ------------------------------------------------------------------ */
function MobileCheckbox({
  checked,
  indeterminate,
  size = 20,
}: {
  checked: boolean;
  indeterminate?: boolean;
  size?: number;
}) {
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="md"
      border="1.5px solid"
      borderColor={
        checked || indeterminate ? "var(--chakra-colors-primary)" : "gray.300"
      }
      bg={checked || indeterminate ? "var(--chakra-colors-primary)" : "white"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      transition="all .13s"
    >
      {checked && (
        <Box
          as={LuCheck}
          w={`${size * 0.6}px`}
          h={`${size * 0.6}px`}
          color="white"
        />
      )}
      {!checked && indeterminate && (
        <Box w="8px" h="2px" bg="white" borderRadius="full" />
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile radio indicator                                               */
/* ------------------------------------------------------------------ */
function MobileRadio({
  checked,
  size = 20,
}: {
  checked: boolean;
  size?: number;
}) {
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      border="2px solid"
      borderColor={checked ? "var(--chakra-colors-primary)" : "gray.300"}
      bg="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      transition="all .13s"
    >
      {checked && (
        <Box
          w={`${size * 0.5}px`}
          h={`${size * 0.5}px`}
          borderRadius="full"
          bg="var(--chakra-colors-primary)"
        />
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* DRS tag badge                                                         */
/* ------------------------------------------------------------------ */
function DrsBadge() {
  return (
    <Box
      px={1.5}
      py="1px"
      bg="var(--chakra-colors-primary)"
      color="white"
      fontSize="9px"
      fontWeight={700}
      letterSpacing=".08em"
      borderRadius="sm"
      lineHeight="1.6"
      w="fit-content"
    >
      DRS
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                        */
/* ------------------------------------------------------------------ */
export default function Disbursement() {
  /* ---- shared state ---- */
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

  /* ---- mobile state ---- */
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileStep, setMobileStep] = useState(0);
  const [mobileQuery, setMobileQuery] = useState("");
  const [mobileEmpPage, setMobileEmpPage] = useState(1);
  const empListContainerRef = useRef<HTMLDivElement>(null);
  const empListSentinelRef = useRef<HTMLDivElement>(null);
  const [mobileDrsPage, setMobileDrsPage] = useState(1);
  const drsListContainerRef = useRef<HTMLDivElement>(null);
  const drsListSentinelRef = useRef<HTMLDivElement>(null);
  const [mobileChecked, setMobileChecked] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState<{
    count: number;
    amount: number;
    drsName: string;
  } | null>(null);

  const { messageBox } = useMessageDialog();

  useEffect(() => {
    setUserRole(readCookieVal("osp_user"));
    const data = sessionStorage.getItem("selectedDRS");
    if (data) {
      const parsed: DepositHdr = JSON.parse(data);
      setSelectedDrs(parsed);
      sessionStorage.removeItem("selectedDRS");
    }
  }, []);

  const isSalesAgent = userRole === "sales-agent";

  /* ---- step index helpers ---- */
  const drsStepIdx = isSalesAgent ? 0 : 1;
  const recordsStepIdx = isSalesAgent ? 1 : 2;
  const reviewStepIdx = isSalesAgent ? 2 : 3;

  const ready = Boolean(selectedDrs && selectedType);

  useEffect(() => {
    if (ready) setSetupOpen(false);
  }, [ready]);

  const eligibleRecords = useMemo(() => {
    if (!ready) return [];
    const taken = new Set(
      addedItems
        .filter((i) => i.type === selectedType)
        .map((i) => eligibleRowId(i)),
    );
    return tableItems.filter((r) => !taken.has(eligibleRowId(r)));
  }, [ready, addedItems, selectedType]);

  /* ---- mobile employee / DRS filter ---- */
  const filteredMobileEmployees = useMemo(() => {
    const q = mobileQuery.toLowerCase().trim();
    if (!q) return employeeLookup;
    return employeeLookup.filter(
      (e) =>
        e.salesForceID.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.firstName.toLowerCase().includes(q),
    );
  }, [mobileQuery]);

  const filteredMobileDrs = useMemo(() => {
    const q = mobileQuery.toLowerCase().trim();
    if (!q) return drsItems;
    return drsItems.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.AccountNo ?? "").toLowerCase().includes(q) ||
        (d.BankBranch ?? "").toLowerCase().includes(q),
    );
  }, [mobileQuery]);

  /* ---- mobile checkbox helpers ---- */
  const mobileEligible = eligibleRecords;
  const mobileAllChecked =
    mobileEligible.length > 0 &&
    mobileEligible.every((r) => mobileChecked.has(eligibleRowId(r)));
  const mobileSomeChecked =
    !mobileAllChecked &&
    mobileEligible.some((r) => mobileChecked.has(eligibleRowId(r)));

  const toggleMobileCheck = (id: string) => {
    setMobileChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMobileAll = () => {
    setMobileChecked(
      mobileAllChecked
        ? new Set()
        : new Set(mobileEligible.map((r) => eligibleRowId(r))),
    );
  };

  const mobileCheckedTotal = mobileEligible
    .filter((r) => mobileChecked.has(eligibleRowId(r)))
    .reduce((s, r) => s + parsePeso(r.SIAmount), 0);

  const handleMobileAdd = () => {
    const toAdd = mobileEligible.filter((r) =>
      mobileChecked.has(eligibleRowId(r)),
    );
    if (toAdd.length === 0) return;
    handleAddToList(toAdd);
    setMobileChecked(new Set());
  };

  /* ---- shared actions ---- */
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
      const existingKeys = new Set(prev.map((i) => i._key));
      const next = rows
        .filter((r) => !existingKeys.has(`${eligibleRowId(r)}-${selectedType}`))
        .map<DisbursementItem>((r) => ({
          ...r,
          _key: `${eligibleRowId(r)}-${selectedType}`,
          type: selectedType,
          release: parsePeso(r.SIAmount),
        }));
      return [...prev, ...next];
    });
    setEligibleKey((k) => k + 1);
  };

  const removeItem = (item: DisbursementItem) =>
    setAddedItems((prev) => prev.filter((i) => i._key !== item._key));

  const updateRelease = (key: string, val: number) => {
    setAddedItems((prev) =>
      prev.map((i) =>
        i._key === key ? { ...i, release: Math.max(0, val) } : i,
      ),
    );
  };

  const handleAddSelected = () => {
    if (!ready || selectedEligible.length === 0) return;
    handleAddToList(selectedEligible);
    setSelectedEligible([]);
  };

  /* ---- totals ---- */
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

  const handleSave = async () => {
    if (!canSave) {
      toast.error(
        over
          ? "Selected amount exceeds the available balance."
          : "Add at least one record to release.",
      );
      return;
    }

    const confirmed = await messageBox({
      title: "Confirm Release",
      message: `Release ${addedItems.length} record${addedItems.length > 1 ? "s" : ""} totalling ${peso(totals.disburse)} from ${selectedDrs?.name}?`,
      confirmText: "Yes, Release",
      cancelText: "Cancel",
      variant: "warning",
      showCancel: true,
    });

    if (!confirmed) return;

    setSubmittedSummary({
      count: addedItems.length,
      amount: totals.disburse,
      drsName: selectedDrs?.name ?? "",
    });
    setAddedItems([]);
    setEligibleKey((k) => k + 1);
    setSelectedType("");
    setMobileChecked(new Set());
    setMobileStep(0);
    setSubmitted(true);
  };

  const handleNewDisbursement = () => {
    setSubmitted(false);
    setSubmittedSummary(null);
    setSelectedEmployee(null);
    setSelectedDrs(null);
    setSelectedType("");
    setAddedItems([]);
    setMobileStep(0);
    setMobileQuery("");
  };

  /* ------------------------------------------------------------------ */
  /* Mobile step content builders                                         */
  /* ------------------------------------------------------------------ */

  /* Step 1 (optional): Employee */
  const visibleEmployees = filteredMobileEmployees.slice(0, mobileEmpPage * 5);
  const hasMoreEmployees =
    filteredMobileEmployees.length > visibleEmployees.length;

  useEffect(() => {
    const sentinel = empListSentinelRef.current;
    const container = empListContainerRef.current;
    if (!sentinel || !hasMoreEmployees) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMobileEmpPage((p) => p + 1);
      },
      { root: container, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreEmployees, mobileEmpPage]);

  const empStepContent = (
    <VStack align="stretch" gap={3} pt={3}>
      <MobileSearchInput
        value={mobileQuery}
        onChange={(v) => {
          setMobileQuery(v);
          setMobileEmpPage(1);
        }}
        placeholder="Search ID or name…"
      />

      <Text
        fontSize="xs"
        fontWeight={700}
        letterSpacing=".06em"
        textTransform="uppercase"
        color="gray.400"
        px={0.5}
      >
        Employees · {filteredMobileEmployees.length}
      </Text>

      <Box ref={empListContainerRef}>
        <VStack gap={2.5} align="stretch" px={"2px"}>
          {visibleEmployees.map((e) => {
            const isSelected =
              selectedEmployee?.salesForceID === e.salesForceID;
            return (
              <Box
                key={e.salesForceID}
                as="button"
                w="full"
                textAlign="left"
                p={3.5}
                bg={isSelected ? "green.50" : "white"}
                borderRadius="2xl"
                border="1.5px solid"
                borderColor={
                  isSelected ? "var(--chakra-colors-primary)" : "gray.200"
                }
                boxShadow={
                  isSelected
                    ? "0 0 0 3px var(--chakra-colors-primary-disabled)"
                    : "0 1px 2px rgba(20,33,48,.05)"
                }
                cursor="pointer"
                transition="all .12s"
                _active={{ transform: "scale(.955)" }}
                onClick={() => {
                  if (!isSelected) {
                    setSelectedEmployee(e);
                    resetWorkflow();
                  }
                  setMobileStep((s) => s + 1);
                  setMobileQuery("");
                }}
              >
                <HStack gap={3} align="center">
                  <Box
                    p={2}
                    borderRadius="full"
                    bg={
                      isSelected ? "var(--chakra-colors-primary)" : "gray.100"
                    }
                    color={isSelected ? "white" : "gray.600"}
                    transition="all .12s"
                  >
                    <LuUser size={18} />
                  </Box>
                  <VStack align="start" gap={0} flex={1} minW={0}>
                    <Text
                      fontSize="15px"
                      fontWeight={600}
                      letterSpacing="-.01em"
                      lineClamp={1}
                      color={isSelected ? "green.800" : "gray.900"}
                    >
                      {e.lastName}, {e.firstName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" lineClamp={1}>
                      {e.salesForceID} · {e.positionCode}
                    </Text>
                    <Text fontSize="xs" color="gray.400" lineClamp={1}>
                      {e.branch}
                    </Text>
                  </VStack>
                  <MobileRadio checked={isSelected} />
                </HStack>
              </Box>
            );
          })}

          {visibleEmployees.length === 0 && (
            <Text textAlign="center" color="gray.400" fontSize="sm" py={6}>
              No employees match &ldquo;{mobileQuery}&rdquo;
            </Text>
          )}

          {/* sentinel — IntersectionObserver loads next page on scroll */}
          <Box ref={empListSentinelRef} h="1px" />
        </VStack>
      </Box>
      <Box h={4} />
    </VStack>
  );

  /* Step 2: DRS */
  const visibleDrs = filteredMobileDrs.slice(0, mobileDrsPage * 5);
  const hasMoreDrs = filteredMobileDrs.length > visibleDrs.length;

  useEffect(() => {
    const sentinel = drsListSentinelRef.current;
    const container = drsListContainerRef.current;
    if (!sentinel || !hasMoreDrs) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMobileDrsPage((p) => p + 1);
      },
      { root: container, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreDrs, mobileDrsPage]);

  const drsStepContent = (
    <VStack align="stretch" gap={3} pt={3}>
      {selectedEmployee && !isSalesAgent && (
        <HStack
          p={3}
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          justify="space-between"
        >
          <HStack gap={2.5} minW={0}>
            <Box p={2} borderRadius="full" bg="gray.100">
              <LuUser size={18} />
            </Box>
            <VStack align="start" gap={0} minW={0}>
              <Text fontWeight={600} fontSize="sm" lineClamp={1}>
                {selectedEmployee.lastName}, {selectedEmployee.firstName}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {selectedEmployee.salesForceID}
              </Text>
            </VStack>
          </HStack>
          <Box
            as="button"
            w="36px"
            h="36px"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
            bg="gray.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            color="gray.500"
            flexShrink={0}
            onClick={() => {
              setMobileStep(0);
              setMobileQuery("");
            }}
            title="Change employee"
          >
            <Box as={LuArrowLeftRight} w={3.5} h={3.5} />
          </Box>
        </HStack>
      )}

      <MobileSearchInput
        value={mobileQuery}
        onChange={(v) => {
          setMobileQuery(v);
          setMobileDrsPage(1);
        }}
        placeholder="Search reference, account, branch…"
      />

      <Text
        fontSize="xs"
        fontWeight={700}
        letterSpacing=".06em"
        textTransform="uppercase"
        color="gray.400"
        px={0.5}
      >
        Select a Remittance Slip
      </Text>

      <Box ref={drsListContainerRef}>
        <VStack gap={2.5} align="stretch" px={"2px"}>
          {visibleDrs.map((d) => {
            const isSelected = selectedDrs?.name === d.name;
            return (
              <Box
                key={d.name}
                as="button"
                w="full"
                textAlign="left"
                p={4}
                bg={isSelected ? "green.50" : "white"}
                borderRadius="2xl"
                border="1.5px solid"
                borderColor={
                  isSelected ? "var(--chakra-colors-primary)" : "gray.200"
                }
                boxShadow={
                  isSelected
                    ? "0 0 0 3px var(--chakra-colors-primary-disabled)"
                    : "0 1px 2px rgba(20,33,48,.05)"
                }
                cursor="pointer"
                transition="all .12s"
                _active={{ transform: "scale(.985)" }}
                onClick={() => {
                  if (!isSelected) {
                    setSelectedDrs(d);
                    resetWorkflow();
                  }
                  setMobileStep((s) => s + 1);
                  setMobileQuery("");
                }}
              >
                <HStack justify="space-between" align="center" gap={3}>
                  <VStack align="start" gap={1} minW={0} flex={1}>
                    <Text
                      fontWeight={600}
                      fontSize="sm"
                      letterSpacing="-.01em"
                      lineClamp={1}
                      color={isSelected ? "green.800" : "gray.900"}
                    >
                      {d.name}
                    </Text>
                  </VStack>
                  <VStack align="end" gap={0.5} flexShrink={0}>
                    <Text
                      fontSize="10px"
                      fontWeight={600}
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing=".04em"
                    >
                      Available balance
                    </Text>
                    <Text
                      fontWeight={700}
                      fontSize="lg"
                      color={isSelected ? "green.700" : "gray.700"}
                      letterSpacing="-.02em"
                    >
                      {peso(parsePeso(d.Amount))}
                    </Text>
                  </VStack>
                  <MobileRadio checked={isSelected} />
                </HStack>
              </Box>
            );
          })}
          {visibleDrs.length === 0 && (
            <Text textAlign="center" color="gray.400" fontSize="sm" py={6}>
              No results match &ldquo;{mobileQuery}&rdquo;
            </Text>
          )}
          {/* sentinel — IntersectionObserver loads next page on scroll */}
          <Box ref={drsListSentinelRef} h="1px" />
        </VStack>
      </Box>
      <Box h={4} />
    </VStack>
  );

  /* Step 3: Records */
  const recordsStepContent = (
    <VStack align="stretch" gap={3} pt={3} pb={2}>
      {/* DRS balance strip */}
      {selectedDrs && (
        <Box
          as="button"
          w="full"
          textAlign="left"
          p={3.5}
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          bg="gray.100"
          cursor="pointer"
          onClick={() => {
            setMobileStep(drsStepIdx);
            setMobileQuery("");
          }}
        >
          <HStack justify="space-between" gap={2}>
            <HStack gap={2} minW={0}>
              {/* <DrsBadge /> */}
              <Text
                fontWeight={600}
                fontSize="sm"
                color="gray.700"
                lineClamp={1}
              >
                {selectedDrs.name}
              </Text>
            </HStack>
            <HStack gap={2} flexShrink={0}>
              <Text
                fontSize="10px"
                fontWeight={600}
                color="primary"
                textTransform="uppercase"
                letterSpacing=".03em"
              >
                Available
              </Text>
              <Text
                fontWeight={700}
                fontSize="lg"
                color="green.900"
                letterSpacing="-.02em"
              >
                {peso(totals.balance)}
              </Text>
              <Box as={LuArrowLeftRight} w={3.5} h={3.5} color="primary" />
            </HStack>
          </HStack>
        </Box>
      )}

      {/* Type segment */}
      <HStack gap={2}>
        {TYPE_OPTIONS.map((opt) => {
          const on = selectedType === opt.value;
          return (
            <Box
              key={opt.value}
              as="button"
              flex={1}
              h="46px"
              borderRadius="xl"
              border="1.5px solid"
              bg={on ? "green.50" : "gray.50"}
              borderColor={on ? "var(--chakra-colors-primary)" : "transparent"}
              color={on ? "green.800" : "gray.500"}
              fontWeight={600}
              fontSize="sm"
              fontFamily="inherit"
              boxShadow={on ? "0 0 0 3px rgba(14,163,114,.15)" : "none"}
              cursor="pointer"
              transition="all .14s"
              onClick={() => {
                changeType(opt.value);
                setMobileChecked(new Set());
              }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              {opt.label}
              <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                minW="22px"
                h="20px"
                px={1.5}
                borderRadius="full"
                bg={on ? "var(--chakra-colors-primary)" : "rgba(0,0,0,.06)"}
                color={on ? "white" : "gray.400"}
                fontSize="xs"
                fontWeight={700}
              >
                {ready ? mobileEligible.length : 0}
              </Box>
            </Box>
          );
        })}
      </HStack>

      {/* Select all bar */}
      {selectedType && mobileEligible.length > 0 && (
        <HStack justify="space-between" px={0.5} mt={1}>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing=".06em"
            textTransform="uppercase"
            color="gray.400"
          >
            Subject for Release · {mobileEligible.length}
          </Text>
          <Box
            as="button"
            display="flex"
            alignItems="center"
            gap={1.5}
            fontSize="xs"
            fontWeight={600}
            color="green.600"
            cursor="pointer"
            onClick={toggleMobileAll}
          >
            <MobileCheckbox
              checked={mobileAllChecked}
              indeterminate={mobileSomeChecked}
              size={16}
            />
            {mobileAllChecked ? "Clear all" : "Select all"}
          </Box>
        </HStack>
      )}

      {/* Hints */}
      {!selectedType && (
        <VStack py={10} gap={2} color="gray.400">
          <Box as={LuFilter} w={5} h={5} />
          <Text fontSize="sm" textAlign="center" px={4} lineHeight={1.5}>
            Pick{" "}
            <Text as="span" fontWeight={600} color="gray.600">
              Commission
            </Text>{" "}
            or{" "}
            <Text as="span" fontWeight={600} color="gray.600">
              Transportation
            </Text>{" "}
            to load eligible records.
          </Text>
        </VStack>
      )}

      {selectedType && ready && mobileEligible.length === 0 && (
        <VStack py={10} gap={2} color="gray.400">
          <Box as={LuCheck} w={5} h={5} />
          <Text fontSize="sm" textAlign="center">
            All eligible records have been added to your list.
          </Text>
        </VStack>
      )}

      {/* Records list */}
      {selectedType && mobileEligible.length > 0 && (
        <VStack gap={2.5} align="stretch">
          {mobileEligible.map((r) => {
            const id = eligibleRowId(r);
            const on = mobileChecked.has(id);
            return (
              <Box
                key={id}
                as="button"
                w="full"
                textAlign="left"
                p={3.5}
                bg={on ? "green.50" : "white"}
                border="1px solid"
                borderColor={on ? "var(--chakra-colors-primary)" : "gray.200"}
                borderRadius="2xl"
                boxShadow="0 1px 2px rgba(20,33,48,.05)"
                transition="border-color .12s, background .12s"
                cursor="pointer"
                onClick={() => toggleMobileCheck(id)}
              >
                <HStack align="start" gap={3}>
                  <Box pt={0.5} flexShrink={0}>
                    <MobileCheckbox checked={on} size={20} />
                  </Box>
                  <VStack align="start" gap={1} flex={1} minW={0}>
                    <HStack
                      justify="space-between"
                      w="full"
                      align="baseline"
                      gap={2}
                    >
                      <Text
                        fontWeight={600}
                        fontSize="sm"
                        letterSpacing="-.01em"
                        lineClamp={1}
                      >
                        {r.name}
                      </Text>
                      <Text
                        fontWeight={700}
                        fontSize="sm"
                        flexShrink={0}
                        fontVariantNumeric="tabular-nums"
                      >
                        {peso(parsePeso(r.SIAmount))}
                      </Text>
                    </HStack>
                    <HStack gap={1.5} fontSize="xs" color="gray.500">
                      <Text fontFamily="mono">{r.LPANo}</Text>
                      <Text color="gray.300">·</Text>
                      <Text fontFamily="mono">{r.SI}</Text>
                    </HStack>
                    <HStack gap={2} flexWrap="wrap">
                      <OSPBadge
                        type={selectedType === "COM" ? "success" : "info"}
                      >
                        {selectedType === "COM" ? "Commission" : "TE"}
                      </OSPBadge>
                      <Text fontSize="xs" color="gray.400">
                        Inst. {r.InstNo} · {r.SIDate}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      )}

      {/* Action bar */}
      <Box
        mt={3}
        p={3}
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="0 -2px 12px rgba(20,33,48,.06)"
      >
        {addedItems.length > 0 && (
          <Box
            as="button"
            w="full"
            textAlign="left"
            p={3}
            mb={2.5}
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            onClick={() => setMobileStep(reviewStepIdx)}
          >
            <HStack gap={2} fontSize="sm" color="gray.600">
              <Box
                as={LuWallet}
                w={3.5}
                h={3.5}
                color="var(--chakra-colors-primary)"
              />
              <Text fontWeight={700} color="gray.900">
                {addedItems.length}
              </Text>
              <Text>in list · {peso(totals.disburse)}</Text>
            </HStack>
            <HStack
              gap={1}
              fontSize="sm"
              fontWeight={600}
              color={over ? "red.500" : "green.700"}
            >
              <Text fontVariantNumeric="tabular-nums">
                {peso(totals.remaining)} left
              </Text>
              <Box as={LuChevronRight} w={4} h={4} />
            </HStack>
          </Box>
        )}

        {mobileChecked.size > 0 ? (
          <Box
            as="button"
            w="full"
            h="52px"
            borderRadius="xl"
            border={0}
            bg="var(--chakra-colors-primary)"
            color="white"
            fontSize="15.5px"
            fontWeight={600}
            fontFamily="inherit"
            letterSpacing="-.01em"
            boxShadow="0 4px 14px -2px rgba(14,163,114,.5)"
            transition="transform .1s"
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            _active={{ transform: "scale(.99)" }}
            onClick={handleMobileAdd}
          >
            <Box as={LuPlus} w={4} h={4} />
            Add {mobileChecked.size} · {peso(mobileCheckedTotal)}
          </Box>
        ) : addedItems.length > 0 ? (
          <></>
        ) : (
          // <Box
          //   as="button"
          //   w="full"
          //   h="52px"
          //   borderRadius="xl"
          //   border={0}
          //   bg="green.800"
          //   color="white"
          //   fontSize="15.5px"
          //   fontWeight={600}
          //   fontFamily="inherit"
          //   letterSpacing="-.01em"
          //   boxShadow="0 4px 14px -2px rgba(34,84,61,.4)"
          //   transition="transform .1s"
          //   cursor="pointer"
          //   display="flex"
          //   alignItems="center"
          //   justifyContent="center"
          //   gap={2}
          //   _active={{ transform: "scale(.99)" }}
          //   onClick={() => setMobileStep(reviewStepIdx)}
          // >
          //   Review &amp; Release · {peso(totals.disburse)}
          // </Box>
          <Box
            w="full"
            h="52px"
            borderRadius="xl"
            bg="gray.100"
            color="gray.400"
            fontSize="15.5px"
            fontWeight={600}
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="not-allowed"
          >
            {selectedType
              ? "Select records to continue"
              : "Choose a type first"}
          </Box>
        )}
      </Box>

      <Box h={2} />
    </VStack>
  );

  /* Step 4: Review & Release */
  const reviewStepContent = (
    <VStack align="stretch" gap={4} pt={3} pb={2}>
      {/* Balance card */}
      <Box
        p={4}
        borderRadius="xl"
        bg="linear-gradient(155deg,#e8f7f0,#eef8f3)"
        border="1px solid"
        borderColor="green.100"
      >
        <HStack justify="space-between" mb={2.5}>
          <Text
            fontSize="xs"
            fontWeight={600}
            color="green.600"
            textTransform="uppercase"
            letterSpacing=".04em"
          >
            Available balance
          </Text>
          <Text
            fontWeight={700}
            fontSize="xl"
            color="green.900"
            letterSpacing="-.02em"
            fontVariantNumeric="tabular-nums"
          >
            {peso(totals.balance)}
          </Text>
        </HStack>
        <Box
          h="8px"
          borderRadius="full"
          bg="rgba(255,255,255,.7)"
          overflow="hidden"
        >
          <Box
            h="full"
            borderRadius="full"
            bg={
              over
                ? "linear-gradient(90deg,#e0454a,#c5363b)"
                : allocatedPct >= 90
                  ? "linear-gradient(90deg,#e08a13,#d97706)"
                  : "linear-gradient(90deg,var(--chakra-colors-primary),#0b8a60)"
            }
            transition="width .3s"
            w={`${Math.min(100, allocatedPct)}%`}
          />
        </Box>
        <HStack justify="space-between" mt={1.5}>
          <Text fontSize="xs" fontWeight={500} color="green.600">
            {allocatedPct}% allocated
          </Text>
          <Text
            fontSize="xs"
            fontWeight={over ? 600 : 500}
            color={over ? "red.500" : "green.600"}
          >
            {over
              ? `Over by ${peso(Math.abs(totals.remaining))}`
              : `${peso(totals.remaining)} left`}
          </Text>
        </HStack>
      </Box>

      {/* Breakdown */}
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        overflow="hidden"
      >
        <HStack
          justify="space-between"
          px={4}
          py={3}
          borderBottom="1px solid"
          borderColor="gray.100"
          fontSize="sm"
          color="gray.500"
        >
          <HStack gap={2}>
            <Box
              w="8px"
              h="8px"
              borderRadius="sm"
              bg="var(--chakra-colors-primary)"
            />
            <Text>Commission</Text>
          </HStack>
          <Text
            fontWeight={600}
            color="gray.800"
            fontVariantNumeric="tabular-nums"
          >
            {peso(totals.com)}
          </Text>
        </HStack>
        <HStack
          justify="space-between"
          px={4}
          py={3}
          borderBottom="1px solid"
          borderColor="gray.100"
          fontSize="sm"
          color="gray.500"
        >
          <HStack gap={2}>
            <Box w="8px" h="8px" borderRadius="sm" bg="blue.400" />
            <Text>Transportation</Text>
          </HStack>
          <Text
            fontWeight={600}
            color="gray.800"
            fontVariantNumeric="tabular-nums"
          >
            {peso(totals.te)}
          </Text>
        </HStack>
        <HStack
          justify="space-between"
          px={4}
          py={3}
          fontSize="sm"
          bg="gray.50"
          fontWeight={600}
          color="gray.800"
        >
          <Text>Total to disburse</Text>
          <Text fontSize="md" fontVariantNumeric="tabular-nums">
            {peso(totals.disburse)}
          </Text>
        </HStack>
      </Box>

      {/* Items list */}
      <VStack align="stretch" gap={2}>
        <HStack justify="space-between">
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing=".06em"
            textTransform="uppercase"
            color="gray.400"
          >
            {addedItems.length} record{addedItems.length !== 1 ? "s" : ""}
          </Text>
          {addedItems.length > 0 && (
            <Box
              as="button"
              fontSize="xs"
              fontWeight={600}
              color="red.500"
              cursor="pointer"
              onClick={() => {
                setAddedItems([]);
                setEligibleKey((k) => k + 1);
              }}
            >
              Clear all
            </Box>
          )}
        </HStack>

        {addedItems.length === 0 && (
          <VStack py={6} gap={2} color="gray.300" align="center">
            <Box as={LuClipboardList} w={6} h={6} />
            <Text fontSize="sm">No records added yet.</Text>
          </VStack>
        )}

        {addedItems.map((item) => {
          const edited = item.release !== parsePeso(item.SIAmount);
          return (
            <HStack
              key={item._key}
              justify="space-between"
              p={3}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              gap={3}
            >
              <VStack align="start" gap={1} minW={0} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight={600}
                  lineClamp={1}
                  color="gray.900"
                >
                  {item.name}
                </Text>
                <HStack gap={1.5} fontSize="xs" color="gray.400">
                  <OSPBadge type={item.type === "COM" ? "success" : "info"}>
                    {item.type === "COM" ? "Com" : "TE"}
                  </OSPBadge>
                  <Text fontFamily="mono">{item.SI}</Text>
                </HStack>
              </VStack>
              <HStack gap={2} flexShrink={0}>
                <HStack
                  gap={1}
                  h="36px"
                  px={2.5}
                  bg="white"
                  border="1.5px solid"
                  borderColor={edited ? "orange.300" : "gray.200"}
                  borderRadius="lg"
                  css={{
                    "&:focus-within": {
                      borderColor: "var(--chakra-colors-primary)",
                      boxShadow: "0 0 0 3px rgba(14,163,114,.15)",
                    },
                  }}
                >
                  <Text fontSize="xs" color="gray.400" fontWeight={600}>
                    ₱
                  </Text>
                  <input
                    type="number"
                    min={0}
                    max={parsePeso(item.SIAmount)}
                    step={50}
                    value={item.release}
                    onChange={(e) =>
                      updateRelease(item._key, Number(e.target.value))
                    }
                    style={{
                      width: "66px",
                      border: 0,
                      outline: 0,
                      background: "transparent",
                      textAlign: "right",
                      fontSize: "14px",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color: "inherit",
                      fontFamily: "inherit",
                      MozAppearance: "textfield",
                    }}
                  />
                </HStack>
                <Box
                  as="button"
                  w="34px"
                  h="34px"
                  borderRadius="lg"
                  border={0}
                  bg="red.50"
                  color="red.500"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  flexShrink={0}
                  onClick={() => removeItem(item)}
                >
                  <Box as={Trash2} w={3.5} h={3.5} />
                </Box>
              </HStack>
            </HStack>
          );
        })}
      </VStack>

      {/* Over-balance warning */}
      {over && (
        <HStack
          gap={2}
          px={3}
          py={2.5}
          bg="red.50"
          borderRadius="lg"
          fontSize="sm"
          fontWeight={600}
          color="red.500"
        >
          <Box as={LuTriangleAlert} w={3.5} h={3.5} />
          <Text>Exceeds balance by {peso(Math.abs(totals.remaining))}</Text>
        </HStack>
      )}
    </VStack>
  );

  /* ---- success screen ---- */
  const successScreen = (
    <VStack align="center" gap={6} pt={10} px={2} pb={8}>
      <Box
        w="84px"
        h="84px"
        borderRadius="full"
        bg="green.50"
        border="2px solid"
        borderColor="green.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CheckCircle2
          size={46}
          color="var(--chakra-colors-primary)"
          strokeWidth={1.5}
        />
      </Box>

      <VStack gap={1} textAlign="center">
        <Text
          fontSize="22px"
          fontWeight={700}
          letterSpacing="-.02em"
          color="gray.900"
        >
          Released Successfully
        </Text>
        <Text fontSize="sm" color="gray.500" lineHeight={1.6}>
          {submittedSummary?.count} record
          {submittedSummary?.count !== 1 ? "s" : ""} disbursed
        </Text>
      </VStack>

      <Box
        w="full"
        p={4}
        bg="linear-gradient(155deg,#e8f7f0,#eef8f3)"
        border="1px solid"
        borderColor="green.100"
        borderRadius="2xl"
      >
        <VStack gap={2.5} align="stretch">
          <HStack justify="space-between">
            <Text
              fontSize="xs"
              fontWeight={600}
              color="green.600"
              textTransform="uppercase"
              letterSpacing=".04em"
            >
              Amount Released
            </Text>
            <Text
              fontSize="xl"
              fontWeight={700}
              color="green.900"
              letterSpacing="-.02em"
              fontVariantNumeric="tabular-nums"
            >
              {peso(submittedSummary?.amount ?? 0)}
            </Text>
          </HStack>
          <Separator borderColor="green.200" />
          <HStack justify="space-between">
            <Text fontSize="xs" color="gray.500">
              From DRS
            </Text>
            <Text
              fontSize="sm"
              fontWeight={600}
              color="gray.700"
              lineClamp={1}
              maxW="60%"
              textAlign="right"
            >
              {submittedSummary?.drsName}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="xs" color="gray.500">
              Records
            </Text>
            <Text fontSize="sm" fontWeight={600} color="gray.700">
              {submittedSummary?.count} record
              {submittedSummary?.count !== 1 ? "s" : ""}
            </Text>
          </HStack>
        </VStack>
      </Box>

      <Box
        as="button"
        w="full"
        h="52px"
        borderRadius="xl"
        border={0}
        bg="var(--chakra-colors-primary)"
        color="white"
        fontSize="15.5px"
        fontWeight={600}
        fontFamily="inherit"
        letterSpacing="-.01em"
        // boxShadow="0 4px 14px -2px rgba(14,163,114,.5)"
        transition="transform .1s"
        cursor="pointer"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
        _active={{ transform: "scale(.99)" }}
        onClick={handleNewDisbursement}
      >
        New Disbursement
      </Box>
      <Box
        mt={-3}
        as="button"
        w="full"
        h="52px"
        borderRadius="xl"
        border={"1px solid"}
        borderColor={"var(--chakra-colors-primary)"}
        bg="white"
        color="var(--chakra-colors-primary)"
        fontSize="15.5px"
        fontWeight={600}
        fontFamily="inherit"
        letterSpacing="-.01em"
        // boxShadow="0 4px 14px -2px rgba(14,163,114,.5)"
        transition="transform .1s"
        cursor="pointer"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
        _active={{ transform: "scale(.99)" }}
        onClick={() => (window.location.href = "/")}
      >
        Got to Homepage
      </Box>
    </VStack>
  );

  /* ---- mobile steps ---- */
  const mobileSteps = (() => {
    const steps: {
      title: string;
      icon: any;
      content: React.ReactNode;
      validateBeforeNext?: () => boolean;
    }[] = [];

    if (!isSalesAgent) {
      steps.push({
        title: "Employee",
        icon: LuUser,
        validateBeforeNext: () => !!selectedEmployee,
        content: empStepContent,
      });
    }

    steps.push({
      title: "DRS",
      icon: LuFileText,
      validateBeforeNext: () => !!selectedDrs,
      content: drsStepContent,
    });

    steps.push({
      title: "Disburse",
      icon: LuClipboardList,
      validateBeforeNext: () => canSave,
      content: recordsStepContent,
    });

    steps.push({
      title: "Release",
      icon: LuWallet,
      content: reviewStepContent,
    });

    return steps;
  })();

  /* ------------------------------------------------------------------ */
  /* Desktop table config                                                  */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* Render                                                               */
  /* ------------------------------------------------------------------ */
  return (
    <Page.Root
      title="Disbursement"
      description="Manage COMTE expense releases."
      headerButton="menu"
    >
      <Page.MainContent
        flex="1"
        minH="calc(100% - var(--sticky-header-h, 0px))"
      >
        {/* ============ MOBILE VIEW (< md) ============ */}
        <Box display={{ base: "block", md: "none" }} w="full">
          {submitted ? (
            successScreen
          ) : (
            <FormSteps
              stepsData={mobileSteps}
              title="Disbursement"
              description="Commission & expense release"
              currentStep={mobileStep}
              setCurrentStep={(step) => {
                setMobileStep(step);
                setMobileQuery("");
              }}
              onStepsComplete={handleSave}
              submitButtonText="Release"
            />
          )}
        </Box>

        {/* ============ DESKTOP VIEW (≥ md) ============ */}
        <Box
          display={{ base: "none", md: "flex" }}
          flexDirection="column"
          gap="20px"
          w="full"
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
                      <HStack gap={{ base: 4, md: 6 }} flexWrap="wrap">
                        <InfoItem
                          label="Balance"
                          value={peso(totals.balance)}
                        />
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

                      <Box
                        flex="1"
                        minW={{ base: "full", lg: "160px" }}
                        maxW={{ lg: "320px" }}
                      >
                        <Progress.Root
                          value={allocatedPct}
                          size="sm"
                          colorPalette={
                            over
                              ? "red"
                              : allocatedPct >= 90
                                ? "orange"
                                : "green"
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
                        <Box
                          w={{ base: "full", lg: "auto" }}
                          minW={{ lg: "44" }}
                        >
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
        </Box>
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
