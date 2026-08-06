"use client";
import {
  Box,
  Dialog,
  Flex,
  Grid,
  GridItem,
  Portal,
  Show,
  Text,
} from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";



import { LuFolderOpen } from "react-icons/lu";
import { RiFileList3Line } from "react-icons/ri";
import { TbMoneybagMove, TbFileCertificate } from "react-icons/tb";
import { MdOutlineCancelPresentation } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";
import { useRouter } from "next/navigation";

import {
  ActionButtons,
  LookupField,
  Page,
  ProfileHeaderCard,
  useMessageDialog,
} from "osp-ui-kit";
import type { LookupColumn } from "osp-ui-kit";
import { planholderLookup } from "../data/planholder-lookup";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import { PendingRequests, RequestProps } from "@/components/plan-management/planholder-profile/sections/pending-requests";
import { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import { ListOfPlans } from "@/components/plan-management/planholder-profile/sections/list-of-plans";
import { PlanholderInfo } from "@/components/plan-management/planholder-profile/sections/planholder-info";

import { ContactInfo } from "@/components/plan-management/planholder-profile/sections/contact-info";
import { EmploymentInfo } from "@/components/plan-management/planholder-profile/sections/employment-info";
import { Address, PlanholderAddressCard } from "@/components/plan-management/planholder-profile/sections/address-info";

import { RITF_REQUESTS } from "../../ritf/data/data";
import { ROP_REQUESTS } from "../../rop/data/data";
import { CSV_REQUESTS } from "../../csv/data/data";


// Same columns the BPIS profile's lookup shows.
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
    description: "LPA No. 2025-001234 · Annual Premium",
    transactionId: "RI-2025-001234",
    currentStep: 2,
    totalSteps: 4,
    status: "Pending",
    date: "May 20, 2026",
    hyperlink: "#",
  },
  {
    type: "Returned of Premium",
    title: "ROP Application",
    description: "LPA No. 2024-009876 · Maturity Benefit",
    transactionId: "ROP-2024-009876",
    currentStep: 3,
    totalSteps: 3,
    status: "Approved",
    date: "Nov 15, 2025",
    hyperlink: "#",
  },
];

export default function PisPlanholderProfilePage({
  props,
}: {
  props: PlanholderPageProps;
}) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const router = useRouter();
  const { messageBox } = useMessageDialog();
  const [isProfileOpen] = useState(true);
  const isWebOnMount = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;
  const [emptyStateOpen, setEmptyStateOpen] = useState(!props.planholderInfo);
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

  const personId = props.planholderInfo?.personId;

  // If this planholder has an existing RITF/ROP/CSV request (matched by LPA
  // number), jump straight to editing it. Otherwise let the user know there's
  // nothing to open instead of dumping them on the unfiltered list.
  const planLpaNumbers = (props.plans ?? []).map((p) => p.lpaNumber);

  function findRequestId(requests: { id: string; lpaNo: string }[]) {
    return requests.find((r) => planLpaNumbers.includes(r.lpaNo))?.id;
  }

  const ritfId = findRequestId(RITF_REQUESTS);
  const ropId = findRequestId(ROP_REQUESTS);
  const csvId = findRequestId(CSV_REQUESTS);

  const goToRequestOrNotify = (label: string, id: string | undefined, basePath: string) => {
    if (id) {
      router.push(`${basePath}/${id}`);
      return;
    }
    messageBox({
      title: `No ${label} Request`,
      message: `The selected planholder does not have a ${label} request.`,
      confirmText: "Okay",
      variant: "information",
    });
  };

  // Quick Actions — accounts-management module shortcuts. All of them live in
  // the overflow drawer; the toolbar itself carries the planholder lookup.
  const overflowActions = [
    {
      label: "RITF",
      onClick: () =>
        goToRequestOrNotify("RITF", ritfId, "/accounts-management/ritf"),
      icon: () => <RiFileList3Line size={16} />,
    },
    {
      label: "ROP",
      onClick: () =>
        goToRequestOrNotify("ROP", ropId, "/accounts-management/rop"),
      icon: () => <GiReceiveMoney size={16} />,
    },
    {
      label: "Plan Termination",
      href: "/accounts-management/plan-termination",
      icon: () => <MdOutlineCancelPresentation size={16} />,
    },
    {
      label: "CSV",
      onClick: () =>
        goToRequestOrNotify("CSV", csvId, "/accounts-management/csv"),
      icon: () => <TbMoneybagMove size={16} />,
    },
    {
      label: "COFP",
      href: "/accounts-management/cofp",
      icon: () => <TbFileCertificate size={16} />,
    },
  ];

  // Derived from the route rather than held in state, so back/forward stays in sync
  const currentPlanholderRecord =
    planholderLookup.find(
      (ph) => ph.personId === props.planholderInfo?.personId,
    ) ?? null;

  /** Jump to whichever planholder was picked in the lookup. */
  const handleLookupSelect = (item: PlanholderLookup | null) => {
    if (!item || item.personId === currentPlanholderRecord?.personId) return;
    router.push(`/accounts-management/planholder-profile/${item.personId}`);
  };

  // Left unset (`value={null}`) on purpose: the kit hides the type-ahead
  // suggestions whenever the field holds a value, which would make this a
  // read-only display of the planholder already on screen. Empty, it stays a
  // search box for switching to another one — the profile below already says
  // who is loaded.
  const planholderLookupField = (
    <LookupField<PlanholderLookup>
      label=""
      placeholder="Change Planholder"
      modalTitle="Search Planholder"
      columns={PLANHOLDER_LOOKUP_COLUMNS}
      dataSource={planholderLookup}
      searchKeys={["lpaNumber", "lastName", "firstName", "middleName"]}
      onSelect={handleLookupSelect}
      renderDisplay={(ph) =>
        `${ph.firstName} ${ph.middleName} ${ph.lastName} [${ph.personId}]`
      }
      value={null}
      mobileFullscreen
    />
  );

  return (
    <Page.Root
      title={"Planholder Profile"}
      description="Clear Access to Every Planholder Detail."
    >
      <Page.ToolContent>
        {/* Desktop — planholder lookup in place of the primary buttons, with
            every action in the overflow sheet beside it */}
        <Flex display={{ base: "none", lg: "flex" }} align="center" gap={2}>
          <Box w={{ lg: "330px" }} flexShrink={0}>
            {planholderLookupField}
          </Box>
          <ActionButtons buttons={overflowActions} />
        </Flex>

        {/* Mobile — keep every action in the overflow sheet */}
        {props.planholderInfo && (
          <Box display={{ base: "block", lg: "none" }}>
            <ActionButtons buttons={overflowActions} />
          </Box>
        )}
      </Page.ToolContent>
      <Page.MainContent>
        {/* Mobile — lookup sits above the profile header card, and stays
            reachable in the empty state so there is always a way to pick a
            planholder */}
        <Box display={{ base: "block", lg: "none" }}>
          {planholderLookupField}
        </Box>

        {/* Empty state — a dialog over the blank profile, carrying the same
            lookup the toolbar does. */}
        <Dialog.Root
          open={emptyStateOpen}
          onOpenChange={(e) => setEmptyStateOpen(e.open)}
          placement="center"
          size={{ base: "xs", md: "md" }}
          motionPreset="slide-in-bottom"
          // Non-modal on purpose: the lookup inside opens a dialog of its own,
          // and the nested modal locks (`pointer-events: none` on body) were
          // not released when this one closed, leaving the page dead to
          // clicks. Without the lock the page stays usable once dismissed.
          modal={false}
          // Zag derives this from `modal` (`closeOnInteractOutside: modal &&
          // !alertDialog`), so going non-modal would otherwise stop clicks on
          // the profile behind from dismissing the prompt.
          closeOnInteractOutside
        >
          <Portal>
            {/* No backdrop, and the positioner lets clicks through, so the
                page behind stays usable while the prompt is up — only the
                card itself takes pointer events. */}
            <Dialog.Positioner pointerEvents="none">
              {/* No `overflow="hidden"` — it would clip the lookup's
                  type-ahead list, which drops below the field */}
              <Dialog.Content
                borderRadius="2xl"
                pointerEvents="auto"
                boxShadow="2xl"
              >
                <Dialog.Body p={6}>
                  <Flex direction="column" align="center" textAlign="center">
                    {/* Same lookup as the toolbar, leading the dialog so the
                        way forward is the first thing in reach. Raised so its
                        suggestions sit over the artwork below. */}
                    <Box
                      w="full"
                      textAlign="start"
                      mb={6}
                      position="relative"
                      zIndex={2}
                    >
                      {planholderLookupField}
                    </Box>

                    <Flex
                      align="center"
                      justify="center"
                      boxSize="140px"
                      borderRadius="full"
                      bg="var(--chakra-colors-primary-disabled)/20"
                      color="var(--chakra-colors-primary)"
                      mb={6}
                    >
                      <LuFolderOpen size={64} />
                    </Flex>

                    <Text fontSize="xl" fontWeight="bold" color="gray.800">
                      No plan record selected yet
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      Search for a planholder to load their records.
                    </Text>
                  </Flex>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        <Box
          display={{
            base: props.planholderInfo ? "block" : "none",
            lg: "block",
          }}
        >
          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap={5}
            alignItems="start"
          >
            <GridItem>
              <Flex direction="column" gap={4}>
                <Box pt={0}>
                  <ProfileHeaderCard
                    name={
                      props.planholderInfo
                        ? props.planholderInfo.firstName +
                          " " +
                          props.planholderInfo.lastName
                        : undefined
                    }
                    personId={personId}
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
                  />
                </Box>
                <Show when={isMobile}>
                  <ListOfPlans
                    plans={(props.plans ?? []) as any}
                    deletePlanFunction={props.actionFunctions?.deletePlanFunction}
                    personId={personId}
                    planholderAddress={planholderAddress}
                  />
                  <PendingRequests requests={MOCK_REQUESTS} />
                </Show>

                <Box>
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

            <GridItem>
              <Flex direction="column" gap={4}>
                <Show when={!isMobile}>
                  <PendingRequests requests={MOCK_REQUESTS} />
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
                  planholderInfo={undefined}
                  isOpen={employmentOpen}
                  onToggle={() => setEmploymentOpen((p) => !p)}
                />
              </Flex>
            </GridItem>
          </Grid>

          <Box display={{ base: "none", lg: "block" }}>
            <ListOfPlans
              plans={(props.plans ?? []) as any}
              deletePlanFunction={props.actionFunctions?.deletePlanFunction}
              personId={personId}
              planholderAddress={planholderAddress}
            />
          </Box>
        </Box>
      </Page.MainContent>
    </Page.Root>
  );
}
