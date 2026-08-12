"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Show,
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
  LuUsers,
  LuClipboardList,
  LuTarget,
  LuHandCoins,
} from "react-icons/lu";
import { useState } from "react";
import AgentEditForm from "../forms/agent-edit-form";
import {
  getSubordinates,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import MenuButton, { MenuItemButton } from "@/components/primitives/MenuButton";
import { useRouter } from "next/navigation";
import TeamMemberDrawer from "../drawers/team-member-drawer";
import { PendingRequests } from "@/components/plan-management/planholder-profile/sections/pending-requests";
import AgentReassignForm from "../forms/agent-reassign-form";
import AgentMovementForm from "../forms/agent-movement-form";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import AgentPersonalInfoCard from "../cards/AgentPersonalInfoCard";
import AgentEmploymentInfoCard from "../cards/AgentEmploymentInfoCard";
import {
  InfoCardAccordion,
  MetricCard,
  Page,
  ProfileHeaderCard,
  SecondarySmButton,
} from "osp-ui-kit";
import { PlanholderAddressCard } from "@/components/plan-management/planholder-profile/sections/address-info";
import ReferralPage from "./referral-page";
import AgentContactInfoCard from "../cards/AgentContactInfoCard";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import ActionButtons, {
  ActionButtonItem,
} from "@/components/primitives/ActionButtons";
import MCPRList, {
  mcprData,
} from "@/app/(bpis)/accounts-maintenance/mcpr/mcpr-list";
import { SuperiorResultCard } from "@/app/(bpis)/sales-force/re-assign/components/SuperiorResultCard";
import { MOCK_AGENT_REQUESTS } from "@/app/(bpis)/data/saleforce/agent-requests";

const peso = (value: number) =>
  `₱ ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function AgentDetails(params: {
  selectedAgent: SalesAgent;
  onDeleteAgent?: () => void;
}) {
  const [page, setPage] = useState("default");
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<SalesAgent | null>(null);
  const isWebOnMount = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;
  const [personalOpen, setPersonalOpen] = useState(isWebOnMount);
  const [addressOpen, setAddressOpen] = useState(isWebOnMount);
  const [contactOpen, setContactOpen] = useState(isWebOnMount);
  const [employmentOpen, setEmploymentOpen] = useState(isWebOnMount);

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
    <PendingRequests requests={MOCK_AGENT_REQUESTS} h="full" />
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

  const profileBase = `/sales-force/profile/${selectedAgent.id}`;

  // Primary actions — surfaced as visible toolbar buttons
  const primaryActions = [
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
  ];

  // Secondary actions — kept in the overflow quick-actions sheet
  const overflowActions = [
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
      description="View sales agent information and details."
    >
      {page === "default" && (
        <Page.ToolContent>
          <Flex align="center" gap={2}>
            {primaryActions.map((action) => (
              <SecondarySmButton key={action.label} onClick={action.onClick}>
                <action.icon />
                {action.label}
              </SecondarySmButton>
            ))}
            {overflowActions.length > 0 && (
              <ActionButtons buttons={overflowActions} />
            )}
          </Flex>
        </Page.ToolContent>
      )}

      <Page.MainContent>
        {page === "default" ? (
          <>
            {/* Expand / Collapse strip */}
            {/* <Flex justify="flex-end" gap={2} mb={1}>
              <TertiarySmButton onClick={expandAll}>
                <LuChevronsDown size={14} />
                Expand All
              </TertiarySmButton>
              <TertiarySmButton onClick={collapseAll}>
                <LuChevronsUp size={14} />
                Collapse All
              </TertiarySmButton>
            </Flex> */}

            <Flex direction="column" gap={4}>
              {/* Top row — profile header + pending requests share an equal
                  height on desktop (both stretch to the taller of the two) */}
              <Grid
                templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                gap={5}
                alignItems="stretch"
              >
                <GridItem>
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
                </GridItem>
                <GridItem>
                  <Show when={!isMobile}>{pendingRequestsCard}</Show>
                </GridItem>
              </Grid>

              {/* Pending requests sits under the header on mobile */}
              <Show when={isMobile}>{pendingRequestsCard}</Show>

              {/* Lower row — detail cards share an equal height on desktop */}
              <Grid
                templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                gap={5}
                alignItems="stretch"
              >
                <GridItem>
                  <AgentEmploymentInfoCard
                    agent={selectedAgent}
                    isOpen={employmentOpen}
                    onToggle={() => setEmploymentOpen((p) => !p)}
                    h={employmentOpen ? "full" : undefined}
                  />
                </GridItem>
                <GridItem>
                  <AgentPersonalInfoCard
                    agent={selectedAgent}
                    isOpen={personalOpen}
                    onToggle={() => setPersonalOpen((p) => !p)}
                    h={personalOpen ? "full" : undefined}
                  />
                </GridItem>
              </Grid>
            </Flex>

            {/* Team Members — full width, hidden for SA1 positions */}
            {selectedAgent.position !== "SA1" && (
              <InfoCardAccordion
                icon={<LuUsers />}
                title="Team Members"
                subtitle={`${getSubordinates(selectedAgent.id).length} member(s)`}
                defaultOpen
              >
                <Flex direction="column" gap={2}>
                  {getSubordinates(selectedAgent.id).map((member) => (
                    <SuperiorResultCard
                      key={member.id}
                      agent={member}
                      selected={selectedTeamMember?.id === member.id}
                      onSelect={() => {
                        setSelectedTeamMember(member);
                        setTeamDrawerOpen(true);
                      }}
                    />
                  ))}
                </Flex>
              </InfoCardAccordion>
            )}

            {/* MCPR — full width, SA2 positions only */}
            {selectedAgent.position === "SA2" && (
              <InfoCardAccordion
                icon={<LuClipboardList />}
                title="Monthly Collection Performance Report"
                subtitle="Collection performance summary by period"
                defaultOpen
              >
                {(() => {
                  const collected = mcprData.filter((r) => r.Aging === 0);
                  const noOfAccounts = mcprData.length;
                  const commQuota = mcprData.reduce(
                    (sum, r) => sum + r.CommQ30,
                    0,
                  );
                  const ncommQuota = mcprData.reduce(
                    (sum, r) => sum + r.QNCom,
                    0,
                  );
                  const commCollection = collected.reduce(
                    (sum, r) => sum + r.CommQ30,
                    0,
                  );
                  const ncommCollection = collected.reduce(
                    (sum, r) => sum + r.QNCom,
                    0,
                  );
                  return (
                    <Grid
                      templateColumns={{
                        base: "1fr",
                        sm: "repeat(auto-fit, minmax(180px, 1fr))",
                      }}
                      gap={3}
                      mb={4}
                    >
                      <MetricCard
                        icon={<LuUsers size={20} />}
                        label="No. of Accounts"
                        value={noOfAccounts.toLocaleString()}
                        accent="blue"
                      />
                      <MetricCard
                        icon={<LuTarget size={20} />}
                        label="Comm. Quota"
                        value={peso(commQuota)}
                        accent="purple"
                      />
                      <MetricCard
                        icon={<LuTarget size={20} />}
                        label="Non-Comm. Quota"
                        value={peso(ncommQuota)}
                        accent="teal"
                      />
                      <MetricCard
                        icon={<LuHandCoins size={20} />}
                        label="Comm. Collection"
                        value={peso(commCollection)}
                        accent="green"
                      />
                      <MetricCard
                        icon={<LuHandCoins size={20} />}
                        label="Non-Comm. Collection"
                        value={peso(ncommCollection)}
                        accent="orange"
                      />
                    </Grid>
                  );
                })()}
                <MCPRList />
              </InfoCardAccordion>
            )}
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
