"use client";

import {
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
} from "@chakra-ui/react";
import { ChevronDown, ChevronUp, Receipt, Repeat, Trash2 } from "lucide-react";
import {
  Body,
  Box,
  CancelSolidButton,
  InputFloatingLabel,
  PrimaryMdFlexButton,
  SaveButton,
  SelectFloatingLabel,
  Small,
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
import { useDisclosure } from "@chakra-ui/react";
import { Employee } from "@/data/doc-management/employeeSelector";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import { PlanholderLookupItem } from "@/app/Model/Types/global.types";
import { planholderLookup } from "@/app/Model/function/lookupFunction";
import { computePayments } from "../utils/paymentComputation";

import SectionTitle from "@/components/texts/SectionTitle";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import LabelText from "@/components/texts/LabelText";
import { TblLoanHdrData } from "@/app/Model/Data/rawData";
import { RowAction } from "@/components/common/reusable-tableV2/types";
import Card from "@/components/cards/Card";
import { OSPBadge } from "@/components/common/badge/badge";

type Props = {
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
};
export function EncodePaymentPage({ payments, setPayments }: Props) {
  const [paymentType, setPaymentType] = useState("CH");
  const [paymentClass, setPaymentClass] = useState("DC");
  const [selectPlanholder, setSelectPlanholder] =
    useState<PlanholderLookupItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [installmentAmount, setInstallmentAmount] = useState<number>(0);
  const [nextSI, setNextSI] = useState("00000050");
  const [selectedSIDate, setSelectedSIDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // "YYYY-MM-DD" format
  });
  const { open, onOpen, onClose } = useDisclosure();
  const defaultEmployee = EMPLOYEES[0];
  useEffect(() => {
    if (paymentClass === "CO" && payments) {
      setIsDialogOpen(true);
    }
  }, [paymentClass, payments, nextSI]);

  // For LOAN planholders only Lending Payment (LE) / Lending Penalty (PL) are
  // valid. Reset the payment class to a valid option when the entry type changes.
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
  // Find selected planholder's plan details
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
    if (lpaPayments.length === 0) return 1; // first installment
    const maxInst = Math.max(...lpaPayments.map((p) => p.InstNo as any));
    return maxInst + 1;
  };
  // Compute next SI
  useEffect(() => {
    if (payments.length === 0) {
      setNextSI("00000050"); // starting SI if no records
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
    // Loan AR payments are not installment-based, so InstNo stays fixed.
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

  const DetailChip = ({ label, value }: { label: string; value: string }) => (
    <Flex
      align="center"
      gap={1.5}
      px={3}
      py={1.5}
      borderRadius="md"
      bg="gray.50"
      borderWidth="1px"
      borderColor="gray.100"
      w="full"
    >
      <Body fontSize="sm" color="gray.500">
        {label}
      </Body>
      <Body fontSize="sm" fontWeight="semibold" color="gray.800">
        {value}
      </Body>
    </Flex>
  );

  const getEntryBadge = (type: PlanholderLookupItem["EntryType"]): { label: string; color: "warning" | "success" | "info" | "danger" } => {
    switch (type) {
      case "LOAN":
        return { label: "LOAN", color: "info" };
      case "PH":
        return { label: "PLAN", color: "success" };
      default:
        return { label: "UNKNOWN", color: "warning" };
    }
  };
  const SearchHeader: LookupColumn<PlanholderLookupItem>[] = [
    {
      key: "LAFNo",
      header: "LPA / LAF Number",
      render: (_, row) => {
        const badge = getEntryBadge(row.EntryType);
        const refNo = row.EntryType === "LOAN" ? row.LAFNo : row.LPANo;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <OSPBadge type={badge.color}> {badge.label}</OSPBadge>

            <span>{refNo}</span>
          </div>
        );
      },
    },

    { key: "FirstName", header: "First Name" },
    { key: "LastName", header: "Last Name" },
    { key: "MiddleName", header: "Middle Name" },
  ];

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const employeeColumns: LookupColumn<Employee>[] = [
    { key: "id", header: "Employee ID" },
    { key: "name", header: "Name" },
    { key: "branch", header: "Branch" },
  ];

  // Per-planholder commission / transportation expense.
  // Displayed on selection and constant regardless of the payments list.
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

  // ✅ MOCK OCR FUNCTION
  const mockOCR = async (file: File) => {
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

  // ✅ FILE HANDLER
  const handleFileChange = async (files: File[]) => {
    if (!files || files.length === 0) return;

    // // reset first
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

      setChequeData(result); // only update once
      toast.success("Cheque details extracted!");
    } catch (err) {
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

  return (
    <Box mx="auto" maxW="full">
      {/* PLANHOLDER SEARCH */}

      <Card.Root>
        <Card.MainContent>
          <Flex justify={"end"}>
            <Box width={{ base: "full", md: "sm" }}>
              <LookupField<any>
                label=""
                placeholder="Search by Name / LPA#/ LAF#"
                modalTitle="Search Planholder"
                columns={SearchHeader}
                dataSource={planholderLookup}
                searchKeys={[
                  "LPANo",
                  "LAFNo",
                  "FirstName",
                  "LastName",
                  "MiddleName",
                ]}
                onSelect={setSelectPlanholder}
                renderDisplay={(a) => {
                  if (a.EntryType === "LOAN") {
                    return `LOAN: ${a.LAFNo} - ${a.FirstName} ${a.LastName}`;
                  }

                  return `PLAN: ${a.LPANo} - ${a.FirstName} ${a.LastName}`;
                }}
                value={selectPlanholder}
              />
            </Box>
          </Flex>
        </Card.MainContent>
      </Card.Root>

      {/* PLANHOLDER DETAILS */}
      <Box mt={5}>
        {/* EMPTY STATE */}
        {!selectPlanholder && (
          <Card.Root title={"Planholder Details"}>
            <Card.MainContent>
              <EmptyStateCard
                title="No Planholder Selected"
                description="Search and select a planholder to display plan details."
              />
            </Card.MainContent>
          </Card.Root>
        )}

        {selectPlanholder && (
          <Card.Root>
            <Card.MainContent>
              <Flex
                direction={{ base: "column", lg: "row" }}
                justify="space-between"
                align={{ base: "stretch", lg: "center" }}
                gap={{ base: 3, lg: 4 }}
              >
                {/* IDENTITY */}
                <Flex
                  align="center"
                  gap={3}
                  minW={0}
                  justify={{ base: "space-between", lg: "start" }}
                >
                  <Flex gap={2} align="center">
                    <Flex
                      align="center"
                      justify="center"
                      flexShrink={0}
                      w="48px"
                      h="48px"
                      borderRadius="lg"
                      bg="green.500"
                      color="white"
                      fontWeight="semibold"
                      fontSize="md"
                    >
                      {`${selectPlanholder.LastName?.[0] ?? ""}${selectPlanholder.FirstName?.[0] ?? ""}`.toUpperCase()}
                    </Flex>
                    <Box minW={0}>
                      <Body
                        fontWeight="semibold"
                        textTransform="uppercase"
                        lineHeight="1.2"
                        truncate
                      >
                        {`${selectPlanholder.LastName} ${selectPlanholder.FirstName} ${selectPlanholder.MiddleName}`}
                      </Body>
                      <Small
                        color="gray.500"
                        textTransform="uppercase"
                        truncate
                      >
                        {[
                          selectPlanholder.PlanData?.PlanCatalog
                            ?.CatalogDescription,
                          selectPlanholder.OrgUnit?.OrgUnitDescription,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Small>
                    </Box>
                  </Flex>
                  <Flex
                    flexShrink={0}
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="green.50"
                    color="green.600"
                    fontWeight="semibold"
                    fontSize="sm"
                  >
                    <OSPBadge
                      type={
                        selectPlanholder.EntryType == "PH" ? "success" : "info"
                      }
                    >
                      {selectPlanholder.EntryType == "PH"
                        ? selectPlanholder.LPANo
                        : (selectPlanholder?.LAFNo ?? "")}
                    </OSPBadge>
                  </Flex>
                </Flex>

                {/* DETAIL CHIPS */}
                {selectPlanholder.EntryType == "PH" && (
                  <Grid
                    gap={2}
                    templateColumns={{
                      base: "repeat(2,1fr)",
                      lg: "repeat(4,auto)",
                    }}
                    justifyContent={{ base: "stretch", lg: "flex-end" }}
                  >
                    <DetailChip
                      label="Effectivity"
                      value={new Date(
                        String(selectPlanholder.Planholders[0].EffectivityDate),
                      ).toLocaleDateString()}
                    />
                    <DetailChip
                      label="Due"
                      value={new Date(
                        String(selectPlanholder.Planholders[0].DueDate),
                      ).toLocaleDateString()}
                    />
                    <DetailChip
                      label="Agent"
                      value={selectPlanholder.FirstName || ""}
                    />
                    <DetailChip
                      label="Agent 2"
                      value={selectPlanholder.LastName || ""}
                    />
                  </Grid>
                )}
              </Flex>
            </Card.MainContent>
          </Card.Root>
        )}
      </Box>

      {/* PAYMENT DETAILS */}
      <Box mt={5} mx="auto">
        {/* HEADER */}
        <Card.Root
          title={
            selectPlanholder?.EntryType == "LOAN"
              ? "Loan Payment Details"
              : "Payment Details"
          }
        >
          <Card.ButtonSection>
            <Box
              width={{ base: "full", md: "sm" }}
              display={
                selectPlanholder?.EntryType == "LOAN" || !selectPlanholder
                  ? "none"
                  : ""
              }
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
            </Box>
          </Card.ButtonSection>

          <Card.MainContent>
            {/* EMPTY STATE */}
            {!selectPlanholder && (
              <EmptyStateCard
                title="No Planholder Selected"
                description="Search and select a planholder to start entering payment details."
              />
            )}

            {/* PAYMENT FORM */}
            <Collapsible.Root open={selectPlanholder != null}>
              <Collapsible.Content>
                {/* PAYMENT GRID */}
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
                      display={
                        selectPlanholder?.EntryType == "PH" ? "" : "none"
                      }
                    >
                      -
                    </Button>

                    <InputFloatingLabel
                      key={installmentAmount}
                      label="Amount"
                      name="amount"
                      value={installmentAmount.toString()}
                      onChange={(e) => {
                        setInstallmentAmount(
                          Number(e.currentTarget.value) || 0,
                        );
                      }}
                    />

                    <Button
                      onClick={handleIncrease}
                      display={
                        selectPlanholder?.EntryType == "PH" ? "" : "none"
                      }
                    >
                      +
                    </Button>
                  </HStack>
                  {/* <InfoItem label={"Amount"} value={installmentAmount} /> */}

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
                      templateColumns={{
                        base: "1fr",
                        md: "repeat(2,1fr)",
                        lg: "repeat(2,1fr)",
                      }}
                      gap={{ base: 1, md: 2, xl: 4 }}
                    >
                      <LabelText
                        label="Com CBI"
                        value={computed.comCBI.toFixed(2)}
                      />
                      <LabelText
                        label="NCom CBI"
                        value={computed.ncomCBI.toFixed(2)}
                      />
                      <LabelText
                        label="Commission"
                        value={computed.commission.toFixed(2)}
                      />
                      <LabelText
                        label={"Transportation Expense"}
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

                      {/* FILE UPLOAD */}
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

                        {/* ✅ OCR SUCCESS INDICATOR */}
                        {!isProcessing && chequeData.actno && (
                          <Body fontSize="xs" color="green.500" mt={1}>
                            ✔ OCR data loaded
                          </Body>
                        )}
                      </GridItem>
                    </Grid>
                  </Collapsible.Content>
                </Collapsible.Root>

                {/* TAX DETAILS (collapsible) */}
                {selectPlanholder?.EntryType == "PH" && (
                  <Box
                    mt={4}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    {/* HEADER BAR */}
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
                        {/* <Receipt size={18} /> */}
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

                    {/* BODY */}
                    <Collapsible.Root open={taxOpen}>
                      <Collapsible.Content>
                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2,1fr)",
                          }}
                          columnGap={{ base: 0, md: 10 }}
                          rowGap={2}
                          px={{ base: 3, md: 4 }}
                          py={4}
                        >
                          <LabelText
                            label="Vatable Sales"
                            value={computed.vatableSales.toFixed(2)}
                          />
                          <LabelText
                            label="VAT Exempt Sales"
                            value={computed.vatExemptSales.toFixed(2)}
                          />
                          <LabelText
                            label="Total Sales"
                            value={computed.totalSales.toFixed(2)}
                          />
                          <LabelText
                            label="Less VAT"
                            value={computed.lessVat.toFixed(2)}
                          />
                          <LabelText
                            label="Add 12% VAT"
                            value={computed.vat.toFixed(2)}
                          />
                          <LabelText
                            label="Sub Total"
                            value={computed.subTotal.toFixed(2)}
                          />
                          <LabelText
                            label="Zero Rated Sales"
                            value={computed.zeroRatedSales.toFixed(2)}
                          />
                          <LabelText
                            label="VAT Amount"
                            value={computed.vatAmount.toFixed(2)}
                          />
                          <LabelText
                            label="Amount Net of VAT"
                            value={computed.amountNetOfVat.toFixed(2)}
                          />
                          <LabelText
                            label="Amount Due"
                            value={computed.amountDue.toFixed(2)}
                          />
                          <LabelText
                            label="Withholding Tax"
                            value={computed.withholdingTax.toFixed(2)}
                          />
                          <LabelText
                            label="Total Amount Due"
                            value={computed.totalAmountDue.toFixed(2)}
                          />
                        </Grid>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </Box>
                )}

                {/* ACTION BUTTONS */}
                <Flex
                  // gap={{ base: 0 }}
                  mt={{ base: 2, md: 3 }}
                  justify={"flex-end"}
                  flexWrap="wrap"
                >
                  {/* <ClearOutlineButton
                width={{ base: "100%", md: "auto" }}
                onClick={() => setInstallmentAmount("0")}
              /> */}
                  <Box
                    w={{ base: "full", md: "1/12" }}
                    minW={{ base: "full", md: "-webkit-fit-content" }}
                  >
                    <PrimaryMdFlexButton
                      onClick={(e) => {
                        if (payments.length > 0) {
                          const isLaf = TblLoanHdrData.some(
                            (a) => a.LAFNo === payments[0].LPANo,
                          );

                          // toast.info(`isLaf: ${isLaf}`);

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
                      Add to List
                    </PrimaryMdFlexButton>
                  </Box>
                </Flex>
              </Collapsible.Content>
            </Collapsible.Root>
          </Card.MainContent>
        </Card.Root>
      </Box>
      {/* ENCODED PAYMENT TABLE */}
      <Box mt={5}>
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
            // icon: LuTrash,
            onClick: () => {
              setPayments([]);
              toast.success("Deleted All");
            },
          }}
          rowActions={rowActions}
          renderDetail={(row) => (
            <Card.Root title={`${row.SI} - ${row.LPANo}`}>
              <Card.MainContent>
                <Grid
                  templateColumns={{
                    base: "1fr",
                  }}
                  gap={2}
                >
                  <LabelText label="Name" value={row.name} />
                  <LabelText label="SI Date" value={row.SIDate} />
                  <LabelText label="Installment Number" value={row.InstNo} />
                  <LabelText label="Pay Class" value={row.PayClass} />
                  <LabelText label="Amount" value={row.SIAmount} />
                  <LabelText label="commission" value={row.COMPCV} />
                  <LabelText label="Transportation Expense" value={row.TEPCV} />
                  <LabelText label="Encoded Date" value={row.AuditDate} />
                </Grid>
              </Card.MainContent>
            </Card.Root>
          )}
          // mobileConfig={{
          //   viewMode: "accordion",
          //   titleTransform: "uppercase",
          //   primaryField: "SI",
          //   secondaryField: "LPANo",
          //   badgeField: "SIAmount",
          //   visibleFields: ["name", "InstNo", "PayClass", "SIDate"],
          //   labelMap: {
          //     LPANo: "LPA Number",
          //     InstNo: "Installment Number",
          //     SIDate: "Sales Invoice Date",
          //   },
          //   valueFormatter: {
          //     SIAmount: (value) => {
          //       const num = Number(value);
          //       return isNaN(num) ? String(num) : `₱: ${value}`;
          //     },
          //   },
          // }}
        />
      </Box>

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
