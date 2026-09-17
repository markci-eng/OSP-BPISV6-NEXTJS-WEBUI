"use client";

// THE MAIN COLUMN — the plan holder behind the claim being worked.
//
// This is the page's subject. The queue in the rail beside it is how a claim is
// PICKED; everything that happens after the picking happens here, at the width
// the work actually needs. That is the inversion this redesign is: the old
// dashboard gave its largest column to the list and opened the claim somewhere
// else, so the thing being worked was never the thing on screen.
//
// WHAT IT SHOWS IS THE PLAN HOLDER PAGE'S OWN MAIN COLUMN, section for section
// and component for component — the profile header, the plan details, the
// remarks, the payment ledger, the declared beneficiaries and any other plans
// the person holds. Not a version of it built to look the same. A claim is
// decided against the RECORD, and the record already has a design; picking a
// claim here should land a processor on the same page they would have opened
// from anywhere else in the area, minus the trip.
//
// JUST THE MAIN COLUMN. The profile page is two columns, and its right one —
// the plan holder search, the plan's actions, that plan's claim requests and
// the document folder — is not brought across. This page already has a right
// column, and it is the queue. Two rails would be the screen arguing with
// itself about which list is the one being worked.
//
// The CLAIM is a strip above all of it. Everything under that strip is the
// person; the strip is which of their claims put you here, and the two things
// that can be done with it.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import {
  LuCheck,
  LuConstruction,
  LuCopy,
  LuInbox,
  LuReceipt,
  LuUserX,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { toast } from "sonner";
import {
  PrimarySmButton,
  SecondarySmButton,
  useMessageDialog,
} from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  addClaimNote,
  decideClaim,
  getClaimDecision,
  getClaimNotes,
} from "../../../claim-store";
import {
  getOtherPlansForPerson,
  getPlanholder,
  getPlanholderBeneficiaries,
  getPlanholderPayments,
  getPlanholderRemarks,
} from "../../../claims-data";
// THE PROFILE'S OWN SECTIONS, imported rather than reproduced. Each one already
// answers for its own layout at any width — see the container query in
// `PlanholderProfileHeader` — so they need nothing from this page but the plan.
import { PlanholderProfileHeader } from "../../../planholder/components/PlanholderProfileHeader";
import { PlanholderInfoCard } from "../../../planholder/components/PlanholderInfoCard";
import { PlanholderRemarks } from "../../../planholder/components/PlanholderRemarks";
import { PlanholderPayments } from "../../../planholder/components/PlanholderPayments";
import { PlanholderBeneficiaries } from "../../../planholder/components/PlanholderBeneficiaries";
import { PlanholderOtherPlans } from "../../../planholder/components/PlanholderOtherPlans";
import { PlanholderDocuments } from "../../../planholder/components/PlanholderDocuments";
import { type DeathClaim } from "../../../death-claim/death-claims-data";
import { useFloatingDock } from "./floating-dock";
import { claimWindowFor } from "./claim-window";
import { KitCardShape, SectionCard } from "../../../components/section-card";
import { SectionLauncher, SectionPopup } from "../../../components/section-popup";
import { ClaimPayees } from "../../../components/claim-payees";
import {
  NATURE_LABEL,
  isNatureBuilt,
  type ClaimNature,
} from "../../../components/nature-select";
import type { QueueKey } from "./queue-rail";

/**
 * Shown until a claim is picked.
 *
 * Says what to do rather than that something is missing: nothing has gone wrong
 * here — the page has simply not been given its subject yet, and the rail that
 * supplies it is the next thing to the right.
 */
function NothingPicked({ nature }: { nature: ClaimNature }) {
  // A nature with no module behind it has nothing to pick, so "pick a claim"
  // would be an instruction the page cannot honour. Same distinction the rail
  // draws beside it: no work today is not the same fact as no module yet.
  const unbuilt = !isNatureBuilt(nature);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      gap={3}
      py={{ base: 16, xl: 28 }}
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
    >
      <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
        {unbuilt ? <LuConstruction size={26} /> : <LuInbox size={26} />}
      </Box>
      <Text fontSize="lg" fontWeight="700" color="gray.800">
        {unbuilt ? `${NATURE_LABEL[nature]} claims` : "Pick a claim to work"}
      </Text>
      <Text fontSize="sm" color="gray.500" maxW="360px">
        {unbuilt
          ? "This module is not available yet. Pick another nature in the queue to carry on."
          : "Choose one from the queue and it opens here. Open a second in a window to compare the two."}
      </Text>
    </Flex>
  );
}

/**
 * A claim whose LPA number matches no plan on file.
 *
 * Worth its own state rather than an empty profile: the profile's sections
 * would each render their own "nothing on file", and six of those together read
 * as a plan holder with an empty record instead of a plan holder who could not
 * be found. Same wording as the profile page's own not-found.
 */
function PlanholderMissing({ lpaNo }: { lpaNo: string }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      gap={3}
      py={{ base: 12, xl: 20 }}
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
    >
      <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
        <LuUserX size={26} />
      </Box>
      <Text fontSize="lg" fontWeight="700" color="gray.800">
        Plan Holder Not Found
      </Text>
      <Text fontSize="sm" color="gray.500" maxW="360px">
        No plan holder is on file for LPA No.{" "}
        <Text as="span" fontWeight="600" color="gray.700">
          {lpaNo}
        </Text>
        .
      </Text>
    </Flex>
  );
}

/**
 * WHICH CLAIM PUT YOU HERE, and the two things that can be done with it.
 *
 * Everything below this strip is the plan holder — the same record whichever of
 * their claims was picked — so the claim has to be named somewhere or the column
 * would not say what it is showing. It names the CLAIM and not the person on
 * purpose: the person is the first card underneath, and saying it twice would
 * make the strip look like the profile's own header.
 *
 * The actions are here for the same reason. "Compare in window" is the entry to
 * the dock, and it belongs to a claim rather than to a plan holder.
 */
function ClaimStrip({
  claim,
  identifier,
}: {
  claim: DeathClaim;
  identifier: ClaimIdentifier;
}) {
  const router = useRouter();
  const { open } = useFloatingDock();

  // The queue's own choice, and no falling back to the other number when it is
  // missing: a For Process card names the request, so this names the request.
  const byClaim = identifier === "claim";
  const number = (byClaim ? claim.claimNo : claim.reference) || "—";

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={4}
      py={3}
    >
      <Flex align="center" gap={3} wrap="wrap">
        <Box minW={{ base: "100%", sm: 0 }} flex={{ sm: "1" }}>
          <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.06em">
            {byClaim ? "Claim no." : "Request no."}
          </Text>
          <Flex align="center" gap={2} wrap="wrap" mt="1px">
            <Text fontSize="sm" fontWeight="700" color="gray.900">
              {number}
            </Text>
            <Box
              px={2}
              py="1px"
              borderRadius="full"
              bg={claim.type === "special" ? "#FFF7ED" : "#F0FDF4"}
              color={
                claim.type === "special"
                  ? BRAND_COLORS.warningText
                  : BRAND_COLORS.darkGreen
              }
              fontSize="11px"
              fontWeight="700"
            >
              {claim.type === "special" ? "Special" : "Regular"}
            </Box>
            <Box
              px={2}
              py="1px"
              borderRadius="full"
              bg="gray.100"
              color="gray.700"
              fontSize="11px"
              fontWeight="700"
            >
              {claim.phase}
            </Box>
          </Flex>
        </Box>

        <Flex gap={2} flexShrink={0} w={{ base: "full", sm: "auto" }}>
          {/* Only for a request that has no claim header yet — the form exists
              to create one, so a claim already opened has nothing to send it. */}
          {!claim.claimNo && (
            <PrimarySmButton
              onClick={() =>
                router.push(
                  `/claims/death-claim/create/${encodeURIComponent(claim.reference)}`,
                )
              }
            >
              Process this claim
            </PrimarySmButton>
          )}

          {/* SEND IT TO THE DOCK — what makes comparison possible. The main
              column holds one claim; putting this one in a window frees the
              column for the next without losing it. */}
          <SecondarySmButton onClick={() => open(claimWindowFor(claim))}>
            <LuCopy />
            Compare in window
          </SecondarySmButton>
        </Flex>
      </Flex>
    </Box>
  );
}

/**
 * THE PROCESSOR'S VERDICT, at the foot of the column.
 *
 * FOR PROCESS ONLY. The other two queues are somebody else's step — verification
 * and endorsement each have their own act — and a claim already past this stage
 * has been decided once. So the bar is gated on the stage rather than on the
 * claim, which is what the queue is for.
 *
 * WHAT THE WORDS MEAN, because the buttons say one thing and the record says a
 * more careful version of it. "Approved" and "Denied" are the SUPERVISOR's
 * verdict on an endorsed claim — the claim store leaves both out of the
 * processor's reach on purpose (see `SELECTABLE_CLAIM_STATUSES`). What a
 * processor decides here is which of the two a claim is sent FOR, so the buttons
 * carry the verbs a processor uses and the confirmation, the trail and the
 * recorded line below all say "sent for approval" / "sent for denial".
 *
 * Denial on the LEFT and quiet, approval on the RIGHT and solid: the destructive
 * half of a pair should never be the one the hand falls on, and the two are held
 * apart rather than sat side by side so neither is hit by accident.
 */
function DecisionBar({ claim }: { claim: DeathClaim }) {
  const { messageBox } = useMessageDialog();
  const decision = getClaimDecision(claim.reference);
  const label = claim.claimNo ?? claim.reference;

  /** Confirm, then record. A declined confirmation leaves the claim alone. */
  const decide = async (outcome: "approval" | "denial") => {
    const approving = outcome === "approval";
    const confirmed = await messageBox({
      title: approving ? "SEND FOR APPROVAL" : "SEND FOR DENIAL",
      message: approving
        ? `Send ${label} for approval? It goes to a supervisor for the final verdict.`
        : `Send ${label} for denial? It goes to a supervisor for the final verdict.`,
      confirmText: approving ? "Send for approval" : "Send for denial",
      variant: "confirmation",
    });
    if (!confirmed) return;

    decideClaim(claim.reference, outcome);
    toast.success(
      approving ? "Sent for approval" : "Sent for denial",
      { description: label },
    );
  };

  // ALREADY DECIDED — the buttons give way to what was decided rather than
  // standing there inviting a second, contradictory answer. The claim stays on
  // the For Process list either way (see `decideClaim`), so without this the
  // only sign anything had happened would have been a toast that is already
  // gone.
  // NO CARD ROUND EITHER STATE. Everything above this in the column is a record
  // being read, and a card is what says "this is a section of it". The verdict
  // is not a section — it is what you do once you have read them — so it stands
  // on the page with the buttons as the only thing drawn.
  if (decision) {
    const approved = decision.outcome === "approval";
    return (
      <Flex align="center" gap={2} px={1}>
        <Box
          color={approved ? BRAND_COLORS.darkGreen : BRAND_COLORS.destructiveRed}
          flexShrink={0}
        >
          {approved ? <LuCheck size={15} /> : <LuX size={15} />}
        </Box>
        <Text fontSize="sm" fontWeight="700" color="gray.800">
          {approved ? "Sent for approval" : "Sent for denial"}
        </Text>
        <Text fontSize="xs" color="gray.500">
          by {decision.decidedBy}
        </Text>
      </Flex>
    );
  }

  return (
    // `space-between` and not a gap: the two are opposite answers and they sit
    // at opposite ends of the row. On a phone they stack, and the ghost goes
    // first there too — the order is the same at every width.
    <Flex align="center" justify="space-between" gap={3} wrap="wrap">
      {/* THE KIT'S OWN BUTTONS, not Chakra's dressed up to look like them.
          Secondary IS the outline variant — transparent over a brand border,
          filling solid on hover — and Primary is the solid fill. Both are
          "locked": the kit omits bg, colour, border and hover from their props
          on purpose, so a call site cannot drift from the theme.

          NO ICONS ON THEM EITHER: a tick beside the word "Approve" and a cross
          beside "Deny" are the label again in a second alphabet. The mark earns
          its place on the RECORDED line above, where it is the fastest way to
          tell which of the two happened, and not here where the word is already
          the whole answer.

          THAT IS ALSO WHY DENY IS NOT RED. The kit ships no danger button —
          only a factory for one — and hand-colouring a locked component is the
          exact thing its type signature exists to prevent. Weight carries the
          distinction instead: solid for the action being invited, outline for
          the one that should take a moment's thought. A real danger variant
          belongs in the kit, not in this file. */}
      <SecondarySmButton onClick={() => decide("denial")}>
        Deny
      </SecondarySmButton>
      <PrimarySmButton onClick={() => decide("approval")}>
        Approve
      </PrimarySmButton>
    </Flex>
  );
}

/** Which of a claim's two numbers names it — see `IDENTIFIER` in the rail. */
export type ClaimIdentifier = "request" | "claim";

export function ClaimDetailPanel({
  claim,
  nature,
  identifier,
  stage,
}: {
  claim: DeathClaim | undefined;
  nature: ClaimNature;
  /** The queue's own choice of number, so the strip repeats the card. */
  identifier: ClaimIdentifier;
  /**
   * Which queue the claim was picked from — the processor's decision belongs to
   * one of the three and not to the claim. See {@link DecisionBar}.
   */
  stage: QueueKey;
}) {
  const planholder = claim ? getPlanholder(claim.lpaNo) : undefined;

  /**
   * Which look-up is open over the page, if any.
   *
   * ONE piece of state for both, not a flag each: they are two views of the
   * same slot and only one can be up at a time, so a pair of booleans would be
   * a way to open both at once and have to be stopped from doing it.
   */
  const [popup, setPopup] = useState<"payments" | "beneficiaries" | null>(null);

  // What the two buttons report. Read here rather than inside the sections,
  // because the button has to say how much is behind it before it is pressed.
  const paymentCount = planholder
    ? getPlanholderPayments(planholder.lpaNo).length
    : 0;
  const beneficiaryCount = planholder
    ? getPlanholderBeneficiaries(planholder.lpaNo).length
    : 0;


  /**
   * Whether the person holds a plan other than this one.
   *
   * Asked HERE as well as inside the section, because the section answers by
   * rendering nothing — and a card drawn around nothing is an empty card at the
   * foot of the column. The card has to know before it is drawn.
   */
  const hasOtherPlans = planholder
    ? getOtherPlansForPerson(planholder.personId, planholder.lpaNo).length > 0
    : false;

  if (!claim) return <NothingPicked nature={nature} />;

  return (
    <Flex direction="column" gap={4}>
      <ClaimStrip claim={claim} identifier={identifier} />

      {!planholder ? (
        <PlanholderMissing lpaNo={claim.lpaNo} />
      ) : (
        <>
          {/* THE PROFILE'S MAIN COLUMN, in its own order — every section in a
              card, so the column reads as one stack rather than carded sections
              with loose bands between them. See `SectionCard`.

              These two arrive as cards already, so they are reshaped rather
              than wrapped: the kit turns its corners at 5px and this column
              turns at 12, and the details card carries no hairline at all. See
              `KitCardShape`. */}
          <KitCardShape>
            <PlanholderProfileHeader planholder={planholder} />
          </KitCardShape>

          <KitCardShape>
            <PlanholderInfoCard planholder={planholder} asDetails />
          </KitCardShape>

          {/* `showNotes={false}`, matching the profile page: notes are a
              different record from the remarks on the plan, and this area only
              reads the second. */}
          <SectionCard>
            <PlanholderRemarks
              remarks={getPlanholderRemarks(planholder.lpaNo)}
              showNotes={false}
              showSubtitles={false}
            />
          </SectionCard>

          {/* THE TWO LOOK-UPS, behind buttons. Neither is what a claim is
              decided on — they are consulted, occasionally and deliberately —
              and inline they cost more column than every section that IS.
              Sixty receipts is a screenful. See `SectionLauncher`.

              Side by side when the column has room for two, stacked when it
              does not: `auto-fit` and not a breakpoint, for the reason this
              page keeps meeting — what decides the count is the width of THIS
              column, which a viewport query cannot see. */}
          <Grid
            templateColumns="repeat(auto-fit, minmax(min(240px, 100%), 1fr))"
            gap={3}
          >
            <SectionLauncher
              Icon={LuReceipt}
              title="Payments"
              subtitle="Official receipts on record"
              count={paymentCount}
              onClick={() => setPopup("payments")}
            />
            <SectionLauncher
              Icon={LuUsers}
              title="Beneficiaries"
              subtitle="Declared on this plan"
              count={beneficiaryCount}
              onClick={() => setPopup("beneficiaries")}
            />
          </Grid>

          {/* Only for a person who holds another plan. The section hides itself
              when they do not — see `hasOtherPlans`, which is why that is asked
              out here too.

              Its own `mt` is cancelled: it carries one because on the profile
              page a wrapper's margin would survive as a phantom gap on the
              plans where it renders nothing. Here the card is already
              conditional, and the column's own gap does the spacing — left in,
              it would sit a step further from Beneficiaries than every other
              pair. */}
          {hasOtherPlans && (
            <SectionCard>
              <Box css={{ "& > div": { marginTop: 0 } }}>
                <PlanholderOtherPlans
                  personId={planholder.personId}
                  currentLpaNo={planholder.lpaNo}
                />
              </Box>
            </SectionCard>
          )}

          {/* PAYEE'S INFORMATION — the first of the claim-scoped sections, and
              ahead of the notes and the folder because it is the DECISION the
              other two are evidence for: who is paid, and how much. Everything
              above it belongs to the plan holder. */}
          <SectionCard>
            <ClaimPayees claim={claim} />
          </SectionCard>

          {/* THE CLAIM'S NOTES, above the folder it belongs with — the
              processor's own working notes on this claim, and the only thing in
              this column besides the folder that is WRITTEN rather than read.
              The two sit together for that reason.

              PER CLAIM, and that is the whole distinction from the Remarks card
              higher up: those are the PLAN's remarks and are the same whichever
              of a person's claims you picked. These are notes on the claim in
              front of you, read straight off the claim store by its request
              number, so writing one lands against this claim and no other.

              The store's `emit` is what refreshes it — the page subscribes with
              `useClaimStore`, so a note added here re-renders the panel and the
              new line is on screen without a refetch. */}
          <SectionCard>
            <PlanholderRemarks
              showRemarks={false}
              showSubtitles={false}
              asDialog
              notes={getClaimNotes(claim.reference).join("\n\n")}
              onAddNote={(text) => {
                addClaimNote(claim.reference, text);
                toast.success("Note added", {
                  description: claim.claimNo ?? claim.reference,
                });
              }}
            />
          </SectionCard>

          {/* THE FOLDER, LAST — what the claim is decided on, and the one
              section here that is written to rather than read.

              `withDeficiencies` is what makes it the CLAIM's folder rather than
              the profile's: two tabbed lists instead of one heading — what is on
              file, and what is still missing — with Add serving both. The
              profile page deliberately leaves that off, because a plan holder's
              folder is a record and a record has nothing to be deficient
              against; a claim does. See the prop's own note.

              KEYED ON THE CLAIM. The section holds its tab and its uploads in
              local state, and two claims of the same person would otherwise
              share them — a document added while looking at one would still be
              listed under the next, which is precisely the confusion a
              per-claim deficiency list exists to prevent.

              A HEIGHT, because the section reads the VIEWPORT to decide whether
              it is in a rail, and from `xl` it believes it is: it then lists
              every document rather than five and a "View all", expecting the
              bound a rail would have given it. In a card down a page there is
              no such bound, so a thick folder would run for screens. This is
              that bound, and the scroller the section already brought is what
              uses it. */}
          <SectionCard>
            <Box
              display={{ xl: "flex" }}
              flexDirection="column"
              maxH={{ xl: "420px" }}
              minH={{ xl: 0 }}
            >
              <PlanholderDocuments
                key={claim.reference}
                personId={planholder.personId}
                withDeficiencies
                asDialog
              />
            </Box>
          </SectionCard>

          {/* THE VERDICT, LAST — after the record it is made against, which is
              the order a decision is actually reached in. For Process only. */}
          {stage === "process" && <DecisionBar claim={claim} />}

          {/* THE TWO POP-UPS, both always in the tree with `open` driving
              them. Never `{popup === "payments" && <SectionPopup/>}`: a dialog
              mounted at the moment it opens has left this app with the page
              behind it unclickable, because the overlay is torn down on a frame
              the dialog no longer exists to clean up after.

              The sections are the SAME components the column renders — the
              pop-up is where they are shown, not what they are. And the width
              here is what the ledger wanted all along: room for its four
              columns to lay out as a table rather than fall back to rows. */}
          <SectionPopup
            title="Payments"
            open={popup === "payments"}
            onClose={() => setPopup(null)}
          >
            <PlanholderPayments lpaNo={planholder.lpaNo} />
          </SectionPopup>

          <SectionPopup
            title="Beneficiaries"
            open={popup === "beneficiaries"}
            onClose={() => setPopup(null)}
          >
            <PlanholderBeneficiaries lpaNo={planholder.lpaNo} />
          </SectionPopup>
        </>
      )}
    </Flex>
  );
}

export default ClaimDetailPanel;
