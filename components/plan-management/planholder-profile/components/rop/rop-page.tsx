"use client";

import {
  Box,
  Field,
  Flex,
  Grid,
  GridItem,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaFileAlt } from "react-icons/fa";
import { FaFileShield } from "react-icons/fa6";
import {
  LuChevronDown,
  LuChevronRight,
  LuSearch,
  LuShieldCheck,
} from "react-icons/lu";
import { Checkbox, H4, PrimaryMdButton, Small } from "st-peter-ui";
import { z } from "zod";

import { OSPBadge } from "@/components/common/badge/badge";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { DataTable } from "@/components/common/reusable-tableV2/DataTable";
import Page from "@/claude components/layout/page/Page";
import { Card } from "@/claude components/card-accordion/card";
import FormSteps from "@/claude components/FormSteps";
import InfoCard from "@/claude components/info-card/info-card";
import { RowItem } from "@/claude components/info-card/row-item";

// ---- Types ----
interface RopRecord {
  lpaNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  planType: string;
  ropSched: string;
  ropDate: string;
  totalAmt: string;
}

// ---- Mock data ----
const initialRopData: RopRecord[] = [
  {
    lpaNo: "LPA-2021-001234",
    firstName: "Juan",
    middleName: "Santos",
    lastName: "Dela Cruz",
    birthDate: "1980-01-15",
    planType: "ST. DOROTHY",
    ropSched: "1st",
    ropDate: "10-08-2025",
    totalAmt: "PHP 6,000.00",
  },
  {
    lpaNo: "LPA-2019-005678",
    firstName: "Maria",
    middleName: "Cruz",
    lastName: "Santos",
    birthDate: "1975-05-20",
    planType: "ST. PETER CLASSIC",
    ropSched: "2nd",
    ropDate: "05-15-2025",
    totalAmt: "PHP 9,500.00",
  },
];

// ---- Search schema ----
const RopSearchSchema = z.object({
  lpaNo: z.string().min(1, "LPA Number is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
});

type RopSearchFormValues = z.infer<typeof RopSearchSchema>;

function getFullName(r: RopRecord) {
  return [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ");
}

// ---- Step 1: Select Plan ----
function RopSelectPlanStep({
  tableData,
  setTableData,
  selectedLpaNumbers,
  onSelectionChange,
}: {
  tableData: RopRecord[];
  setTableData: React.Dispatch<React.SetStateAction<RopRecord[]>>;
  selectedLpaNumbers: string[];
  onSelectionChange: (lpaNumbers: string[]) => void;
}) {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searching, setSearching] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RopSearchFormValues>({
    resolver: zodResolver(RopSearchSchema),
    defaultValues: {
      lpaNo: "",
      firstName: "",
      middleName: "",
      lastName: "",
      birthDate: "",
    },
  });

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

  const handleSearch = async (values: RopSearchFormValues) => {
    setSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newRecord: RopRecord = {
      lpaNo: values.lpaNo,
      firstName: values.firstName,
      middleName: values.middleName ?? "",
      lastName: values.lastName,
      birthDate: values.birthDate,
      planType: "ST. DOROTHY",
      ropSched: "1st",
      ropDate: "10-08-2025",
      totalAmt: "PHP 6,000.00",
    };
    setTableData((prev) => {
      const exists = prev.some((r) => r.lpaNo === values.lpaNo);
      return exists ? prev : [newRecord, ...prev];
    });
    reset();
    setSearching(false);
    setSearchExpanded(false);
  };

  const isAllSelected =
    tableData.length > 0 && selectedLpaNumbers.length === tableData.length;

  const columns: ColumnDef<RopRecord, any>[] = [
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
      id: "fullName",
      header: "Full Name",
      cell: ({ row }) => getFullName(row.original),
    },
    {
      accessorKey: "planType",
      header: "Plan Type",
    },
    {
      accessorKey: "totalAmt",
      header: "Amount",
    },
    {
      accessorKey: "ropDate",
      header: "Schedule Date",
    },
    {
      accessorKey: "ropSched",
      header: "Inst. Schedule",
    },
  ];

  return (
    <Box py={3}>
      {/* Required documents */}
      <InfoCard>
        Please prepare scanned copies of: (1) one valid Government-issued ID
        with signature; (2) three Specimen Signatures or right thumbmark; (3)
        proof of account showing name, account number, and bank name — cash /
        cheque deposit slip (≥6 months from last transaction) or fully-verified
        eWallet screenshot.
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
              Kindly select the plans you want to request.
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
            search: false,
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
                  borderColor={isChecked ? "green.300" : "gray.200"}
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
                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                        {getFullName(row)}
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
                    <RowItem label="Amount" value={row.totalAmt} />
                    <RowItem label="Schedule Date" value={row.ropDate} />
                    <RowItem label="Inst. Schedule" value={row.ropSched} />
                  </Box>
                </Box>
              );
            },
          }}
        />
      </Box>

      {/* Plan not in list — collapsible search */}
      <Box mt={6}>
        <Text
          fontSize="sm"
          color="blue.600"
          cursor="pointer"
          onClick={() => setSearchExpanded((v) => !v)}
          display="inline-flex"
          alignItems="center"
          gap={1}
          mb={3}
          _hover={{ textDecoration: "underline" }}
        >
          Plan not in the list?
          {searchExpanded ? (
            <LuChevronDown size={14} />
          ) : (
            <LuChevronRight size={14} />
          )}
        </Text>

        {searchExpanded && (
          <Card
            activeIcon={<LuSearch />}
            title="Search ROP Application"
            subtitle="Enter planholder details to look up a plan"
          >
            <Box as="form" onSubmit={handleSubmit(handleSearch)} mt={2}>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={4}
              >
                <Field.Root invalid={!!errors.lpaNo}>
                  <Field.Label fontSize="sm">LPA Number</Field.Label>
                  <Input size="sm" {...register("lpaNo")} />
                  {errors.lpaNo && (
                    <Field.ErrorText>{errors.lpaNo.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root>
                  <Field.Label fontSize="sm">Upload Valid ID</Field.Label>
                  <Input
                    size="sm"
                    type="file"
                    accept="image/*,.pdf"
                    border="1px solid"
                    borderColor="gray.300"
                    borderRadius="sm"
                    p={1}
                    cursor="pointer"
                  />
                </Field.Root>

                <Field.Root invalid={!!errors.firstName}>
                  <Field.Label fontSize="sm">First Name</Field.Label>
                  <Input size="sm" {...register("firstName")} />
                  {errors.firstName && (
                    <Field.ErrorText>
                      {errors.firstName.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root>
                  <Field.Label fontSize="sm">Middle Name</Field.Label>
                  <Input size="sm" {...register("middleName")} />
                </Field.Root>

                <Field.Root invalid={!!errors.lastName}>
                  <Field.Label fontSize="sm">Last Name</Field.Label>
                  <Input size="sm" {...register("lastName")} />
                  {errors.lastName && (
                    <Field.ErrorText>{errors.lastName.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.birthDate}>
                  <Field.Label fontSize="sm">Birth Date</Field.Label>
                  <Input size="sm" type="date" {...register("birthDate")} />
                  {errors.birthDate && (
                    <Field.ErrorText>
                      {errors.birthDate.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Flex justify="flex-end" mt={2}>
                    <PrimaryMdButton type="submit" disabled={searching}>
                      {searching ? "Searching…" : "Search"}
                    </PrimaryMdButton>
                  </Flex>
                </GridItem>
              </Grid>
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
}

// ---- Step 2: Review summary ----
function RopSummaryStep({ records }: { records: RopRecord[] }) {
  return (
    <Box py={3}>
      <InfoCard>
        Please review the selected plans before submitting your Return of
        Premium application.
      </InfoCard>

      <Flex direction="column" gap={4} mt={5}>
        {records.map((record) => (
          <Card
            key={record.lpaNo}
            activeIcon={<LuShieldCheck />}
            title="ROP Application Summary"
            subtitle={record.lpaNo}
          >
            <RowItem label="Contract No." value={record.lpaNo} />
            <RowItem label="Full Name" value={getFullName(record)} />
            <RowItem label="Plan Type" value={record.planType} />
            <RowItem label="ROP Amount" value={record.totalAmt} />
            <RowItem label="Schedule Date" value={record.ropDate} />
            <RowItem label="Inst. Schedule" value={record.ropSched} />
          </Card>
        ))}
      </Flex>
    </Box>
  );
}

// ---- Main exported component ----
export function RopPage({ onProceed }: { onProceed: () => void }) {
  const [tableData, setTableData] = useState<RopRecord[]>(initialRopData);
  const [selectedLpaNumbers, setSelectedLpaNumbers] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const { messageBox } = useMessageDialog();

  const selectedRecords = tableData.filter((r) =>
    selectedLpaNumbers.includes(r.lpaNo),
  );

  const handleSubmit = async () => {
    const confirmed = await messageBox({
      title: "Confirm Submission",
      message:
        "Are you sure you want to submit this Return of Premium application?",
      variant: "warning",
      confirmText: "Yes, Submit",
      showCancel: true,
      cancelText: "Cancel",
    });
    if (confirmed) {
      sessionStorage.setItem("selectedRows", JSON.stringify(selectedRecords));
      onProceed();
    }
  };

  const stepsData = [
    {
      title: "Select Plan",
      icon: FaFileAlt,
      content: (
        <RopSelectPlanStep
          tableData={tableData}
          setTableData={setTableData}
          selectedLpaNumbers={selectedLpaNumbers}
          onSelectionChange={setSelectedLpaNumbers}
        />
      ),
      validateBeforeNext: () => {
        if (selectedLpaNumbers.length === 0) {
          messageBox({
            title: "No Plan Selected",
            message: "Please select at least one plan to proceed.",
            confirmText: "Okay",
            variant: "warning",
          });
          return false;
        }
        return true;
      },
    },
    {
      title: "Review Application",
      icon: FaFileShield,
      content: <RopSummaryStep records={selectedRecords} />,
    },
  ];

  return (
    <Page.Root
      title="Return of Premium"
      description="Apply for a refund of premiums paid upon plan maturity."
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title=""
          description=""
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={handleSubmit}
          submitButtonText="Submit Application"
        />
      </Page.MainContent>
    </Page.Root>
  );
}
