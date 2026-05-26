// Change or Add by: JLO 2026-05-16
"use client";

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  GridItem,
  Portal,
  Separator,
  Span,
  Strong,
  Text,
  VStack,
  Carousel,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import {
  Body,
  H3,
  H4,
  InputFloatingLabel,
  PrimaryMdButton,
  Small,
} from "st-peter-ui";
import {
  LuPrinter,
  LuReplace,
  LuTrendingUpDown,
  LuUserPen,
  LuArrowLeft,
  LuArrowRight,
  LuHistory,
  LuPhone,
  LuSmartphone,
  LuMail,
  LuShare2,
} from "react-icons/lu";
import DataTable from "../../common/reusable-tableV2/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import AgentEditForm from "../forms/agent-edit-form";
import {
  getAgentNameById,
  getSubordinates,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import MCPRList from "@/app/accounts-maintenance/mcpr/mcpr-list";
import MenuButton, { MenuItemButton } from "@/components/buttons/MenuButton";
import { ProgressCard } from "@/components/plan-management/planholders/cards/pending-request-card";
import { useRouter } from "next/navigation";
import { SearchAgentDialog } from "../../common/agent-lookup/search-agent-dialog";
import TeamMemberDrawer from "../drawers/team-member-drawer";
import RequestHistoryDrawer from "../drawers/request-history-drawer";
import AgentReassignForm from "../forms/agent-reassign-form";
import AgentMovementForm from "../forms/agent-movement-form";
import AgentProfileHeaderCard from "../cards/agent-profile-header-card";
import Card from "@/components/cards/Card";
import AgentPersonalInfoCard from "../cards/AgentPersonalInfoCard";
import AgentEmploymentInfoCard from "../cards/AgentEmploymentInfoCard";
import InfoItem from "@/components/common/info-item/info-item";
import { Page } from "@/components/page/page";
import { PlanholderAddressCard } from "@/components/new-planholder-profile/sections/address-info";
import LabelText from "@/components/texts/LabelText";
import ReferralPage from "./referral-page";
import AgentContactInfoCard from "../cards/AgentContactInfoCard";
import ProfileSectionCard from "../components/profile-section-card";

export function AgentDetails(params: {
  selectedAgent: SalesAgent | undefined;
  onAgentSelect?: (agent: SalesAgent | undefined) => void;
  breadItem: {
    label: string;
    href?: string;
  }[];
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("default");
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<SalesAgent | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { selectedAgent, onAgentSelect } = params;
  const router = useRouter();

  return (
    <Page
      title="Sales Agent Profile"
      description="View sales agent information and details."
      breadcrumbItems={params.breadItem}
      actionComponent={
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

          {selectedAgent ? (
            <>
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
            </>
          ) : (
            <></>
          )}
        </Flex>
      }
    >
      {page === "default" ? (
        <>
          {selectedAgent ? (
            <>
              <Grid
                mt={{ base: 4, md: 6 }}
                mb={6}
                gap={{ base: 4, md: 6 }}
                templateColumns={{ base: "1fr", xl: "2fr 1fr" }}
                alignItems="start"
              >
                <GridItem>
                  <Flex flexDir={"column"} gap={6}>
                    <AgentProfileHeaderCard agent={selectedAgent} />
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
                    <ProfileSectionCard
                      title="Pending Requests"
                      description="Track active approval workflows for this agent."
                      action={
                        <IconButton
                          aria-label="View request history"
                          size="xs"
                          variant="ghost"
                          color="var(--chakra-colors-primary)"
                          onClick={() => setHistoryOpen(true)}
                        >
                          <LuHistory /> History
                        </IconButton>
                      }
                    >
                        <Carousel.Root
                          slideCount={2}
                          maxW="full"
                          mx="auto"
                          gap="4"
                        >
                          <Carousel.Control
                            justifyContent="center"
                            gap={{ base: 2, md: 4 }}
                            w="full"
                          >
                            <Carousel.PrevTrigger asChild>
                              <IconButton
                                size={{ base: "2xs", md: "xs" }}
                                variant="outline"
                              >
                                <LuArrowLeft />
                              </IconButton>
                            </Carousel.PrevTrigger>

                            <Carousel.ItemGroup width="full">
                              <Carousel.Item index={0}>
                                <ProgressCard
                                  current={3}
                                  total={7}
                                  title={"Contract Renewal"}
                                  description={"Waiting for approval."}
                                  transactionId="RI-202-6311"
                                  onClick={() =>
                                    (window.location.href =
                                      "/transaction/CA-202-6311")
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
                                    (window.location.href =
                                      "/transaction/TR-202-6311")
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

                          <Carousel.Indicators
                            transition="width 0.2s ease-in-out"
                            transformOrigin="center"
                            opacity="0.5"
                            boxSize="2"
                            _current={{
                              width: "10",
                              bg: "colorPalette.subtle",
                              opacity: 1,
                            }}
                          />
                        </Carousel.Root>
                    </ProfileSectionCard>

                    <AgentContactInfoCard agent={selectedAgent} />

                    <ProfileSectionCard
                      title="Team Members"
                      description="Directly reporting agents."
                    >
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
                </GridItem>
              </Grid>

              <ProfileSectionCard
                title="Monthly Collection Performance Report"
                description="Collection performance and account activity for the selected agent."
              >
                <Box width={"full"}>
                  <Flex p={{ base: 0, md: 2 }} gap={4} direction={"column"}>
                    <MCPRList />
                  </Flex>
                </Box>
              </ProfileSectionCard>
            </>
          ) : (
            <Grid
              mt={{ base: 4, md: 6 }}
              mb={6}
              gap={{ base: 4, md: 6 }}
              templateColumns={{ base: "1fr", xl: "2fr 1fr" }}
              alignItems="start"
            >
              <GridItem>
                <Flex flexDir={"column"} gap={6}>
                  <AgentProfileHeaderCard />

                  <Card.Root title="Personal">
                    <Card.MainContent>
                      <Box px={1}>
                        <Grid
                          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                          gap={1}
                        >
                          <LabelText label="Place of Birth" value="—" />
                          <LabelText label="Date of Birth" value="—" />
                          <LabelText label="Gender" value="—" />
                          <LabelText label="Civil Status" value="—" />
                          <LabelText label="Nationality" value="—" />
                          <LabelText label="Naturalization Date" value="—" />
                          <LabelText label="Height" value="—" />
                          <LabelText label="Weight" value="—" />
                        </Grid>
                      </Box>
                    </Card.MainContent>
                  </Card.Root>

                  <Card.Root title="Employment">
                    <Card.MainContent>
                      <Box px={1}>
                        <Grid
                          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                          gap={1}
                        >
                          <LabelText label="Position" value="—" />
                          <LabelText label="Date Hired" value="—" />
                          <LabelText label="Employee Status" value="—" />
                          <LabelText label="Branch" value="—" />
                          <LabelText label="Supervisor" value="—" />
                          <LabelText label="SSS No." value="—" />
                          <LabelText label="NBI No." value="—" />
                          <LabelText label="TIN No." value="—" />
                        </Grid>
                      </Box>
                    </Card.MainContent>
                  </Card.Root>

                  <PlanholderAddressCard phAddress={undefined} />
                </Flex>
              </GridItem>

              <GridItem>
                <Flex
                  height={"100%"}
                  flexDir={"column"}
                  gap="6"
                  borderRadius={"md"}
                >
                  <ProfileSectionCard
                    title="Pending Requests"
                    description="Active approval workflows will appear here."
                  >
                      <Flex
                        align={"center"}
                        justify="center"
                        flexDir="column"
                        py={10}
                      >
                        <Small>No Pending Request</Small>
                      </Flex>
                  </ProfileSectionCard>

                  <ProfileSectionCard title="Contact Information">
                      <InfoItem
                        icon={LuSmartphone}
                        label="Phone Number"
                        value="—"
                      />
                      <InfoItem icon={LuPhone} label="Landline" value="—" />
                      <InfoItem icon={LuMail} label="Email" value="—" />
                  </ProfileSectionCard>

                  <ProfileSectionCard
                    title="Team Members"
                    description="Directly reporting agents will appear here."
                  >
                      <Flex
                        align={"center"}
                        justify="center"
                        flexDir="column"
                        py={10}
                      >
                        <Small>No Team Members</Small>
                      </Flex>
                  </ProfileSectionCard>
                </Flex>
              </GridItem>
            </Grid>
          )}
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

      <RequestHistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} />

      <Dialog.Root
        lazyMount
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        size={{ base: "lg" }}
      >
        <Dialog.Trigger asChild>
          <Button variant="outline" display={"none"}>
            Open
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Flex flexDir={"column"}>
                  <Dialog.Title>
                    <Strong color="gray.700">New Sales Agent Form</Strong>
                  </Dialog.Title>
                  <Body color="gray.500">
                    Please provide the following details of SA1.
                  </Body>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <Separator />
                <Box pt={2}>
                  <Grid templateColumns={{ base: "repeat(2, 1fr)" }} gap={2}>
                    <InputFloatingLabel label="Last Name" />
                    <InputFloatingLabel label="First Name" />
                    <InputFloatingLabel label="Middle Name" />
                    <InputFloatingLabel label="Suffix" />
                    <InputFloatingLabel label="Date of Birth" type="date" />
                    <InputFloatingLabel label="Gender" />
                  </Grid>
                </Box>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button>Save</Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Page>
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
