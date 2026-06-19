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
import Page from "@/claude components/layout/page/Page";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import {
  Avatar,
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
} from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import {
  LuArrowLeft,
  LuBriefcase,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsUpDown,
  LuSearch,
  LuUser,
  LuUserRound,
  LuUsers,
  LuUsersRound,
  LuX,
} from "react-icons/lu";
import { Body, H4, PrimaryMdButton, Small } from "st-peter-ui";
import Summary from "@/components/forms/Summary";
import { RowItem } from "@/claude components/info-card/row-item";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";
import InfoCard from "@/claude components/info-card/info-card";

interface ReassignPageWebProps {
  superior: SalesAgent | null;
  setSuperior: (agent: SalesAgent | null) => void;
}

type ViewMode = "form" | "summary";

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

const ReassignPageWeb = ({ superior, setSuperior }: ReassignPageWebProps) => {
  const [searchVal, setSearchVal] = React.useState("");
  const [data, setData] = React.useState<SalesAgent[]>([]);
  const [selectedSubs, setSelectedSubs] = React.useState<SalesAgent[]>([]);
  const [view, setView] = React.useState<ViewMode>("form");
  const [step1Open, setStep1Open] = React.useState(true);
  const [step2Open, setStep2Open] = React.useState(false);

  const runSearch = () => {
    setData(getAllAgents().filter((a) => matchesQuery(a, searchVal)));
    if (superior !== null) setSuperior(null);
  };

  const clearSuperior = () => {
    setSuperior(null);
    setSearchVal("");
    setSelectedSubs([]);
    setStep1Open(true);
    setStep2Open(false);
  };

  const handleSuperiorSelect = (agent: SalesAgent) => {
    setSuperior(getAgentById(agent.id)!);
    setSearchVal(agent.firstName + " " + agent.lastName);
    setStep1Open(false);
    setStep2Open(true);
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

  const step1Subtitle = superior
    ? `${superior.firstName} ${superior.lastName} · ${superior.id}`
    : "Search and select the receiving superior";

  const step2Subtitle =
    selectedSubs.length > 0
      ? `${selectedSubs.length} agent${selectedSubs.length > 1 ? "s" : ""} selected`
      : "Tick agents to move under this superior";

  return (
    <Page.Root
      headerButton="menu"
      title="Re-Organization"
      description="Move sales agents under a new superior in two quick steps."
    >
      <Page.MainContent>
        <Flex flexDir="column" gap={4} mt={{ base: "10px", md: 0 }}>
          {/* STEP 1 — Choose the new superior */}
          <InputCardAccordion
            icon={<LuUser size={16} />}
            title="Choose the New Superior"
            subtitle={step1Subtitle}
            isOpen={step1Open}
            onToggle={() => setStep1Open((p) => !p)}
            isComplete={superior !== null}
          >
            <Flex flexDir="column" gap={4}>
              {!superior && (
                <InfoCard>
                  Search by Agent ID, full name, or position. The person you
                  pick here will receive the agents you select in Step 2.
                </InfoCard>
              )}

              {/* Search bar */}
              <HStack
                w="full"
                gap={0}
                border="1.5px solid"
                borderColor={
                  superior !== null
                    ? "var(--chakra-colors-primary-disabled)"
                    : "gray.200"
                }
                borderRadius="lg"
                bg="white"
                boxShadow="xs"
                overflow="hidden"
                transition="border-color 0.15s, box-shadow 0.15s"
                _hover={{
                  borderColor:
                    superior !== null
                      ? "var(--chakra-colors-primary)"
                      : "gray.300",
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
                  color={
                    superior !== null
                      ? "var(--chakra-colors-primary)"
                      : "gray.400"
                  }
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
                    aria-label={
                      superior !== null ? "Clear selected superior" : "Search"
                    }
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
                    {superior !== null ? (
                      <LuX size={12} />
                    ) : (
                      <LuChevronsUpDown size={12} />
                    )}
                  </IconButton>
                </Flex>
              </HStack>

              {/* Results: table or selected superior card */}
              {superior === null ? (
                <Box boxShadow="md" borderRadius="md">
                  <DataTable<SalesAgent>
                    columns={columns}
                    data={data}
                    getRowId={(row) => row.id}
                    onRowClick={(row) => handleSuperiorSelect(row)}
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
                          Search above to find the agent you want to promote to
                          superior.
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
                    mobileConfig={{
                      viewMode: "card",
                      primaryField: "name",
                      secondaryField: "position",
                    }}
                  />
                </Box>
              ) : (
                <SuperiorCard superior={superior} onClear={clearSuperior} />
              )}
            </Flex>
          </InputCardAccordion>

          {/* STEP 2 — only after superior is picked */}
          {superior !== null && (
            <InputCardAccordion
              icon={<LuUsers size={16} />}
              title={`Assign Agents to ${superior.firstName} ${superior.lastName}`}
              subtitle={step2Subtitle}
              isOpen={step2Open}
              onToggle={() => setStep2Open((p) => !p)}
              isComplete={selectedSubs.length > 0}
            >
              <Flex flexDir="column" gap={4}>
                {selectedSubs.length > 0 && (
                  <Flex align="center">
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
                  mobileConfig={{
                    viewMode: "card",
                    primaryField: "name",
                    secondaryField: "position",
                  }}
                />

                <Flex w="100%" justifyContent="flex-end" align="center" gap={3}>
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
            </InputCardAccordion>
          )}
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
};

/* ─── Superior Card ──────────────────────────────────────────────────────── */

interface SuperiorCardProps {
  superior: SalesAgent;
  onClear: () => void;
}

const SuperiorCard = ({ superior, onClear }: SuperiorCardProps) => {
  const subordinates = getSubordinates(superior.id);

  return (
    <Flex flexDir="column" gap={3}>
      {/* Profile row */}
      <Flex
        gap={4}
        align="center"
        justify="space-between"
        px={2}
        py={3}
        borderRadius="xl"
        bg="gray.50"
      >
        <Flex gap={3} align="center">
          <Avatar.Root size="lg">
            <Avatar.Fallback color="var(--chakra-colors-primary)">
              {superior.firstName.charAt(0)}
              {superior.lastName.charAt(0)}
            </Avatar.Fallback>
          </Avatar.Root>
          <Flex flexDir="column">
            <H4 color="var(--chakra-colors-primary)">
              {superior.firstName} {superior.lastName}
            </H4>
            <Small color="gray.500">{superior.id}</Small>
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

      {/* Agent details */}
      <InputCardAccordion
        icon={<LuBriefcase size={16} />}
        title="Agent Details"
        subtitle="Position and employment info"
        defaultOpen
      >
        <Flex flexDir="column">
          <RowItem
            label="Position"
            value={getPositionDesc(superior.position) ?? superior.position}
          />
          <RowItem
            label="Current Superior"
            value={getAgentNameById(superior.superiorId ?? "") ?? "N/A"}
          />
          <RowItem label="Date Hired" value={formatDate(superior.hireDate)} />
        </Flex>
      </InputCardAccordion>

      {/* Current team */}
      <InputCardAccordion
        icon={<LuUsers size={16} />}
        title="Current Team"
        subtitle={
          subordinates.length > 0
            ? `${subordinates.length} subordinate${subordinates.length > 1 ? "s" : ""}`
            : "No existing team"
        }
        defaultOpen
      >
        {subordinates.length > 0 ? (
          <Flex flexDir="column">
            {subordinates.map((sub) => (
              <RowItem
                key={sub.id}
                label={`${sub.firstName} ${sub.lastName}`}
                value={getPositionDesc(sub.position) ?? sub.position}
              />
            ))}
          </Flex>
        ) : (
          <Small color="gray.500">
            No subordinates yet — this will be a new team.
          </Small>
        )}
      </InputCardAccordion>
    </Flex>
  );
};

/* ─── Summary Page ───────────────────────────────────────────────────────── */

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
              title: `Agents to Re-organize (${agents.length})`,
              data: agents.map((a) => ({
                label: `${a.firstName} ${a.lastName} · ${a.id}`,
                value: `${
                  getPositionDesc(a.position) ?? a.position
                } — from ${getAgentNameById(a.superiorId ?? "") ?? "N/A"}`,
              })),
            },
          ]}
        />
        <Flex
          w="full"
          justify="space-between"
          align="center"
          mb={1}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            aria-label="Previous step"
            size="sm"
            variant="outline"
            onClick={onBack}
          >
            <LuChevronLeft />
          </IconButton>

          <IconButton
            aria-label="submit"
            size="sm"
            variant="solid"
            onClick={handleSubmit}
            px={3}
          >
            Submit Re-organization
            <LuChevronRight />
          </IconButton>
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
};

/* ─── Column Definitions ─────────────────────────────────────────────────── */

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
  },
];

export default ReassignPageWeb;
