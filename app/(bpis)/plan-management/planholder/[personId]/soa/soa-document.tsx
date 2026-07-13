"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Separator,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuPrinter } from "react-icons/lu";
import Page from "@/claude components/layout/page/Page";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import type { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import type { PlanStatement } from "@/components/new-planholder-profile/data/plan-statement";

function formatPeso(amount: number) {
  return "₱ " + amount.toLocaleString("en-PH");
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface SoaDocumentProps {
  planholder: PlanholderLookup;
  plan: PlanDetailType;
  statement: PlanStatement;
  soaNumber: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" gap={4} py={1}>
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
      <Text fontSize="xs" fontWeight="medium" color="gray.900" textAlign="right">
        {value}
      </Text>
    </Flex>
  );
}

export function SoaDocument({
  planholder,
  plan,
  statement,
  soaNumber,
}: SoaDocumentProps) {
  const planholderName = [
    planholder.firstName,
    planholder.middleName,
    planholder.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const generatedOn = formatDate(new Date());

  return (
    <Page.Root
      title="Statement of Account"
      description={soaNumber}
      headerButton="back"
    >
      <Page.ToolContent className="no-print">
        <HStack>
          <Button
            aria-label="Print statement"
            onClick={() => window.print()}
            variant="outline"
            borderRadius="md"
          >
            <LuPrinter size={16} />
            <Text ml={1} fontSize="13px">
              Print
            </Text>
          </Button>
        </HStack>
      </Page.ToolContent>

      <Page.MainContent>
        <Page.Row>
          {/* Only this block is visible when printing (see .print-area in globals.css) */}
          <Box
            className="print-area"
            bg="white"
            color="gray.900"
            mx="auto"
            my={4}
            w="full"
            maxW="820px"
            p={{ base: 5, md: 8 }}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="sm"
          >
            {/* Header */}
            <Flex justify="space-between" align="flex-start" gap={4} wrap="wrap">
              <Box>
                <Text fontSize="lg" fontWeight="extrabold" letterSpacing="tight">
                  ST. PETER LIFE PLAN, INC.
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {plan.branch} Branch
                </Text>
              </Box>
              <Box textAlign="right">
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="var(--chakra-colors-primary)"
                >
                  Statement of Account
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {soaNumber}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Generated {generatedOn}
                </Text>
              </Box>
            </Flex>

            <Separator my={4} />

            {/* Planholder & plan info */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={{ base: 2, md: 8 }}>
              <Box>
                <InfoRow label="Planholder" value={planholderName || "—"} />
                <InfoRow label="Person ID" value={planholder.personId} />
                <InfoRow label="LPA Number" value={plan.lpaNumber} />
                <InfoRow label="Plan" value={plan.planDescription} />
                <InfoRow label="Plan Code" value={plan.planCode} />
              </Box>
              <Box>
                <InfoRow label="Mode" value={plan.mode} />
                <InfoRow
                  label="Term"
                  value={`${plan.term} year${plan.term !== 1 ? "s" : ""}`}
                />
                <InfoRow label="Account Status" value={plan.accountStatus} />
                <InfoRow
                  label="Effectivity Date"
                  value={formatDate(new Date(plan.effectivityDate))}
                />
                <InfoRow label="Next Due Date" value={formatDate(statement.nextDueDate)} />
              </Box>
            </Grid>

            <Separator my={4} />

            {/* Financial summary */}
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="gray.500" mb={2}>
              Account Summary
            </Text>
            <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={3} mb={2}>
              <SummaryTile label="Installment Amount" value={formatPeso(statement.installmentAmount)} />
              <SummaryTile label="Total Amount Payable" value={formatPeso(statement.totalAmountPayable)} />
              <SummaryTile
                label={`Installments Paid (${statement.progress}%)`}
                value={`${statement.installmentsPaid} of ${statement.totalInstallments}`}
              />
              <SummaryTile label="Total Payments" value={formatPeso(statement.totalPayments)} />
              <SummaryTile label="Balance" value={formatPeso(statement.balance)} accent />
              <SummaryTile label="Termination Value" value={formatPeso(statement.terminationValue)} />
            </Grid>

            <Separator my={4} />

            {/* Payment records */}
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="gray.500" mb={2}>
              Payment Records
            </Text>
            <Box overflowX="auto">
              <Table.Root size="sm" showColumnBorder>
                <Table.Header bg="gray.50">
                  <Table.Row>
                    <Table.ColumnHeader fontSize="11px">Inst. #</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="11px">SI No.</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="11px">SI Date</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="11px">Class</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="11px" textAlign="end">
                      Amount
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="11px">CV No.</Table.ColumnHeader>
                    <Table.ColumnHeader fontSize="11px">Next Due</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {statement.paymentRecords.length === 0 ? (
                    <Table.Row>
                      <Table.Cell
                        colSpan={7}
                        textAlign="center"
                        color="gray.400"
                        fontSize="11px"
                        py={4}
                      >
                        No payments recorded yet.
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    statement.paymentRecords.map((record) => (
                      <Table.Row key={record.siNumber}>
                        <Table.Cell fontSize="11px">
                          {record.installmentNumber}
                        </Table.Cell>
                        <Table.Cell fontSize="11px">{record.siNumber}</Table.Cell>
                        <Table.Cell fontSize="11px">
                          {formatDate(record.siDate)}
                        </Table.Cell>
                        <Table.Cell fontSize="11px">{record.payClass}</Table.Cell>
                        <Table.Cell fontSize="11px" textAlign="end">
                          {formatPeso(record.siAmount)}
                        </Table.Cell>
                        <Table.Cell fontSize="11px">{record.cvNumber}</Table.Cell>
                        <Table.Cell fontSize="11px">
                          {formatDate(record.nextDueDate)}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
                <Table.Footer>
                  <Table.Row bg="gray.50">
                    <Table.Cell
                      colSpan={4}
                      fontSize="11px"
                      fontWeight="bold"
                      textAlign="end"
                    >
                      Total Payments
                    </Table.Cell>
                    <Table.Cell fontSize="11px" fontWeight="bold" textAlign="end">
                      {formatPeso(statement.totalPayments)}
                    </Table.Cell>
                    <Table.Cell colSpan={2} />
                  </Table.Row>
                </Table.Footer>
              </Table.Root>
            </Box>

            <Text fontSize="10px" color="gray.400" mt={4}>
              This statement is system-generated from the plan's payment history.
              Total Payments ({formatPeso(statement.totalPayments)}) plus Balance
              ({formatPeso(statement.balance)}) equals the Total Amount Payable
              ({formatPeso(statement.totalAmountPayable)}).
            </Text>
          </Box>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}

function SummaryTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor={accent ? "var(--chakra-colors-primary-disabled)" : "gray.200"}
      borderRadius="md"
      p={3}
      bg={accent ? "var(--chakra-colors-primary-disabled)/10" : "white"}
    >
      <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb="2px">
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="bold"
        color={accent ? "var(--chakra-colors-primary)" : "gray.900"}
      >
        {value}
      </Text>
    </Box>
  );
}
