// Change or Add by: JLO 2026-05-16
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
  LuPhone,
  LuMail,
  LuMapPin,
  LuPrinter,
  LuShare2,
  LuArrowLeft,
  LuSearch,
  LuPlus,
  LuActivity,
} from "react-icons/lu";
import AgentInfoTabsMobile from "../tabs/agent-info-tabs-mobile";
import {
  PendingRequests,
  RequestProps,
} from "@/components/new-planholder-profile/sections/pending-requests";
import DataTable from "../../common/reusable-tableV2/DataTable";
import TeamMemberDrawer from "../drawers/team-member-drawer";
import { useState } from "react";
import { Button } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import AgentEditForm from "../forms/agent-edit-form";
import AgentReassignForm from "../forms/agent-reassign-form";
import AgentMovementForm from "../forms/agent-movement-form";
import { SearchAgentDialog } from "../../common/agent-lookup/search-agent-dialog";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import MenuButton, { MenuItemButton } from "@/components/buttons/MenuButton";
import Page from "@/claude components/layout/page/Page";
import ReferralPage from "./referral-page";
import { useRouter } from "next/navigation";
import Card from "@/components/cards/Card";
import { PageHeader } from "@/app/page-template/page";
import { ActionButtonItem } from "@/app/page-template/ActionButtons";

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

const AgentDetailsMobile = (params: {
  selectedAgent: SalesAgent | undefined;
  onAgentSelect?: (agent: SalesAgent | undefined) => void;
}) => {
  const { selectedAgent, onAgentSelect } = params;
  const [page, setPage] = useState("default");
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<SalesAgent | null>(null);
  const router = useRouter();

  const actionButtonDefs: ActionButtonItem[] = [
    {
      label: "New Request",
      href: `/request/new`,
      icon: LuPlus, // Clock for time logging
    },
    {
      label: "Tracker",
      href: `/Transaction`,
      icon: LuActivity, // Clock for time logging
    },
  ];

  return (
    <Page.Root
      title="Sales Agent Profile"
      description="View sales agent information and details."
    >
      <PageHeader
        title="Sales Agent Profile"
        subtitle="View sales agent information and details."
        actionButtonDefs={actionButtonDefs}
      />
      {page === "default" && (
        <Page.ToolContent>
          {selectedAgent && (
            <MenuButton>
              <MenuItemButton
                icon={<LuUserPen />}
                label="Edit"
                itemKey="edit"
                value="edit"
                onClick={() => setPage("edit")}
              />
              <MenuItemButton
                icon={<LuReplace />}
                label="Re-Organized"
                itemKey="reassign"
                value="reassign"
                onClick={() => setPage("reassign")}
              />
              <MenuItemButton
                icon={<LuTrendingUpDown />}
                label="Movement"
                itemKey="movement"
                value="movement"
                onClick={() => setPage("movement")}
              />
              <MenuItemButton
                icon={<LuShare2 />}
                label="Referral"
                itemKey="referral"
                value="referral"
                onClick={() => setPage("referral")}
              />
              <MenuItemButton
                icon={<LuPrinter />}
                label="Reprint SFID"
                itemKey="printing"
                value="printing"
                onClick={() => router.push("/printing")}
              />
            </MenuButton>
          )}
        </Page.ToolContent>
      )}
      <Page.MainContent>
        {page === "default" ? (
          <Flex direction="column" gap={4}>
            {!selectedAgent ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                gap={4}
                py={16}
                px={6}
                textAlign="center"
              >
                <Box
                  p={5}
                  borderRadius="full"
                  bg="var(--chakra-colors-primary-disabled)/20"
                >
                  <LuSearch size={36} color="var(--chakra-colors-primary)" />
                </Box>
                <Box>
                  <Text fontWeight="semibold" fontSize="lg" color="gray.700">
                    No Agent Selected
                  </Text>
                  <Text fontSize="sm" color="gray.400" mt={1}>
                    Use the search bar above to find an agent.
                  </Text>
                </Box>
              </Flex>
            ) : (
              <Flex flexDir="column" gap={4}>
                <Box flex={1} minW={0}>
                  <SearchAgentDialog
                    onSelectChange={(a) => {
                      if (onAgentSelect) onAgentSelect(a);
                    }}
                  />
                </Box>
                <AgentProfileHeaderCard agent={selectedAgent} />

                {(() => {
                  const phone = selectedAgent.mobile || selectedAgent.landline;
                  const email = selectedAgent.email;
                  const addr = selectedAgent.address;
                  const address = addr
                    ? [
                        addr.unit,
                        addr.street,
                        addr.barangay,
                        addr.city,
                        addr.province,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : undefined;
                  return (
                    <Flex gap={2} overflow="hidden">
                      <Button
                        bg={"white"}
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
                              const local = d.startsWith("63")
                                ? "0" + d.slice(2)
                                : d;
                              return local.startsWith("09") &&
                                local.length === 11
                                ? local.replace(
                                    /(\d{4})(\d{3})(\d{4})/,
                                    "$1 $2 $3",
                                  )
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
                        bg={"white"}
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
                        bg={"white"}
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
                    </Flex>
                  );
                })()}

                <PendingRequests requests={MOCK_AGENT_REQUESTS} />

                <Card.Root>
                  <Card.MainContent>
                    <AgentInfoTabsMobile agent={selectedAgent} />
                  </Card.MainContent>
                </Card.Root>

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
                      <Strong
                        fontSize="16px"
                        color="var(--chakra-colors-primary)"
                      >
                        Team Members
                      </Strong>
                    }
                  />
                </Flex>
              </Flex>
            )}

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
          selectedAgent ? (
            <AgentReassignForm
              selectedAgent={selectedAgent}
              onCancel={() => setPage("default")}
              onSubmitted={() => setPage("default")}
            />
          ) : null
        ) : page === "movement" ? (
          selectedAgent ? (
            <AgentMovementForm
              selectedAgent={selectedAgent}
              onCancel={() => setPage("default")}
              onSubmitted={() => setPage("default")}
            />
          ) : null
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
