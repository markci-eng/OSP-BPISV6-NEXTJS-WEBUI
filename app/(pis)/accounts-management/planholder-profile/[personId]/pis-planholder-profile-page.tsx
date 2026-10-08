"use client";
import { Box, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { useState } from "react";

import { LuFolderOpen } from "react-icons/lu";
import { RiArrowLeftRightLine, RiFileList3Line } from "react-icons/ri";
import { TbMoneybagMove, TbFileCertificate } from "react-icons/tb";
import { MdOutlineCancelPresentation } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";
import { useRouter } from "next/navigation";

import { ActionButtons, LookupField, Page, useMessageDialog } from "osp-ui-kit";
import type { LookupColumn } from "osp-ui-kit";
import { BackToTop } from "../../components/back-to-top";
import { formatTerminationStatus } from "../../data/termination-status";
import { planholderLookup } from "../data/planholder-lookup";
import { PlanholderProfileBody } from "../components/planholder-profile-body";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";
import { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";

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
  {
    key: "terminationStatus",
    header: "Termination Status",
    render: (value) => formatTerminationStatus(value as string),
  },
];

export default function PisPlanholderProfilePage({
  props,
}: {
  props: PlanholderPageProps;
}) {
  const router = useRouter();
  const { messageBox } = useMessageDialog();
  const [emptyStateOpen, setEmptyStateOpen] = useState(!props.planholderInfo);

  // The address lines, the contact number and the accordions' open state all
  // moved to `PlanholderProfileBody` with the layout that used them.

  // NO SOURCE WHILE RETURN OF PREMIUM AND CSV ARE BEING REBUILT (2026-09-23,
  // CSV 2026-10-01). Neither new module has a per-request route yet, so the
  // actions below fall through to their "no request" message. Point these at
  // the new modules once they open a request by id.
  const ropId = undefined;
  const csvId = undefined;

  const goToRequestOrNotify = (
    label: string,
    id: string | undefined,
    basePath: string,
  ) => {
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
      label: "Reinstatement",
      href: "/accounts-management/reinstatement",
      icon: () => <RiFileList3Line size={16} />,
    },
    {
      label: "Transfer",
      href: "/accounts-management/transfer",
      icon: () => <RiArrowLeftRightLine size={16} />,
    },
    {
      label: "ROP",
      onClick: () =>
        goToRequestOrNotify(
          "ROP",
          ropId,
          "/accounts-management/return-of-premium",
        ),
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
      placeholder="Search Planholder"
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
    <Page.Root title={"Planholder Profile"}>
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
        {/* One column of our own (user, 2026-10-07): the kit's MainContent puts
            a fixed 24px between its children and takes no `gap`, so
            BackToTop's 1px sentinel alone pushed the profile a second 24px
            below the header's own padding. No gap on desktop, where the
            sentinel and the profile are all there is; the kit's 24px kept on
            a phone, between the lookup and the profile. */}
        <Flex direction="column" gap={{ base: 6, lg: 0 }}>
          <BackToTop />

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
            {/* The profile itself, shared with the ROP module's right panel. */}
            {/* No `requests`: Pending Requests follows the plan picked on
                the name card (user, 2026-10-07). */}
            <PlanholderProfileBody props={props} />
          </Box>
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
}
