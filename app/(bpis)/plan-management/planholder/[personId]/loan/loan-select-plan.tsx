"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";
import { Checkbox, H4, Small } from "st-peter-ui";

import { OSPBadge } from "@/components/common/badge/badge";
import { DataTable } from "@/components/common/reusable-tableV2/DataTable";
import InfoCard from "@/claude components/info-card/info-card";
import { RowItem } from "@/claude components/info-card/row-item";
import { REQUIRED_DOCUMENTS } from "./loan-documents";

// ---- Types ----
export interface LoanRecord {
  lpaNo: string;
  planType: string;
  status: string;
  terminationStatus: string;
  indicativeLoanAmount: number;
  // loanTerm: string;
  // contractPrice: string;
}

// ---- Mock data ----
export const initialLoanData: LoanRecord[] = [
  {
    lpaNo: "L12345678G",
    planType: "ST. DOROTHY",
    status: "Fully Paid",
    terminationStatus: "Not Yet Terminated",
    indicativeLoanAmount: 24800,
    // loanTerm: "12",
    // contractPrice: "₱45,000",
  },
];

// ---- Step 1: Select Plan ----
export function LoanSelectPlanStep({
  tableData,
  selectedLpaNumbers,
  onSelectionChange,
}: {
  tableData: LoanRecord[];
  selectedLpaNumbers: string[];
  onSelectionChange: (lpaNumbers: string[]) => void;
}) {
  const toggleSelection = (lpaNo: string) => {
    onSelectionChange(
      selectedLpaNumbers.includes(lpaNo)
        ? selectedLpaNumbers.filter((n) => n !== lpaNo)
        : [...selectedLpaNumbers, lpaNo],
    );
  };

  const toggleSelectAll = () => {
    onSelectionChange(
      selectedLpaNumbers.length === tableData.length
        ? []
        : tableData.map((r) => r.lpaNo),
    );
  };

  const isAllSelected =
    tableData.length > 0 && selectedLpaNumbers.length === tableData.length;

  const columns: ColumnDef<LoanRecord, any>[] = [
    {
      id: "selected",
      header: () => (
        <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { width: "44px" },
      cell: ({ row }) => (
        <Checkbox
          checked={selectedLpaNumbers.includes(row.original.lpaNo)}
          onCheckedChange={() => toggleSelection(row.original.lpaNo)}
        />
      ),
    },
    {
      accessorKey: "lpaNo",
      header: "Contract No.",
    },
    {
      accessorKey: "planType",
      header: "Plan Type",
    },
    {
      accessorKey: "status",
      header: "Account Status",
    },
    {
      accessorKey: "terminationStatus",
      header: "Termination Status",
    },
    // {
    //   accessorKey: "loanTerm",
    //   header: "Loan Term",
    // },
    // {
    //   accessorKey: "contractPrice",
    //   header: "Contact Price",
    // },
  ];

  return (
    <Box py={3}>
      {/* Required documents */}
      <InfoCard>
        Please prepare scanned copies of the following required documents:{" "}
        {REQUIRED_DOCUMENTS.filter((doc) => doc.required)
          .map((doc) => doc.label)
          .join(", ")}
        .
      </InfoCard>

      {/* Plan list */}
      <Box mt={6}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          gap={3}
          flexWrap="wrap"
        >
          <Box>
            <H4>List of Fully Paid Plans</H4>
            <Small fontStyle="italic">
              Kindly select the plans you wish to apply for a loan.
            </Small>
          </Box>

          <HStack
            gap={3}
            bg="var(--chakra-colors-primary-disabled)"
            border="1px solid"
            borderColor="var(--chakra-colors-primary)"
            borderRadius="xl"
            px={4}
            py={2}
            w={{ base: "full", md: "auto" }}
          >
            <CheckCircle2 size={28} color="var(--chakra-colors-primary)" />
            <Box>
              <Small
                color="var(--chakra-colors-primary-hover)"
                fontWeight="medium"
              >
                Plans Selected
              </Small>
              <HStack gap={1} align="baseline">
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="var(--chakra-colors-primary-hover)"
                  lineHeight="1"
                >
                  {selectedLpaNumbers.length}
                </Text>
                <Text fontSize="sm" color="gray.500" lineHeight="1">
                  / {tableData.length}
                </Text>
              </HStack>
            </Box>
          </HStack>
        </Flex>

        <DataTable
          data={tableData}
          columns={columns}
          getRowId={(row) => row.lpaNo}
          features={{
            sorting: false,
            filtering: false,
            search: true,
            pagination: false,
            columnToggle: false,
            selection: false,
            draggable: false,
            detailSidebar: false,
          }}
          mobileConfig={{
            viewMode: "card",
            renderMobileCard: (row) => {
              const isChecked = selectedLpaNumbers.includes(row.lpaNo);
              return (
                <Box
                  bg="white"
                  borderWidth="1px"
                  borderRadius="md"
                  overflow="hidden"
                  boxShadow="xs"
                  onClick={() => toggleSelection(row.lpaNo)}
                  cursor="pointer"
                  position="relative"
                >
                  {isChecked && (
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      bottom={0}
                      width="3px"
                      bg="green.500"
                    />
                  )}
                  <HStack
                    align="flex-start"
                    justify="space-between"
                    gap={2}
                    px={3}
                    py={3}
                  >
                    <Box flex="1" minW={0}>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color="gray.900"
                        letterSpacing="wide"
                      >
                        {row.lpaNo}
                      </Text>
                    </Box>
                    <HStack gap={1} flexShrink={0}>
                      <OSPBadge>{row.planType}</OSPBadge>
                      {isChecked && (
                        <OSPBadge type="success">Selected</OSPBadge>
                      )}
                    </HStack>
                  </HStack>
                  <Box
                    borderTopWidth="1px"
                    borderColor="gray.100"
                    px={3}
                    py={2.5}
                  >
                    <RowItem label="Account Status" value={row.status} />
                    <RowItem
                      label="Termination Status"
                      value={row.terminationStatus}
                    />
                  </Box>
                </Box>
              );
            },
          }}
        />
      </Box>
    </Box>
  );
}
