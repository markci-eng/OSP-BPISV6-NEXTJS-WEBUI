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
  GridItem,
  Progress,
  Separator,
  Strong,
  Text,
  Wrap,
} from "@chakra-ui/react";
import Page from "@/components/layout/page/Page";
import Card from "@/components/cards/Card";

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
  const [agents, setAgents] = React.useState<AgentPrintingData[]>(() =>
    generateAgents(248),
  );
  const [batchSize, setBatchSize] = React.useState<number>(10);
  const [isPrinting, setIsPrinting] = React.useState(false);

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
    <Page.Root
      title="Contract and SFID Renewal"
      description="Re-print the contract and SFID of sales force agents whose contracts are up for renewal."
    >
      <Page.MainContent>
        <Flex flexDir="column" gap={{ base: 4, md: 6 }} my={6}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={{ base: 4, md: 6 }}
          >
            <GridItem>
              <Card.Root title="Contract Period">
                <Card.MainContent>
                  <Flex flexDir="column" gap={2} px={1}>
                    <Box>
                      <Small color="gray.500" display="block">
                        Contract Expiry Date
                      </Small>
                      <Strong
                        fontSize={{ base: "md", md: "lg" }}
                        color="var(--chakra-colors-primary)"
                      >
                        {formatDate(CONTRACT_END_DATE)}
                      </Strong>
                    </Box>
                    <Separator />
                    <Box>
                      <Small color="gray.500" display="block">
                        Start Date (predetermined)
                      </Small>
                      <Text fontSize="sm">
                        {formatDate(CONTRACT_START_DATE)} — finalized once the
                        agent signs the contract
                      </Text>
                    </Box>
                    <Small color="gray.500">
                      All contracts are valid for {CONTRACT_DURATION_MONTHS}{" "}
                      months and expire on the date above.
                    </Small>
                  </Flex>
                </Card.MainContent>
              </Card.Root>
            </GridItem>

            <GridItem>
              <Card.Root title="Renewal Progress">
                <Card.MainContent>
                  <Flex flexDir="column" gap={3} px={1}>
                    <Wrap gap={2}>
                      <Badge colorPalette="blue" size="lg">
                        Total: {total}
                      </Badge>
                      <Badge colorPalette="orange" size="lg">
                        Pending: {pendingCount}
                      </Badge>
                      <Badge colorPalette="green" size="lg">
                        Printed: {printedCount}
                      </Badge>
                    </Wrap>
                    <Progress.Root value={progressValue} size="sm">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Small color="gray.500">
                      {progressValue}% of contracts printed
                    </Small>
                  </Flex>
                </Card.MainContent>
              </Card.Root>
            </GridItem>
          </Grid>

          <Card.Root title="Batch Printing">
            <Card.MainContent>
              <Flex flexDir="column" gap={4} px={1}>
                <Body color="gray.600">
                  Printing all contracts at once can take a long time. Select a
                  batch size and the system will automatically pick the next set
                  of pending agents to print.
                </Body>

                <Box>
                  <Small color="gray.500" mb={2} display="block">
                    Batch size
                  </Small>
                  <Wrap gap={2}>
                    {BATCH_SIZES.map((size) => (
                      <Button
                        key={size}
                        size="sm"
                        variant={batchSize === size ? "solid" : "outline"}
                        colorPalette={batchSize === size ? "blue" : "gray"}
                        onClick={() => setBatchSize(size)}
                        disabled={isPrinting}
                      >
                        {size}
                      </Button>
                    ))}
                  </Wrap>
                </Box>

                <DataTable
                  data={agents}
                  columns={desktopColumns}
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
                  mobileConfig={{
                    viewMode: "card",
                    primaryField: "fullName",
                    titleTransform: "capitalize",
                    secondaryField: "id",
                    badgeField: "status",
                    visibleFields: ["position"],
                    badgeColorMap: { Printed: "green", Pending: "orange" },
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
            </Card.MainContent>
          </Card.Root>
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
};

const statusCell = (info: CellContext<AgentPrintingData, unknown>) => {
  const value = info.getValue<AgentPrintingData["status"]>();
  return (
    <Badge colorPalette={value === "Printed" ? "green" : "orange"}>
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

export default SaleforcePrintingPage;
