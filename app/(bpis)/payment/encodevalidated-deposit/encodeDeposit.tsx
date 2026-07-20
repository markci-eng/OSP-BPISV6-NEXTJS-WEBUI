"use client";

import { Box, Flex, Grid, SimpleGrid, Text } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";

import { PrimaryMdFlexButton } from "st-peter-ui";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { drsItems, samplePayments } from "../data/paymentDetails";

import DrsDataTable from "../components/drsDataTable";
import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";

import { DepositHdr } from "../data/payment.types";
import DrsPaymentSummary from "../components/drsPaymentSummary";
import { DrsFunction } from "../utils/drsFunction";
import { toast } from "sonner";
import { Employee } from "@/data/doc-management/employeeSelector";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import { refBankBranch } from "@/app/(bpis)/Model/Types/global.types";
import { refBankBranchData } from "@/app/(bpis)/Model/Data/rawData";
import { useRouter } from "next/navigation";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import Page from "@/claude components/layout/page/Page";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { Card as CardAccordion } from "@/claude components/card-accordion/card";
import { LuBanknote, LuSearch } from "react-icons/lu";
import { SlipUpload, SlipUploadStatus } from "../components/SlipUpload";
import Card from "@/components/cards/Card";
import { OSPBadge } from "@/components/common/badge/badge";

const parseCurrency = (value?: string) => {
  const parsed = Number((value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const DEPOSIT_STATUS_META = {
  exact: { label: "Exact", badgeType: "success" as const },
  short: { label: "Short", badgeType: "danger" as const },
  excess: { label: "Excess", badgeType: "warning" as const },
};

const MetaItem = ({
  label,
  value,
  valueColor,
  children,
}: {
  label: string;
  value: ReactNode;
  valueColor?: string;
  children?: ReactNode;
}) => (
  <Box>
    <Text fontSize="xs" color="gray.500" mb={1}>
      {label}
    </Text>
    <Text fontSize="md" fontWeight="bold" color={valueColor}>
      {value}
    </Text>
    {children}
  </Box>
);

export default function EncodeDeposit() {
  const { totals } = DrsFunction(samplePayments);
  const router = useRouter();

  const [selectedDRS, setSelectedDRS] = useState<DepositHdr | null>(null);
  const [searchOpen, setSearchOpen] = useState(true);

  const drsColumns: LookupColumn<DepositHdr>[] = [
    { key: "name", header: "DRS" },
    { key: "Amount", header: "Amount" },
  ];

  useEffect(() => {
    const data = sessionStorage.getItem("selectedDRS");
    if (data) {
      setSelectedDRS(JSON.parse(data));
      setSearchOpen(false);
      sessionStorage.removeItem("selectedDRS");
    }
  }, []);

  const defaultEmployee = EMPLOYEES[0];
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const employeeColumns: LookupColumn<Employee>[] = [
    { key: "id", header: "Employee ID" },
    { key: "name", header: "Name" },
    { key: "branch", header: "Branch" },
  ];

  const [selectedBank, setSelectedBank] = useState<refBankBranch | null>(null);
  const bankBranchColumns: LookupColumn<refBankBranch>[] = [
    { key: "BankCode", header: "Bank Code" },
    { key: "BankBranch", header: "Bank Description" },
  ];

  const EMPTY_DEPOSIT_DATA = { depositDateTime: "", accountNo: "", amount: "" };
  const [depositData, setDepositData] = useState(EMPTY_DEPOSIT_DATA);
  const [depositSlipStatus, setDepositSlipStatus] =
    useState<SlipUploadStatus>("idle");
  const [depositSlipFile, setDepositSlipFile] = useState<File | null>(null);
  const [depositSlipPreviewUrl, setDepositSlipPreviewUrl] = useState<
    string | undefined
  >(undefined);
  const [depositSlipError, setDepositSlipError] = useState<string | undefined>(
    undefined,
  );

  const mockDepositSlipOCR = async (_file: File) => {
    return new Promise<typeof depositData & { bankCode: string }>((resolve) => {
      setTimeout(() => {
        resolve({
          depositDateTime: "2026-07-16T09:30",
          accountNo: "2010073262",
          amount: selectedDRS ? String(parseCurrency(selectedDRS.Amount)) : "",
          bankCode: "124",
        });
      }, 2000);
    });
  };

  const processDepositSlipFile = async (file: File) => {
    setDepositSlipFile(file);
    setDepositSlipPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
    });
    setDepositData(EMPTY_DEPOSIT_DATA);
    setSelectedBank(null);
    setDepositSlipError(undefined);
    setDepositSlipStatus("processing");
    try {
      const { bankCode, ...result } = await mockDepositSlipOCR(file);
      setDepositData(result);
      setSelectedBank(
        refBankBranchData.find((b) => b.BankCode === bankCode) ?? null,
      );
      setDepositSlipStatus("completed");
      toast.success("Deposit slip details extracted!");
    } catch {
      setDepositSlipStatus("failed");
      setDepositSlipError(
        "We couldn't read this deposit slip. Please retry or choose another file.",
      );
      toast.error("Failed to process deposit slip");
    }
  };

  const handleDepositSlipFilesSelected = (files: File[]) => {
    if (!files || files.length === 0) return;
    void processDepositSlipFile(files[0]);
  };

  const handleDepositSlipRetry = () => {
    if (depositSlipFile) void processDepositSlipFile(depositSlipFile);
  };

  const handleDepositSlipRemove = () => {
    if (depositSlipPreviewUrl) URL.revokeObjectURL(depositSlipPreviewUrl);
    setDepositSlipFile(null);
    setDepositSlipPreviewUrl(undefined);
    setDepositSlipError(undefined);
    setDepositSlipStatus("idle");
    setDepositData(EMPTY_DEPOSIT_DATA);
    setSelectedBank(null);
  };

  const { messageBox } = useMessageDialog();
  const handleConfirm = async () => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to Save Deposit?",
      confirmText: "Ok",
      variant: "confirmation",
    });

    if (confirmed) {
      const isSuccess = await messageBox({
        title: "SUCCESS",
        message: "Deposit Successfully Saved.",
        confirmText: "Ok",
        variant: "success",
      });
      if (isSuccess) {
        router.push("/payment/viewvalidated-deposit");
        toast.success("Deposit Successfully Saved.");
      }
    }
  };

  return (
    <Page.Root
      title="Encode Validated Deposit"
      description="Encode your validated deposit"
      headerButton="menu"
    >
      <Page.MainContent>
        <Flex flexDir="column" gap={4}>
          {/* SECTION 1 — Find DRS */}
          <Flex justify="flex-end">
            <Box
              maxW={{ base: "full", md: "sm" }}
              w={{ base: "full", md: "sm" }}
            >
              <LookupField<DepositHdr>
                label=""
                placeholder="Search Digital Remittance Slip"
                modalTitle="Search Digital Remittance Slip"
                columns={drsColumns}
                dataSource={drsItems}
                searchKeys={["id", "name", "DepositDateTime"]}
                onSelect={(e) => {
                  if (!e) {
                    setSelectedDRS(null);
                    return;
                  }
                  if (drsItems[0].id === e.id) {
                    setSelectedDRS(e);
                    setSearchOpen(false);
                  } else {
                    toast.error("Please encode the first created DRS");
                  }
                }}
                renderDisplay={(x) => `${x.name} (${x.Amount})`}
                value={selectedDRS}
              />
            </Box>
          </Flex>

          {/* SECTION 2 — Deposit Details */}
          <CardAccordion
            activeIcon={<LuBanknote size={16} />}
            title="Deposit Details"
            subtitle={selectedDRS ? selectedDRS.name : "Select a DRS first"}
          >
            {!selectedDRS ? (
              <EmptyStateCard
                title="No DRS Selected"
                description="Search and select a Digital Remittance Slip to start entering deposit details."
              />
            ) : (
              <>
                <SlipUpload
                  documentLabel="deposit slip"
                  status={depositSlipStatus}
                  fileName={depositSlipFile?.name}
                  fileSize={depositSlipFile?.size}
                  previewUrl={depositSlipPreviewUrl}
                  error={depositSlipError}
                  extractedCount={
                    Object.values(depositData).filter(Boolean).length +
                    (selectedBank ? 1 : 0)
                  }
                  onFilesSelected={handleDepositSlipFilesSelected}
                  onRetry={handleDepositSlipRetry}
                  onRemove={handleDepositSlipRemove}
                />

                {depositSlipStatus === "completed" && (
                  <>
                    <SimpleGrid
                      columns={{ base: 1, sm: 2, lg: 3 }}
                      gapX={2}
                      gapY={3}
                      mt={3}
                    >
                      <FloatingLabelInput
                        type="datetime-local"
                        id="depositdate"
                        label="Deposit Date Time"
                        value={depositData.depositDateTime}
                        onChange={(e) =>
                          setDepositData((prev) => ({
                            ...prev,
                            depositDateTime: e.target.value,
                          }))
                        }
                      />
                      <FloatingLabelInput
                        type="number"
                        id="AccountNo"
                        label="Account number"
                        value={depositData.accountNo}
                        onChange={(e) =>
                          setDepositData((prev) => ({
                            ...prev,
                            accountNo: e.target.value,
                          }))
                        }
                      />
                      <Flex alignItems="center">
                        <LookupField<refBankBranch>
                          variant="dropdown"
                          label=""
                          placeholder="Bank Branch"
                          modalTitle="Search Bank Branch"
                          columns={bankBranchColumns}
                          dataSource={refBankBranchData}
                          searchKeys={["BankCode", "BankBranch"]}
                          onSelect={setSelectedBank}
                          renderDisplay={(b) =>
                            `${b.BankCode} (${b.BankBranch})`
                          }
                          value={selectedBank}
                        />
                      </Flex>
                      <FloatingLabelInput
                        type="number"
                        id="Amount"
                        label="Deposited Amount"
                        value={depositData.amount}
                        onChange={(e) =>
                          setDepositData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                      <Flex alignItems="center">
                        <LookupField<Employee>
                          variant="dropdown"
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
                      </Flex>
                    </SimpleGrid>

                    {(() => {
                      const expectedAmount = parseCurrency(selectedDRS.Amount);
                      const depositedAmount = parseCurrency(depositData.amount);
                      const variance = depositedAmount - expectedAmount;
                      const status: keyof typeof DEPOSIT_STATUS_META =
                        Math.abs(variance) < 0.01
                          ? "exact"
                          : variance < 0
                            ? "short"
                            : "excess";
                      const meta = DEPOSIT_STATUS_META[status];

                      const varianceColor =
                        status === "exact"
                          ? "green.600"
                          : status === "short"
                            ? "red.500"
                            : "yellow.600";

                      return (
                        <Box mt={3}>
                          <Card.Root title="Deposit Verification">
                            <Card.MainContent>
                              {/* Mobile — stacked rows */}
                              <Flex
                                direction="column"
                                gap={2}
                                display={{ base: "flex", md: "none" }}
                              >
                                <Flex justify="space-between" fontSize="sm">
                                  <Text color="gray.500">Expected Amount</Text>
                                  <Text fontWeight="medium">
                                    {formatCurrency(expectedAmount)}
                                  </Text>
                                </Flex>
                                <Flex justify="space-between" fontSize="sm">
                                  <Text color="gray.500">Deposited Amount</Text>
                                  <Text fontWeight="medium">
                                    {formatCurrency(depositedAmount)}
                                  </Text>
                                </Flex>
                                <Flex
                                  justify="space-between"
                                  align="center"
                                  mt={2}
                                  pt={2}
                                  borderTop="1px solid"
                                  borderColor="gray.200"
                                >
                                  <Flex align="center" gap={2}>
                                    <Text fontSize="sm" fontWeight="medium">
                                      Variance
                                    </Text>
                                    <OSPBadge type={meta.badgeType}>
                                      {meta.label}
                                    </OSPBadge>
                                  </Flex>
                                  <Text
                                    fontSize="md"
                                    fontWeight="bold"
                                    color={varianceColor}
                                  >
                                    {variance > 0 ? "+" : ""}
                                    {formatCurrency(variance)}
                                  </Text>
                                </Flex>
                              </Flex>

                              {/* Desktop — 3-column grid */}
                              <Grid
                                templateColumns="repeat(3, 1fr)"
                                gap={4}
                                display={{ base: "none", md: "grid" }}
                              >
                                <MetaItem
                                  label="Expected Amount"
                                  value={formatCurrency(expectedAmount)}
                                />
                                <MetaItem
                                  label="Deposited Amount"
                                  value={formatCurrency(depositedAmount)}
                                />
                                <MetaItem
                                  label="Variance"
                                  value={`${variance > 0 ? "+" : ""}${formatCurrency(variance)}`}
                                  valueColor={varianceColor}
                                >
                                  <OSPBadge type={meta.badgeType} mt={1}>
                                    {meta.label}
                                  </OSPBadge>
                                </MetaItem>
                              </Grid>
                            </Card.MainContent>
                          </Card.Root>
                        </Box>
                      );
                    })()}
                  </>
                )}

                <Box mt={4}>
                  <DrsDataTable
                    payments={samplePayments}
                    onRowClick={(row) => {}}
                  />
                  <Box display={{ base: "block", md: "none" }}>
                    <DrsPaymentSummary totals={totals} displayProp={true} />
                  </Box>
                </Box>

                <Flex gap={3} mt={4} justify="flex-end" flexWrap="wrap">
                  <Box
                    w={{ base: "full", md: "1/12" }}
                    minW={{ base: "full", md: "-webkit-fit-content" }}
                  >
                    <PrimaryMdFlexButton onClick={handleConfirm}>
                      SAVE
                    </PrimaryMdFlexButton>
                  </Box>
                </Flex>
              </>
            )}
          </CardAccordion>
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
}
