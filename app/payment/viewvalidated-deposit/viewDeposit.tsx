"use client";

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { LuBanknote, LuChevronRight, LuLayoutList } from "react-icons/lu";

import {
  Body,
  CancelSolidButton,
  DeleteSolidButton,
  InputFloatingLabel,
  SaveButton,
} from "st-peter-ui";
import { depositHDR, samplePayments } from "../data/paymentDetails";
import { useEffect, useMemo, useState } from "react";

import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";
import { Employee } from "@/data/doc-management/employeeSelector";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import DrsDataTable from "../components/drsDataTable";
import DrsPaymentSummary from "../components/drsPaymentSummary";
import { DrsFunction } from "../utils/drsFunction";
import Page from "@/claude components/layout/page/Page";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { OSPBadge } from "@/components/common/badge/badge";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { Card } from "@/claude components/card-accordion/card";
import { RowItem } from "@/claude components/info-card/row-item";

const STATUS_STYLES: Record<
  string,
  { colorPalette: "warning" | "success" | "info"; dotColor: string }
> = {
  Pending: { colorPalette: "warning", dotColor: "yellow.500" },
  Validated: { colorPalette: "success", dotColor: "green.500" },
  "For Deposit": { colorPalette: "info", dotColor: "blue.500" },
};

export default function ViewDeposit() {
  const { totals } = DrsFunction(samplePayments);
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

  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const showStrip = collapsed && !isMobile;
  const showBody = !collapsed;

  return (
    <Page.Root
      title="View Validated Deposit"
      description="Review your validated deposit"
      headerButton="menu"
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
          <GridItem minW={0} overflow="hidden" h="full">
            {showStrip ? (
              <Box
                w="full"
                p={1}
                borderRadius="2xl"
                bg="white"
                shadow="sm"
                overflow="hidden"
                h="full"
              >
                <Flex direction="column" align="center" gap={3} py={2} h="full">
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
              </Box>
            ) : (
              <InfoCardAccordion
                icon={<LuLayoutList size={16} />}
                title="Validated Deposits"
                subtitle={`${sortedDrsItems.length} deposit(s)`}
                isOpen={showBody}
                onToggle={() => setCollapsed((p) => !p)}
              >
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
                        borderColor={isSelected ? "green.300" : "border"}
                        bg={isSelected ? "green.50" : "bg"}
                        borderLeftWidth={isSelected ? "4px" : "1px"}
                        borderLeftColor={isSelected ? "green.500" : "border"}
                        p={3}
                        transition="all 0.15s"
                        _hover={{ borderColor: "green.300", bg: "green.50" }}
                      >
                        <Flex justify="space-between" align="start" gap={2}>
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
              </InfoCardAccordion>
            )}
          </GridItem>

          {/* RIGHT PANEL */}
          <GridItem h="full" overflow="hidden">
            <Card
              activeIcon={<LuBanknote size={16} />}
              title="Deposit Details"
              subtitle={
                selectedItem
                  ? `${selectedItem.name} · ${selectedItem.Status ?? (selectedItem.isApproved ? "Validated" : "Pending")}`
                  : "Select a deposit to view details"
              }
            >
              {!selectedId && (
                <EmptyStateCard
                  title="No Deposit Selected"
                  description="Select a deposit from the left to view details"
                />
              )}

              {selectedId && (
                <>
                  <RowItem
                    label="Date/Time"
                    value={selectedItem?.DepositDateTime ?? ""}
                  />
                  <RowItem label="Amount" value={selectedItem?.Amount ?? "0"} />
                  <RowItem
                    label="Account No"
                    value={selectedItem?.AccountNo ?? ""}
                  />
                  <RowItem
                    label="Bank Branch"
                    value={selectedItem?.BankBranch ?? ""}
                  />
                  <RowItem
                    label="Bank Code"
                    value={selectedItem?.BankCode ?? ""}
                  />
                  <RowItem
                    label="Deposited By"
                    value={selectedItem?.DepositedBy || "-"}
                  />

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
                    <Box display={{ base: "block", md: "none" }}>
                      <DrsPaymentSummary totals={totals} displayProp />
                    </Box>
                  </Box>

                  <Separator my={3} />

                  <Flex justify="end">
                    <DeleteSolidButton />
                  </Flex>
                </>
              )}
            </Card>
          </GridItem>
        </Grid>

        {/* Encode Supplementary Dialog */}
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
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gapX={2}>
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
