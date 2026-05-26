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
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import Summary from "@/components/forms/Summary";
import { Page } from "@/components/page/page";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { CARD_LAYOUT } from "@/lib/theme/layout-tokens";
import {
  STANDARD_ICON_BUTTON_STYLES,
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";
import {
  Avatar,
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  Group,
  IconButton,
  Input,
  Strong,
  Text,
} from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import {
  LuArrowLeft,
  LuCheck,
  LuSearch,
  LuUserRound,
  LuUsersRound,
} from "react-icons/lu";
import {
  Body,
  H4,
  PrimaryMdButton,
  SecondaryMdButton,
  Small,
} from "st-peter-ui";

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
    state === "upcoming" ? BRAND_COLORS.grey : BRAND_COLORS.primaryGreen;

  return (
    <Flex align="flex-start" gap={3} mb={{ base: 3, md: 4 }}>
      <Flex
        borderRadius="full"
        h="32px"
        w="32px"
        minW="32px"
        bg={state === "done" ? color : "transparent"}
        borderColor={color}
        borderWidth={2}
        align="center"
        justify="center"
        color={state === "done" ? BRAND_COLORS.white : color}
        boxShadow={state === "active" ? STANDARD_SHADOWS.level1 : undefined}
      >
        {state === "done" ? (
          <LuCheck size={14} />
        ) : (
          <Strong fontSize="14px">{index}</Strong>
        )}
      </Flex>
      <Flex flexDir="column" gap={0.5} minW={0}>
        <Strong color={color} fontSize={{ base: "15px", md: "16px" }}>
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
    <Page
      title="Re-Organization"
      description="Move sales agents under a new superior in two quick steps."
      breadcrumbItems={breadItem}
    >
      <Flex
        flexDir="column"
        gap={{ base: CARD_LAYOUT.gap.base, md: CARD_LAYOUT.gap.md }}
        p={{ base: 0 }}
      >
        <ProfileSectionCard>
          <StepHeader
            index={1}
            title="Choose the new superior"
            hint="Search by ID, name, or position. The person you pick here will receive the agents you select in Step 2."
            state={superior ? "done" : "active"}
          />

          <Flex flexDir="column" gap={4}>
            <Group
              attached
              w="full"
              maxW={{ base: "full", md: "560px" }}
              boxShadow={STANDARD_SHADOWS.level1}
            >
              <Input
                h="40px"
                borderLeftRadius={STANDARD_RADIUS.md}
                borderRightRadius="0"
                borderColor={BRAND_COLORS.neutralBorder}
                color={BRAND_COLORS.neutralText}
                _focusVisible={{
                  borderColor: BRAND_COLORS.primaryGreen,
                  boxShadow: `0 0 0 1px ${BRAND_COLORS.primaryGreen}`,
                }}
                placeholder="Search Agent ID, Name, or Position"
                value={searchVal}
                onChange={(e) => setSearchVal(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.code === "Enter") runSearch();
                }}
              />

              <IconButton
                {...STANDARD_ICON_BUTTON_STYLES.md}
                borderRightRadius={STANDARD_RADIUS.md}
                borderLeftRadius="0"
                bg={BRAND_COLORS.primaryGreen}
                _hover={{ bg: BRAND_COLORS.darkGreen }}
                _active={{ bg: BRAND_COLORS.darkGreen }}
                color={BRAND_COLORS.white}
                onClick={() => {
                  if (superior === null) runSearch();
                  else clearSuperior();
                }}
                aria-label={superior ? "Clear selected superior" : "Search"}
              >
                <LuSearch />
              </IconButton>
            </Group>

            {superior === null ? (
              <Grid>
                <GridItem minW={0}>
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
                  />
                </GridItem>
              </Grid>
            ) : (
              <SuperiorCard superior={superior} onClear={clearSuperior} />
            )}
          </Flex>
        </ProfileSectionCard>

        {superior !== null && (
          <ProfileSectionCard>
            <Flex flexDir="column" minW={0}>
              <StepHeader
                index={2}
                title={`Pick agents to assign under ${superior.firstName} ${superior.lastName}`}
                hint="Tick every agent you want to move. Only agents eligible to report to this superior are listed."
                state={selectedSubs.length > 0 ? "done" : "active"}
              />

              {selectedSubs.length > 0 && (
                <Flex mb={3} align="center" gap={2}>
                  <Badge
                    bg={BRAND_COLORS.successBg}
                    color={BRAND_COLORS.primaryGreen}
                    borderColor={BRAND_COLORS.primaryGreen}
                    borderWidth="1px"
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
                    <Body>No agents are eligible to report to this superior.</Body>
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
              />

              <Flex
                w="100%"
                mt="20px"
                justifyContent={{ base: "stretch", md: "flex-end" }}
                align={{ base: "stretch", md: "center" }}
                direction={{ base: "column", md: "row" }}
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
          </ProfileSectionCard>
        )}
      </Flex>
    </Page>
  );
};

interface SuperiorCardProps {
  superior: SalesAgent;
  onClear: () => void;
}

const SuperiorCard = ({ superior, onClear }: SuperiorCardProps) => (
  <Box
    borderWidth="1px"
    borderColor={BRAND_COLORS.neutralBorder}
    borderRadius={STANDARD_RADIUS.md}
    bg={BRAND_COLORS.white}
    p={{ base: 3, md: 4 }}
  >
    <Flex
      gap={4}
      align={{ base: "flex-start", md: "center" }}
      justify="space-between"
      direction={{ base: "column", md: "row" }}
    >
      <Flex gap={4} align="center" minW={0}>
        <Avatar.Root size="2xl">
          <Avatar.Fallback color={BRAND_COLORS.primaryGreen}>
            {superior.firstName.charAt(0)}
            {superior.lastName.charAt(0)}
          </Avatar.Fallback>
        </Avatar.Root>

        <Flex flexDir="column" justifyContent="center" minW={0}>
          <H4 color={BRAND_COLORS.primaryGreen}>
            {superior.firstName + " " + superior.lastName}
          </H4>
          <Small>{superior.id}</Small>
        </Flex>
      </Flex>

      <Badge
        bg={BRAND_COLORS.successBg}
        color={BRAND_COLORS.primaryGreen}
        borderColor={BRAND_COLORS.primaryGreen}
        borderWidth="1px"
        px={3}
        py={1}
        borderRadius="full"
        cursor="pointer"
        onClick={onClear}
      >
        <LuCheck />
        <Text ml={1}>Selected - change</Text>
      </Badge>
    </Flex>

    <Flex flexDir="column" gap={2} p={{ base: 0, md: 3 }} mt={4}>
      <Strong color={BRAND_COLORS.primaryGreen}>Information</Strong>
      <Grid
        templateColumns={{ base: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }}
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
    </Flex>

    <Flex flexDir="column" gap={2} p={{ base: 0, md: 3 }} mt={4}>
      <Strong color={BRAND_COLORS.primaryGreen}>Current Team</Strong>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
        {(() => {
          const subordinates = getSubordinates(superior.id);
          return subordinates.length > 0 ? (
            subordinates.map((sub) => (
              <Flex
                flexDir="row"
                justify={{ base: "space-between", md: "flex-start" }}
                align="center"
                gap={2}
                key={sub.id}
                p={2}
                borderRadius={STANDARD_RADIUS.md}
                bg={BRAND_COLORS.subtleBg}
              >
                <Text color="gray.800">
                  {sub.firstName} {sub.lastName}
                </Text>
                <Text display={{ base: "none", md: "block" }} color="gray.500">
                  -
                </Text>
                <Text color="gray.500">
                  {getPositionDesc(sub.position) ?? sub.position}
                </Text>
              </Flex>
            ))
          ) : (
            <GridItem colSpan={2}>
              <Small>No subordinates yet - this will be a new team.</Small>
            </GridItem>
          );
        })()}
      </Grid>
    </Flex>
  </Box>
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
    <Page
      title="Review Re-organization"
      description="Double-check the new superior and the agents being moved before submitting."
      breadcrumbItems={[...breadItem, { label: "Summary" }]}
    >
      <Flex
        flexDir="column"
        gap={{ base: CARD_LAYOUT.gap.base, md: CARD_LAYOUT.gap.md }}
      >
        <ProfileSectionCard>
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
                  label: `${a.firstName} ${a.lastName} - ${a.id}`,
                  value: `${
                    getPositionDesc(a.position) ?? a.position
                  } - from ${getAgentNameById(a.superiorId ?? "") ?? "N/A"}`,
                })),
              },
            ]}
          />

          <Flex
            justify={{ base: "stretch", md: "space-between" }}
            direction={{ base: "column", md: "row" }}
            p={{ base: 2, md: 4 }}
            gap={3}
            wrap="wrap"
          >
            <SecondaryMdButton onClick={onBack}>
              <Flex align="center" gap={2}>
                <LuArrowLeft />
                Back to edit
              </Flex>
            </SecondaryMdButton>
            <PrimaryMdButton onClick={handleSubmit}>
              Submit Re-organization
            </PrimaryMdButton>
          </Flex>
        </ProfileSectionCard>
      </Flex>
    </Page>
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
  },
];

export default ReassignPageWeb;
