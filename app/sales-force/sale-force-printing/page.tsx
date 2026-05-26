// Change or Add by: JLO 2026-05-16
"use client";

import React from "react";
import { Body, PrimaryMdButton, Small } from "st-peter-ui";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Progress,
  Separator,
  Strong,
  Text,
  Wrap,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Page } from "@/components/page/page";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CARD_LAYOUT } from "@/lib/theme/layout-tokens";
import {
  STANDARD_BUTTON_STYLES,
  STANDARD_RADIUS,
} from "@/lib/theme/standard-design-tokens";
import { DISPLAY_STATUS_STYLES } from "@/lib/theme/status-display-tokens";

interface AgentPrintingData {
  id: string;
  fullName: string;
  position: string;
  status: "Pending" | "Printed";
}

// Company contract business rule:
// A contract is valid for 6 months. The start date is predetermined and is
// only finalized once the agent signs, so it is fixed company-wide here.
// The expiry date is derived as start + 6 months.
const CONTRACT_DURATION_MONTHS = 6;
const CONTRACT_START_DATE = new Date(2026, 6, 1); // July 1, 2026 (predetermined)
const CONTRACT_END_DATE = new Date(
  CONTRACT_START_DATE.getFullYear(),
  CONTRACT_START_DATE.getMonth() + CONTRACT_DURATION_MONTHS,
  CONTRACT_START_DATE.getDate(),
);

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const POSITIONS = ["Sales Agent 1", "Sales Agent 2", "Sales Team Leader"];

const FIRST_NAMES = [
  "Emily",
  "Michael",
  "Sophia",
  "William",
  "Olivia",
  "James",
  "Ava",
  "Benjamin",
  "Mia",
  "Ethan",
  "Isabella",
  "Lucas",
  "Charlotte",
  "Henry",
  "Amelia",
  "Daniel",
  "Harper",
  "Jack",
  "Evelyn",
  "Owen",
];

const LAST_NAMES = [
  "Johnson",
  "Smith",
  "Lee",
  "Brown",
  "Davis",
  "Wilson",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Moore",
  "Garcia",
  "Cruz",
  "Reyes",
  "Santos",
  "Bautista",
  "Ramos",
  "Mendoza",
  "Aquino",
  "Castro",
];

const generateAgents = (count: number): AgentPrintingData[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: `SF-${(1000 + i).toString()}`,
    fullName: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${
      LAST_NAMES[(i * 3) % LAST_NAMES.length]
    }`,
    position: POSITIONS[i % POSITIONS.length],
    status: "Pending" as const,
  }));

const BATCH_SIZES = [5, 10, 20, 50, 100];

const SaleforcePrintingPage = () => {
  const breadItem = [
    { label: "Home", href: "/" },
    { label: "Sale Agent Management", href: "" },
    { label: "Contract and SFID Renewal" },
  ];

  const [agents, setAgents] = React.useState<AgentPrintingData[]>(() =>
    generateAgents(248),
  );
  const [batchSize, setBatchSize] = React.useState<number>(10);
  const [isPrinting, setIsPrinting] = React.useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const columns = isMobile ? mobileColumns : desktopColumns;

  const total = agents.length;
  const printedCount = agents.filter((a) => a.status === "Printed").length;
  const pendingCount = total - printedCount;
  const progressValue =
    total === 0 ? 0 : Math.round((printedCount / total) * 100);

  // System automatically selects the next batch of pending agents to print.
  const handlePrintBatch = () => {
    if (isPrinting || pendingCount === 0) return;
    setIsPrinting(true);

    const idsToPrint = agents
      .filter((a) => a.status === "Pending")
      .slice(0, batchSize)
      .map((a) => a.id);

    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          idsToPrint.includes(a.id) ? { ...a, status: "Printed" } : a,
        ),
      );
      setIsPrinting(false);
    }, 900);
  };

  return (
    <Page
      title="Contract and SFID Renewal"
      description="Re-print the contract and SFID of sales force agents whose contracts are up for renewal."
      breadcrumbItems={breadItem}
    >
      <Flex
        flexDir="column"
        gap={{ base: CARD_LAYOUT.gap.base, md: CARD_LAYOUT.gap.md }}
        my={{ base: 4, md: 6 }}
      >
        <Grid
          templateColumns={{ base: "1fr", xl: "1fr 1fr" }}
          gap={{ base: CARD_LAYOUT.gap.base, md: CARD_LAYOUT.gap.md }}
          alignItems="stretch"
        >
          <ProfileSectionCard
            title="Contract Renewal"
            description="Review the contract period and renewal rules before printing."
          >
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={{ base: 4, md: 5 }}
            >
              <DetailItem
                label="Contract Expiry Date"
                value={formatDate(CONTRACT_END_DATE)}
                emphasis
              />
              <DetailItem
                label="Start Date (predetermined)"
                value={formatDate(CONTRACT_START_DATE)}
                helper="Finalized once the agent signs the contract."
              />
              <DetailItem
                label="Contract Duration"
                value={`${CONTRACT_DURATION_MONTHS} months`}
              />
              <DetailItem
                label="Renewal Coverage"
                value={`${total} sales force agents`}
              />
            </Grid>
          </ProfileSectionCard>

          <ProfileSectionCard
            title="SFID Renewal"
            description="Track SFID and contract print status for this renewal batch."
          >
            <Flex flexDir="column" gap={4}>
              <Grid
                templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }}
                gap={3}
              >
                <MetricBox label="Total" value={total} tone="neutral" />
                <MetricBox label="Pending" value={pendingCount} tone="pending" />
                <MetricBox label="Printed" value={printedCount} tone="printed" />
              </Grid>

              <Box>
                <Flex justify="space-between" align="center" mb={2} gap={3}>
                  <Small color="gray.500">Renewal progress</Small>
                  <Small color={BRAND_COLORS.primaryGreen} fontWeight="700">
                    {progressValue}%
                  </Small>
                </Flex>
                <Progress.Root value={progressValue} size="sm">
                  <Progress.Track bg={BRAND_COLORS.mutedBg}>
                    <Progress.Range bg={BRAND_COLORS.primaryGreen} />
                  </Progress.Track>
                </Progress.Root>
              </Box>
            </Flex>
          </ProfileSectionCard>
        </Grid>

        <ProfileSectionCard
          title="Batch Renewal Printing"
          description="Select a batch size and print the next pending set of contracts and SFIDs."
        >
          <Flex flexDir="column" gap={{ base: 4, md: 5 }}>
            <Body color="gray.600">
              Printing all contracts at once can take a long time. Select a
              batch size and the system will automatically pick the next set of
              pending agents to print.
            </Body>

            <Box>
              <Small color="gray.500" mb={2} display="block">
                Batch size
              </Small>
              <Wrap gap={2}>
                {BATCH_SIZES.map((size) => {
                  const isSelected = batchSize === size;
                  return (
                    <Button
                      key={size}
                      {...STANDARD_BUTTON_STYLES.sm}
                      variant={isSelected ? "solid" : "outline"}
                      bg={isSelected ? BRAND_COLORS.primaryGreen : undefined}
                      color={
                        isSelected
                          ? BRAND_COLORS.white
                          : BRAND_COLORS.neutralText
                      }
                      borderColor={
                        isSelected
                          ? BRAND_COLORS.primaryGreen
                          : BRAND_COLORS.neutralBorder
                      }
                      _hover={{
                        bg: isSelected
                          ? BRAND_COLORS.darkGreen
                          : BRAND_COLORS.subtleBg,
                        borderColor: isSelected
                          ? BRAND_COLORS.darkGreen
                          : BRAND_COLORS.neutralBorder,
                      }}
                      onClick={() => setBatchSize(size)}
                      disabled={isPrinting}
                    >
                      {size}
                    </Button>
                  );
                })}
              </Wrap>
            </Box>

            <DataTable
              data={agents}
              columns={columns}
              title="Agents for Renewal"
              description="All sales force agents whose contracts are up for renewal."
              size="sm"
              features={{
                search: true,
                filtering: true,
                sorting: true,
                pagination: true,
                columnToggle: false,
                selection: false,
                draggable: false,
                detailSidebar: false,
              }}
            />

            <Separator />

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={3}
              justify="space-between"
              align={{ base: "stretch", sm: "center" }}
            >
              <Small color="gray.500">
                Next batch will print up to{" "}
                <Strong>{Math.min(batchSize, pendingCount)}</Strong> of{" "}
                {pendingCount} pending contract(s).
              </Small>
              <Box w={{ base: "full", sm: "auto" }}>
                <PrimaryMdButton
                  onClick={handlePrintBatch}
                  disabled={isPrinting || pendingCount === 0}
                >
                  {isPrinting
                    ? "Printing..."
                    : pendingCount === 0
                      ? "All Printed"
                      : `Print Batch (${Math.min(batchSize, pendingCount)})`}
                </PrimaryMdButton>
              </Box>
            </Flex>
          </Flex>
        </ProfileSectionCard>
      </Flex>
    </Page>
  );
};

const DetailItem = ({
  label,
  value,
  helper,
  emphasis,
}: {
  label: string;
  value: string;
  helper?: string;
  emphasis?: boolean;
}) => (
  <Box
    borderWidth="1px"
    borderColor={BRAND_COLORS.neutralBorder}
    borderRadius={STANDARD_RADIUS.md}
    bg={BRAND_COLORS.subtleBg}
    p={{ base: 3, md: 4 }}
  >
    <Small color="gray.500" display="block">
      {label}
    </Small>
    <Strong
      fontSize={{ base: "sm", md: emphasis ? "lg" : "md" }}
      color={emphasis ? BRAND_COLORS.primaryGreen : BRAND_COLORS.neutralText}
    >
      {value}
    </Strong>
    {helper ? (
      <Text mt={1} fontSize="sm" color="gray.600">
        {helper}
      </Text>
    ) : null}
  </Box>
);

const MetricBox = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "pending" | "printed";
}) => {
  const style =
    tone === "printed"
      ? DISPLAY_STATUS_STYLES.approved
      : tone === "pending"
        ? DISPLAY_STATUS_STYLES.pending
        : DISPLAY_STATUS_STYLES.fallback;

  return (
    <Box
      borderWidth="1px"
      borderColor={style.borderColor}
      borderRadius={STANDARD_RADIUS.md}
      bg={style.bg}
      p={{ base: 3, md: 4 }}
    >
      <Small color={style.color} display="block" fontWeight={style.fontWeight}>
        {label}
      </Small>
      <Strong color={style.color} fontSize={{ base: "lg", md: "xl" }}>
        {value}
      </Strong>
    </Box>
  );
};

const statusCell = (info: CellContext<AgentPrintingData, unknown>) => {
  const value = info.getValue<AgentPrintingData["status"]>();
  const style =
    value === "Printed"
      ? DISPLAY_STATUS_STYLES.approved
      : DISPLAY_STATUS_STYLES.pending;

  return (
    <Badge
      bg={style.bg}
      color={style.color}
      borderColor={style.borderColor}
      borderWidth={style.borderWidth}
      borderRadius={STANDARD_RADIUS.full}
      fontWeight={style.fontWeight}
      px={2}
    >
      {value}
    </Badge>
  );
};

const desktopColumns: ColumnDef<AgentPrintingData>[] = [
  {
    accessorKey: "id",
    header: "SFID",
    enableColumnFilter: false,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    enableColumnFilter: false,
    cell: (info) => <Strong>{info.getValue<string>()}</Strong>,
  },
  {
    accessorKey: "position",
    header: "Position",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: true,
    cell: statusCell,
  },
];

const mobileColumns: ColumnDef<AgentPrintingData>[] = [
  {
    accessorKey: "fullName",
    header: "Full Name",
    enableColumnFilter: false,
    cell: (info) => <Strong>{info.getValue<string>()}</Strong>,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: true,
    cell: statusCell,
  },
];

export default SaleforcePrintingPage;
