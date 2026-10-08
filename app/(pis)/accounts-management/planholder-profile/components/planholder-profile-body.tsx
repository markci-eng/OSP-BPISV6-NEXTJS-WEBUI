"use client";

// THE PLANHOLDER PROFILE ITSELF — the header card, the Planholder Details,
// COFP and ROP Details and Planholder Remarks and Notes cards under it, and
// the pending requests. The cards that used to sit below the header card
// (personal information, the plan cards, the phone's address and contact
// cards) were removed (user, 2026-10-07).
//
// ONE SELECTED PLAN DRIVES EVERY CARD (user, 2026-10-07): the arrows beside
// the name change it, and the header card's LPA number, branch and statuses,
// both details cards, the remarks and notes and the pending requests all
// follow. Only what belongs to the PERSON — name, birthdate, age, address,
// mobile — stays put.
//
// EXTRACTED FROM `pis-planholder-profile-page` (2026-09-23), unchanged. The
// Return of Premium module shows this same profile in its right panel, and the
// alternative was a second copy of the layout: two files that look identical on
// the day they are written and answer differently a month later. The page keeps
// what is a PAGE's — its title, the planholder lookup in the toolbar, the empty
// state dialog — and hands the profile itself to this.

import { Box, Flex, Grid, GridItem, Show, Text } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { OSPBadge, ProfileHeaderCard, useMessageDialog } from "osp-ui-kit";
import { toast } from "sonner";

import type { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import {
  PendingRequests,
  RequestProps,
} from "@/components/plan-management/planholder-profile/sections/pending-requests";
import type { Address } from "@/components/plan-management/planholder-profile/sections/address-info";
import { ProfileNamePlanNav } from "./profile-name-plan-nav";
import { PlanholderDetailsCard } from "./planholder-details-card";
import { CofpRopDetailsCard } from "./cofp-rop-details-card";
import { PaymentDetailsCard } from "./payment-details-card";
import { buildPlanSoa } from "../data/plan-soa";
import { StatementOfAccountDialog } from "../../components/statement-of-account-dialog";
import { formatTerminationStatus } from "../../data/termination-status";
import AccountQuickActions from "@/components/plan-management/planholder-profile/cards/account-quick-actions";
import { LuPrinter, LuUndo2 } from "react-icons/lu";
import { formatAge, formatFiledDate } from "@/app/(pis)/data";
import { RopRemarksCard } from "../../return-of-premium/components/rop-remarks-card";
import {
  buildPlanholderNotes,
  buildPlanholderRemarks,
} from "../../return-of-premium/data/data";

/**
 * A stable number per plan, to pick its stand-in remarks and notes: the same
 * plan always gets the same ones, and plans differ from one another.
 */
function seedOf(lpaNumber: string): number {
  return [...lpaNumber].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

/**
 * One fact on the name card. The ROP planholder card's `Fact` type — caption
 * and value at the same sizes and weights — but caption BESIDE value, on one
 * line (user, 2026-10-07), rather than over it.
 */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Flex align="baseline" gap={1.5} minW={0} whiteSpace="nowrap">
      {/* A step up from the ROP card's 10px / xs (user, 2026-10-07). */}
      <Text
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0.04em"
        textTransform="uppercase"
        color="gray.500"
      >
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="600" color="gray.800" lineHeight="1.3">
        {value}
      </Text>
    </Flex>
  );
}

/** The kinds of request a plan can have, with their step counts and prefix. */
const REQUEST_KINDS: {
  type: RequestProps["type"];
  title: string;
  prefix: string;
  totalSteps: number;
}[] = [
  {
    type: "Reinstatement",
    title: "Reinstatement",
    prefix: "RI",
    totalSteps: 4,
  },
  {
    type: "Returned of Premium",
    title: "ROP Application",
    prefix: "ROP",
    totalSteps: 3,
  },
  {
    type: "Transfer of Rights",
    title: "Transfer of Rights",
    prefix: "TR",
    totalSteps: 4,
  },
  {
    type: "Change of Mode",
    title: "Change of Mode",
    prefix: "CM",
    totalSteps: 3,
  },
];

/**
 * THE SELECTED PLAN'S REQUESTS (user, 2026-10-07), so Pending Requests
 * changes with the plan like every other card. Stand-ins until the profile has
 * a source: none to two pending, plus one finished for the History drawer,
 * each filed against this plan's LPA number.
 */
function buildPlanRequests(lpaNumber: string, mode: string): RequestProps[] {
  const seed = seedOf(lpaNumber);
  const pendingCount = seed % 3;
  const digits = lpaNumber.replace(/\D/g, "");
  return Array.from({ length: pendingCount + 1 }, (_, k): RequestProps => {
    const kind = REQUEST_KINDS[(seed + k) % REQUEST_KINDS.length];
    const pending = k < pendingCount;
    const date = new Date(2026, 8 - k * 2, 1 + ((seed + k * 7) % 27));
    return {
      type: kind.type,
      title: kind.title,
      description: `LPA No. ${lpaNumber} · ${mode}`,
      transactionId: `${kind.prefix}-${date.getFullYear()}-${digits.slice(-6)}`,
      currentStep: pending
        ? 1 + ((seed + k) % (kind.totalSteps - 1))
        : kind.totalSteps,
      totalSteps: kind.totalSteps,
      status: pending
        ? "Pending"
        : (seed + k) % 4 === 0
          ? "Denied"
          : "Approved",
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      hyperlink: "#",
    };
  });
}

/** The termination status of a plan that has not been terminated. */
const NOT_TERMINATED = "NOT YET TERMINATED";

type BadgeType = "success" | "info" | "warning" | "danger";

/** Account status colours — LAPSED is the one to stop on. */
const ACCOUNT_STATUS_TYPE: Record<string, BadgeType> = {
  ACTIVE: "success",
  "FULLY PAID": "info",
  LAPSED: "warning",
};

/**
 * THE SELECTED PLAN'S STANDING, in the name card's Contact Information
 * column, after the contact tiles (user, 2026-10-06; it first sat under the
 * LPA number): insurability, account status and termination status, in that
 * order. Insurability keeps the kit's own wording and colours, since this
 * replaces the kit's badge rather than sitting beside it.
 */
function PlanStatusBadges({
  plan,
}: {
  plan: NonNullable<PlanholderPageProps["plans"]>[number];
}) {
  const badges = [
    plan.isInsured !== undefined && (
      <OSPBadge key="insured" type={plan.isInsured ? "success" : "danger"}>
        {plan.isInsured ? "Insurable" : "Not Insurable"}
      </OSPBadge>
    ),
    plan.accountStatus && (
      <OSPBadge
        key="account"
        type={ACCOUNT_STATUS_TYPE[plan.accountStatus] ?? "info"}
      >
        {plan.accountStatus}
      </OSPBadge>
    ),
    plan.terminationStatus && (
      <OSPBadge
        key="termination"
        type={
          plan.terminationStatus === "NOT YET TERMINATED" ? "success" : "info"
        }
      >
        {formatTerminationStatus(plan.terminationStatus)}
      </OSPBadge>
    ),
  ].filter(Boolean);

  // A hairline between each badge (user, 2026-10-07), like the one between
  // Birthdate and Age above, a shade darker so it still reads beside the
  // badges' own tints.
  return (
    <Flex wrap="wrap" align="stretch" gap={2} mt={3}>
      {badges.flatMap((badge, i) =>
        i === 0
          ? [badge]
          : [
              <Box
                key={`separator-${i}`}
                borderLeftWidth="1px"
                borderColor="gray.200"
              />,
              badge,
            ],
      )}
    </Flex>
  );
}

export interface PlanholderProfileBodyProps {
  props: PlanholderPageProps;
  /**
   * Requests shown in the Pending Requests card, in place of the selected
   * plan's own. Left out, the card follows the plan picked on the name card.
   */
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
  requests,
  showPendingRequests = true,
  showContactSection = true,
  headerActions,
}: PlanholderProfileBodyProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const [isProfileOpen] = useState(true);

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

  // With Pending Requests dropped, there is nothing left in the right column,
  // so the profile takes the full width rather than leaving a third of the
  // row empty.
  const hasSideColumn = showPendingRequests;

  // The selected plan: the header card's LPA number and insurability are its,
  // and the arrows beside the name step through the plans, wrapping at either
  // end.
  const [selectedLpa, setSelectedLpa] = useState(props.plans?.[0]?.lpaNumber);
  // Plans whose termination was cancelled on this screen (user, 2026-10-07).
  // Laid over the plans themselves, so every card that reads a plan's
  // termination status — the badges, the SOA — shows it cancelled. Local
  // only: there is nowhere to send it yet, and a reload brings it back.
  const [cancelledTerminations, setCancelledTerminations] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const plans = (props.plans ?? []).map((plan) =>
    cancelledTerminations.has(plan.lpaNumber)
      ? { ...plan, terminationStatus: NOT_TERMINATED }
      : plan,
  );
  const selectedIndex = Math.max(
    plans.findIndex((p) => p.lpaNumber === selectedLpa),
    0,
  );
  const selectedPlan = plans[selectedIndex];
  const planRequests =
    requests ??
    (selectedPlan
      ? buildPlanRequests(selectedPlan.lpaNumber, selectedPlan.mode)
      : []);
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

  // VIEW SOA (user, 2026-10-07): the selected plan's Statement of Account, in
  // the dialog Return of Premium opens.
  const [soaOpen, setSoaOpen] = useState(false);
  const soa = selectedPlan
    ? buildPlanSoa({
        plan: selectedPlan,
        name: fullName ?? "",
        birthDate: props.planholderInfo?.dateOfBirth,
        address: homeAddress?.replace(/\n/g, ", "),
        remarks: buildPlanholderRemarks(seedOf(selectedPlan.lpaNumber)),
      })
    : undefined;
  // CANCEL TERMINATION (user, 2026-10-07), beside View SOA. Asks first, and
  // only for a plan that is terminated; for one that is not, says so.
  const { messageBox } = useMessageDialog();
  const cancelTermination = async () => {
    if (!selectedPlan) return;
    const { lpaNumber, terminationStatus } = selectedPlan;
    if (terminationStatus === NOT_TERMINATED) {
      await messageBox({
        title: "Plan Not Terminated",
        message: `LPA No. ${lpaNumber} is not terminated, so there is no termination to cancel.`,
        confirmText: "Okay",
        variant: "information",
      });
      return;
    }
    const confirmed = await messageBox({
      title: "Cancel Termination",
      message: `Cancel the termination of LPA No. ${lpaNumber} (${formatTerminationStatus(terminationStatus)})?`,
      confirmText: "Cancel Termination",
      cancelText: "Keep",
      variant: "confirmation",
    });
    if (!confirmed) return;
    setCancelledTerminations((current) => new Set(current).add(lpaNumber));
    toast.success(`Termination cancelled for ${lpaNumber}`);
  };

  const actionTiles = selectedPlan && (
    <AccountQuickActions
      actions={[
        {
          key: "view-soa",
          label: "View SOA",
          icon: LuPrinter,
          onClick: () => setSoaOpen(true),
        },
        {
          key: "cancel-termination",
          label: "Cancel Termination",
          icon: LuUndo2,
          onClick: cancelTermination,
        },
      ]}
    />
  );

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
        // The name card and Pending Requests share the first row, so the
        // latter can be held to the former's height (user, 2026-10-07); the
        // details card is the second row, under the name card. On a phone it
        // is one column in source order, 8px apart as before.
        columnGap={5}
        rowGap={2}
        alignItems="start"
      >
        <GridItem minW={0}>
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
                    // Larger again (user, 2026-10-06): just under the
                    // name's own size on desktop.
                    px: 3,
                    py: 1,
                    borderRadius: "full",
                    bg: "infoTint",
                    color: "info",
                    fontSize: { base: "md", lg: "lg" },
                    lineHeight: "1.2",
                    fontWeight: "bold",
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
              planIndex={selectedIndex}
              // The selected plan's branch, under its LPA number (user,
              // 2026-10-06).
              underLpa={
                selectedPlan?.branch && (
                  <Text
                    mt={1.5}
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.600"
                  >
                    {selectedPlan.branch}
                  </Text>
                )
              }
              onPrevious={() => stepPlan(-1)}
              onNext={() => stepPlan(1)}
              // The planholder's date of birth and age, under the Mobile tile
              // (user, 2026-10-07; moved from Planholder Details, then from
              // under the branch) — the status slot comes straight after the
              // contact tiles, and Mobile is the last of them — then the
              // selected plan's status badges.
              status={
                <>
                  {/* Drawn as the ROP planholder card draws them (user,
                      2026-10-07): two cells side by side, caption over
                      value, a hairline between and a rule above. */}
                  {props.planholderInfo?.dateOfBirth && (
                    <Flex
                      align="stretch"
                      gap={3}
                      mt={3}
                      pt={2.5}
                      borderTopWidth="1px"
                      borderColor="gray.100"
                    >
                      <Fact
                        label="Birthdate"
                        value={formatFiledDate(
                          props.planholderInfo.dateOfBirth.toISOString(),
                        )}
                      />
                      <Box borderLeftWidth="1px" borderColor="gray.100" />
                      <Fact
                        label="Age"
                        value={formatAge(props.planholderInfo.dateOfBirth)}
                      />
                    </Flex>
                  )}
                  {selectedPlan && <PlanStatusBadges plan={selectedPlan} />}
                </>
              }
              // No "Contact Information" caption (user, 2026-10-07). Hidden
              // by the nav rather than blanked on the card, since the nav
              // finds the contact column by that caption.
              hideContactHeading
            />
          </Box>
        </GridItem>

        {/* PENDING REQUESTS AS TALL AS THE NAME CARD (user, 2026-10-07).
            Stretched to the row and drawn absolutely inside it, so it takes
            the row's height without adding to it: the name card alone sets
            that height, and the kit card clips whatever does not fit. */}
        {!isMobile && showPendingRequests && (
          <GridItem minW={0} alignSelf="stretch" position="relative">
            <Box position="absolute" inset={0}>
              {/* Keyed by plan, so its carousel starts at the first
                  request each time the plan changes. */}
              <PendingRequests
                key={`requests-${selectedPlan?.lpaNumber}`}
                requests={planRequests}
                h="full"
              />
            </Box>
          </GridItem>
        )}

        {/* Personal Information, the selected plan's cards and the phone's
            address and contact cards are gone (user, 2026-10-07); the one
            card under the name card is Planholder Details, which follows the
            plan the arrows select. Pending Requests sits beside the name card
            on desktop, under it on a phone. */}
        <Show when={isMobile && showPendingRequests}>
          <GridItem minW={0}>
            <PendingRequests
              key={`requests-${selectedPlan?.lpaNumber}`}
              requests={planRequests}
            />
          </GridItem>
          {/* View SOA and Cancel Termination under Pending Requests on a
              phone too. */}
          <GridItem minW={0}>{actionTiles}</GridItem>
        </Show>
        {/* ONE CELL for both cards (user, 2026-10-07): as separate grid
            items the remarks card auto-placed into the empty right-hand cell
            under Pending Requests. Together they stay in the left column,
            under the name card. */}
        <GridItem minW={0}>
          <Flex direction="column" gap={2}>
            {/* Planholder Details and COFP and ROP Details, half the column
                each on desktop (user, 2026-10-07); stacked on a phone. The
                row stretches both to the taller one, and `fill` lets each
                card take that height (user, 2026-10-07). */}
            <Flex
              direction={{ base: "column", lg: "row" }}
              align="stretch"
              gap={2}
            >
              <Box flex="1" minW={0}>
                <PlanholderDetailsCard
                  planholder={props.planholderInfo}
                  plan={selectedPlan}
                  fill
                />
              </Box>
              <Box flex="1" minW={0}>
                <CofpRopDetailsCard plan={selectedPlan} fill />
              </Box>
            </Flex>
            {/* PLANHOLDER REMARKS AND NOTES (user, 2026-10-07) — the ROP card
                itself, as Transfer and CSV show it, not a copy. Keyed by plan
                so the notes list starts over on each one. Stand-in remarks and
                notes from the ROP data until the profile has a source for
                them. */}
            {selectedPlan && (
              <RopRemarksCard
                // Prefixed: Payment Details beside it is keyed by the same
                // plan, and two siblings sharing a key left the old cards in
                // place on each change of plan — the card doubled.
                key={`remarks-${selectedPlan.lpaNumber}`}
                lpaNo={selectedPlan.lpaNumber}
                planholderName={fullName ?? ""}
                remarks={buildPlanholderRemarks(seedOf(selectedPlan.lpaNumber))}
                notes={buildPlanholderNotes(
                  selectedPlan.lpaNumber,
                  seedOf(selectedPlan.lpaNumber),
                )}
              />
            )}
            {/* PAYMENT DETAILS (user, 2026-10-07), under the remarks. Keyed
                by plan, so a row deleted on one plan does not carry over. */}
            {selectedPlan && (
              <PaymentDetailsCard
                key={`payments-${selectedPlan.lpaNumber}`}
                plan={selectedPlan}
              />
            )}
          </Flex>
        </GridItem>

        {/* VIEW SOA AND CANCEL TERMINATION, under Pending Requests (user,
            2026-10-07): the right column's second row, beside the details
            cards. Placed there by the grid's own flow — it is the next free
            cell after the left column's. */}
        {!isMobile && showPendingRequests && (
          <GridItem minW={0}>{actionTiles}</GridItem>
        )}
      </Grid>

      {soa && (
        <StatementOfAccountDialog
          open={soaOpen}
          onOpenChange={setSoaOpen}
          soa={soa}
        />
      )}
    </>
  );
}

export default PlanholderProfileBody;
