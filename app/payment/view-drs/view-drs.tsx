"use client";
import {
  Box,
  Button,
  Collapsible,
  Flex,
  Grid,
  GridItem,
  Table,
  TableScrollArea,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { PrimaryMdFlexButton, SecondaryMdFlexButton } from "st-peter-ui";

import { drsItems, samplePayments } from "../data/paymentDetails";
import { LuTrash } from "react-icons/lu";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DrsDataTable from "../components/drsDataTable";

import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";
import { Employee } from "@/data/doc-management/employeeSelector";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import DrsPaymentSummary from "../components/drsPaymentSummary";
import { DrsFunction } from "../utils/drsFunction";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { Page } from "@/components/page/page";
import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

export default function ViewDrs() {
  const { rows, totals } = DrsFunction(samplePayments);
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string>("");
  const [items, setItems] = useState(drsItems);
  const sortedDrsItems = useMemo(() => {
    return [...items].sort((a, b) => Number(b.id) - Number(a.id));
  }, [items]);
  const selectedItem = useMemo(
    () => items.find((x) => x.id === selectedId),
    [selectedId, items],
  );

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const employeeColumns: LookupColumn<Employee>[] = [
    { key: "id", header: "Employee ID" },
    { key: "name", header: "Name" },
    { key: "branch", header: "Department" },
  ];
  const breadCrumb = [
    {
      label: "Home",
    },
    {
      label: "Payment",
    },
    {
      label: "View Digital Remittance Slip",
    },
  ];

  //delete function
  const { messageBox } = useMessageDialog();
  const handleDelete = async (item: any) => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to delete DRS?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "confirmation",
    });

    if (!confirmed) return;

    //  perform delete
    setItems((prev) => prev.filter((x) => x.id !== item.id));

    if (selectedId === item.id) {
      setSelectedId("");
    }

    //  show success (use toast OR messageBox, not both)
    messageBox({
      title: "SUCCESS",
      message: "DRS successfully deleted.",
      confirmText: "OK",
      variant: "success",
    });

    toast.success(`Deleted ${item.name}`);
  };

  return (
    <Page
      breadcrumbItems={breadCrumb}
      title={"Digital Remittance Slip"}
      description="Search, review, and process digital remittance slips."
    >
      {/* MAIN GRID */}
      <Grid
        gap={{ base: 4, lg: 5 }}
        templateColumns={{
          base: "1fr",
          lg: "380px 1fr",
          xl: "420px 1fr",
        }}
        alignItems="start"
      >
        {/* LEFT PANEL */}
        <Card.Root>
          <Card.MainContent>
            <GridItem minW={0} bg="white" overflow="hidden" h={"full"}>
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
                maxH={{
                  base: "300px",
                  md: "450px",
                  xl: "500px",
                }}
              >
                <Table.Root
                  size="sm"
                  variant="outline"
                  interactive
                  stickyHeader
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Reference Number</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">
                        Amount
                      </Table.ColumnHeader>
                      <Table.ColumnHeader w="100px">Action</Table.ColumnHeader>
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
                        <Table.Cell>{item.name}</Table.Cell>

                        <Table.Cell textAlign="end">{item.Amount}</Table.Cell>

                        <Table.Cell>
                          {sortedDrsItems[0]?.id === item.id && (
                            <Flex gap={2} flexWrap="wrap">
                              <Button
                                size="xs"
                                variant="outline"
                                color={BRAND_COLORS.destructiveRed}
                                borderColor={BRAND_COLORS.destructiveRed}
                                borderRadius={STANDARD_RADIUS.md}
                                _hover={{
                                  bg: BRAND_COLORS.errorBg,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item);
                                }}
                              >
                                <LuTrash />
                              </Button>
                            </Flex>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </TableScrollArea>
            </GridItem>
          </Card.MainContent>
        </Card.Root>

        {/* RIGHT PANEL */}

        <GridItem bg="white" overflow="hidden" h="full">
          <Card.Root>
            <Card.MainContent>
              {!selectedId && (
                /* EMPTY STATE */
                <EmptyStateCard
                  title={"No DRS Selected"}
                  description="Select a DRS from the left to view details"
                />
              )}
              <Collapsible.Root open={selectedId != ""}>
                <Collapsible.Content>
                  <DrsDataTable
                    payments={samplePayments}
                    onRowClick={(row) => console.log("Clicked row:", row)}
                  />
                  <Box display={{ base: "block", md: "none" }}>
                    <DrsPaymentSummary totals={totals} displayProp={false} />
                  </Box>
                  {/* ACTION BUTTON */}
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justify={{ base: "flex-end" }}
                    mt={4}
                    gap={{ base: 3, xl: 4 }}
                    width="full"
                  >
                    <Box width={{ base: "full", md: "auto" }}>
                      <SecondaryMdFlexButton
                        width={{ base: "full", md: "auto" }}
                        onClick={() => {
                          const selected = items.find(
                            (x) => x.id === selectedId,
                          );

                          sessionStorage.setItem(
                            "selectedDRS",
                            JSON.stringify(selected),
                          );

                          router.push("/disbursement/comte");
                        }}
                      >
                        Add Disbursement
                      </SecondaryMdFlexButton>
                    </Box>

                    <Box width={{ base: "full", md: "auto" }}>
                      <PrimaryMdFlexButton
                        width={{ base: "full", md: "auto" }}
                        onClick={() => {
                          const selected = items.find(
                            (x) => x.id === selectedId,
                          );

                          if (!selected) return;

                          const firstCreated = drsItems[0];

                          if (selected.id !== firstCreated?.id) {
                            toast.error("Please encode the first created DRS");
                            return;
                          }

                          sessionStorage.setItem(
                            "selectedDRS",
                            JSON.stringify(selected),
                          );

                          router.push("/payment/encodevalidated-deposit");
                        }}
                      >
                        Encode Deposit
                      </PrimaryMdFlexButton>
                    </Box>
                  </Flex>
                </Collapsible.Content>
              </Collapsible.Root>
            </Card.MainContent>
          </Card.Root>
        </GridItem>
      </Grid>
    </Page>
  );
}
