"use client";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Show,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  PlanholderInfo,
  PlanholderInfoProps,
} from "./sections/planholder-info";
import { PendingRequests, RequestProps } from "./sections/pending-requests";
import { ContactInfo } from "./sections/contact-info";
import { EmploymentInfo } from "./sections/employment-info";
import { Address, PlanholderAddressCard } from "./sections/address-info";
import { useRouter } from "next/navigation";
import { ListOfPlans } from "./sections/list-of-plans";
import { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import {
  LuUserPen,
  LuReplace,
  LuTrendingUpDown,
  LuTrash2,
  LuFile,
  LuSearch,
} from "react-icons/lu";
import { MdPayment } from "react-icons/md";
import { useMessageDialog } from "osp-ui-kit";
import { TbMoneybagMove } from "react-icons/tb";
import { Page, ProfileHeaderCard, LookupField } from "osp-ui-kit";
import type { LookupColumn } from "osp-ui-kit";
import { SecondarySmButton } from "st-peter-ui";
import ActionButtons from "@/components/primitives/ActionButtons";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { planholderLookup } from "@/app/(bpis)/plan-management/data/planholder-lookup";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";

export interface Hyperlinks {
  payMyPlan?: string | undefined;
  changeOfMode?: string | undefined;
  returnedOfPremium?: string | undefined;
  claimApplication?: string | undefined;
  cashSurrenderedValue?: string | undefined;
  transferOfRights: string | undefined;
  loanApplication?: string | undefined;
  reinstement: string | undefined;
}

export interface ActionFunctions {
  deletePlanFunction?: (lpaNumber: string) => void;
}

export interface PlanholderPageProps {
  hyperlinks?: Hyperlinks;
  actionFunctions?: ActionFunctions;
  planholderInfo?: PlanholderInfoProps | undefined;
  planholderAddress?: Address[] | undefined;
  planholderContact?:
    | {
        personId: string;
        value: string;
        type: string;
      }[]
    | undefined;
  plans?: PlanDetailType[] | undefined;
}

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

const MOCK_REQUESTS: RequestProps[] = [
  {
    type: "Reinstatement",
    title: "Reinstatement",
    description: "2025-001234 · Annual Premium",
    transactionId: "RI-2025-001234",
    currentStep: 2,
    totalSteps: 4,
    status: "Pending",
    date: "May 20, 2026",
    hyperlink: "#",
  },
  {
    type: "Change of Mode",
    title: "Change of Mode",
    description: "2025-005678 · Quarterly to Monthly",
    transactionId: "COM-2025-005678",
    currentStep: 1,
    totalSteps: 3,
    status: "Pending",
    date: "May 24, 2026",
    hyperlink: "#",
  },
  {
    type: "Returned of Premium",
    title: "ROP Application",
    description: "2024-009876 · Maturity Benefit",
    transactionId: "ROP-2024-009876",
    currentStep: 3,
    totalSteps: 3,
    status: "Approved",
    date: "Nov 15, 2025",
    hyperlink: "#",
  },
  {
    type: "Transfer of Rights",
    title: "Transfer of Rights",
    description: "2024-003456 · Beneficiary Change",
    transactionId: "TF-2024-003456",
    currentStep: 2,
    totalSteps: 4,
    status: "Denied",
    date: "Sep 3, 2025",
    hyperlink: "#",
  },
];

export default function PlanholderProfilePage({
  props,
  selectedLpaNumber,
}: {
  props: PlanholderPageProps;
  selectedLpaNumber?: string;
}) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const router = useRouter();
  const { messageBox } = useMessageDialog();
  const [isProfileOpen, setIsProfileOpen] = useState(true);
  const isWebOnMount = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;
  const [personalOpen, setPersonalOpen] = useState(isWebOnMount);
  const [addressOpen, setAddressOpen] = useState(isWebOnMount);
  const [contactOpen, setContactOpen] = useState(isWebOnMount);
  const [employmentOpen, setEmploymentOpen] = useState(isWebOnMount);

  const planholderAddress = (() => {
    const addr =
      props.planholderAddress?.find((a) => a.addressType === "RESIDENCE") ??
      props.planholderAddress?.[0];
    return addr
      ? [addr.addressNo, addr.street, addr.barangay, addr.city, addr.province]
          .filter(Boolean)
          .join(", ")
      : undefined;
  })();

  /** Build the newline-delimited address string ProfileHeaderCard expects. */
  const buildAddressLines = (addr?: Address) =>
    addr
      ? [
          [addr.addressNo, addr.street].filter(Boolean).join(" "),
          [addr.barangay, addr.district].filter(Boolean).join(" "),
          [addr.city, addr.province].filter(Boolean).join(" "),
        ]
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n")
      : undefined;

  const homeAddress = buildAddressLines(
    props.planholderAddress?.find((a) => a.addressType === "RESIDENCE"),
  );
  const officeAddress = buildAddressLines(
    props.planholderAddress?.find((a) => a.addressType === "OFFICE"),
  );

  const phone =
    props.planholderContact?.find((c) => c.type === "MobileNo")?.value ??
    props.planholderContact?.find((c) => c.type === "LandlineNo")?.value;

  // Primary actions — surfaced as visible toolbar buttons on desktop
  const primaryActions = [
    {
      label: "Edit",
      href: `/plan-management/planholder/${props.planholderInfo?.personId}/edit`,
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
    ...(props.hyperlinks?.payMyPlan
      ? [
          {
            label: "Pay My Plan",
            href: props.hyperlinks.payMyPlan as string,
            icon: MdPayment,
          },
        ]
      : []),
  ];

  // Secondary actions — kept in the overflow quick-actions sheet
  const overflowActions = [
    {
      label: "Edit",
      href: `/plan-management/planholder/${props.planholderInfo?.personId}/edit`,
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
    ...(props.hyperlinks?.payMyPlan
      ? [
          {
            label: "Pay My Plan",
            href: props.hyperlinks.payMyPlan as string,
            icon: MdPayment,
          },
        ]
      : []),
    ...(props.hyperlinks?.changeOfMode
      ? [
          {
            label: "Change of Mode",
            href: props.hyperlinks.changeOfMode as string,
            icon: () => <LuReplace size={16} />,
          },
        ]
      : []),

    ...(props.hyperlinks?.returnedOfPremium
      ? [
          {
            label: "ROP Application",
            href: props.hyperlinks.returnedOfPremium as string,
            icon: () => <LuTrendingUpDown size={16} />,
          },
        ]
      : []),

    ...(props.hyperlinks?.claimApplication
      ? [
          {
            label: "Claim Application",
            href: props.hyperlinks.claimApplication as string,
            icon: () => <LuFile size={16} />,
          },
        ]
      : []),

    ...(props.hyperlinks?.loanApplication
      ? [
          {
            label: "Loan Application",
            href: props.hyperlinks.loanApplication as string,
            icon: () => <LiaHandHoldingUsdSolid size={16} />,
          },
        ]
      : []),

    ...(props.hyperlinks?.cashSurrenderedValue
      ? [
          {
            label: "CSV Application",
            href: props.hyperlinks.cashSurrenderedValue as string,
            icon: () => <TbMoneybagMove size={16} />,
          },
        ]
      : []),
  ];

  // On mobile every action lives in the overflow sheet
  const actionButtonDefs = [...primaryActions, ...overflowActions];

  const handleAction = (action: { href?: string; onClick?: () => void }) => {
    if (action.onClick) action.onClick();
    else if (action.href) router.push(action.href);
  };

  // The planholder the route currently points at — stable reference, so it only
  // changes when the URL does
  const currentPlanholderRecord =
    planholderLookup.find(
      (ph) =>
        ph.personId === props.planholderInfo?.personId &&
        (!selectedLpaNumber || ph.lpaNumber === selectedLpaNumber),
    ) ?? null;

  // LookupField is controlled and goes readOnly whenever `value` is set, so the
  // selection has to live in state — otherwise its clear button has nothing to
  // clear and the field can never be typed in again.
  const [lookupSelection, setLookupSelection] =
    useState<PlanholderLookup | null>(currentPlanholderRecord);

  // Re-sync when the route changes underneath us (back/forward, in-page links)
  useEffect(() => {
    setLookupSelection(currentPlanholderRecord);
  }, [currentPlanholderRecord]);

  /** Jump to whichever planholder was picked in the lookup. */
  const handleLookupSelect = (item: PlanholderLookup | null) => {
    setLookupSelection(item);

    if (!item || item.lpaNumber === currentPlanholderRecord?.lpaNumber) return;

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
        {/* Desktop — primary actions as buttons, planholder lookup in place of the overflow sheet */}
        <Flex display={{ base: "none", lg: "flex" }} align="center" gap={2}>
          {/* {props.planholderInfo &&
            primaryActions.map((action) => (
              <SecondarySmButton
                key={action.label}
                onClick={() => handleAction(action)}
              >
                <action.icon />
                {action.label}
              </SecondarySmButton>
            ))} */}
          <Box w={{ lg: "330px" }} flexShrink={0}>
            {planholderLookupField}
          </Box>
          <ActionButtons buttons={actionButtonDefs} />
        </Flex>

        {/* Mobile — keep every action in the overflow sheet */}
        {props.planholderInfo && (
          <Box display={{ base: "block", lg: "none" }}>
            <ActionButtons buttons={actionButtonDefs} />
          </Box>
        )}
      </Page.ToolContent>
      <Page.MainContent>
        {/* Mobile — lookup sits above the profile header card, and stays reachable
            in the empty state so there is always a way to pick a planholder */}
        <Box display={{ base: "block", lg: "none" }}>
          {planholderLookupField}
        </Box>

        {/* Mobile empty state — visible only on mobile when no planholder is selected */}
        <Flex
          display={{ base: props.planholderInfo ? "none" : "flex", lg: "none" }}
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
              No Planholder Selected
            </Text>
            <Text fontSize="sm" color="gray.400" mt={1}>
              Use the search bar above to find a planholder.
            </Text>
          </Box>
        </Flex>

        {/* Main content — hidden on mobile when no planholder is selected */}
        <Box
          display={{
            base: props.planholderInfo ? "block" : "none",
            lg: "block",
          }}
        >
          {/* Unified 2-column profile grid */}
          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap={5}
            alignItems="start"
          >
            {/* Left column — identity & details */}
            <GridItem>
              <Flex direction="column" gap={4}>
                <Box id="tour-profile-header" pt={0}>
                  <ProfileHeaderCard
                    name={
                      props.planholderInfo
                        ? props.planholderInfo.firstName +
                          " " +
                          props.planholderInfo.lastName
                        : undefined
                    }
                    personId={props.planholderInfo?.personId}
                    isInsured={props.plans?.[0]?.isInsured}
                    homeAddress={homeAddress}
                    officeAddress={officeAddress}
                    email={
                      props.planholderContact?.find((x) => x.type === "Email")
                        ?.value
                    }
                    landlineNo={
                      props.planholderContact?.find(
                        (x) => x.type === "LandlineNo",
                      )?.value
                    }
                    contactNo={phone}
                    isOpen={isProfileOpen}
                    contentId="profile-details-content"
                    avatarUrl={mockAvatarUrl(
                      props.planholderInfo?.personId ?? "",
                    )}
                  />
                </Box>
                <Show when={isMobile}>
                  <ListOfPlans
                    plans={(props.plans ?? []) as any}
                    deletePlanFunction={
                      props.actionFunctions?.deletePlanFunction
                    }
                    personId={props.planholderInfo?.personId}
                    planholderAddress={planholderAddress}
                    selectedLpaNumber={selectedLpaNumber}
                  />
                  <PendingRequests requests={MOCK_REQUESTS} />
                </Show>

                <Box id="tour-planholder-info">
                  <PlanholderInfo
                    planholder={props.planholderInfo ?? undefined}
                    isOpen={personalOpen}
                    onToggle={() => setPersonalOpen((p) => !p)}
                  />
                </Box>
                <Box display={{ base: "block", lg: "none" }}>
                  <PlanholderAddressCard
                    phAddress={props.planholderAddress}
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
                <Box display={{ base: "block", lg: "none" }}>
                  <ContactInfo
                    contacts={{
                      Email:
                        props.planholderContact
                          ?.filter((x) => x.type === "Email")
                          .map((x) => x.value) ?? [],
                      MobileNo:
                        props.planholderContact
                          ?.filter((x) => x.type === "MobileNo")
                          .map((x) => x.value) ?? [],
                      LandlineNo:
                        props.planholderContact
                          ?.filter((x) => x.type === "LandlineNo")
                          .map((x) => x.value) ?? [],
                    }}
                    isOpen={contactOpen}
                    onToggle={() => setContactOpen((p) => !p)}
                  />
                </Box>
                <EmploymentInfo
                  planholderInfo={props.planholderInfo}
                  isOpen={employmentOpen}
                  onToggle={() => setEmploymentOpen((p) => !p)}
                />
              </Flex>
            </GridItem>
          </Grid>

          {/* Plans section — full width */}
          <Box id="tour-plans-list" display={{ base: "none", lg: "block" }}>
            <ListOfPlans
              plans={(props.plans ?? []) as any}
              deletePlanFunction={props.actionFunctions?.deletePlanFunction}
              personId={props.planholderInfo?.personId}
              planholderAddress={planholderAddress}
              selectedLpaNumber={selectedLpaNumber}
            />
          </Box>
        </Box>
      </Page.MainContent>
    </Page.Root>
  );
}
