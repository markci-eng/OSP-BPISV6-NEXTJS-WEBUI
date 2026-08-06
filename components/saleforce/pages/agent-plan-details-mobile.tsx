"use client";

import {
  getSubordinates,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import { Flex, Strong, Text, Box } from "@chakra-ui/react";
import {
  LuReplace,
  LuTrendingUpDown,
  LuUserPen,
  LuPrinter,
  LuShare2,
} from "react-icons/lu";
import AgentInfoTabsMobile from "../tabs/agent-info-tabs-mobile";
import { PendingRequests } from "@/components/plan-management/planholder-profile/sections/pending-requests";
import { DataTable } from "osp-ui-kit";
import TeamMemberDrawer from "../drawers/team-member-drawer";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import ActionButtons, {
  ActionButtonItem,
} from "@/components/primitives/ActionButtons";
import { Page, ProfileHeaderCard } from "osp-ui-kit";
import { useRouter } from "next/navigation";
import { MOCK_AGENT_REQUESTS } from "@/app/(bpis)/data/saleforce/agent-requests";

const AgentDetailsMobile = (params: { selectedAgent: SalesAgent }) => {
  const { selectedAgent } = params;
  const router = useRouter();
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<SalesAgent | null>(null);

  const profileBase = `/sales-force/profile/${selectedAgent.id}`;

  const actionButtonDefs: ActionButtonItem[] = [
    {
      label: "Edit",
      icon: LuUserPen,
      onClick: () => router.push(`${profileBase}/edit`),
    },
    {
      label: "Re-Organize",
      icon: LuReplace,
      onClick: () => router.push(`${profileBase}/re-organize`),
    },
    {
      label: "Movement",
      icon: LuTrendingUpDown,
      onClick: () => router.push(`${profileBase}/movement`),
    },
    {
      label: "Referral",
      icon: LuShare2,
      onClick: () => router.push(`${profileBase}/referral`),
    },
    {
      label: "Reprint SFID",
      icon: LuPrinter,
      onClick: () => router.push(`${profileBase}/printing`),
    },
  ];

  return (
    <Page.Root
      title="Sales Agent Profile"
      description="View sales agent info and details."
    >
      <Page.ToolContent>
        <ActionButtons buttons={actionButtonDefs} />
      </Page.ToolContent>

      <Page.MainContent>
        <Flex flexDir="column" gap={4}>
          <ProfileHeaderCard
            name={selectedAgent.name}
            personId={selectedAgent.id}
            avatarUrl={mockAvatarUrl(selectedAgent.id)}
            homeAddress={[
              selectedAgent.address?.unit,
              selectedAgent.address?.street,
              selectedAgent.address?.barangay,
              selectedAgent.address?.city,
              selectedAgent.address?.province,
            ]
              .filter(Boolean)
              .join(", ")}
            contactNo={selectedAgent.mobile || selectedAgent.landline}
            email={selectedAgent.email}
            landlineNo={selectedAgent.landline}
          />

          <PendingRequests requests={MOCK_AGENT_REQUESTS} />

          <AgentInfoTabsMobile agent={selectedAgent} />

          <Flex borderColor="gray.200" borderRadius="md">
            <DataTable
              columns={columns}
              data={getSubordinates(selectedAgent.id)}
              onRowClick={(row) => {
                setSelectedTeamMember(row);
                setTeamDrawerOpen(true);
              }}
              features={{
                search: true,
                filtering: true,
                sorting: true,
                pagination: true,
                selection: false,
                columnToggle: true,
                detailSidebar: false,
              }}
              mobileConfig={{
                viewMode: "card",
                primaryField: "name",
                secondaryField: "id",
              }}
              title={
                <Strong fontSize="16px" color="var(--chakra-colors-primary)">
                  Team Members
                </Strong>
              }
            />
          </Flex>

          <TeamMemberDrawer
            agent={selectedTeamMember}
            open={teamDrawerOpen}
            onOpenChange={setTeamDrawerOpen}
          />
        </Flex>
      </Page.MainContent>
    </Page.Root>
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
