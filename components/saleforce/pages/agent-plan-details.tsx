"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Show,
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
  LuChevronsDown,
  LuChevronsUp,
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
import MenuButton, {
  MenuItemButton,
} from "@/claude components/buttons/MenuButton";
import { useRouter } from "next/navigation";
import TeamMemberDrawer from "../drawers/team-member-drawer";
import {
  PendingRequests,
  RequestProps,
} from "@/components/new-planholder-profile/sections/pending-requests";
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
import { TertiarySmButton } from "st-peter-ui";

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
  selectedAgent: SalesAgent;
  onDeleteAgent?: () => void;
}) {
  const [page, setPage] = useState("default");
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<SalesAgent | null>(null);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [employmentOpen, setEmploymentOpen] = useState(false);

  const { selectedAgent } = params;
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const expandAll = () => {
    setPersonalOpen(true);
    setAddressOpen(true);
    setContactOpen(true);
    setEmploymentOpen(true);
  };

  const collapseAll = () => {
    setPersonalOpen(false);
    setAddressOpen(false);
    setContactOpen(false);
    setEmploymentOpen(false);
  };

  const phone = selectedAgent.mobile || selectedAgent.landline;
  const email = selectedAgent.email;
  const addr = selectedAgent.address;
  const agentAddress = addr
    ? [addr.unit, addr.street, addr.barangay, addr.city, addr.province]
        .filter(Boolean)
        .join(", ")
    : undefined;

  const contactActions = (
    <Flex gap={2} overflow="hidden" flexWrap="wrap">
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
        disabled={!agentAddress}
        asChild={!!agentAddress}
        flexShrink={0}
      >
        {agentAddress ? (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(agentAddress)}`}
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

  const pendingRequestsCard = (
    <PendingRequests requests={MOCK_AGENT_REQUESTS} />
  );

  const agentPhAddress = addr
    ? [
        {
          id: "1",
          addressType: "RESIDENCE",
          addressNo: addr.unit || null,
          street: addr.street || null,
          barangay: addr.barangay || null,
          district: addr.district || null,
          city: addr.city,
          province: addr.province,
          zipCode: addr.zipCode ? parseInt(addr.zipCode) : null,
          isMailAddress: true,
        },
      ]
    : undefined;

  return (
    <Page.Root
      title="Sales Agent Profile"
      description="View sales agent information and details."
    >
      {page === "default" && (
        <Page.ToolContent>
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
        </Page.ToolContent>
      )}

      <Page.MainContent>
        {page === "default" ? (
          <>
            {/* Expand / Collapse strip */}
            <Flex justify="flex-end" gap={2} mb={1}>
              <TertiarySmButton onClick={expandAll}>
                <LuChevronsDown size={14} />
                Expand All
              </TertiarySmButton>
              <TertiarySmButton onClick={collapseAll}>
                <LuChevronsUp size={14} />
                Collapse All
              </TertiarySmButton>
            </Flex>

            {/* Single unified 2-column grid */}
            <Grid
              templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
              gap={5}
              alignItems="start"
            >
              {/* Left column — identity & details */}
              <GridItem>
                <Flex direction="column" gap={4}>
                  <AgentProfileHeaderCard agent={selectedAgent} />
                  {contactActions}
                  <Show when={isMobile}>{pendingRequestsCard}</Show>
                  <AgentPersonalInfoCard
                    agent={selectedAgent}
                    isOpen={personalOpen}
                    onToggle={() => setPersonalOpen((p) => !p)}
                  />
                  <PlanholderAddressCard
                    phAddress={agentPhAddress}
                    isOpen={addressOpen}
                    onToggle={() => setAddressOpen((p) => !p)}
                  />
                </Flex>
              </GridItem>

              {/* Right column — activity & admin */}
              <GridItem>
                <Flex direction="column" gap={4}>
                  <Show when={!isMobile}>{pendingRequestsCard}</Show>
                  <AgentContactInfoCard
                    agent={selectedAgent}
                    isOpen={contactOpen}
                    onToggle={() => setContactOpen((p) => !p)}
                  />
                  <AgentEmploymentInfoCard
                    agent={selectedAgent}
                    isOpen={employmentOpen}
                    onToggle={() => setEmploymentOpen((p) => !p)}
                  />
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

            {/* MCPR — full width */}
            <Card.Root title="Monthly Collection Performance Report">
              <Card.MainContent>
                <MCPRList />
              </Card.MainContent>
            </Card.Root>
          </>
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
              <Button variant="outline" onClick={() => setPage("default")}>
                <LuArrowLeft /> Back
              </Button>
            </Flex>
            <ReferralPage />
          </Box>
        ) : (
          <Box>
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
