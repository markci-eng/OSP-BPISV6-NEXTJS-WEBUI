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
  Portal,
  Separator,
  SimpleGrid,
  Strong,
  Table,
  TableScrollArea,
  VStack,
} from "@chakra-ui/react";

import {
  Body,
  Breadcrumb,
  CancelSolidButton,
  DeleteSolidButton,
  DeleteSolidSmButton,
  H3,
  InputFloatingLabel,
  SaveButton,
} from "st-peter-ui";
import { depositHDR, samplePayments } from "../data/paymentDetails";
import { useMemo, useState } from "react";
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
import { Page } from "@/components/page/page";
import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import LabelText from "@/components/texts/LabelText";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_BUTTON_STYLES,
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

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

  const breadCrumb = [
    {
      label: "Home",
    },
    {
      label: "Payment",
    },
    {
      label: "View Encode Validated Deposit Slip",
    },
  ];
  return (
    <Page
      breadcrumbItems={breadCrumb}
      title={"View Validated Deposit"}
      description="Review encoded validated deposit slips and related remittance details."
    >
      <Grid
        gap={{ base: 4, lg: 5 }}
        templateColumns={{
          base: "1fr",
          lg: "380px 1fr",
          xl: "420px 1fr",
        }}
        alignItems="start"
      >
        {/* LEFT TABLE */}
        <GridItem minW={0} overflow="hidden" h={"full"}>
          <Card.Root>
            <Card.MainContent>
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

              <TableScrollArea
                maxH={{ base: "350px", md: "420px", lg: "500px" }}
              >
                <Table.Root
                  size="sm"
                  variant="outline"
                  interactive
                  stickyHeader
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Deposit Date Time</Table.ColumnHeader>
                      <Table.ColumnHeader>DRS Reference No</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">
                        Amount
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {sortedDrsItems.map((item) => (
                      <Table.Row
                        key={item.id}
                        cursor="pointer"
                        data-selected={selectedId === item.id ? "" : undefined}
                        onClick={() => setSelectedId(item.id)}
                        _selected={{
                          bg: BRAND_COLORS.successBg,
                          borderLeft: "4px solid",
                          borderColor: BRAND_COLORS.primaryGreen,
                        }}
                      >
                        <Table.Cell>{item.DepositDateTime}</Table.Cell>
                        <Table.Cell>{item.name}</Table.Cell>
                        <Table.Cell textAlign="end">{item.Amount}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </TableScrollArea>
            </Card.MainContent>
          </Card.Root>
        </GridItem>

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
                  {/* INFO GRID */}
                  <SimpleGrid
                    columns={{
                      base: 1,
                      sm: 2,
                      md: 3,
                      lg: 4,
                    }}
                    gap={3}
                  >
                    <LabelText
                      label="Deposit Date Time"
                      value={selectedItem?.DepositDateTime.toString() ?? ""}
                    />
                    <LabelText
                      label="DRS Reference No"
                      value={selectedItem?.name ?? ""}
                    />
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
                      label="Amount"
                      value={selectedItem?.Amount ?? "0"}
                    />
                    <LabelText
                      label="Deposited By"
                      value={selectedItem?.DepositedBy || "-"}
                    />
                  </SimpleGrid>

                  <Flex justify={{ base: "stretch", md: "end" }} mt={4}>
                    <Button
                      w={{ base: "full", md: "auto" }}
                      bg={BRAND_COLORS.primaryGreen}
                      color={BRAND_COLORS.white}
                      _hover={{ bg: BRAND_COLORS.darkGreen }}
                      {...STANDARD_BUTTON_STYLES.md}
                      onClick={() => setOpen(true)}
                    >
                      Encode Supplementary
                    </Button>
                  </Flex>

                  <Box my={{ base: 4, md: 5 }}>
                    <DrsDataTable
                      payments={samplePayments}
                      onRowClick={(row) => console.log("Clicked row:", row)}
                    />

                    {/* Mobile summary */}
                    <Box display={{ base: "block", md: "none" }}>
                      <DrsPaymentSummary totals={totals} displayProp />
                    </Box>
                  </Box>

                  <Separator my={4} />

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
      <Dialog.Root open={open} size="xl" placement="center">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              borderRadius={STANDARD_RADIUS.lg}
              boxShadow={STANDARD_SHADOWS.level3}
            >
              <Dialog.Header>
                <Dialog.Title>Encode Supplementary - {selectedId}</Dialog.Title>
              </Dialog.Header>

              <Separator />

              <Dialog.Body>
                <SimpleGrid
                  columns={{
                    base: 1,
                    sm: 2,
                    md: 3,
                  }}
                  columnGap={4}
                  rowGap={3}
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
    </Page>
  );
}
