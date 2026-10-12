"use client";

import { Box, Flex, Grid, GridItem, Show } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LookupField,
  Page,
  ProfileHeaderCard,
  useMessageDialog,
  type LookupColumn,
} from "osp-ui-kit";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import {
  LuFile,
  LuReplace,
  LuTrash2,
  LuTrendingUpDown,
  LuUserPen,
} from "react-icons/lu";
import { MdPayment } from "react-icons/md";
import { TbMoneybagMove } from "react-icons/tb";
import ActionButtons from "@/components/primitives/ActionButtons";
import { PendingRequests } from "@/components/plan-management/planholder-profile/sections/pending-requests";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import { planholderLookup } from "@/app/(bpis)/plan-management/data/planholder-lookup";
import type { PlanholderInfo as PlanholderInfoData } from "@/types/plan-management.types";
import { formatAddress } from "@/lib/format/address";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PlanholderInfo } from "./components/planholder-info";
import { PlanholderAddressCard } from "./components/address-info";
import { EmploymentInfo } from "./components/employment-info";
import { ListOfPlans } from "./components/list-of-plans";
import { MOCK_REQUESTS } from "./data/pending-requests";

const PLANHOLDER_LOOKUP_COLUMNS: LookupColumn<PlanholderLookup>[] = [
  { key: "lpaNumber", header: "LPA Number" },
  { key: "lastName", header: "Last Name" },
  { key: "firstName", header: "First Name" },
  { key: "middleName", header: "Middle Name" },
  { key: "planDescription", header: "Plan Description" },
  { key: "mode", header: "Mode" },
  {
    key: "effectivityDate",
    header: "Effectivity Date",
    render: (value) => (value as Date).toLocaleDateString(),
  },
  { key: "branch", header: "Branch" },
  { key: "accountStatus", header: "Account Status" },
  { key: "terminationStatus", header: "Termination Status" },
];

export function PlanholderProfilePage({
  personId,
  selectedLpaNumber,
  planholderInfo,
}: {
  personId: string;
  selectedLpaNumber: string;
  planholderInfo: PlanholderInfoData;
}) {
  const router = useRouter();
  const { messageBox } = useMessageDialog();
  const isMobile = useIsMobile();

  const actionButtonDefs = [
    {
      label: "Edit",
      href: `/plan-management/planholder/${personId}/edit`,
      icon: LuUserPen,
    },
    {
      label: "Delete",
      icon: LuTrash2,
      onClick: () =>
        messageBox({
          title: "Unable to delete planholder.",
          message: "Unable to delete planholder with active plans.",
          confirmText: "Dismiss",
          variant: "error",
        }),
    },
    {
      label: "Pay My Plan",
      href: `/plan-management/planholder/${personId}/pay-my-plan`,
      icon: MdPayment,
    },
    {
      label: "Change of Mode",
      href: `/plan-management/planholder/${personId}/change-of-mode`,
      icon: () => <LuReplace size={16} />,
    },
    {
      label: "ROP Application",
      href: `/plan-management/planholder/${personId}/rop`,
      icon: () => <LuTrendingUpDown size={16} />,
    },
    {
      label: "Claim Application",
      href: `/plan-management/planholder/${personId}/claim-application`,
      icon: () => <LuFile size={16} />,
    },
    {
      label: "Loan Application",
      href: `/plan-management/planholder/${personId}/loan`,
      icon: () => <LiaHandHoldingUsdSolid size={16} />,
    },
    {
      label: "CSV Application",
      href: "/",
      icon: () => <TbMoneybagMove size={16} />,
    },
  ];

  // Accordions start open on desktop, closed on a phone. useIsMobile settles
  // after mount, so follow it once it does.
  const [personalOpen, setPersonalOpen] = useState(true);
  const [addressOpen, setAddressOpen] = useState(true);
  const [employmentOpen, setEmploymentOpen] = useState(true);
  useEffect(() => {
    setPersonalOpen(!isMobile);
    setAddressOpen(!isMobile);
    setEmploymentOpen(!isMobile);
  }, [isMobile]);

  const { personalInfo, contacts, addresses, plans } = planholderInfo;
  const homeAdd = addresses.find((x) => x.addressType === "RESIDENCE");
  const officeAdd = addresses.find((x) => x.addressType === "OFFICE");
  const contactOf = (type: string) =>
    contacts.find((x) => x.contactType === type)?.value;

  const deletePlan = (lpaNumber: string) =>
    messageBox({
      title: "Delete Successful",
      message: lpaNumber + " plan has been deleted successfully!",
      confirmText: "Okay",
      showCancel: false,
      variant: "information",
    });

  /** Jump to whichever planholder was picked in the lookup. */
  const handleLookupSelect = (item: PlanholderLookup | null) => {
    if (!item || item.lpaNumber === selectedLpaNumber) return;
    router.push(
      `/plan-management/planholder/${item.personId}?lpaNumber=${encodeURIComponent(item.lpaNumber)}`,
    );
  };

  const planholderLookupField = (
    <LookupField<PlanholderLookup>
      label=""
      placeholder="Search LPA Number or Planholder Name . . ."
      modalTitle="Search Planholder"
      columns={PLANHOLDER_LOOKUP_COLUMNS}
      dataSource={planholderLookup}
      searchKeys={["lpaNumber", "lastName", "firstName", "middleName"]}
      onSelect={handleLookupSelect}
      renderDisplay={(ph) =>
        `${ph.firstName} ${ph.middleName} ${ph.lastName} [${ph.lpaNumber}]`
      }
      value={null}
      mobileFullscreen
    />
  );

  return (
    <Page.Root
      headerButton="back"
      title={"Planholder Profile"}
      description="Clear Access to Every Planholder Detail."
    >
      <Page.ToolContent>
        {/* Desktop — planholder lookup beside the actions */}
        <Flex display={{ base: "none", lg: "flex" }} align="center" gap={2}>
          <Box w={{ lg: "330px" }} flexShrink={0}>
            {planholderLookupField}
          </Box>
          <ActionButtons buttons={actionButtonDefs} />
        </Flex>

        {/* Mobile — keep every action in the overflow sheet */}
        <Box display={{ base: "block", lg: "none" }}>
          <ActionButtons buttons={actionButtonDefs} />
        </Box>
      </Page.ToolContent>
      <Page.MainContent>
        {/* Mobile — lookup sits above the profile header card */}
        <Box display={{ base: "block", lg: "none" }}>
          {planholderLookupField}
        </Box>

        {/* Unified 2-column profile grid */}
        <Grid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={{ base: "3", lg: "5" }}
          alignItems="start"
        >
          {/* Left column — identity & details */}
          <GridItem>
            <Flex direction="column" gap={4}>
              <Box id="tour-profile-header" pt={0}>
                <ProfileHeaderCard
                  name={personalInfo.firstName + " " + personalInfo.lastName}
                  email={contactOf("EMAIL ADDRESS")}
                  contactNo={contactOf("MOBILE NUMBER")}
                  landlineNo={contactOf("TELEPHONE/LANDLINE")}
                  homeAddress={formatAddress(homeAdd)}
                  officeAddress={formatAddress(officeAdd)}
                  isInsured={personalInfo.isInsured}
                  personId={personalInfo.personId}
                  isOpen={true}
                  contentId="profile-details-content"
                  avatarUrl={
                    personalInfo.avatarUrl ?? mockAvatarUrl(personalInfo.personId)
                  }
                />
              </Box>
              <Show when={isMobile}>
                <ListOfPlans
                  plans={plans}
                  personId={personId}
                  selectedLpaNumber={selectedLpaNumber}
                  phAddress={homeAdd}
                  deletePlanFunction={deletePlan}
                />
                <PendingRequests requests={MOCK_REQUESTS} />
              </Show>

              <Box id="tour-planholder-info">
                <PlanholderInfo
                  planholder={personalInfo}
                  isOpen={personalOpen}
                  onToggle={() => setPersonalOpen((p) => !p)}
                />
              </Box>
              <Box display={{ base: "block", lg: "none" }}>
                <PlanholderAddressCard
                  phAddress={addresses}
                  isOpen={addressOpen}
                  onToggle={() => setAddressOpen((p) => !p)}
                />
              </Box>
            </Flex>
          </GridItem>

          {/* Right column — activity & admin */}
          <GridItem>
            <Flex direction="column" gap={4}>
              <Show when={!isMobile}>
                <Box id="tour-pending-requests">
                  <PendingRequests requests={MOCK_REQUESTS} />
                </Box>
              </Show>

              <EmploymentInfo
                employmentInfo={{
                  employerName: personalInfo.employerName,
                  tin: personalInfo.tin,
                  securityNo: personalInfo.securityNo,
                  sourceOfFund: personalInfo.sourceOfFund,
                }}
                isOpen={employmentOpen}
                onToggle={() => setEmploymentOpen((p) => !p)}
              />
            </Flex>
          </GridItem>
        </Grid>

        {/* Plans section — full width */}
        <Box id="tour-plans-list" display={{ base: "none", lg: "block" }}>
          <ListOfPlans
            plans={plans}
            personId={personId}
            selectedLpaNumber={selectedLpaNumber}
            phAddress={homeAdd}
            deletePlanFunction={deletePlan}
          />
        </Box>
      </Page.MainContent>
    </Page.Root>
  );
}
