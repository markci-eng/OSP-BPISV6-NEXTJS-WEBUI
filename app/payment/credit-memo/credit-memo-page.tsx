"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Badge,
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Input,
  NativeSelect,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Plus, Search } from "lucide-react";
import { BatchHeaderForm } from "./components/BatchHeaderForm";
import { DepositForm } from "./components/DepositForm";
import { DepositList } from "./components/DepositList";
import { PaymentTable } from "./components/PaymentTable";
import { PlanholderLookup } from "./components/PlanholderLookup";
import { SummaryPanel } from "./components/SummaryPanel";
import {
  BatchInfo,
  Deposit,
  Payment,
  Attachment,
  Planholder,
  getDepositStatus,
} from "./components/types";
import DocumentUploader from "@/components/document-uploader/DragAndDrop";

const MotionBox = motion.create(Box);

const sectionVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: "auto", marginTop: 24 },
};

const PAY_CLASSES = ["Monthly", "Quarterly", "Semi-Annual", "Annual"] as const;

export default function CreditMemoPage() {
  const [batch, setBatch] = React.useState<BatchInfo>({
    batchNo: "",
    type: "",
    subtype: "",
    description: "",
  });

  const [deposits, setDeposits] = React.useState<Deposit[]>([]);
  const [selectedDepositId, setSelectedDepositId] = React.useState<
    string | null
  >(null);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [lookupOpen, setLookupOpen] = React.useState(false);
  const [selectedPlanholder, setSelectedPlanholder] =
    React.useState<Planholder | null>(null);

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
  const totalPayments = payments.reduce(
    (sum, p) => sum + p.amount + p.charges,
    0,
  );

  const handleAddDeposit = (deposit: Deposit) => {
    setDeposits((prev) => [...prev, deposit]);
    setSelectedDepositId(deposit.id);
    toast.success("Deposit added");
  };

  const handleRemoveDeposit = (id: string) => {
    setDeposits((prev) => prev.filter((d) => d.id !== id));

    if (selectedDepositId === id) {
      setSelectedDepositId(null);
    }

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
    setPaymentForm({
      siNumber: "",
      siDate: "",
      installments: 1,
      amount: 0,
      payClass: "",
      charges: 0,
    });
    setSelectedPlanholder(null);
    toast.success("Payment added");
  };

  const handleReset = () => {
    setBatch({
      batchNo: "",
      type: "",
      subtype: "",
      description: "",
    });
    setDeposits([]);
    setSelectedDepositId(null);
    setPayments([]);
    setAttachments([]);
    setSelectedPlanholder(null);
    setPaymentForm({
      siNumber: "",
      siDate: "",
      installments: 1,
      amount: 0,
      payClass: "",
      charges: 0,
    });
    toast.info("Form reset");
  };

  const handleSave = () => {
    toast.success("Batch saved as draft");
  };

  const handleSubmit = () => {
    if (!batch.batchNo || !batch.type) {
      toast.error("Please complete the batch header");
      return;
    }

    if (depositStatus === "required" && deposits.length === 0) {
      toast.error("At least one deposit is required");
      return;
    }

    toast.success("Credit Memo submitted");
  };

  const selectedDeposit = deposits.find((d) => d.id === selectedDepositId);

  return (
    <Box minH="100vh" bg="bg.subtle">
      {/* Top Bar */}
      <Box
        as="header"
        borderBottomWidth="1px"
        borderColor="border.muted"
        bg="bg"
      >
        <HStack
          maxW="1440px"
          mx="auto"
          px={{ base: 4, md: 6 }}
          py={4}
          justify="space-between"
          align="center"
        >
          <Box>
            <Text fontSize="lg" fontWeight="semibold" letterSpacing="tight">
              Credit Memo
            </Text>
            <Text fontSize="xs" color="fg.muted" mt="0.5">
              CMDM Module · Special Remittances
            </Text>
          </Box>

          <Text
            fontSize="xs"
            color="fg.muted"
            fontVariantNumeric="tabular-nums"
          >
            {batch.batchNo || "—"}
          </Text>
        </HStack>
      </Box>

      <Box maxW="1440px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
        <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={6}>
          {/* Main Column */}
          <GridItem colSpan={{ base: 1, lg: 8 }}>
            <VStack align="stretch" gap={6}>
              <BatchHeaderForm batch={batch} onChange={setBatch} />

              <AnimatePresence>
                {showDeposits && (
                  <MotionBox
                    key="deposits"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={sectionVariants}
                    transition={{
                      duration: 0.2,
                      ease: [0.2, 0, 0, 1] as const,
                    }}
                    overflow="hidden"
                  >
                    <Box
                      bg="bg"
                      borderWidth="1px"
                      borderColor="border.muted"
                      rounded="xl"
                      p={6}
                      boxShadow="sm"
                    >
                      <HStack
                        justify="space-between"
                        mb={4}
                        wrap="wrap"
                        gap={2}
                      >
                        <Text fontSize="lg" fontWeight="semibold">
                          Deposits
                        </Text>

                        {depositStatus === "required" &&
                          deposits.length === 0 && (
                            <Badge colorPalette="blue" variant="subtle">
                              Required
                            </Badge>
                          )}
                      </HStack>

                      <DepositList
                        deposits={deposits}
                        selectedId={selectedDepositId}
                        onSelect={setSelectedDepositId}
                        onRemove={handleRemoveDeposit}
                      />

                      <Box
                        mt={4}
                        pt={4}
                        borderTopWidth="1px"
                        borderColor="border.muted"
                      >
                        <Text fontSize="sm" fontWeight="medium" mb={3}>
                          New Deposit
                        </Text>
                        <DepositForm onAdd={handleAddDeposit} />
                      </Box>
                    </Box>
                  </MotionBox>
                )}
              </AnimatePresence>

              {/* Payment Entry */}
              <Box
                bg="bg"
                borderWidth="1px"
                borderColor="border.muted"
                rounded="xl"
                p={6}
                boxShadow="sm"
              >
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Payment Entry
                </Text>

                {/* Planholder Lookup */}
                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="medium" mb={1.5}>
                    Planholder
                  </Text>

                  <HStack mt={1.5} gap={2}>
                    <Button
                      variant="outline"
                      justifyContent="flex-start"
                      fontWeight="normal"
                      w="full"
                      onClick={() => setLookupOpen(true)}
                    >
                      <Search size={16} />
                      {selectedPlanholder
                        ? selectedPlanholder.name
                        : "Search planholder..."}
                    </Button>
                  </HStack>

                  {selectedPlanholder && (
                    <MotionBox
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      mt={2}
                      p={3}
                      rounded="lg"
                      bg="bg.muted"
                      fontSize="sm"
                    >
                      <Text>
                        <Text as="span" color="fg.muted">
                          Policy:
                        </Text>{" "}
                        {selectedPlanholder.policyNo}
                        <Text as="span" ml={4} color="fg.muted">
                          Plan:
                        </Text>{" "}
                        {selectedPlanholder.plan}
                        <Text as="span" ml={4} color="fg.muted">
                          Status:
                        </Text>{" "}
                        <Text
                          as="span"
                          color={
                            selectedPlanholder.status === "Active"
                              ? "green.600"
                              : "red.500"
                          }
                          fontWeight="medium"
                        >
                          {selectedPlanholder.status}
                        </Text>
                      </Text>
                    </MotionBox>
                  )}
                </Box>

                {/* Payment Fields */}
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    xl: "repeat(3, 1fr)",
                  }}
                  gap={4}
                  mb={4}
                >
                  <Field label="SI Number">
                    <Input
                      fontVariantNumeric="tabular-nums"
                      value={paymentForm.siNumber}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          siNumber: e.target.value,
                        }))
                      }
                      placeholder="e.g. SI-001"
                    />
                  </Field>

                  <Field label="SI Date">
                    <Input
                      type="date"
                      value={paymentForm.siDate}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          siDate: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field label="No. of Installments">
                    <Input
                      type="number"
                      min={1}
                      fontVariantNumeric="tabular-nums"
                      value={paymentForm.installments}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          installments: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </Field>

                  <Field label="Amount">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      fontVariantNumeric="tabular-nums"
                      value={paymentForm.amount || ""}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          amount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </Field>

                  <Field label="Pay Class">
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={paymentForm.payClass}
                        onChange={(e) =>
                          setPaymentForm((f) => ({
                            ...f,
                            payClass: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select</option>
                        {PAY_CLASSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field>

                  <Field label="Charges (Optional)">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      fontVariantNumeric="tabular-nums"
                      value={paymentForm.charges || ""}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          charges: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </Field>
                </Grid>

                {deposits.length > 0 && selectedDepositId && (
                  <Text fontSize="xs" color="fg.muted" mb={3}>
                    Payment will be linked to selected deposit (
                    {selectedDeposit?.bankName}).
                  </Text>
                )}

                <Button onClick={handleAddPayment} size="sm">
                  <Plus size={16} />
                  Add to List
                </Button>

                <Box mt={5}>
                  <PaymentTable
                    payments={payments}
                    onRemove={(id) =>
                      setPayments((prev) => prev.filter((p) => p.id !== id))
                    }
                  />
                </Box>
              </Box>

              {/* Attachments */}
              <Box
                bg="bg"
                borderWidth="1px"
                borderColor="border.muted"
                rounded="xl"
                p={6}
                boxShadow="sm"
              >
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Attachments
                </Text>

                {/* <FileUploader
                  attachments={attachments}
                  onAdd={(newFiles) =>
                    setAttachments((prev) => [...prev, ...newFiles])
                  }
                  onRemove={(id) =>
                    setAttachments((prev) => prev.filter((a) => a.id !== id))
                  }
                /> */}
                <DocumentUploader />
              </Box>
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
      </Box>

      <PlanholderLookup
        open={lookupOpen}
        onClose={() => setLookupOpen(false)}
        onSelect={setSelectedPlanholder}
      />
    </Box>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <VStack align="stretch" gap={1.5}>
      <Text fontSize="sm" fontWeight="medium">
        {label}
      </Text>
      {children}
    </VStack>
  );
}
