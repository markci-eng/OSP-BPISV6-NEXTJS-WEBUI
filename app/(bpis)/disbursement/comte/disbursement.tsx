"use client";

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LuArrowLeftRight,
  LuCheck,
  LuChevronRight,
  LuClipboardList,
  LuFileText,
  LuFilter,
  LuPlus,
  LuTriangleAlert,
  LuUser,
  LuWallet,
  LuX,
} from "react-icons/lu";
import { CheckCircle2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import FormSteps from "@/claude components/FormSteps";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

import { OSPBadge } from "@/components/common/badge/badge";
import { employeeLookup } from "@/components/common/employee-lookup/data/employee-lookup";
import type { EmployeeLookupType } from "@/components/common/employee-lookup/employee-lookup.type";
import Page from "@/claude components/layout/page/Page";

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

const peso = (n: number) =>
  "₱" +
  n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const parsePeso = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

const eligibleRowId = (row: EligibleRecord) => `${row.LPANo}-${row.SI}`;

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
  };

  const changeType = (type: DisbursementType) => {
    setSelectedType(type);
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
              onClick={() => setAddedItems([])}
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
        <Box w="full">
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
      </Page.MainContent>
    </Page.Root>
  );
}
