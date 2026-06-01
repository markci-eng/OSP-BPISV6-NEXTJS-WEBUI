"use client";

import {
  getAgentById,
  getAgentNameById,
  getAllAgents,
  getPosibleSubordinates,
  getPositionDesc,
  getSubordinates,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import InfoItem from "@/components/common/info-item/info-item";
import LabelText from "@/components/texts/LabelText";
import SummaryForm from "@/components/common/text/SummaryForm";
import Page from "@/components/layout/page/Page";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import {
  Avatar,
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  Separator,
  Strong,
  Text,
} from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import {
  LuArrowLeft,
  LuCheck,
  LuChevronRight,
  LuSearch,
  LuUserRound,
  LuUsersRound,
  LuX,
  LuChevronsUpDown
} from "react-icons/lu";
import { Body, H4, PrimaryMdButton, Small } from "st-peter-ui";
import Summary from "@/components/forms/Summary";

interface ReassignPageWebProps {
  superior: SalesAgent | null;
  setSuperior: (agent: SalesAgent | null) => void;
}

type ViewMode = "form" | "summary";

const breadItem = [{ label: "Home", href: "/" }, { label: "Re-Organization" }];
const matchesQuery = (agent: SalesAgent, query: string) => {
  const q = query.trim().replace(/\s+/g, "").toLowerCase();
  if (!q) return true;
  const normalize = (v: string) => v.trim().replace(/\s+/g, "").toLowerCase();
  return (
    normalize(agent.id).includes(q) ||
    normalize(agent.firstName).includes(q) ||
    normalize(agent.lastName).includes(q) ||
    normalize(agent.position).includes(q) ||
    normalize(agent.firstName + agent.lastName).includes(q) ||
    normalize(agent.lastName + agent.firstName).includes(q)
  );
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

interface StepHeaderProps {
  index: number;
  title: string;
  hint: string;
  state: "active" | "done" | "upcoming";
}

const StepHeader = ({ index, title, hint, state }: StepHeaderProps) => {
  const color =
    state === "upcoming"
      ? "var(--chakra-colors-gray-400)"
      : "var(--chakra-colors-primary)";

  return (
    <Flex align="flex-start" gap={3} mb={4}>
      <Flex
        borderRadius="full"
        h="28px"
        w="28px"
        minW="28px"
        bg={state === "done" ? color : "transparent"}
        borderColor={color}
        borderWidth={2}
        align="center"
        justify="center"
        color={state === "done" ? "white" : color}
      >
        {state === "done" ? (
          <LuCheck size={14} />
        ) : (
          <Strong fontSize="14px">{index}</Strong>
        )}
      </Flex>
      <Flex flexDir="column" gap={0.5}>
        <Strong color={color} fontSize="16px">
          {title}
        </Strong>
        <Body color="gray.600">{hint}</Body>
      </Flex>
    </Flex>
  );
};

const ReassignPageWeb = (params: ReassignPageWebProps) => {
  const { superior, setSuperior } = params;

  const [searchVal, setSearchVal] = React.useState("");
  const [data, setData] = React.useState<SalesAgent[]>([]);
  const [selectedSubs, setSelectedSubs] = React.useState<SalesAgent[]>([]);
  const [view, setView] = React.useState<ViewMode>("form");

  const runSearch = () => {
    setData(getAllAgents().filter((a) => matchesQuery(a, searchVal)));
    if (superior !== null) setSuperior(null);
  };

  const clearSuperior = () => {
    setSuperior(null);
    setSearchVal("");
    setSelectedSubs([]);
  };

  const possibleSubs = React.useMemo(
    () => getPosibleSubordinates(superior),
    [superior],
  );

  const handleConfirm = () => {
    if (!superior || selectedSubs.length === 0) return;
    setView("summary");
  };

  if (view === "summary" && superior) {
    return (
      <ReassignSummary
        superior={superior}
        agents={selectedSubs}
        onBack={() => setView("form")}
      />
    );
  }

  return (
    <>
      <Page.Root
        title="Re-Organization"
        description="Move sales agents under a new superior in two quick steps."
      >
        <Page.MainContent>
        <Flex flexDir="column" gap={6} p={{ base: 0 }}>
          {/* STEP 1 */}
          <Flex flexDir="column" marginTop={{ base: "10px", md: 0 }}>
            <StepHeader
              index={1}
              title="Choose the new superior"
              hint="Search by ID, name, or position. The person you pick here will receive the agents you select in Step 2."
              state={superior ? "done" : "active"}
            />

            <Flex flexDir="column" gap={4}>
              <HStack
                w="full"
                gap={0}
                border="1.5px solid"
                borderColor={superior !== null ? "var(--chakra-colors-primary-disabled)" : "gray.200"}
                borderRadius="lg"
                bg="white"
                boxShadow="xs"
                overflow="hidden"
                transition="border-color 0.15s, box-shadow 0.15s"
                _hover={{
                  borderColor: superior !== null ? "var(--chakra-colors-primary)" : "gray.300",
                  boxShadow: "sm",
                }}
                _focusWithin={{
                  borderColor: "var(--chakra-colors-primary)",
                  boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
                }}
                minH="10"
              >
                <Flex
                  align="center"
                  pl={3}
                  color={superior !== null ? "var(--chakra-colors-primary)" : "gray.400"}
                  flexShrink={0}
                  pointerEvents="none"
                >
                  <LuSearch size={14} />
                </Flex>

                <Box flex={1}>
                  <Input
                    border="none"
                    bg="transparent"
                    boxShadow="none"
                    borderRadius="0"
                    px={2}
                    fontSize="sm"
                    color={superior !== null ? "gray.800" : "gray.700"}
                    fontWeight={superior !== null ? "medium" : "normal"}
                    placeholder="Search Agent ID, Name, or Position"
                    value={searchVal}
                    readOnly={superior !== null}
                    cursor={superior !== null ? "default" : "text"}
                    _placeholder={{ color: "gray.400" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                    onChange={(e) => setSearchVal(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.code === "Enter") runSearch();
                    }}
                  />
                </Box>

                <Flex align="center" pr={2} flexShrink={0}>
                  <IconButton
                    aria-label={superior !== null ? "Clear selected superior" : "Search"}
                    variant="ghost"
                    size="xs"
                    borderRadius="full"
                    color="gray.400"
                    _hover={{ bg: "gray.100", color: "gray.600" }}
                    onClick={() => {
                      if (superior !== null) clearSuperior();
                      else runSearch();
                    }}
                  >
                    {superior !== null ? <LuX size={12} /> : <LuChevronsUpDown size={12} />}
                  </IconButton>
                </Flex>
              </HStack>

              {superior === null ? (
                <Grid>
                  <GridItem minW={0} boxShadow="md" borderRadius="md">
                    <DataTable<SalesAgent>
                      columns={columns}
                      data={data}
                      getRowId={(row) => row.id}
                      onRowClick={(row) => {
                        setSuperior(getAgentById(row.id)!);
                        setSearchVal(row.firstName + " " + row.lastName);
                      }}
                      emptyState={
                        <Flex
                          flexDir="column"
                          align="center"
                          gap={2}
                          py={10}
                          color="gray.500"
                        >
                          <LuUserRound size={32} />
                          <Body>
                            Search above to find the agent you want to promote
                            to superior.
                          </Body>
                        </Flex>
                      }
                      features={{
                        search: true,
                        filtering: true,
                        sorting: true,
                        pagination: true,
                        columnToggle: true,
                        selection: false,
                        draggable: false,
                        detailSidebar: false,
                      }}
                      mobileConfig={{ viewMode: "card", primaryField: "name", secondaryField: "position" }}
                    />
                  </GridItem>
                </Grid>
              ) : (
                <SuperiorCard superior={superior} onClear={clearSuperior} />
              )}
            </Flex>
          </Flex>

          {/* STEP 2 — only after superior is picked */}
          {superior !== null && (
            <Flex flexDirection="column" minW={0} height="100%">
              <Flex flexDir="column">
                <StepHeader
                  index={2}
                  title={`Pick agents to assign under ${superior.firstName} ${superior.lastName}`}
                  hint="Tick every agent you want to move. Only agents eligible to report to this superior are listed."
                  state={selectedSubs.length > 0 ? "done" : "active"}
                />

                {selectedSubs.length > 0 && (
                  <Flex mb={3} align="center" gap={2}>
                    <Badge
                      colorPalette="green"
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      <LuUsersRound />
                      <Body ml={1}>
                        {selectedSubs.length} agent
                        {selectedSubs.length > 1 ? "s" : ""} selected
                      </Body>
                    </Badge>
                  </Flex>
                )}

                <DataTable<SalesAgent>
                  columns={columns}
                  data={possibleSubs}
                  getRowId={(row) => row.id}
                  onSelectionChange={(rows) => setSelectedSubs(rows)}
                  emptyState={
                    <Flex
                      flexDir="column"
                      align="center"
                      gap={2}
                      py={10}
                      color="gray.500"
                    >
                      <LuUsersRound size={32} />
                      <Body>
                        No agents are eligible to report to this superior.
                      </Body>
                    </Flex>
                  }
                  features={{
                    search: true,
                    filtering: true,
                    sorting: true,
                    pagination: true,
                    columnToggle: true,
                    selection: true,
                    draggable: false,
                    detailSidebar: false,
                  }}
                  mobileConfig={{ viewMode: "card", primaryField: "name", secondaryField: "position" }}
                />

                <Flex
                  w="100%"
                  mt="20px"
                  justifyContent="flex-end"
                  align="center"
                  gap={3}
                >
                  <Body color="gray.500">
                    {selectedSubs.length === 0
                      ? "Select at least one agent to continue."
                      : "Review your changes on the next step."}
                  </Body>
                  <PrimaryMdButton
                    onClick={handleConfirm}
                    disabled={selectedSubs.length === 0}
                  >
                    Submit
                  </PrimaryMdButton>
                </Flex>
              </Flex>
            </Flex>
          )}
        </Flex>
        </Page.MainContent>
      </Page.Root>
    </>
  );
};

interface SuperiorCardProps {
  superior: SalesAgent;
  onClear: () => void;
}

const SuperiorCard = ({ superior, onClear }: SuperiorCardProps) => (
  <Flex
    flexDir="column"
    gap={2}
    p={4}
    boxShadow={"md"}
    borderRadius={{ base: "2xl", md: "md" }}
  >
    <Flex gap={4} align="center" justify="space-between">
      <Flex gap={4} align="center">
        <Avatar.Root size="2xl">
          <Avatar.Fallback color="var(--chakra-colors-primary)">
            {superior.firstName.charAt(0)}
            {superior.lastName.charAt(0)}
          </Avatar.Fallback>
        </Avatar.Root>

        <Flex flexDir="column" justifyContent="center">
          <H4 color="var(--chakra-colors-primary)">
            {superior.firstName + " " + superior.lastName}
          </H4>
          <Small>{superior.id}</Small>
        </Flex>
      </Flex>

      <Badge
        colorPalette="green"
        variant="subtle"
        px={3}
        py={1}
        borderRadius="full"
        cursor="pointer"
        onClick={onClear}
      >
        <LuCheck />
        <Text ml={1}>Selected — change</Text>
      </Badge>
    </Flex>

    <Flex flexDir="column" gap={2} p={3}>
      <Strong color="var(--chakra-colors-primary)">Information</Strong>

      {/* Desktop */}
      <Grid
        display={{ base: "none", md: "grid" }}
        templateColumns="repeat(3, 1fr)"
        gap={4}
      >
        <InfoItem
          label="Position"
          value={getPositionDesc(superior.position) ?? superior.position}
        />
        <InfoItem
          label="Current Superior"
          value={getAgentNameById(superior.superiorId ?? "") ?? "N/A"}
        />
        <InfoItem label="Date Hired" value={formatDate(superior.hireDate)} />
      </Grid>

      {/* Mobile */}
      <Flex display={{ base: "flex", md: "none" }} flexDir="column" gap={2} paddingX={2}>
        <LabelText
          label="Position"
          value={getPositionDesc(superior.position) ?? superior.position}
        />
        <Separator />
        <LabelText
          label="Current Superior"
          value={getAgentNameById(superior.superiorId ?? "") ?? "N/A"}
        />
        <Separator />
        <LabelText label="Date Hired" value={formatDate(superior.hireDate)} />
      </Flex>
    </Flex>

    <Flex flexDir="column" gap={2} p={3}>
      <Strong color="var(--chakra-colors-primary)">Current Team</Strong>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}>
        {(() => {
          const subordinates = getSubordinates(superior.id);
          return subordinates.length > 0 ? (
            subordinates.map((sub) => (
              <Flex
                flexDir={{ base: "row" }}
                justify={{ base: "space-between", md: "flex-start" }}
                align={{ base: "center" }}
                gap={2}
                key={sub.id}
                p={2}
              >
                <Text color="gray.800">
                  {sub.firstName} {sub.lastName}
                </Text>
                <Text display={{ base: "none", md: "block" }} color="gray.500">
                  -
                </Text>
                <Text fontSize={{ base: "16px" }} color="gray.500">
                  {getPositionDesc(sub.position) ?? sub.position}
                </Text>
              </Flex>
            ))
          ) : (
            <GridItem colSpan={2}>
              <Small>No subordinates yet — this will be a new team.</Small>
            </GridItem>
          );
        })()}
      </Grid>
    </Flex>
  </Flex>
);

interface ReassignSummaryProps {
  superior: SalesAgent;
  agents: SalesAgent[];
  onBack: () => void;
}

const ReassignSummary = ({
  superior,
  agents,
  onBack,
}: ReassignSummaryProps) => {
  const handleSubmit = () => {
    // TODO: wire up to real reassignAgent() API
  };

  return (
    <Page.Root
      title="Review Re-organization"
      description="Double-check the new superior and the agents being moved before submitting."
    >
      <Page.ToolContent>
        <Flex align="center" gap={3}>
          <Flex
            as="button"
            align="center"
            gap={2}
            color="var(--chakra-colors-primary)"
            onClick={onBack}
            cursor="pointer"
          >
            <LuArrowLeft />
            <Strong>Back to edit</Strong>
          </Flex>
          <PrimaryMdButton onClick={handleSubmit}>
            Submit Re-organization
          </PrimaryMdButton>
        </Flex>
      </Page.ToolContent>
      <Page.MainContent>
        <Summary
          title="Re-organization Summary"
          subtitle="Verify the information below before submitting the re-organization."
          data={[
            {
              title: "New Superior",
              data: [
                {
                  label: "Name",
                  value: `${superior.firstName} ${superior.lastName}`,
                },
                { label: "Agent ID", value: superior.id },
                {
                  label: "Position",
                  value:
                    getPositionDesc(superior.position) ?? superior.position,
                },
                {
                  label: "Current Superior",
                  value: getAgentNameById(superior.superiorId ?? "") ?? "N/A",
                },
                { label: "Date Hired", value: formatDate(superior.hireDate) },
              ],
            },
            {
              title: `Agents to Re-organized (${agents.length})`,
              data: agents.map((a) => ({
                label: `${a.firstName} ${a.lastName} · ${a.id}`,
                value: `${
                  getPositionDesc(a.position) ?? a.position
                } — from ${getAgentNameById(a.superiorId ?? "") ?? "N/A"}`,
              })),
            },
          ]}
        />
      </Page.MainContent>
    </Page.Root>
  );
};

const columns: ColumnDef<SalesAgent>[] = [
  {
    accessorKey: "id",
    header: "Agent ID",
    enableColumnFilter: false,
    cell: (info) => <Small>{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "name",
    header: "Full Name",
    enableColumnFilter: true,
    cell: (info) => <Small>{String(info.getValue())}</Small>,
  },
  {
    accessorKey: "position",
    header: "Position",
    enableColumnFilter: true,
    cell: (info) => <Small>{getPositionDesc(String(info.getValue()))}</Small>,
  }
];

export default ReassignPageWeb;
