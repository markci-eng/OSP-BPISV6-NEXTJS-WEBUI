"use client";

import InfoItem from "@/components/common/info-item/info-item";

import {
  Box,
  Button,
  CloseButton,
  Collapsible,
  Dialog,
  EmptyState,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Strong,
  Table,
  TableScrollArea,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuChevronUp,
} from "react-icons/lu";

import {
  Body,
  Breadcrumb,
  CancelSolidButton,
  DeleteSolidButton,
  DeleteSolidSmButton,
  H3,
  InputFloatingLabel,
  SaveButton,
  Small,
} from "st-peter-ui";
import { depositHDR, samplePayments } from "../data/paymentDetails";
import { DepositHdr } from "../data/payment.types";
import { useEffect, useMemo, useState } from "react";
import DataTable from "@/components/common/reusable-tableV2/DataTable";

import { SearchEmployeeDialog } from "@/components/common/employee-lookup/search-employee-dialog";
import { LuShoppingCart } from "react-icons/lu";
import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";
import { Employee } from "@/data/doc-management/employeeSelector";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import DrsDataTable from "../components/drsDataTable";
import DrsPaymentSummary from "../components/drsPaymentSummary";
import { DrsFunction } from "../utils/drsFunction";
import Page from "@/components/layout/page/Page";
import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import LabelText from "@/components/texts/LabelText";
import { OSPBadge } from "@/components/common/badge/badge";

const STATUS_STYLES: Record<
  string,
  { colorPalette: "warning" | "success" | "info"; dotColor: string }
> = {
  Pending: { colorPalette: "warning", dotColor: "yellow.500" },
  Validated: { colorPalette: "success", dotColor: "green.500" },
  "For Deposit": { colorPalette: "info", dotColor: "blue.500" },
};

export default function ViewDeposit() {
  const { rows, totals } = DrsFunction(samplePayments);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedDrsItems = useMemo(() => {
    return [...depositHDR].sort((a, b) => Number(b.id) - Number(a.id));
  }, []);

  const selectedItem = useMemo(() => {
    return sortedDrsItems.find((item) => item.id === selectedId);
  }, [selectedId, sortedDrsItems]);
  const [open, setOpen] = useState(false);

  const employeeColumns: LookupColumn<Employee>[] = [
    { key: "id", header: "Employee ID" },
    { key: "name", header: "Name" },
    { key: "branch", header: "Branch" },
  ];
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  // ── Collapsible panel state ──
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const [collapsed, setCollapsed] = useState(false);

  // Mobile defaults to collapsed (accordion closed); desktop defaults to open.
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const showStrip = collapsed && !isMobile; // desktop minimized rail
  const showBody = !collapsed;

  return (
    <Page.Root
      title={"View Validated Deposit"}
      description="Review your validated deposit"
    >
      <Page.MainContent>
        <Grid
          gap={{ base: 4, lg: 6 }}
          templateColumns={{
            base: "1fr",
            lg: showStrip ? "56px 1fr" : "380px 1fr",
            xl: showStrip ? "56px 1fr" : "420px 1fr",
          }}
          alignItems="start"
          transition="grid-template-columns 0.3s ease"
        >
          {/* LEFT PANEL */}
          <Card.Root>
            <Card.MainContent>
              <GridItem minW={0} overflow="hidden" h={"full"}>
                {showStrip ? (
                  /* ── DESKTOP COLLAPSED RAIL ── */
                  <Flex
                    direction="column"
                    align="center"
                    gap={3}
                    py={1}
                    h="full"
                  >
                    <IconButton
                      aria-label="Expand deposits panel"
                      size="sm"
                      variant="ghost"
                      onClick={() => setCollapsed(false)}
                    >
                      <LuChevronRight />
                    </IconButton>
                    <OSPBadge type="success">{sortedDrsItems.length}</OSPBadge>
                    <Body
                      fontWeight="semibold"
                      fontSize="sm"
                      color="fg.muted"
                      css={{ writingMode: "vertical-rl" }}
                      transform="rotate(180deg)"
                      whiteSpace="nowrap"
                    >
                      Validated Deposits
                    </Body>
                  </Flex>
                ) : (
                  <>
                    {/* HEADER */}
                    <Flex align="center" justify="space-between" gap={2} mb={3}>
                      <Flex align="center" gap={2} minW={0}>
                        <Heading size="md" lineClamp={1}>
                          Validated Deposits
                        </Heading>
                        <OSPBadge type="success">
                          {sortedDrsItems.length}
                        </OSPBadge>
                      </Flex>
                      <IconButton
                        aria-label={
                          collapsed
                            ? "Expand deposits panel"
                            : "Collapse deposits panel"
                        }
                        size="sm"
                        variant="ghost"
                        flexShrink={0}
                        onClick={() => setCollapsed((prev) => !prev)}
                      >
                        {isMobile ? (
                          collapsed ? (
                            <LuChevronDown />
                          ) : (
                            <LuChevronUp />
                          )
                        ) : (
                          <LuChevronLeft />
                        )}
                      </IconButton>
                    </Flex>

                    <AnimatePresence initial={false}>
                      {showBody && (
                        <motion.div
                          key="deposit-panel-body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          {/* SEARCH — reusable lookup */}
                          <Box mb={3}>
                            <LookupField<Employee>
                              label=""
                              placeholder="Search by name or ID..."
                              modalTitle="Search Employee"
                              columns={employeeColumns}
                              dataSource={EMPLOYEES}
                              searchKeys={["id", "name", "branch"]}
                              onSelect={setSelectedEmployee}
                              renderDisplay={(emp) => `${emp.name} (${emp.id})`}
                              value={selectedEmployee}
                            />
                          </Box>

                          {/* CARD LIST */}
                          <Stack
                            gap={2}
                            maxH={{ base: "360px", md: "450px", xl: "520px" }}
                            overflowY="auto"
                            pr={1}
                          >
                            {sortedDrsItems.map((item) => {
                              const isSelected = selectedId === item.id;
                              const status =
                                item.Status ??
                                (item.isApproved ? "Validated" : "Pending");
                              const styles =
                                STATUS_STYLES[status] ?? STATUS_STYLES.Pending;

                              return (
                                <Box
                                  key={item.id}
                                  role="button"
                                  onClick={() => setSelectedId(item.id)}
                                  cursor="pointer"
                                  position="relative"
                                  borderWidth="1px"
                                  borderRadius="lg"
                                  borderColor={
                                    isSelected ? "green.300" : "border"
                                  }
                                  bg={isSelected ? "green.50" : "bg"}
                                  borderLeftWidth={isSelected ? "4px" : "1px"}
                                  borderLeftColor={
                                    isSelected ? "green.500" : "border"
                                  }
                                  p={3}
                                  transition="all 0.15s"
                                  _hover={{
                                    borderColor: "green.300",
                                    bg: "green.50",
                                  }}
                                >
                                  <Flex
                                    justify="space-between"
                                    align="start"
                                    gap={2}
                                  >
                                    <Text
                                      fontWeight="bold"
                                      color="green.700"
                                      fontSize="sm"
                                    >
                                      {item.name}
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      color="green.700"
                                      fontSize="sm"
                                      whiteSpace="nowrap"
                                    >
                                      {item.Amount}
                                    </Text>
                                  </Flex>

                                  <Flex
                                    justify="space-between"
                                    align="center"
                                    mt={2}
                                    gap={2}
                                  >
                                    <Text fontSize="xs" color="fg.muted">
                                      {item.DepositDateTime}
                                    </Text>

                                    <OSPBadge type={styles.colorPalette}>
                                      {status}
                                    </OSPBadge>
                                  </Flex>
                                </Box>
                              );
                            })}
                          </Stack>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </GridItem>
            </Card.MainContent>
          </Card.Root>

          {/* RIGHT DETAILS */}
          <GridItem h="full" overflow="hidden">
            <Card.Root>
              <Card.MainContent>
                {!selectedItem && (
                  <EmptyStateCard
                    title={"No Deposit Selected"}
                    description="  Select a Deposit from the left to view details"
                  />
                )}

                <Collapsible.Root open={selectedItem != null}>
                  <Collapsible.Content>
                    {/* HEADER — reference, status & amount */}
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      align={{ base: "start", sm: "center" }}
                      gap={3}
                      pb={3}
                      borderBottomWidth="1px"
                    >
                      <Box minW={0}>
                        <Flex align="center" gap={2}>
                          <Heading size="md" lineClamp={1} fontWeight="bold">
                            {selectedItem?.name}
                          </Heading>
                          <OSPBadge
                            type={
                              (selectedItem?.Status &&
                                STATUS_STYLES[selectedItem.Status]
                                  ?.colorPalette) ??
                              (selectedItem?.isApproved ? "success" : "warning")
                            }
                          >
                            {selectedItem?.Status ??
                              (selectedItem?.isApproved
                                ? "Validated"
                                : "Pending")}
                          </OSPBadge>
                        </Flex>
                        <Small fontWeight="semibold" color="fg.muted" mt={1}>
                          {selectedItem?.DepositDateTime}
                        </Small>
                      </Box>

                      <Box textAlign={{ base: "left", sm: "right" }}>
                        <InfoItem
                          label={"Amount"}
                          value={selectedItem?.Amount ?? "0"}
                          color="green.700"
                        />
                        {/* <Text fontSize="xs" color="fg.muted">
                          Amount
                        </Text>
                        <Heading size="lg" color="green.700">
                          {selectedItem?.Amount ?? "0"}
                        </Heading> */}
                      </Box>
                    </Flex>

                    {/* INFO GRID — compact bank / deposit details */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gapY={2} mt={2}>
                      <LabelText
                        label="Account No"
                        value={selectedItem?.AccountNo ?? ""}
                      />
                      <LabelText
                        label="Bank Branch"
                        value={selectedItem?.BankBranch ?? ""}
                      />
                      <LabelText
                        label="Bank Code"
                        value={selectedItem?.BankCode ?? ""}
                      />
                      <LabelText
                        label="Deposited By"
                        value={selectedItem?.DepositedBy || "-"}
                      />
                    </SimpleGrid>

                    <Flex justify={{ base: "stretch", md: "end" }} mt={4}>
                      <Button
                        size="sm"
                        w={{ base: "full", md: "auto" }}
                        onClick={() => setOpen(true)}
                      >
                        Encode Supplementary
                      </Button>
                    </Flex>

                    <Box mt={4}>
                      <DrsDataTable
                        payments={samplePayments}
                        onRowClick={(row) => console.log("Clicked row:", row)}
                      />

                      {/* Mobile summary */}
                      <Box display={{ base: "block", md: "none" }}>
                        <DrsPaymentSummary totals={totals} displayProp />
                      </Box>
                    </Box>

                    <Separator my={3} />

                    <Flex justify="end">
                      <DeleteSolidButton />
                    </Flex>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.MainContent>
            </Card.Root>
          </GridItem>
        </Grid>

        {/* Dialog */}
        <Dialog.Root
          open={open}
          size={{ base: "full", md: "xl" }}
          placement="center"
          scrollBehavior="inside"
          motionPreset="slide-in-bottom"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner p={{ base: 0, md: undefined }}>
              <Dialog.Content
                borderRadius={{ base: 0, md: undefined }}
                h={{ base: "100dvh", md: "auto" }}
              >
                <Dialog.Header>
                  <Dialog.Title>
                    Encode Supplementary - {selectedId}
                  </Dialog.Title>
                </Dialog.Header>

                <Separator />

                <Dialog.Body>
                  <SimpleGrid
                    columns={{
                      base: 1,
                      sm: 2,
                      md: 3,
                    }}
                    gapX={2}
                  >
                    <InputFloatingLabel
                      type="date"
                      id="depositdate"
                      label="Deposit Date Time"
                    />
                    <InputFloatingLabel
                      type="number"
                      id="AccountNo"
                      label="Account No#:"
                    />
                    <InputFloatingLabel id="BankBranch" label="Bank Branch" />
                    <InputFloatingLabel id="BankCode" label="Bank Code" />
                    <InputFloatingLabel id="Amount" label="Amount" />
                    <InputFloatingLabel label="Deposited By" />
                  </SimpleGrid>
                </Dialog.Body>

                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <CancelSolidButton onClick={() => setOpen(false)} />
                  </Dialog.ActionTrigger>
                  <SaveButton />
                </Dialog.Footer>

                <Dialog.CloseTrigger asChild>
                  <CloseButton onClick={() => setOpen(false)} />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Page.MainContent>
    </Page.Root>
  );
}
