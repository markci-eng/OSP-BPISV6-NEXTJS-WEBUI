"use client";

import {
  getSubordinates,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import { Flex, Strong, Text, Box, Button } from "@chakra-ui/react";
import {
  LuReplace,
  LuTrendingUpDown,
  LuUserPen,
  LuPhone,
  LuMail,
  LuMapPin,
  LuPrinter,
  LuShare2,
  LuArrowLeft,
} from "react-icons/lu";
import AgentInfoTabsMobile from "../tabs/agent-info-tabs-mobile";
import {
  PendingRequests,
  RequestProps,
} from "@/components/new-planholder-profile/sections/pending-requests";
import DataTable from "../../common/reusable-tableV2/DataTable";
import TeamMemberDrawer from "../drawers/team-member-drawer";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AgentEditForm from "../forms/agent-edit-form";
import AgentReassignForm from "../forms/agent-reassign-form";
import AgentMovementForm from "../forms/agent-movement-form";
import ProfileHeaderCard from "@/components/cards/ProfileHeaderCard";
import ActionButtons, {
  ActionButtonItem,
} from "@/components/buttons/ActionButtons";
import Page from "@/claude components/layout/page/Page";
import ReferralPage from "./referral-page";

const MOCK_AGENT_REQUESTS: RequestProps[] = [
  {
    type: "Reinstatement",
    title: "Contract Renewal",
    description: "Waiting for approval.",
    transactionId: "RI-202-6311",
    currentStep: 3,
    totalSteps: 7,
    status: "Pending",
    date: "",
    hyperlink: "/transaction/CA-202-6311",
  },
  {
    type: "Transfer of Rights",
    title: "Transfer Approval",
    description: "Waiting for approval.",
    transactionId: "TR-202-6309",
    currentStep: 2,
    totalSteps: 3,
    status: "Pending",
    date: "",
    hyperlink: "/transaction/TR-202-6311",
  },
];

const AgentDetailsMobile = (params: { selectedAgent: SalesAgent }) => {
  const { selectedAgent } = params;
  const [page, setPage] = useState("default");
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<SalesAgent | null>(null);

  const phone = selectedAgent.mobile || selectedAgent.landline;
  const email = selectedAgent.email;
  const addr = selectedAgent.address;
  const address = addr
    ? [addr.unit, addr.street, addr.barangay, addr.city, addr.province]
        .filter(Boolean)
        .join(", ")
    : undefined;

  const actionButtonDefs: ActionButtonItem[] = [
    { label: "Edit", icon: LuUserPen, onClick: () => setPage("edit") },
    {
      label: "Re-Organized",
      icon: LuReplace,
      onClick: () => setPage("reassign"),
    },
    {
      label: "Movement",
      icon: LuTrendingUpDown,
      onClick: () => setPage("movement"),
    },
    { label: "Referral", icon: LuShare2, onClick: () => setPage("referral") },
    { label: "Reprint SFID", icon: LuPrinter, href: "/printing" },
  ];

  return (
    <Page.Root
      title="Sales Agent Profile"
      description="View sales agent information and details."
    >
      {page === "default" && (
        <Page.ToolContent>
          <ActionButtons buttons={actionButtonDefs} />
        </Page.ToolContent>
      )}

      <Page.MainContent>
        {page === "default" ? (
          <Flex flexDir="column" gap={4}>
            <ProfileHeaderCard
              name={selectedAgent.name}
              personId={selectedAgent.id}
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

            {/* <Flex gap={2} overflow="hidden">
              <Button
                bg="white"
                variant="outline"
                size="sm"
                borderRadius="full"
                disabled={!phone}
                asChild={!!phone}
                flexShrink={0}
              >
                {phone ? (
                  <a href={`tel:${phone}`}>
                    <LuPhone />
                    {(() => {
                      const d = phone.replace(/\D/g, "");
                      const local = d.startsWith("63") ? "0" + d.slice(2) : d;
                      return local.startsWith("09") && local.length === 11
                        ? local.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")
                        : phone;
                    })()}
                  </a>
                ) : (
                  <>
                    <LuPhone />
                    No phone
                  </>
                )}
              </Button>
              <Button
                bg="white"
                variant="outline"
                size="sm"
                borderRadius="full"
                disabled={!email}
                asChild={!!email}
                flexShrink={0}
              >
                {email ? (
                  <a href={`mailto:${email}`}>
                    <LuMail />
                    Send email
                  </a>
                ) : (
                  <>
                    <LuMail />
                    Send email
                  </>
                )}
              </Button>
              <Button
                bg="white"
                variant="outline"
                size="sm"
                borderRadius="full"
                disabled={!address}
                asChild={!!address}
                flexShrink={0}
              >
                {address ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LuMapPin />
                    Map address
                  </a>
                ) : (
                  <>
                    <LuMapPin />
                    Map address
                  </>
                )}
              </Button>
            </Flex> */}

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
                  search: false,
                  filtering: false,
                  sorting: false,
                  pagination: true,
                  selection: false,
                  draggable: false,
                  columnToggle: false,
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
        ) : page === "edit" ? (
          <AgentEditForm
            selectedAgent={selectedAgent}
            onCancel={() => setPage("default")}
            onSubmitted={() => setPage("default")}
          />
        ) : page === "reassign" ? (
          <AgentReassignForm
            selectedAgent={selectedAgent}
            onCancel={() => setPage("default")}
            onSubmitted={() => setPage("default")}
          />
        ) : page === "movement" ? (
          <AgentMovementForm
            selectedAgent={selectedAgent}
            onCancel={() => setPage("default")}
            onSubmitted={() => setPage("default")}
          />
        ) : page === "referral" ? (
          <Box>
            <Flex justify="flex-start" mb={2}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage("default")}
              >
                <LuArrowLeft /> Back
              </Button>
            </Flex>
            <ReferralPage />
          </Box>
        ) : null}
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
