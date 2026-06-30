"use client";

import {
  Badge,
  Button,
  CloseButton,
  Collapsible,
  Dialog,
  FileUpload,
  Flex,
  Grid,
  GridItem,
  HStack,
  Portal,
  Separator,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDown, ChevronUp, Receipt, Trash2 } from "lucide-react";
import {
  Body,
  Box,
  CancelSolidButton,
  InputFloatingLabel,
  PrimaryMdFlexButton,
  SaveButton,
  SelectFloatingLabel,
} from "st-peter-ui";

import {
  LoanPayClass,
  PayClass,
  PayType,
  tableColumns,
} from "../data/paymentDetails";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";

import { PaymentRecord } from "../data/payment.types";
import { Employee } from "@/data/doc-management/employeeSelector";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import { PlanholderLookupItem } from "@/app/(bpis)/Model/Types/global.types";
import { planholderLookup } from "@/app/(bpis)/Model/function/lookupFunction";
import { computePayments } from "../utils/paymentComputation";

import SectionTitle from "@/components/texts/SectionTitle";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { TblLoanHdrData } from "@/app/(bpis)/Model/Data/rawData";
import { RowAction } from "@/components/common/reusable-tableV2/types";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";
import { LuUser, LuHash, LuMapPin, LuCalendar } from "react-icons/lu";
import { RowItem } from "@/claude components/info-card/row-item";
import { BottomQuickActions } from "@/claude components/drawer/bottom-quick-actions";
import { QuickBottomSheet } from "@/claude components/drawer/quick-bottom-sheet";
import { ShieldCheck, Banknote } from "lucide-react";

type Props = {
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
};

const ACCOUNT_FILTER_LIFE_PLAN = "LP";
const ACCOUNT_FILTER_LENDING = "LN";

export function EncodePaymentPage({ payments, setPayments }: Props) {
  const [showSheet, setShowSheet] = useState(true);
  const [paymentType, setPaymentType] = useState("CH");
  const [paymentClass, setPaymentClass] = useState("DC");
  const [accountFilter, setAccountFilter] = useState(ACCOUNT_FILTER_LIFE_PLAN);
  const [selectPlanholder, setSelectPlanholder] =
    useState<PlanholderLookupItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const filteredLookup = useMemo(() => {
    if (accountFilter === ACCOUNT_FILTER_LENDING) {
      return planholderLookup.filter((item) => item.EntryType === "LOAN");
    }
    return planholderLookup.filter((item) => item.EntryType === "PH");
  }, [accountFilter]);

  const handleSelectPlanholder = (item: PlanholderLookupItem | null) => {
    setSelectPlanholder(item);
    if (item) {
      setSearchOpen(false);
      setPaymentOpen(true);
    }
  };

  const handleAccountFilterChange = (next: string) => {
    setAccountFilter(next);
    if (
      selectPlanholder &&
      ((next === ACCOUNT_FILTER_LIFE_PLAN &&
        selectPlanholder.EntryType !== "PH") ||
        (next === ACCOUNT_FILTER_LENDING &&
          selectPlanholder.EntryType !== "LOAN"))
    ) {
      setSelectPlanholder(null);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [installmentAmount, setInstallmentAmount] = useState<number>(0);
  const [nextSI, setNextSI] = useState("00000050");
  const [selectedSIDate, setSelectedSIDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const defaultEmployee = EMPLOYEES[0];

  useEffect(() => {
    if (paymentClass === "CO" && payments) {
      setIsDialogOpen(true);
    }
  }, [paymentClass, payments, nextSI]);

  const isLoan = selectPlanholder?.EntryType === "LOAN";

  useEffect(() => {
    if (isLoan) {
      if (paymentClass !== "LE" && paymentClass !== "PL") {
        setPaymentClass("LE");
      }
    } else if (paymentClass === "LE" || paymentClass === "PL") {
      setPaymentClass("DC");
    }
  }, [isLoan, paymentClass]);

  const planDetails = selectPlanholder;

  useEffect(() => {
    const amount = planDetails?.PlanData?.PlanType?.IntsAmt;
    setInstallmentAmount(amount ? amount : 0);
  }, [planDetails]);

  const rowActions: RowAction<any>[] = [
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      separator: true,
      onClick: (row: any) => {
        setPayments((prev) => prev.filter((p) => p.SI !== row.SI));
        toast.success(`Deleted ${row.SI}`);
      },
      hidden: (row: any) => payments[0]?.SI !== row.SI,
    },
  ];

  const getNextInstNo = (lpaNumber: string) => {
    const lpaPayments = payments.filter((p) => p.LPANo === lpaNumber);
    if (lpaPayments.length === 0) return 1;
    const maxInst = Math.max(...lpaPayments.map((p) => p.InstNo as any));
    return maxInst + 1;
  };

  useEffect(() => {
    if (payments.length === 0) {
      setNextSI("00000050");
    } else {
      const maxSI = payments.reduce(
        (max, p) => Math.max(max, parseInt(p.SI, 10)),
        0,
      );
      setNextSI((maxSI + 1).toString().padStart(8, "0"));
    }
  }, [payments]);

  const handleAddPayment = () => {
    if (!selectPlanholder || !planDetails) {
      toast.error("Please select Planholder");
      return;
    }
    const newInstNo = isLoan ? 1 : getNextInstNo(selectPlanholder.LPANo);
    const formattedSI = /^\d+$/.test(nextSI) ? nextSI.padStart(8, "0") : nextSI;

    const newPayment: PaymentRecord = {
      LPANo:
        selectPlanholder.EntryType == "PH"
          ? selectPlanholder.LPANo
          : (selectPlanholder.LAFNo ?? ""),
      name: `${selectPlanholder.LastName} ${selectPlanholder.FirstName} ${selectPlanholder.MiddleName}`,
      SI: formattedSI,
      SIDate: new Date(selectedSIDate).toLocaleDateString(),
      SIAmount: installmentAmount.toString() || "0",
      InstNo: newInstNo.toString(),
      PayClass: paymentClass,
      TEPCV: "76.00",
      TEDue: "76.00",
      COMPCV: "342.00",
      GrossCom: installmentAmount.toString() || "0",
      TaxCom: "0",
      ComDue: "950.0000",
      AuditDate: new Date().toLocaleDateString(),
      AuditUser: "System",
      EditDate: "",
      EditUser: "",
    };

    setPayments((prev) => [newPayment, ...prev]);
    toast.success(`Payment added! SI: ${formattedSI}, InstNo: ${newInstNo}`);
  };

  const SearchHeader: LookupColumn<PlanholderLookupItem>[] = [
    {
      key: "LAFNo",
      header: "LPA / LAF Number",
      render: (_, row) => {
        return row.EntryType === "LOAN" ? row.LAFNo : row.LPANo;
      },
    },
    {
      key: "LastName",
      header: "Name",
      render: (_, row) => {
        const givenName = [row.FirstName, row.MiddleName]
          .filter(Boolean)
          .join(" ");
        return [row.LastName, givenName].filter(Boolean).join(", ");
      },
    },
  ];

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const employeeColumns: LookupColumn<Employee>[] = [
    { key: "id", header: "Employee ID" },
    { key: "name", header: "Name" },
    { key: "branch", header: "Branch" },
  ];

  const COMMISSION_PER_PLANHOLDER = 342;
  const TRANSPORTATION_EXPENSE_PER_PLANHOLDER = 76;

  const computed = useMemo(() => {
    if (!selectPlanholder) {
      return computePayments(0, 0, 0);
    }
    return computePayments(
      installmentAmount,
      COMMISSION_PER_PLANHOLDER,
      TRANSPORTATION_EXPENSE_PER_PLANHOLDER,
    );
  }, [selectPlanholder, installmentAmount]);

  const [isProcessing, setIsProcessing] = useState(false);

  const [chequeData, setChequeData] = useState({
    actno: "",
    accname: "",
    bankName: "",
    bankBranch: "",
    chequeNumber: "",
  });

  const mockOCR = async (_file: File) => {
    return new Promise<typeof chequeData>((resolve) => {
      setTimeout(() => {
        resolve({
          actno: "1234567890",
          accname: "JUAN DELA CRUZ",
          bankName: "BDO",
          bankBranch: "QUIAPO",
          chequeNumber: "00012345",
        });
      }, 2000);
    });
  };

  const handleFileChange = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setChequeData({
      actno: "",
      accname: "",
      bankName: "",
      bankBranch: "",
      chequeNumber: "",
    });
    setIsProcessing(true);
    try {
      const result = await mockOCR(files[0]);
      setChequeData(result);
      toast.success("Cheque details extracted!");
    } catch {
      toast.error("Failed to process cheque");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrease = () => {
    setInstallmentAmount((prev) =>
      Math.max(
        planDetails?.PlanData.PlanType.IntsAmt ?? 0,
        prev - (planDetails?.PlanData.PlanType.IntsAmt ?? 0),
      ),
    );
  };

  const handleIncrease = () => {
    setInstallmentAmount(
      (prev) => prev + (planDetails?.PlanData.PlanType.IntsAmt ?? 0),
    );
  };

  const sheetOptions = [
    {
      value: ACCOUNT_FILTER_LIFE_PLAN,
      label: "Life Plan",
      description: "Manage Life Plan premium payments",
      icon: ShieldCheck,
    },
    {
      value: ACCOUNT_FILTER_LENDING,
      label: "Lending",
      description: "Manage loan repayments",
      icon: Banknote,
    },
  ];

  return (
    <Box mx="auto" maxW="full">
      <QuickBottomSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        title="What are you collecting for?"
        subtitle="Choose the business unit for this remittance batch."
        options={sheetOptions}
        onConfirm={(value) => handleAccountFilterChange(value)}
      />

      <Flex flexDir="column" gap={4}>
        <Flex justify="flex-end">
        <Box width={{ base: "full", md: "sm" }}>
          <LookupField<any>
            label=""
            placeholder="Search by Name / LPA#/ LAF#"
            modalTitle="Search Planholder"
            columns={SearchHeader}
            dataSource={filteredLookup}
            searchKeys={[
              "LPANo",
              "LAFNo",
              "FirstName",
              "LastName",
              "MiddleName",
            ]}
            onSelect={handleSelectPlanholder}
            renderDisplay={(a) => {
              const fullName = [
                a.LastName,
                [a.FirstName, a.MiddleName].filter(Boolean).join(" "),
              ]
                .filter(Boolean)
                .join(", ");
              return a.EntryType === "LOAN"
                ? `LOAN: ${a.LAFNo} - ${fullName}`
                : `PLAN: ${a.LPANo} - ${fullName}`;
            }}
            value={selectPlanholder}
          />
        </Box>
        </Flex>

        {selectPlanholder && (
          <>
            {/* MOBILE: original stacked card */}
            <Box mt={4} borderRadius={"2xl"} shadow="sm" p={4} display={{ base: "block", md: "none" }}>
              <Flex justify="space-between" align="start" mb={3}>
                <Flex align="center" gap={2}>
                  <Box p={2} borderRadius="full" bg="gray.100">
                    <LuUser size={18} />
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
                      {`${selectPlanholder.LastName} ${selectPlanholder.FirstName} ${selectPlanholder.MiddleName}`}
                    </Text>
                    <Flex align="center" gap={1} fontSize="xs" color="gray.500">
                      <LuHash size={12} />
                      <Text>
                        {selectPlanholder.EntryType == "PH"
                          ? selectPlanholder.LPANo
                          : (selectPlanholder?.LAFNo ?? "")}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
                <Flex align="center" gap={2}>
                  <Box
                    w="2"
                    h="2"
                    borderRadius="full"
                    bg={selectPlanholder.EntryType == "PH" ? "green.400" : "blue.400"}
                    shadow="sm"
                  />
                  <Badge
                    colorPalette={selectPlanholder.EntryType == "PH" ? "green" : "blue"}
                    variant="subtle"
                    px={2}
                    py={1}
                    fontSize="0.75rem"
                  >
                    {selectPlanholder.EntryType == "PH" ? "Plan Holder" : "Loan"}
                  </Badge>
                </Flex>
              </Flex>
              <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm" color="gray.600" px={2} mb={3}>
                <Flex align="center" gap={2} gridColumn="span 2">
                  <LuHash size={14} />
                  <Text>
                    <Text as="span" fontWeight="semibold">Plan:</Text>{" "}
                    {selectPlanholder.PlanData?.PlanCatalog?.CatalogDescription}
                  </Text>
                </Flex>
                {selectPlanholder.EntryType == "PH" && (
                  <>
                    <Flex align="center" gap={2}>
                      <LuCalendar size={14} />
                      <Text>
                        <Text as="span" fontWeight="semibold">Effectivity:</Text>{" "}
                        {new Date(String(selectPlanholder.Planholders[0].EffectivityDate)).toLocaleDateString()}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={2}>
                      <LuCalendar size={14} />
                      <Text>
                        <Text as="span" fontWeight="semibold">Due:</Text>{" "}
                        {new Date(String(selectPlanholder.Planholders[0].DueDate)).toLocaleDateString()}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={2}>
                      <LuUser size={14} />
                      <Text>
                        <Text as="span" fontWeight="semibold">Agent:</Text>{" "}
                        {selectPlanholder.FirstName || ""}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={2}>
                      <LuUser size={14} />
                      <Text>
                        <Text as="span" fontWeight="semibold">Agent 2:</Text>{" "}
                        {selectPlanholder.LastName || ""}
                      </Text>
                    </Flex>
                  </>
                )}
              </Grid>
            </Box>

            {/* WEB: compact single-row layout */}
            <Box mt={2} borderRadius="xl" shadow="xs" px={3} py={2} borderWidth="1px" borderColor="gray.100" display={{ base: "none", md: "block" }}>
              <Flex align="center" gap={3}>
                {/* Name + ID */}
                <Flex align="center" gap={2} flex="1" minW="0">
                  <Box p={1.5} borderRadius="full" bg="gray.100" flexShrink={0}>
                    <LuUser size={14} />
                  </Box>
                  <Box minW="0">
                    <Text fontWeight="semibold" fontSize="sm" lineHeight="1.2" truncate>
                      {`${selectPlanholder.LastName}, ${selectPlanholder.FirstName} ${selectPlanholder.MiddleName}`}
                    </Text>
                    <Flex align="center" gap={1} fontSize="xs" color="gray.400">
                      <LuHash size={10} />
                      <Text>
                        {selectPlanholder.EntryType == "PH"
                          ? selectPlanholder.LPANo
                          : (selectPlanholder?.LAFNo ?? "")}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>

                <Box w="1px" h="32px" bg="gray.200" flexShrink={0} />

                {/* Plan */}
                <Flex align="center" gap={1.5} fontSize="xs" color="gray.600" flexShrink={0}>
                  <LuHash size={12} color="var(--chakra-colors-gray-400)" />
                  <Text fontWeight="medium" color="gray.400" whiteSpace="nowrap">Plan:</Text>
                  <Text truncate maxW="160px">
                    {selectPlanholder.PlanData?.PlanCatalog?.CatalogDescription}
                  </Text>
                </Flex>

                {selectPlanholder.EntryType == "PH" && (
                  <>
                    <Box w="1px" h="32px" bg="gray.200" flexShrink={0} />
                    <Flex align="center" gap={1.5} fontSize="xs" color="gray.600" flexShrink={0}>
                      <LuCalendar size={12} color="var(--chakra-colors-gray-400)" />
                      <Text fontWeight="medium" color="gray.400" whiteSpace="nowrap">Eff:</Text>
                      <Text whiteSpace="nowrap">
                        {new Date(String(selectPlanholder.Planholders[0].EffectivityDate)).toLocaleDateString()}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={1.5} fontSize="xs" color="gray.600" flexShrink={0}>
                      <LuCalendar size={12} color="var(--chakra-colors-gray-400)" />
                      <Text fontWeight="medium" color="gray.400" whiteSpace="nowrap">Due:</Text>
                      <Text whiteSpace="nowrap">
                        {new Date(String(selectPlanholder.Planholders[0].DueDate)).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </>
                )}

                <Badge
                  colorPalette={selectPlanholder.EntryType == "PH" ? "green" : "blue"}
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  ml="auto"
                  flexShrink={0}
                >
                  {selectPlanholder.EntryType == "PH" ? "Plan Holder" : "Loan"}
                </Badge>
              </Flex>
            </Box>
          </>
        )}

        {/* PAYMENT DETAILS */}
        <InputCardAccordion
          icon={<Receipt size={16} />}
          title={isLoan ? "Loan Payment Details" : "Payment Details"}
          subtitle={
            !selectPlanholder
              ? "Select a planholder first"
              : payments.length > 0
                ? `${payments.length} payment(s) encoded`
                : "Enter payment information"
          }
          isOpen={paymentOpen}
          onToggle={() => setPaymentOpen((p) => !p)}
          isComplete={payments.length > 0}
        >
          {!selectPlanholder && (
            <EmptyStateCard
              title="No Planholder Selected"
              description="Search and select a planholder to start entering payment details."
            />
          )}

          {selectPlanholder && (
            <>
              {/* <Box
                width={{ base: "full", md: "sm" }}
                mb={3}
                display={isLoan ? "none" : ""}
              >
                <LookupField<Employee>
                  label=""
                  placeholder="Search by name or ID..."
                  modalTitle="Search Employee"
                  columns={employeeColumns}
                  dataSource={EMPLOYEES}
                  searchKeys={["id", "name", "branch"]}
                  onSelect={setSelectedEmployee}
                  renderDisplay={(emp) => `${emp.name} (${emp.id})`}
                  value={selectedEmployee || defaultEmployee}
                />
              </Box> */}

              <Grid
                templateColumns={{
                  base: "1fr",
                  sm: "repeat(1,1fr)",
                  lg: "repeat(3,1fr)",
                  xl: "repeat(4,1fr)",
                }}
                gapX={{ base: 1, md: 2 }}
                alignItems="center"
              >
                <SelectFloatingLabel
                  label="Payment Class"
                  collection={isLoan ? LoanPayClass : PayClass}
                  value={[paymentClass]}
                  onValueChanged={(e) => setPaymentClass(e[0])}
                />

                <SelectFloatingLabel
                  label="Payment Type"
                  collection={PayType}
                  value={[paymentType]}
                  onValueChanged={(e) => setPaymentType(e[0])}
                />

                <InputFloatingLabel
                  key={nextSI}
                  label={
                    selectPlanholder?.EntryType == "PH"
                      ? "Sales Invoice Number"
                      : "AR Number"
                  }
                  name="si"
                  value={nextSI}
                  onChange={(e) => setNextSI(e.currentTarget.value)}
                  onBlur={(e) => {
                    const raw = e.currentTarget.value.trim();
                    if (/^\d+$/.test(raw)) {
                      setNextSI(raw.padStart(8, "0"));
                    }
                  }}
                />

                <InputFloatingLabel
                  label={
                    selectPlanholder?.EntryType == "PH"
                      ? "Sales Invoice Extension"
                      : "AR Extension"
                  }
                  name="siext"
                />

                <HStack>
                  <Button
                    onClick={handleDecrease}
                    display={selectPlanholder?.EntryType == "PH" ? "" : "none"}
                  >
                    -
                  </Button>
                  <InputFloatingLabel
                    key={installmentAmount}
                    label="Amount"
                    name="amount"
                    value={installmentAmount.toString()}
                    onChange={(e) =>
                      setInstallmentAmount(Number(e.currentTarget.value) || 0)
                    }
                  />
                  <Button
                    onClick={handleIncrease}
                    display={selectPlanholder?.EntryType == "PH" ? "" : "none"}
                  >
                    +
                  </Button>
                </HStack>

                <InputFloatingLabel
                  label={
                    selectPlanholder?.EntryType == "PH"
                      ? "Sales Invoice Date"
                      : "AR Date"
                  }
                  name="sidate"
                  type="date"
                  value={selectedSIDate}
                  onChange={(e) => setSelectedSIDate(e.target.value)}
                />

                <GridItem
                  colSpan={{ base: 1, lg: 3, xl: 2 }}
                  display={selectPlanholder?.EntryType == "PH" ? "" : "none"}
                  boxShadow="sm"
                  p={3}
                  borderRadius="sm"
                >
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }}
                    gap={{ base: 1, md: 2, xl: 4 }}
                  >
                    <RowItem
                      label="Com CBI"
                      value={computed.comCBI.toFixed(2)}
                    />
                    <RowItem
                      label="NCom CBI"
                      value={computed.ncomCBI.toFixed(2)}
                    />
                    <RowItem
                      label="Commission"
                      value={computed.commission.toFixed(2)}
                    />
                    <RowItem
                      label="Transportation Expense"
                      value={computed.transportationExpense.toFixed(2)}
                    />
                  </Grid>
                </GridItem>
              </Grid>

              {/* CHEQUE DETAILS */}
              <Collapsible.Root
                open={paymentType === "CK"}
                unmountOnExit={false}
              >
                <Collapsible.Content>
                  <Separator my={4} />
                  <SectionTitle>Cheque Details</SectionTitle>
                  <Separator my={3} />
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      sm: "repeat(2,1fr)",
                      lg: "repeat(3,1fr)",
                      xl: "repeat(4,1fr)",
                    }}
                    gap={{ base: 1, md: 2, xl: 4 }}
                    alignItems="center"
                  >
                    <InputFloatingLabel
                      key={chequeData.actno}
                      label="Account Number"
                      value={chequeData.actno}
                      onChange={(e) =>
                        setChequeData((prev) => ({
                          ...prev,
                          actno: e.target.value,
                        }))
                      }
                    />
                    <InputFloatingLabel
                      key={chequeData.accname}
                      label="Account Name"
                      name="accname"
                      value={chequeData.accname}
                      onChange={(e) =>
                        setChequeData((prev) => ({
                          ...prev,
                          accname: e.target.value,
                        }))
                      }
                    />
                    <InputFloatingLabel
                      key={chequeData.bankName}
                      label="Bank Name"
                      name="bankName"
                      value={chequeData.bankName}
                      disabled={isProcessing}
                      onChange={(e) =>
                        setChequeData((prev) => ({
                          ...prev,
                          bankName: e.target.value,
                        }))
                      }
                    />
                    <InputFloatingLabel
                      key={chequeData.bankBranch}
                      label="Bank Branch"
                      name="bankBranch"
                      value={chequeData.bankBranch}
                      disabled={isProcessing}
                      onChange={(e) =>
                        setChequeData((prev) => ({
                          ...prev,
                          bankBranch: e.target.value,
                        }))
                      }
                    />
                    <InputFloatingLabel
                      key={chequeData.chequeNumber}
                      label="Cheque Number"
                      name="chequeNumber"
                      value={chequeData.chequeNumber}
                      disabled={isProcessing}
                      onChange={(e) =>
                        setChequeData((prev) => ({
                          ...prev,
                          chequeNumber: e.target.value,
                        }))
                      }
                    />
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FileUpload.Root width="100%">
                        <FileUpload.HiddenInput
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            handleFileChange(files);
                          }}
                        />
                        <FileUpload.Context>
                          {({ acceptedFiles }) => (
                            <Box
                              asChild
                              width="100%"
                              border="1px solid"
                              borderColor="gray.300"
                              borderRadius="sm"
                              cursor="pointer"
                              p={2}
                              fontSize="sm"
                              _hover={{ borderColor: "gray.400" }}
                            >
                              <FileUpload.Trigger>
                                {isProcessing ? (
                                  <Flex align="center" gap={2}>
                                    <Spinner size="sm" />
                                    <Body>Processing cheque...</Body>
                                  </Flex>
                                ) : acceptedFiles.length === 0 ? (
                                  <Body>Upload Cheque Slip</Body>
                                ) : (
                                  <Body>{acceptedFiles[0].name}</Body>
                                )}
                              </FileUpload.Trigger>
                            </Box>
                          )}
                        </FileUpload.Context>
                      </FileUpload.Root>
                      {!isProcessing && chequeData.actno && (
                        <Body fontSize="xs" color="green.500" mt={1}>
                          ✔ OCR data loaded
                        </Body>
                      )}
                    </GridItem>
                  </Grid>
                </Collapsible.Content>
              </Collapsible.Root>

              {/* TAX DETAILS */}
              {selectPlanholder?.EntryType == "PH" && (
                <>
                  <Box
                    mt={4}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <Flex
                      onClick={() => setTaxOpen((p) => !p)}
                      align="center"
                      justify="space-between"
                      gap={2}
                      w="full"
                      px={{ base: 3, md: 4 }}
                      py={3}
                      bg="green.50"
                      cursor="pointer"
                      _hover={{ bg: "green.100" }}
                    >
                      <Flex align="center" gap={2} color="green.700">
                        <Text fontWeight="semibold" fontSize="sm">
                          Tax Details
                        </Text>
                      </Flex>
                      <Flex align="center" gap={2}>
                        <Text fontSize="sm" color="gray.600">
                          Net:
                        </Text>
                        <Text fontWeight="bold" fontSize="sm" color="green.600">
                          {`₱${computed.totalAmountDue.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}`}
                        </Text>
                        <Box color="green.700">
                          {taxOpen ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </Box>
                      </Flex>
                    </Flex>
                  </Box>
                  <BottomQuickActions
                    open={taxOpen}
                    onOpenChange={setTaxOpen}
                    title="Tax Details"
                    subtitle={`Net: ₱${computed.totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  >
                    <Box px={1}>
                      <RowItem
                        label="Vatable Sales"
                        value={computed.vatableSales.toFixed(2)}
                      />
                      <RowItem
                        label="VAT Exempt Sales"
                        value={computed.vatExemptSales.toFixed(2)}
                      />
                      <RowItem
                        label="Total Sales"
                        value={computed.totalSales.toFixed(2)}
                      />
                      <RowItem
                        label="Less VAT"
                        value={computed.lessVat.toFixed(2)}
                      />
                      <RowItem
                        label="Add 12% VAT"
                        value={computed.vat.toFixed(2)}
                      />
                      <RowItem
                        label="Sub Total"
                        value={computed.subTotal.toFixed(2)}
                      />
                      <RowItem
                        label="Zero Rated Sales"
                        value={computed.zeroRatedSales.toFixed(2)}
                      />
                      <RowItem
                        label="VAT Amount"
                        value={computed.vatAmount.toFixed(2)}
                      />
                      <RowItem
                        label="Amount Net of VAT"
                        value={computed.amountNetOfVat.toFixed(2)}
                      />
                      <RowItem
                        label="Amount Due"
                        value={computed.amountDue.toFixed(2)}
                      />
                      <RowItem
                        label="Withholding Tax"
                        value={computed.withholdingTax.toFixed(2)}
                      />
                      <RowItem
                        label="Total Amount Due"
                        value={computed.totalAmountDue.toFixed(2)}
                      />
                    </Box>
                  </BottomQuickActions>
                </>
              )}

              {/* ADD TO LIST */}
              <Flex mt={{ base: 2, md: 3 }} justify="flex-end" flexWrap="wrap">
                <Box
                  w={{ base: "full", md: "1/12" }}
                  minW={{ base: "full", md: "-webkit-fit-content" }}
                >
                  <PrimaryMdFlexButton
                    onClick={() => {
                      if (payments.length > 0) {
                        const isLaf = TblLoanHdrData.some(
                          (a) => a.LAFNo === payments[0].LPANo,
                        );
                        const entryType = selectPlanholder?.EntryType;
                        const canProceed =
                          (entryType === "PH" && !isLaf) ||
                          (entryType === "LOAN" && isLaf);
                        if (canProceed) {
                          handleAddPayment();
                        } else {
                          toast.info(
                            "Payment cannot be saved. Please prepare drs the current encoded payment to proceed.",
                          );
                        }
                      } else {
                        handleAddPayment();
                      }
                    }}
                  >
                    Save Payment
                  </PrimaryMdFlexButton>
                </Box>
              </Flex>
            </>
          )}
        </InputCardAccordion>

        {/* ENCODED PAYMENT TABLE */}
        <DataTable
          data={payments}
          columns={tableColumns}
          title="Encoded Payment(s)"
          features={{
            search: false,
            sorting: false,
            draggable: false,
            selection: false,
            filtering: false,
            columnToggle: false,
          }}
          headerButton={{
            label: "DELETE ALL",
            onClick: () => {
              setPayments([]);
              toast.success("Deleted All");
            },
          }}
          rowActions={rowActions}
          renderDetail={(row) => (
            <Grid templateColumns={{ base: "1fr" }} gap={2} px={2} py={3}>
              <RowItem label="Name" value={row.name} />
              <RowItem label="SI Date" value={row.SIDate} />
              <RowItem label="Installment Number" value={row.InstNo} />
              <RowItem label="Pay Class" value={row.PayClass} />
              <RowItem label="Amount" value={row.SIAmount} />
              <RowItem label="Commission" value={row.COMPCV} />
              <RowItem label="Transportation Expense" value={row.TEPCV} />
              <RowItem label="Encoded Date" value={row.AuditDate} />
            </Grid>
          )}
        />
      </Flex>

      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
        size={{ base: "full", md: "xl" }}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={{ base: 0, md: undefined }}>
            <Dialog.Content borderRadius={{ base: 0, md: undefined }}>
              <Dialog.Body>
                <Box py={8}>
                  <DataTable columns={[]} data={[]} title="Cancelled SI" />
                </Box>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <CancelSolidButton onClick={() => setIsDialogOpen(false)} />
                </Dialog.ActionTrigger>
                <SaveButton />
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" onClick={() => setIsDialogOpen(false)} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
