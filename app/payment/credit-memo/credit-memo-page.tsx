"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Box,
  Collapsible,
  Flex,
  Grid,
  GridItem,
  HStack,
  NativeSelect,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BatchHeaderForm } from "./components/BatchHeaderForm";
import { DepositForm } from "./components/DepositForm";
import { DepositList } from "./components/DepositList";
import { PaymentTable } from "./components/PaymentTable";
import { SummaryPanel } from "./components/SummaryPanel";
import {
  BatchInfo,
  Deposit,
  Payment,
  Planholder,
  getDepositStatus,
} from "./components/types";
import DocumentUploader from "@/components/document-uploader/DragAndDrop";
import Page from "@/components/layout/page/Page";
import Card from "@/components/cards/Card";
import {
  LookupField,
  LookupColumn,
} from "@/components/common/reusable-lookup/LookUpField";
import { InputFloatingLabel, PrimaryMdFlexButton } from "st-peter-ui";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import SectionTitle from "@/components/texts/SectionTitle";

const PAY_CLASSES = ["Monthly", "Quarterly", "Semi-Annual", "Annual"] as const;

const MOCK_PLANHOLDERS: Planholder[] = [
  { id: "PH001", name: "John A. Doe", policyNo: "POL-2024-001", plan: "Life Plus", status: "Active" },
  { id: "PH002", name: "Maria S. Cruz", policyNo: "POL-2024-002", plan: "Health Shield", status: "Active" },
  { id: "PH003", name: "James T. Santos", policyNo: "POL-2024-003", plan: "Education Plan", status: "Active" },
  { id: "PH004", name: "Ana G. Reyes", policyNo: "POL-2024-004", plan: "Retirement Fund", status: "Lapsed" },
  { id: "PH005", name: "Robert C. Lim", policyNo: "POL-2024-005", plan: "Life Plus", status: "Active" },
];

const planholderColumns: LookupColumn<Planholder>[] = [
  { key: "name", header: "Name" },
  { key: "policyNo", header: "Policy No." },
  { key: "plan", header: "Plan" },
  { key: "status", header: "Status" },
];

export default function CreditMemoPage() {
  const { messageBox } = useMessageDialog();

  const [batch, setBatch] = React.useState<BatchInfo>({
    batchNo: "",
    type: "",
    subtype: "",
    description: "",
  });
  const [deposits, setDeposits] = React.useState<Deposit[]>([]);
  const [selectedDepositId, setSelectedDepositId] = React.useState<string | null>(null);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [selectedPlanholder, setSelectedPlanholder] = React.useState<Planholder | null>(null);

  const [paymentForm, setPaymentForm] = React.useState({
    siNumber: "",
    siDate: "",
    installments: 1,
    amount: 0,
    payClass: "",
    charges: 0,
  });

  const depositStatus = getDepositStatus(batch.type);
  const showDeposits = depositStatus !== "none";
  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount + p.charges, 0);
  const selectedDeposit = deposits.find((d) => d.id === selectedDepositId);

  const handleAddDeposit = (deposit: Deposit) => {
    setDeposits((prev) => [...prev, deposit]);
    setSelectedDepositId(deposit.id);
    toast.success("Deposit added");
  };

  const handleRemoveDeposit = (id: string) => {
    setDeposits((prev) => prev.filter((d) => d.id !== id));
    if (selectedDepositId === id) setSelectedDepositId(null);
    setPayments((prev) =>
      prev.map((p) => (p.depositId === id ? { ...p, depositId: null } : p)),
    );
  };

  const handleAddPayment = () => {
    if (!selectedPlanholder || !paymentForm.siNumber || !paymentForm.amount) {
      toast.error("Please complete planholder and payment details");
      return;
    }
    if (depositStatus === "required" && deposits.length === 0) {
      toast.error("At least one deposit is required for this memo type");
      return;
    }
    const payment: Payment = {
      id: crypto.randomUUID(),
      depositId: selectedDepositId,
      planholderName: selectedPlanholder.name,
      planholderId: selectedPlanholder.id,
      siNumber: paymentForm.siNumber,
      siDate: paymentForm.siDate,
      installments: paymentForm.installments,
      amount: paymentForm.amount,
      payClass: paymentForm.payClass,
      charges: paymentForm.charges,
    };
    setPayments((prev) => [...prev, payment]);
    setPaymentForm({ siNumber: "", siDate: "", installments: 1, amount: 0, payClass: "", charges: 0 });
    setSelectedPlanholder(null);
    toast.success("Payment added");
  };

  const handleReset = async () => {
    const confirmed = await messageBox({
      title: "Reset Form",
      message: "Are you sure you want to reset all form data?",
      confirmText: "Reset",
      cancelText: "Cancel",
      variant: "warning",
    });
    if (!confirmed) return;
    setBatch({ batchNo: "", type: "", subtype: "", description: "" });
    setDeposits([]);
    setSelectedDepositId(null);
    setPayments([]);
    setSelectedPlanholder(null);
    setPaymentForm({ siNumber: "", siDate: "", installments: 1, amount: 0, payClass: "", charges: 0 });
    toast.info("Form reset");
  };

  const handleSave = () => {
    toast.success("Batch saved as draft");
  };

  const handleSubmit = async () => {
    if (!batch.batchNo || !batch.type) {
      toast.error("Please complete the batch header");
      return;
    }
    if (depositStatus === "required" && deposits.length === 0) {
      toast.error("At least one deposit is required");
      return;
    }
    const confirmed = await messageBox({
      title: "Submit Credit Memo",
      message: "Are you sure you want to submit this credit memo?",
      confirmText: "Submit",
      cancelText: "Cancel",
      variant: "warning",
    });
    if (confirmed) toast.success("Credit Memo submitted");
  };

  return (
    <Page.Root
      title="Credit Memo"
      subtitle="CMDM Module · Special Remittances"
      description="Record and process credit memo batch transactions for remittances and corrections."
    >
      <Page.ToolContent>
        {batch.batchNo && (
          <Flex
            align="center"
            px={3}
            py={1.5}
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            bg="white"
          >
            <Text fontSize="xs" color="gray.500" fontFamily="mono">
              {batch.batchNo}
            </Text>
          </Flex>
        )}
      </Page.ToolContent>

      <Page.MainContent>
        <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={5}>
          {/* Main Column */}
          <GridItem colSpan={{ base: 1, lg: 8 }}>
            <VStack align="stretch" gap={5}>
              <BatchHeaderForm batch={batch} onChange={setBatch} />

              {/* Deposits */}
              <Collapsible.Root open={showDeposits} unmountOnExit>
                <Collapsible.Content>
                  <Card.Root title="Deposits">
                    <Card.MainContent>
                      <DepositList
                        deposits={deposits}
                        selectedId={selectedDepositId}
                        onSelect={setSelectedDepositId}
                        onRemove={handleRemoveDeposit}
                      />
                      <Box mt={4} pt={4} borderTopWidth="1px" borderColor="gray.100">
                        <SectionTitle>Add Deposit</SectionTitle>
                        <Box mt={3}>
                          <DepositForm onAdd={handleAddDeposit} />
                        </Box>
                      </Box>
                    </Card.MainContent>
                  </Card.Root>
                </Collapsible.Content>
              </Collapsible.Root>

              {/* Payment Entry */}
              <Card.Root title="Payment Entry">
                <Card.MainContent>
                  <Box mb={4}>
                    <LookupField<Planholder>
                      label="Planholder"
                      placeholder="Search by name or policy number..."
                      modalTitle="Find Planholder"
                      columns={planholderColumns}
                      dataSource={MOCK_PLANHOLDERS}
                      searchKeys={["name", "policyNo"]}
                      onSelect={setSelectedPlanholder}
                      renderDisplay={(p) => `${p.name} — ${p.policyNo}`}
                      value={selectedPlanholder}
                    />
                  </Box>

                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
                    gap={4}
                    mb={4}
                  >
                    <InputFloatingLabel
                      label="SI Number"
                      value={paymentForm.siNumber}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, siNumber: e.target.value }))
                      }
                    />
                    <InputFloatingLabel
                      label="SI Date"
                      type="date"
                      value={paymentForm.siDate}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, siDate: e.target.value }))
                      }
                    />
                    <InputFloatingLabel
                      label="No. of Installments"
                      type="number"
                      value={paymentForm.installments.toString()}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          installments: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                    <InputFloatingLabel
                      label="Amount"
                      type="number"
                      value={paymentForm.amount || ""}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          amount: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                    <VStack align="stretch" gap={1.5}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Pay Class
                      </Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={paymentForm.payClass}
                          onChange={(e) =>
                            setPaymentForm((f) => ({ ...f, payClass: e.target.value }))
                          }
                        >
                          <option value="">Select</option>
                          {PAY_CLASSES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </VStack>
                    <InputFloatingLabel
                      label="Charges (Optional)"
                      type="number"
                      value={paymentForm.charges || ""}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          charges: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </Grid>

                  {deposits.length > 0 && selectedDepositId && (
                    <Text fontSize="xs" color="gray.500" mb={3}>
                      Payment will be linked to: {selectedDeposit?.bankName}
                    </Text>
                  )}

                  <HStack justify="flex-end">
                    <Box minW={{ base: "full", md: "fit-content" }}>
                      <PrimaryMdFlexButton onClick={handleAddPayment}>
                        Add to List
                      </PrimaryMdFlexButton>
                    </Box>
                  </HStack>

                  <Box mt={5}>
                    <PaymentTable
                      payments={payments}
                      onRemove={(id) =>
                        setPayments((prev) => prev.filter((p) => p.id !== id))
                      }
                    />
                  </Box>
                </Card.MainContent>
              </Card.Root>

              {/* Attachments */}
              <Card.Root title="Attachments">
                <Card.MainContent>
                  <DocumentUploader />
                </Card.MainContent>
              </Card.Root>
            </VStack>
          </GridItem>

          {/* Side Rail */}
          <GridItem colSpan={{ base: 1, lg: 4 }}>
            <SummaryPanel
              totalDeposits={totalDeposits}
              totalPayments={totalPayments}
              onSubmit={handleSubmit}
              onSave={handleSave}
              onReset={handleReset}
            />
          </GridItem>
        </Grid>
      </Page.MainContent>
    </Page.Root>
  );
}
