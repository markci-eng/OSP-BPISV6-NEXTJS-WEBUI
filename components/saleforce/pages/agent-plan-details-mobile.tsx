// Change or Add by: JLO 2026-05-16
"use client";

import {
  getSubordinates,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import {
  Flex,
  Text,
  Box,
  Carousel,
  IconButton,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuReplace,
  LuTrendingUpDown,
  LuUserPen,
  LuHistory,
} from "react-icons/lu";
import { ProgressCard } from "../../plan-management/planholders/cards/pending-request-card";
import AgentInfoTabsMobile from "../tabs/agent-info-tabs-mobile";
import DataTable from "../../common/reusable-tableV2/DataTable";
import TeamMemberDrawer from "../drawers/team-member-drawer";
import RequestHistoryDrawer from "../drawers/request-history-drawer";
import { useState } from "react";
import { Button } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import StickyNavbar from "../../common/navbar/StickyNavbar";
import StickyNavbarBtn from "../../common/navbar/StickyNavbarBtn";
import AgentEditForm from "../forms/agent-edit-form";
import AgentReassignForm from "../forms/agent-reassign-form";
import AgentMovementForm from "../forms/agent-movement-form";
import { SearchAgentDialog } from "../../common/agent-lookup/search-agent-dialog";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import AgentMoreDrawer from "../drawers/agent-more-drawer";
import { Page } from "@/components/page/page";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import ProfileSectionCard from "../components/profile-section-card";

const AgentDetailsMobile = (params: {
  selectedAgent: SalesAgent | undefined;
  onAgentSelect?: (agent: SalesAgent | undefined) => void;
  breadItem: {
    label: string;
    href?: string;
  }[];
}) => {
  const { selectedAgent, onAgentSelect } = params;
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<SalesAgent | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <Page
      title="Sales Agent Profile"
      description="View sales agent information and details."
      breadcrumbItems={params.breadItem}
    >
      <Flex direction="column" gap={4}>
        <Box py={2}>
          <SearchAgentDialog
            onSelectChange={(a) => {
              if (onAgentSelect) onAgentSelect(a);
            }}
          />
        </Box>

        {!selectedAgent ? (
          <Flex flexDir="column" gap={3}>
            <AgentProfileHeaderCard agent={undefined} />

            <ProfileSectionCard title="Pending Requests" minH="120px">
              <EmptyStateCard
                title="Request"
                description="No Pending Request"
                w="full"
              ></EmptyStateCard>
            </ProfileSectionCard>

            <ProfileSectionCard title="Agent Information">
                <AgentInfoTabsMobile agent={undefined} />
            </ProfileSectionCard>

            <ProfileSectionCard title="Team Members" minH="100px">
              <EmptyStateCard
                title="Team"
                description="No team members."
                w="full"
              ></EmptyStateCard>
            </ProfileSectionCard>
          </Flex>
        ) : (
          <>
            <Flex flexDir="column" gap={4}>
              <AgentProfileHeaderCard agent={selectedAgent} />

              <ProfileSectionCard
                title="Pending Requests"
                description="Track active approval workflows."
              >
                <Carousel.Root slideCount={2} maxW="full">
                  <Carousel.Control justifyContent="center" gap={2} w="full">
                    <Carousel.PrevTrigger asChild>
                      <IconButton size={"2xs"} variant="outline">
                        <LuArrowLeft />
                      </IconButton>
                    </Carousel.PrevTrigger>

                    <Carousel.ItemGroup w="full">
                      <Carousel.Item index={0}>
                        <ProgressCard
                          current={3}
                          total={7}
                          title={"Contract Renewal"}
                          description={"Waiting for approval."}
                          transactionId="RI-202-6311"
                          onClick={() =>
                            (window.location.href = "/transaction/CA-202-6311")
                          }
                        />
                      </Carousel.Item>

                      <Carousel.Item index={1}>
                        <ProgressCard
                          current={2}
                          total={3}
                          title={"Transfer Approval"}
                          description={"Waiting for approval."}
                          transactionId="TR-202-6309"
                          onClick={() =>
                            (window.location.href = "/transaction/TR-202-6311")
                          }
                        />
                      </Carousel.Item>
                    </Carousel.ItemGroup>

                    <Carousel.NextTrigger asChild>
                      <IconButton
                        size={{ base: "2xs", md: "xs" }}
                        variant="outline"
                      >
                        <LuArrowRight />
                      </IconButton>
                    </Carousel.NextTrigger>
                  </Carousel.Control>
                </Carousel.Root>

                <Flex justify="center" mt={2}>
                  <Button
                    variant="plain"
                    size="xs"
                    color="var(--chakra-colors-primary)"
                    onClick={() => setHistoryOpen(true)}
                  >
                    <LuHistory />
                    <Text fontSize="xs">View Request History</Text>
                  </Button>
                </Flex>
              </ProfileSectionCard>

              <ProfileSectionCard title="Agent Information">
                <AgentInfoTabsMobile agent={selectedAgent} />
              </ProfileSectionCard>

              <ProfileSectionCard title="Team Members">
                <DataTable
                  columns={columns}
                  data={getSubordinates(selectedAgent.id)}
                  onRowClick={(row) => {
                    setSelectedTeamMember(row);
                    setTeamDrawerOpen(true);
                  }}
                  features={{
                    search: false,
                    filtering: false,
                    sorting: false,
                    pagination: true,
                    selection: false,
                    draggable: false,
                    columnToggle: false,
                    detailSidebar: false,
                  }}
                />
              </ProfileSectionCard>
            </Flex>

            <StickyNavbar>
              <StickyNavbarBtn
                onClickEvent={() => {}}
                btnChildren={<LuUserPen />}
                title="Edit"
              >
                <Box pb={6}>
                  <AgentEditForm
                    selectedAgent={selectedAgent}
                    onCancel={() => {}}
                    hideActions
                  />
                </Box>
              </StickyNavbarBtn>

              <StickyNavbarBtn
                onClickEvent={() => {}}
                btnChildren={<LuReplace />}
                title="Re-Organized"
              >
                <Box pb={6}>
                  <AgentReassignForm
                    selectedAgent={selectedAgent}
                    onCancel={() => {}}
                    hideActions
                  />
                </Box>
              </StickyNavbarBtn>

              <StickyNavbarBtn
                onClickEvent={() => {}}
                btnChildren={<LuTrendingUpDown />}
                title="Movement"
              >
                <Box pb={6}>
                  <AgentMovementForm
                    selectedAgent={selectedAgent}
                    onCancel={() => {}}
                    hideActions
                  />
                </Box>
              </StickyNavbarBtn>

              <AgentMoreDrawer />
            </StickyNavbar>
          </>
        )}

        <TeamMemberDrawer
          agent={selectedTeamMember}
          open={teamDrawerOpen}
          onOpenChange={setTeamDrawerOpen}
        />

        <RequestHistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        />
      </Flex>
    </Page>
  );
};

const columns: ColumnDef<SalesAgent>[] = [
  {
    accessorKey: "id",
    header: "Agent ID",
    enableColumnFilter: false,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "name",
    header: "Name",
    enableColumnFilter: false,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
];

export default AgentDetailsMobile;
