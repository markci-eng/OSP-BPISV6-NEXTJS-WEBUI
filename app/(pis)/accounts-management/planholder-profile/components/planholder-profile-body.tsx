"use client";

// THE PLANHOLDER PROFILE ITSELF — the header card, the four fact sections, the
// pending requests and the list of plans, in the arrangement the profile page
// has always drawn them in.
//
// EXTRACTED FROM `pis-planholder-profile-page` (2026-09-23), unchanged. The
// Return of Premium module shows this same profile in its right panel, and the
// alternative was a second copy of the layout: two files that look identical on
// the day they are written and answer differently a month later. The page keeps
// what is a PAGE's — its title, the planholder lookup in the toolbar, the empty
// state dialog — and hands the profile itself to this.
//
// It owns the open/closed state of its own accordions because that is a
// property of the profile being looked at, not of the screen it is on: both
// callers want them open on a wide screen and shut on a phone.

import { Box, Flex, Grid, GridItem, Show } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { OSPBadge, ProfileHeaderCard } from "osp-ui-kit";

import type { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import {
  PendingRequests,
  RequestProps,
} from "@/components/plan-management/planholder-profile/sections/pending-requests";
import { ListOfPlans } from "@/components/plan-management/planholder-profile/sections/list-of-plans";
import { PlanholderInfo } from "@/components/plan-management/planholder-profile/sections/planholder-info";
import { ContactInfo } from "@/components/plan-management/planholder-profile/sections/contact-info";
import {
  Address,
  PlanholderAddressCard,
} from "@/components/plan-management/planholder-profile/sections/address-info";
import { ProfileNamePlanNav } from "./profile-name-plan-nav";

/** Stand-in requests until the profile has a source for them. */
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

type BadgeType = "success" | "info" | "warning" | "danger";

/** Account status colours — LAPSED is the one to stop on. */
const ACCOUNT_STATUS_TYPE: Record<string, BadgeType> = {
  ACTIVE: "success",
  "FULLY PAID": "info",
  LAPSED: "warning",
};

/**
 * THE SELECTED PLAN'S STANDING, on the name card under the LPA number (user,
 * 2026-10-06): insurability, account status and termination status, in that
 * order. Insurability keeps the kit's own wording and colours, since this
 * replaces the kit's badge rather than sitting beside it.
 */
function PlanStatusBadges({
  plan,
}: {
  plan: NonNullable<PlanholderPageProps["plans"]>[number];
}) {
  return (
    <Flex
      wrap="wrap"
      gap={1.5}
      mt={2}
      justify={{ base: "flex-start", lg: "center" }}
    >
      {plan.isInsured !== undefined && (
        <OSPBadge type={plan.isInsured ? "success" : "danger"}>
          {plan.isInsured ? "Insurable" : "Not Insurable"}
        </OSPBadge>
      )}
      {plan.accountStatus && (
        <OSPBadge type={ACCOUNT_STATUS_TYPE[plan.accountStatus] ?? "info"}>
          {plan.accountStatus}
        </OSPBadge>
      )}
      {plan.terminationStatus && (
        <OSPBadge
          type={
            plan.terminationStatus === "NOT YET TERMINATED" ? "success" : "info"
          }
        >
          {plan.terminationStatus}
        </OSPBadge>
      )}
    </Flex>
  );
}

export interface PlanholderProfileBodyProps {
  props: PlanholderPageProps;
  /** Requests shown in the Pending Requests card. */
  requests?: RequestProps[];
  /**
   * The Pending Requests card. Defaults to on.
   *
   * Exists for the Return of Premium panel (user, 2026-09-23), which is itself
   * a request being worked on: a Pending Requests card beside it lists the
   * request you are already looking at.
   *
   * There is no Employment Information card any more (user, 2026-10-06) — it
   * was removed from the profile outright, not made optional.
   */
  showPendingRequests?: boolean;
  /**
   * The List of Plans block — the LPA search, the plan card and the run of
   * plan accordions under it.
   *
   * Off in the ROP panel (user, 2026-09-23) for the same reason as the other
   * two: the panel is already scoped to ONE plan, the one the request was
   * raised against, and a plan picker inside it invites a user to switch to a
   * plan the request has nothing to do with.
   */
  showListOfPlans?: boolean;
  /**
   * The profile header card's CONTACT INFORMATION column — its heading, the
   * mobile/landline/email rows AND the home and office address rows, which the
   * kit draws inside that same section.
   *
   * Off in the ROP panel (user, 2026-09-23), which is getting a card of its own
   * for this later. The kit renders the heading unconditionally, so hiding it
   * means blanking its two labels and withholding the values that feed it —
   * there is no prop that removes the column outright.
   */
  showContactSection?: boolean;
  /**
   * The Planholder Information card — the personal details block under the
   * header card.
   *
   * Off in the ROP panel (user, 2026-09-23), which is being pared back to the
   * request and the person it belongs to.
   */
  showPlanholderInfo?: boolean;
  /**
   * Extra content for the profile header card, rendered full-width at the
   * bottom of it through the kit's own `actions` slot.
   *
   * The ROP panel puts its request details here (user, 2026-09-23) so they sit
   * ON the planholder card rather than in a card of their own above it.
   */
  headerActions?: ReactNode;
}

export function PlanholderProfileBody({
  props,
  requests = MOCK_REQUESTS,
  showPendingRequests = true,
  showListOfPlans = true,
  showContactSection = true,
  showPlanholderInfo = true,
  headerActions,
}: PlanholderProfileBodyProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const isWebOnMount = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;

  const [isProfileOpen] = useState(true);
  const [personalOpen, setPersonalOpen] = useState(isWebOnMount);
  const [addressOpen, setAddressOpen] = useState(isWebOnMount);
  const [contactOpen, setContactOpen] = useState(isWebOnMount);

  const personId = props.planholderInfo?.personId;

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
  const mobileNo = props.planholderContact?.find(
    (c) => c.type === "MobileNo",
  )?.value;

  // With Pending Requests and the List of Plans both dropped, there is nothing
  // left in the right column above `lg` — only the phone's contact card, which
  // stacks anyway — so the profile takes the full width rather than leaving a
  // third of the row empty.
  const hasSideColumn = showPendingRequests || showListOfPlans;

  // THE LIST OF PLANS, SPLIT ACROSS THE TWO COLUMNS on desktop (user,
  // 2026-10-06): the LPA search and plan cards on the right, the details of
  // the selected plan on the left under Personal Information. The two halves
  // are separate elements, so the selection lives here and both are handed it.
  // A phone has one column and keeps the block whole.
  const [selectedLpa, setSelectedLpa] = useState(props.plans?.[0]?.lpaNumber);
  const listOfPlansProps = {
    plans: (props.plans ?? []) as any,
    deletePlanFunction: props.actionFunctions?.deletePlanFunction,
    personId,
    planholderAddress,
    selected: selectedLpa,
    onSelect: setSelectedLpa,
  };

  // The header card follows the same selection: its LPA number and its
  // insurability are the selected plan's, and the arrows beside the name step
  // through the plans, wrapping at either end.
  const plans = props.plans ?? [];
  const selectedIndex = Math.max(
    plans.findIndex((p) => p.lpaNumber === selectedLpa),
    0,
  );
  const selectedPlan = plans[selectedIndex];
  const stepPlan = (by: number) => {
    if (plans.length === 0) return;
    const index = (selectedIndex + by + plans.length) % plans.length;
    setSelectedLpa(plans[index].lpaNumber);
  };

  const fullName = props.planholderInfo
    ? [
        props.planholderInfo.firstName,
        props.planholderInfo.middleName,
        props.planholderInfo.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : undefined;
  // Held in state, from a callback ref on a plain `div`: the nav has to
  // search the card once it is in the page, and a ref object read on the
  // first commit came back empty.
  const [headerCard, setHeaderCard] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <Grid
        // `minmax(0, 1fr)` rather than a bare `1fr` (user, 2026-09-24): a
        // `1fr` track is `minmax(auto, 1fr)`, whose floor is the MIN-CONTENT
        // width of what is in it. The kit's profile card has a wide minimum, so
        // in a narrow column the track refused to shrink and the card hung past
        // its container — which is what made this card look wider than the ROP
        // details card under it. A zero floor lets the track take the width it
        // is given and the card shrink to fit.
        templateColumns={{
          base: "minmax(0, 1fr)",
          lg: hasSideColumn ? "2fr 1fr" : "minmax(0, 1fr)",
        }}
        gap={5}
        alignItems="start"
      >
        <GridItem minW={0}>
          <Flex direction="column" gap={4}>
            <Box
              pt={0}
              // THE LPA NUMBER under the name (user, 2026-10-06): no "#" in
              // front of it, and loud enough to find at a glance. The kit
              // hardcodes a hash icon and muted xs text on that line with no
              // prop for either, so this reaches into it. That row is the
              // only place the card puts an icon directly before a paragraph
              // — the address and contact chips are icon + bare text — and
              // the header actions are fenced off in case they ever do.
              css={{
                "& div:has(> svg:first-child + p:last-child):not([data-header-actions] *)":
                  {
                    "& > svg": { display: "none" },
                    "& > p": {
                      px: 2.5,
                      py: 0.5,
                      borderRadius: "full",
                      bg: "infoTint",
                      color: "info",
                      fontSize: "sm",
                      fontWeight: "semibold",
                      letterSpacing: "wide",
                    },
                  },
                // The previous/next plan slots `ProfileNamePlanNav` puts on
                // either side of the name: the block holding the name becomes
                // a three-column row — arrow, name, arrow — with the LPA line
                // spanning all three under it.
                "& :has(> [data-plan-nav])": {
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr) auto",
                  alignItems: "center",
                  // Set off from the name on desktop (user, 2026-10-06).
                  columnGap: { base: 1, lg: 3 },
                  "& > :not([data-plan-nav]):not(p)": {
                    gridColumn: "1 / -1",
                  },
                  // The phone layout cuts the name to one line with an
                  // ellipsis; with an arrow on each side that left only a
                  // few letters, so it wraps instead.
                  "& > p": {
                    whiteSpace: "normal",
                    overflow: "visible",
                    textOverflow: "clip",
                  },
                },
                // THE HOME ADDRESS in Contact Information gets two lines
                // before it is cut short (user, 2026-10-06); the kit gives it
                // one. Its tile is the only one that links to a map, which is
                // what picks it out — the value is the tile's last line.
                '& a[href*="maps.google.com"] p:last-child': {
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                },
                // THE NAME COLUMN, WIDER (user, 2026-10-06), to fit the larger
                // arrows either side of the name. The kit fixes it at 210px
                // and gives the contact column whatever is left, so widening
                // it here is what narrows the contact column. Desktop only:
                // on a phone the same selector lands on the avatar row,
                // which lays itself out.
                // (`:has()` cannot be nested — a `:has(> :has(…))` is dropped
                // by the browser whole — hence the `> * >` path.)
                "& :has(> * > [data-plan-nav])": {
                  lg: { width: "320px" },
                },
              }}
            >
              <div ref={setHeaderCard}>
                <ProfileHeaderCard
                  name={fullName}
                  // The kit draws this under the name. It shows the selected
                  // plan's LPA number (user, 2026-10-06) rather than the
                  // internal person ID.
                  personId={selectedPlan?.lpaNumber}
                  // Withheld whenever the status row below is drawn — it
                  // carries insurability itself, so the kit's own badge would
                  // be a second copy. The row needs a name to anchor to; with
                  // none, the kit's badge is all there is.
                  isInsured={fullName ? undefined : selectedPlan?.isInsured}
                  // The kit builds its contact column out of home address,
                  // office address, mobile, landline and email. Only the home
                  // address and the mobile number are shown (user, 2026-10-06);
                  // the other three are left out, and the full set stays in the
                  // contact and address cards below. Both are withheld when the
                  // section is off, which leaves the column nothing to draw.
                  homeAddress={showContactSection ? homeAddress : undefined}
                  contactNo={showContactSection ? mobileNo : undefined}
                  // ...and the two labels blanked, which is what removes the
                  // heading and the "no contact information" line the kit would
                  // otherwise show in its place.
                  contactSectionLabel={showContactSection ? undefined : ""}
                  emptyContactLabel={showContactSection ? undefined : ""}
                  isOpen={isProfileOpen}
                  contentId="profile-details-content"
                  actions={
                    headerActions && (
                      <Box data-header-actions>{headerActions}</Box>
                    )
                  }
                />
              </div>
              <ProfileNamePlanNav
                card={headerCard}
                name={fullName}
                planCount={plans.length}
                onPrevious={() => stepPlan(-1)}
                onNext={() => stepPlan(1)}
                below={selectedPlan && <PlanStatusBadges plan={selectedPlan} />}
              />
            </Box>
            <Show when={isMobile}>
              {showPendingRequests && <PendingRequests requests={requests} />}
            </Show>

            {showPlanholderInfo && (
              <Box>
                <PlanholderInfo
                  planholder={props.planholderInfo ?? undefined}
                  isOpen={personalOpen}
                  onToggle={() => setPersonalOpen((p) => !p)}
                />
              </Box>
            )}
            {/* Directly under Personal Information: the whole block on a
                phone, only the selected plan's details above `lg`. */}
            <Show when={isMobile && showListOfPlans}>
              <ListOfPlans {...listOfPlansProps} />
            </Show>
            <Show when={!isMobile && showListOfPlans}>
              <ListOfPlans {...listOfPlansProps} part="details" />
            </Show>
            <Box display={{ base: "block", lg: "none" }}>
              <PlanholderAddressCard
                phAddress={props.planholderAddress}
                isOpen={addressOpen}
                onToggle={() => setAddressOpen((p) => !p)}
              />
            </Box>
          </Flex>
        </GridItem>

        <GridItem minW={0}>
          <Flex direction="column" gap={4}>
            <Show when={!isMobile && showPendingRequests}>
              <PendingRequests requests={requests} />
            </Show>
            {/* The LPA search and plan cards, on the right on desktop, under
                Pending Requests. */}
            <Show when={!isMobile && showListOfPlans}>
              <ListOfPlans {...listOfPlansProps} part="picker" />
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
          </Flex>
        </GridItem>
      </Grid>
    </>
  );
}

export default PlanholderProfileBody;
