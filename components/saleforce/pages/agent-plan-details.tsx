// Change or Add by: JLO 2026-05-16
"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Separator,
  Show,
  Strong,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LuPrinter,
  LuReplace,
  LuTrendingUpDown,
  LuUserPen,
  LuArrowLeft,
  LuPhone,
  LuMail,
  LuMapPin,
  LuShare2,
  LuSearch,
} from "react-icons/lu";
import DataTable from "../../common/reusable-tableV2/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import AgentEditForm from "../forms/agent-edit-form";
import {
  getSubordinates,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import MCPRList from "@/app/accounts-maintenance/mcpr/mcpr-list";
import MenuButton, { MenuItemButton } from "@/components/buttons/MenuButton";
import { useRouter } from "next/navigation";
import { SearchAgentDialog } from "../../common/agent-lookup/search-agent-dialog";
import TeamMemberDrawer from "../drawers/team-member-drawer";
import { PendingRequests, RequestProps } from "@/components/new-planholder-profile/sections/pending-requests";
import AgentReassignForm from "../forms/agent-reassign-form";
import AgentMovementForm from "../forms/agent-movement-form";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import Card from "@/components/cards/Card";
import AgentPersonalInfoCard from "../cards/AgentPersonalInfoCard";
import AgentEmploymentInfoCard from "../cards/AgentEmploymentInfoCard";
import Page from "@/components/layout/page/Page";
import { PlanholderAddressCard } from "@/components/new-planholder-profile/sections/address-info";
import ReferralPage from "./referral-page";
import AgentContactInfoCard from "../cards/AgentContactInfoCard";

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

export function AgentDetails(params: {
  selectedAgent: SalesAgent | undefined;
  onAgentSelect?: (agent: SalesAgent | undefined) => void;
}) {
  const [page, setPage] = useState("default");
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<SalesAgent | null>(null);
  const { selectedAgent, onAgentSelect } = params;
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const pendingRequestsCard = <PendingRequests requests={MOCK_AGENT_REQUESTS} />;

  return (
    <Page.Root
      title="Sales Agent Profile"
      description="View sales agent information and details."
    >
      {page === "default" && (
        <Page.ToolContent>
          <Flex
            direction={{ base: "column", sm: "row" }}
            gap={2}
            align={{ base: "stretch", sm: "center" }}
            w={{ base: "full", md: "auto" }}
          >
            <Box w={{ base: "full", sm: "320px" }}>
              <SearchAgentDialog
                onSelectChange={(a) => {
                  if (onAgentSelect) {
                    onAgentSelect(a);
                  } else if (a) {
                    router.push(`/sales-force/profile/${a.id}`);
                  }
                }}
              />
            </Box>

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
          </Flex>
        </Page.ToolContent>
      )}
      <Page.MainContent>
      {page === "default" ? (
        <>
          {/* Empty state — mobile/tablet only, when no agent is selected */}
          <Flex
            display={{ base: selectedAgent ? "none" : "flex", lg: "none" }}
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

          {/* Main content — hidden on mobile/tablet when no agent selected; always visible on desktop */}
          <Box display={{ base: selectedAgent ? "block" : "none", lg: "block" }}>
            {selectedAgent ? (
              <>
                <Grid
                  my={6}
                  gap={{ base: 4, md: 6 }}
                  templateColumns={{ base: "1fr", xl: "2fr 1fr" }}
                >
                  <GridItem>
                    <Flex flexDir={"column"} gap={6}>
                      <AgentProfileHeaderCard agent={selectedAgent} />

                      {/* Quick action buttons */}
                      {(() => {
                        const phone = selectedAgent.mobile || selectedAgent.landline;
                        const email = selectedAgent.email;
                        const addr = selectedAgent.address;
                        const address = addr
                          ? [addr.unit, addr.street, addr.barangay, addr.city, addr.province]
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

                      {/* Pending requests — mobile only */}
                      <Show when={isMobile}>{pendingRequestsCard}</Show>

                      <AgentPersonalInfoCard agent={selectedAgent} />
                      <AgentEmploymentInfoCard agent={selectedAgent} />

                      <PlanholderAddressCard
                        phAddress={[
                          {
                            id: "1",
                            addressType: "RESIDENCE",
                            addressNo: "31",
                            street: "GSIS AVENUE",
                            barangay: "BAGONG NAYON",
                            district: "",
                            city: "ANTIPOLO",
                            province: "RIZAL",
                            zipCode: 1870,
                            isMailAddress: true,
                          },
                        ]}
                      />
                    </Flex>
                  </GridItem>

                  <GridItem>
                    <Flex
                      height={"100%"}
                      flexDir={"column"}
                      gap="6"
                      borderRadius={"md"}
                    >
                      {/* Pending requests — desktop only */}
                      <Show when={!isMobile}>{pendingRequestsCard}</Show>

                      <AgentContactInfoCard agent={selectedAgent} />

                      <Card.Root title="Team Members">
                        <Card.MainContent>
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
                        </Card.MainContent>
                      </Card.Root>
                    </Flex>
                  </GridItem>
                </Grid>

                <Box
                  w={"full"}
                  padding={6}
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="gray.200"
                  my={6}
                >
                  <Box width={"full"}>
                    <Flex justify={"space-between"}>
                      <Strong
                        fontSize={"md"}
                        color="var(--chakra-colors-primary)"
                      >
                        Monthly Collection Performance Report
                      </Strong>
                    </Flex>
                    <Separator my={2} />
                    <Flex p={2} gap={4} direction={"column"}>
                      <MCPRList />
                    </Flex>
                  </Box>
                </Box>
            </>
            ) : (
              <Grid
                my={6}
                gap={{ base: 4, md: 6 }}
                templateColumns={{ base: "1fr", xl: "2fr 1fr" }}
              >
                <GridItem>
                  <Flex flexDir={"column"} gap={6}>
                    <AgentProfileHeaderCard />
                    <AgentPersonalInfoCard agent={undefined} />
                    <AgentEmploymentInfoCard agent={undefined} />
                    <PlanholderAddressCard phAddress={undefined} />
                  </Flex>
                </GridItem>
                <GridItem>
                  <Flex height={"100%"} flexDir={"column"} gap="6" borderRadius={"md"}>
                    <PendingRequests />
                    <AgentContactInfoCard agent={undefined} />
                    <Card.Root title="Team Members">
                      <Card.MainContent>
                        <Flex align={"center"} justify="center" flexDir="column" py={10} />
                      </Card.MainContent>
                    </Card.Root>
                  </Flex>
                </GridItem>
              </Grid>
            )}
          </Box>
        </>
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
        <Box my={6}>
          <Flex justify="flex-start" mb={2}>
            <Button variant="outline" onClick={() => setPage("default")}>
              <LuArrowLeft /> Back
            </Button>
          </Flex>
          <ReferralPage />
        </Box>
      ) : (
        <Box my={6}>
          <AgentEditForm
            selectedAgent={selectedAgent}
            onCancel={() => setPage("default")}
            onSubmitted={() => setPage("default")}
          />
        </Box>
      )}

      <TeamMemberDrawer
        agent={selectedTeamMember}
        open={teamDrawerOpen}
        onOpenChange={setTeamDrawerOpen}
      />

      </Page.MainContent>
    </Page.Root>
  );
}

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
