"use client";

import {
  Box,
  Collapsible,
  Flex,
  Grid,
  GridItem,
  Separator,
  SimpleGrid,
  Strong,
  Table,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import {
  Body,
  H3,
  H4,
  InputFloatingLabel,
  PrimaryMdFlexButton,
  SaveButton,
} from "st-peter-ui";
import {
  drsItems,
  samplePayments,
  tableColumns,
  tableItems,
} from "../data/paymentDetails";

import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { SearchPlanholderDialog } from "@/components/common/planholder-lookup/search-planholder-dialog";
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
import { refBankBranch } from "@/app/Model/Types/global.types";
import { refBankBranchData } from "@/app/Model/Data/rawData";
import { useRouter } from "next/navigation";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import Page from "@/components/layout/page/Page";
import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";

export default function EncodeDeposit() {
  const { rows, totals } = DrsFunction(samplePayments);
  const [selectedId, setSelectedId] = useState<string>("");
  const router = useRouter();
  // const selectedItem = useMemo(
  //   () => drsItems.find((x) => x.id === selectedId),
  //   [selectedId],
  // );

  //DRS
  const [selectedDRS, setSelectedDRS] = useState<DepositHdr | null>(null);

  const selectedItem = selectedDRS;
  const drsColumns: LookupColumn<DepositHdr>[] = [
    { key: "name", header: "DRS" },
    { key: "Amount", header: "Amount" },
    // { key: "DepositDateTime", header: "Deposit" },
  ];
  useEffect(() => {
    const data = sessionStorage.getItem("selectedDRS");

    if (data) {
      setSelectedDRS(JSON.parse(data));
      sessionStorage.removeItem("selectedDRS");
    }
  }, []);

  //Employee
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
      title={"Encode Validated Deposit"}
      description="Encode your validated deposit"
    >
      <Page.MainContent>
        {/* SEARCH PANEL */}

        <Card.Root>
          <Card.MainContent>
            <Flex
              direction={{ base: "column", lg: "row" }}
              align={{ base: "flex-start", lg: "center" }}
              justify="space-between"
              gap={4}
            >
              {/* LEFT INFO */}
              <Box w="full">
                {selectedDRS && (
                  <Body>
                    Reference#: <Strong>{selectedDRS?.name}</Strong> Amount:{" "}
                    <Strong>{selectedDRS?.Amount}</Strong>
                  </Body>
                )}
              </Box>

              {/* SEARCH FIELD */}
              <Box w="full" maxW={{ base: "full", md: "sm" }}>
                <LookupField<DepositHdr>
                  label=""
                  placeholder="Search Digital Remittance Slip."
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
                    } else {
                      toast.error("Please encode the first created DRS");
                    }
                  }}
                  renderDisplay={(x) => `${x.name} (${x.Amount})`}
                  value={selectedDRS}
                />
              </Box>
            </Flex>
          </Card.MainContent>
        </Card.Root>

        <Grid gap={4} mt={4}>
          {/* DEPOSIT DETAILS */}
          <GridItem
            bg="white"
            colSpan={{ base: 1 }}
            overflow="hidden"
            h={"full"}
          >
            {/* HEADER */}
            <Card.Root title={`Deposit Details ${selectedItem?.name || ""}`}>
              <Card.MainContent>
                {!selectedDRS && (
                  <EmptyStateCard
                    title={"No Digital Remittance Selected"}
                    description="Search and select a Digital remittance to start entering Deposit
                details."
                  />
                )}
                {/* FORM */}
                <Collapsible.Root open={selectedDRS != null}>
                  <Collapsible.Content>
                    {/* FORM GRID */}
                    <SimpleGrid
                      columns={{
                        base: 1,
                        sm: 2,
                        lg: 3,
                      }}
                      gapX={2}
                      gapY={1}
                    >
                      <InputFloatingLabel
                        type="datetime-local"
                        id="depositdate"
                        label="Deposit Date Time"
                      />

                      <InputFloatingLabel
                        type="number"
                        id="AccountNo"
                        label="Account number"
                        value={"2010073262"}
                      />

                      {/* <InputFloatingLabel
                  id="BankBranch"
                  label="Bank Branch"
                  value={selectedItem?.BankBranch || ""}
                /> */}
                      <Flex alignItems={"center"}>
                        <LookupField<refBankBranch>
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
                      {/* <InputFloatingLabel
                  id="BankCode"
                  label="Bank Code"
                  value={selectedItem?.BankCode || ""}
                /> */}

                      <InputFloatingLabel
                        id="Amount"
                        label="Amount"
                        value={selectedItem?.Amount || "₱0.00"}
                      />
                      {/* 
                <InputFloatingLabel
                  id="DepositedBy"
                  label="Deposited By"
                  value={selectedItem?.DepositedBy || ""}
                /> */}
                      <Flex alignItems={"center"}>
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
                      </Flex>
                    </SimpleGrid>

                    {/* TABLE */}
                    <Box mt={4} borderRadius="md">
                      <DrsDataTable
                        payments={samplePayments}
                        onRowClick={(row) => console.log("Clicked row:", row)}
                      />
                      <Box display={{ base: "block", md: "none" }}>
                        <DrsPaymentSummary totals={totals} displayProp={true} />
                      </Box>
                    </Box>

                    {/* ACTION BUTTONS */}
                    <Flex gap={3} mt={4} justify={"flex-end"} flexWrap="wrap">
                      <Box
                        w={{ base: "full", md: "1/12" }}
                        minW={{ base: "full", md: "-webkit-fit-content" }}
                      >
                        <PrimaryMdFlexButton onClick={handleConfirm}>
                          SAVE
                        </PrimaryMdFlexButton>
                      </Box>
                    </Flex>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.MainContent>
            </Card.Root>

            {/* EMPTY STATE */}
          </GridItem>
          {/* </Grid>
</Box> */}

          {/* Digital Remittance Reference */}
          {/* <GridItem
          p={4}
          bg="white"
          boxShadow="sm"
          borderRadius="lg"
          h={{ base: "auto", xl: "full" }}
          w={{ base: "auto", xl: "lg" }}
        >
          <Strong color="gray.700">Digital Remittance Reference#</Strong>
          <Box mt={2}>
            <SearchEmployeeDialog />
          </Box>

          <Separator my={2} />
          <Box overflowY="auto" maxH="xs" w={"full"}>
            <Table.Root size="sm" variant="outline" interactive>
              <Table.Body>
                {drsItems.map((item) => (
                  <Table.Row
                    key={item.id}
                    data-selected={selectedId === item.id ? "" : undefined}
                    onClick={() => setSelectedId(item.id)}
                    cursor="pointer"
                    _selected={{
                      bg: "green.100",
                      borderLeft: "4px solid",
                      borderColor: "green.500",
                    }}
                  >
                    <Table.Cell>
                      <Flex justify="space-between" align="center" gap={2}>
                        <Box>
                          {item.name} : {item.DepositDateTime || "-"} -{" "}
                          {item.Amount}
                        </Box>
                        <Flex gap={2} align="center">
                          {item.isApproved === 1 && (
                            <FaCheckCircle color="green" />
                          )}
                          {drsItems[drsItems.length - 1]?.id === item.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              color="red.500"
                              borderColor="red.500"
                              _hover={{ bg: "red.500", color: "white" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(item.name);
                              }}
                            >
                              <LuTrash /> DELETE
                            </Button>
                          )}
                        </Flex>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </GridItem> */}

          {/* Deposit Summary */}
          {/* <GridItem
          w={{ base: "auto", xl: "lg" }}
          colSpan={{ base: 2, lg: 1 }}
          p={4}
          bg="white"
          boxShadow="sm"
          borderRadius="lg"
        >
          <H4>Deposit Summary Details</H4>
          <Separator my={2} />

          <Table.Root size="sm" variant="outline" interactive textAlign="right">
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <Body>DRS:</Body>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Body fontWeight={"bolder"}>
                    {selectedItem?.name || "-"}{" "}
                  </Body>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Body>DRS Amount:</Body>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Body fontWeight={"bolder"}>
                    {" "}
                    {selectedItem?.Amount || "₱0.00"}
                  </Body>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Body> Check Book ID: </Body>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Body fontWeight={"bolder"}>00011</Body>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Body>Bank Name: </Body>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Body fontWeight={"bolder"}>
                    {selectedItem?.BankBranch || "-"}{" "}
                  </Body>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Body>Gross Collection:</Body>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Body fontWeight={"bolder"}>₱0.00</Body>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Body>Less Disbursments:</Body>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Body fontWeight={"bolder"}>₱0.00</Body>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Body>Net Collection:</Body>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Body fontWeight={"bolder"}>₱0.00</Body>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <Body>Excess/(Shortage):</Body>
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Body fontWeight={"bolder"}>₱0.00</Body>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
          <Flex justify="flex-end" gap={4} mt={4}>
            {/* <DeleteSolidButton /> */}
          {/* <SaveButton />
          </Flex>
        </GridItem> */}
        </Grid>
      </Page.MainContent>
    </Page.Root>
  );
}
