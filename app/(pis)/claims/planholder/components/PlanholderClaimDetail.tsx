"use client";

// The claim request view — everything a processor reads and does on ONE claim.
//
// Rendered two ways, from the same component. On a phone it is the body of a
// full-height drawer over the profile ({@link PlanholderClaimRequestDrawer});
// on a desktop it takes the profile's main column while the plan holder moves
// to the rail beside it, which is the layout the death-claim create page
// already uses. The two used to be one drawer at every width — a side panel
// over a page that had the room to show the same thing properly.
//
// Nothing about the CONTENT differs between them. The only difference is the
// chrome around it, which the caller supplies.

import { useEffect, useState } from "react";
import {
  Box,
  CloseButton,
  Drawer,
  Flex,
  Grid,
  GridItem,
  Menu,
  Portal,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuEllipsis,
  LuFolderOpen,
  LuPlus,
  LuSend,
  LuUser,
} from "react-icons/lu";
import { toast } from "sonner";
import { useMessageDialog } from "osp-ui-kit";
import { TertiarySmButton } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { RowItem } from "@/components/info-card/row-item";
import ActionButtons, {
  type ActionButtonItem,
} from "@/components/primitives/ActionButtons";
import {
  EDIT_ACTION,
  ENDORSE_ACTION,
  MORE_CLAIM_ACTIONS,
  PRIMARY_CLAIM_ACTIONS,
  VERIFY_ACTION,
} from "../../components/claim-action-items";
import {
  addClaimNote,
  endorseClaim,
  ENDORSEMENT_TARGETS,
  verifyClaim,
  type EndorsementTarget,
} from "../../claim-store";
import {
  formatFiledDate,
  getClaimPayeesForRequest,
  toFullName,
  type BeneficiaryPayout,
  type ClaimPayee,
  type ClaimRequest,
  type Planholder,
} from "../../claims-data";
import {
  ActionButtonRow,
  ActionRowButton,
} from "../../components/action-button-row";
import { DetailCard } from "../../components/detail-card";
import { InfoLabel } from "../../components/info-label";
import { BackButton, DrawerPageHeader } from "./DrawerPageHeader";
import { PlanholderProfileHeader } from "./PlanholderProfileHeader";
import { PlanholderDetailsDrawer } from "./PlanholderDetailsDrawer";
import { PlanholderDocuments } from "./PlanholderDocuments";
import { SwipeToRemoveRow } from "./SwipeToRemoveRow";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { PlanholderRemarks } from "./PlanholderRemarks";
import { PlanholderPayeeDrawer } from "./PlanholderPayeeDrawer";
import {
  PlanholderPayeeAddDrawer,
  type PayeeFormValues,
} from "./PlanholderPayeeAddDrawer";
import { PlanholderClaimEditDrawer } from "./PlanholderClaimEditDrawer";
import { claimPayeeFromForm } from "./claim-payee-from-form";

const claimNoOf = (claim: ClaimRequest) => claim.claimNo ?? claim.reference;
const claimTypeOf = (claim: ClaimRequest) => claim.benefit ?? claim.kind ?? "—";
const contestabilityLabel = (claim: ClaimRequest) =>
  claim.contestability
    ? claim.contestability === "within"
      ? "Within"
      : "Over"
    : "";

/**
 * Computation figures show a dash until a processor has worked the claim out,
 * so an un-opened claim reads as "not computed yet" rather than a real zero.
 */
const amount = (value?: number) =>
  value === undefined
    ? undefined
    : value.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const rate = (value?: number) =>
  value === undefined ? undefined : `${value.toFixed(2)}%`;

/**
 * The claim's own facts, in the order they are read.
 *
 * One list rather than fixed rows: the grid is four across at `xl`, and sixteen
 * facts fall into four full rows there, each of which happens to be a question
 * about the claim answered across the card —
 *
 *   1. What is this claim?      no · benefit · status · nature
 *   2. What happened?           date of death · age at death · contestability ·
 *                               deficient
 *   3. And then?                cause of death · interment date · filed ·
 *                               received
 *   4. Who handled it?          branch · branch manager · audit user · date
 *
 * — but the ORDER is what is fixed here, not the rows. Narrower, the same list
 * reflows into two or three columns and the reading order survives, which is
 * what it is for; and a field added or dropped shifts what follows it rather
 * than leaving a hole to be padded out.
 *
 * Verified By, Endorsed To and Endorsed By are NOT here. Verifying or endorsing
 * a claim writes a line into its Remarks — with who, and when — and that trail
 * is the record. Three fields repeating the last of it, blank on every claim
 * nobody has touched yet, were three empty cells on most claims and a worse
 * version of the section directly below on the rest.
 *
 * In the PAGE, Claim No and Benefit lead. They used to be the heading above the
 * whole view; the page leads with the plan holder now, and a number and a
 * benefit are two facts about the claim like the rest. The DRAWER still has that
 * heading, so it leaves them out rather than saying the same two things twice a
 * centimetre apart.
 */
const detailItems = (
  claim: ClaimRequest,
  /** Whether the claim's number and benefit are among them — see above. */
  withIdentity: boolean,
): { label: string; value?: string }[] => [
  ...(withIdentity
    ? [
        { label: "Claim No", value: claimNoOf(claim) },
        { label: "Benefit", value: claimTypeOf(claim) },
      ]
    : []),
  // "Status", not "Claim Status": every field in this card is the claim's, and
  // the two beside it have just said so.
  { label: "Status", value: claim.phase },
  { label: "Nature of Claim", value: claim.natureOfClaim },

  { label: "Date of Death", value: claim.dateOfDeathDisplay },
  { label: "Age at Death", value: claim.ageOfDeath },
  { label: "Contestability", value: contestabilityLabel(claim) || undefined },
  // Nothing records this yet — see `isDeficient` on the request.
  { label: "Deficient" },

  { label: "Cause of Death", value: claim.causeOfIncident },
  // Nor this — see `intermentDateDisplay` on the request.
  { label: "Interment Date", value: claim.intermentDateDisplay },
  { label: "Date Filed", value: claim.filedDisplay },
  { label: "Date Received", value: claim.dateReceivedDisplay },

  { label: "Req. Branch", value: claim.requestingBranch },
  // Spelled out. "BM" is what the legacy screen called it, and it is two
  // letters standing where every other label on the card is a phrase.
  { label: "Branch Manager", value: claim.processor.name },
  { label: "Audit User", value: claim.processor.name },
  { label: "Audit Date", value: claim.auditDateDisplay },
];

// The action LISTS live in `claim-action-items` now — see that file for why.
// This screen keeps what is its own: what each one does when pressed.
const PRIMARY_ACTIONS = PRIMARY_CLAIM_ACTIONS;
const MORE_ACTIONS = MORE_CLAIM_ACTIONS;

/**
 * A whole-claim action, styled like the benefit tiles in the death claim
 * create form — bordered card, icon over label.
 */
function ActionTile({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const accent = BRAND_COLORS.primaryGreen;
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={1}
      py={{ base: 2, md: 3 }}
      minH={{ base: "62px", md: "74px" }}
      cursor="pointer"
      transition="all 0.15s ease"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={1.5}
      _hover={{
        borderColor: accent,
        bg: "#f4faf6",
      }}
    >
      <Box color={accent}>
        <Icon size={18} />
      </Box>
      <Text
        fontSize={{ base: "10px", md: "xs" }}
        fontWeight="700"
        lineHeight="1"
        color="gray.800"
        truncate
      >
        {label}
      </Text>
    </Box>
  );
}

/** A computation line: label on the left, right-aligned value. */
function CompRow({
  label,
  value,
  indent,
  emphasize,
}: {
  label: string;
  value?: string;
  indent?: boolean;
  emphasize?: boolean;
}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      gap={3}
      py="5px"
      borderBottomWidth="1px"
      borderColor="gray.100"
    >
      <Text fontSize="sm" color="gray.600" pl={indent ? 4 : 0}>
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight={emphasize ? "bold" : "medium"}
        color={value ? "gray.800" : "gray.300"}
      >
        {value || "—"}
      </Text>
    </Flex>
  );
}

/**
 * A single payee — compact clickable card matching the plan holder's document
 * rows (rounded-icon · name · muted subtitle · right-aligned value). Tapping it
 * opens the payee detail drawer.
 *
 * Swiping the row left reveals the remove action — see {@link SwipeToRemoveRow},
 * which owns the gesture for every list in this area.
 */
export function PayeeRow({
  payee,
  onClick,
  onRequestRemove,
}: {
  payee: ClaimPayee;
  onClick?: () => void;
  /** Resolves true once the payee has actually been removed. */
  onRequestRemove: () => Promise<boolean>;
}) {
  return (
    <SwipeToRemoveRow onClick={onClick} onRequestRemove={onRequestRemove}>
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" gap={3} minW={0}>
          <Box
            p={2}
            borderRadius="lg"
            bg="#eaf5ee"
            color={BRAND_COLORS.darkGreen}
            flexShrink={0}
          >
            <LuUser size={16} />
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
              {payee.name}
            </Text>
            <Text fontSize="11px" color="gray.500" truncate>
              {payee.relation}
            </Text>
          </Box>
        </Flex>
        <Text
          fontSize="sm"
          fontWeight="600"
          color="gray.800"
          flexShrink={0}
          whiteSpace="nowrap"
        >
          {payee.amountDisplay}
        </Text>
      </Flex>
    </SwipeToRemoveRow>
  );
}

/**
 * One endorsement destination — where the claim goes next, and who normally
 * sends it there. Every option is offered to everyone: which one applies
 * depends on the signed-in user's role, and roles are not wired in yet.
 */
function EndorseOption({
  label,
  description,
  onClick,
}: {
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={3}
      py="10px"
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: BRAND_COLORS.primaryGreen, bg: "#f4faf6" }}
    >
      <Flex align="center" gap={3}>
        <Box
          p={2}
          borderRadius="lg"
          bg="#eaf5ee"
          color={BRAND_COLORS.darkGreen}
          flexShrink={0}
        >
          <LuSend size={16} />
        </Box>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="600" color="gray.800">
            {label}
          </Text>
          <Text fontSize="11px" color="gray.500">
            {description}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

/* ------------------------------ the view ------------------------------ */

interface PlanholderClaimDetailProps {
  /** The claim being viewed. */
  claim: ClaimRequest;
  /** Leave the claim — closes the drawer, or returns the page to the profile. */
  onBack: () => void;
  /**
   * Rendered in the PAGE rather than inside a drawer — two columns, the claim
   * in the main one and the plan holder in the rail beside it.
   *
   * The header stops rendering `Drawer.Title` (which throws outside a
   * `Drawer.Root`), and the body stops being a scroll box of its own — the page
   * it now belongs to already scrolls.
   */
  asPage?: boolean;
  /**
   * The plan holder the claim was filed against. Required by the page layout,
   * which shows them in the rail; the drawer opens over their profile and does
   * not repeat it.
   */
  planholder?: Planholder;
}

/**
 * A single claim request, read and acted on. Reproduces the legacy PISv5
 * "Death Claim" layout — Claim Details, a Computation/Explanation block and the
 * Payee's Information table — as read-only detail, with the whole-claim actions
 * above it. Fields not yet in our data model show a dash.
 */
export function PlanholderClaimDetail({
  claim,
  onBack,
  asPage = false,
  planholder,
}: PlanholderClaimDetailProps) {
  const { messageBox } = useMessageDialog();

  // The endorse sheet — pick where the claim goes next.
  const [endorseOpen, setEndorseOpen] = useState(false);

  // The edit sheet — correct the claim's details.
  const [editOpen, setEditOpen] = useState(false);


  const handleEndorse = (target: EndorsementTarget) => {
    endorseClaim(claim.reference, target);
    setEndorseOpen(false);
    toast.success(`Endorsed to ${target}`, {
      description: `${claimNoOf(claim)} — recorded in the claim's remarks.`,
    });
  };

  const handleVerify = () => {
    // Already verified: say so rather than writing a second identical remark.
    if (claim.isVerified) {
      toast.info("Already verified", {
        description: `${claimNoOf(claim)} was verified by ${claim.verifiedDisplay}.`,
      });
      return;
    }
    verifyClaim(claim.reference);
    toast.success("Claim verified", {
      description: `${claimNoOf(claim)} — recorded in the claim's remarks.`,
    });
  };

  /** Write a note against this claim; it lands in the Notes section. */
  const handleAddNote = (text: string) => {
    addClaimNote(claim.reference, text);
    toast.success("Note added", { description: claimNoOf(claim) });
  };

  /** Everything else still waits on a back end — say so rather than no-op. */
  const notWired = (label: string) =>
    toast.info(`${label} is not available yet`, {
      description: claimNoOf(claim),
    });

  /** Run a claim action by name. Print/Delete are not wired. */
  const runAction = (label: string) => {
    if (label === ENDORSE_ACTION) setEndorseOpen(true);
    else if (label === EDIT_ACTION) setEditOpen(true);
    else if (label === VERIFY_ACTION) handleVerify();
    else notWired(label);
  };

  // The "More" sheet lists every claim action — the five with a button of their
  // own first, then the legacy toolbar rest — so the sheet stands on its own.
  const moreActions: ActionButtonItem[] = [
    ...PRIMARY_ACTIONS,
    ...MORE_ACTIONS,
  ].map((action) => ({ ...action, onClick: () => runAction(action.label) }));


  // The payee currently open in the detail drawer.
  const [selectedPayee, setSelectedPayee] = useState<ClaimPayee | null>(null);

  // The Add Payee sheet.
  const [addPayeeOpen, setAddPayeeOpen] = useState(false);

  // Payees named on this claim, joined to each person's contact details. The
  // payee is filed with the request, so there is one even before processing.
  //
  // Held in state, the same way the Beneficiaries section holds its list: there
  // is no write path to the data layer yet, so an added payee lives here until
  // the page reloads and the seed comes back.
  //
  // Keyed on the REFERENCE rather than the claim object: in the page view the
  // claim is looked up fresh on every store write, so a new object arrives
  // whenever a remark is added — and refetching the payees on that would throw
  // away one just added by hand.
  const [payees, setPayees] = useState<ClaimPayee[]>([]);
  useEffect(() => {
    setPayees(getClaimPayeesForRequest(claim.reference));
  }, [claim.reference]);

  /**
   * Confirm, then drop the payee from the claim. Resolves whether it was
   * actually removed, which is what holds a swiped row open while the
   * confirmation is up.
   *
   * Matched on `idx` + `personId`, the pair the row is keyed by: a payee has no
   * id of its own, and one record naming two people flattens into two entries
   * sharing an `idx`.
   */
  const handleRemovePayee = async (payee: ClaimPayee): Promise<boolean> => {
    const confirmed = await messageBox({
      title: "REMOVE PAYEE",
      message: `Remove ${payee.name} from this claim's payees?`,
      confirmText: "Remove",
      variant: "confirmation",
    });
    if (!confirmed) return false;

    setPayees((prev) =>
      prev.filter(
        (p) => !(p.idx === payee.idx && p.personId === payee.personId),
      ),
    );
    // Removing the one open in the detail closes it with them.
    if (
      selectedPayee?.idx === payee.idx &&
      selectedPayee?.personId === payee.personId
    ) {
      setSelectedPayee(null);
    }
    toast.success(`${payee.name} removed`, { description: claimNoOf(claim) });
    return true;
  };

  /** Save the Add Payee sheet — always an add; edits go through the detail. */
  const handleAddPayee = (
    values: PayeeFormValues,
    payouts: BeneficiaryPayout[],
  ) => {
    // The row itself is built by a shared helper, so this page and
    // `/claims/death-claim` name a payee identically. See
    // `claimPayeeFromForm` — `undefined` means the name was blank.
    const payee = claimPayeeFromForm({
      values,
      payouts,
      claimNo: claimNoOf(claim),
      existingCount: payees.length,
    });
    if (!payee) {
      toast.error("First name and last name are required");
      return;
    }

    setPayees((prev) => [payee, ...prev]);
    toast.success(`${payee.name} added`, { description: claimNoOf(claim) });
    setAddPayeeOpen(false);
  };

  /* Page-style bar: "<" back, claim number over claim type, "More" in the tool
     slot. The DRAWER's, now — the page leads with the plan holder instead and
     carries the claim's number and benefit in the details card below it.

     `asPage` is still passed because the drawer branch is also what an `asPage`
     caller falls back to when it hands over no plan holder, and `Drawer.Title`
     outside a `Drawer.Root` throws. */
  const header = (
    <DrawerPageHeader
      title={claimNoOf(claim)}
      description={claimTypeOf(claim)}
      onBack={onBack}
      asPage={asPage}
      toolContent={
        asPage ? undefined : (
          <ActionButtons
            buttons={moreActions}
            title="Claim Actions"
            subtitle={claimNoOf(claim)}
          />
        )
      }
    />
  );

  const body = (
    <>
      {/* In a drawer this is the scroller, and the bar above it stays put: the
          drawer's content is a flex column, so the body takes what is left of
          it and moves under the header. The page view scrolls as a PAGE, so
          there it is a plain box and only the padding it brings is its own. */}
      <Box
        // No top padding in the page: the gap above is the plan holder card's,
        // and only the drawer needs its own clearance under the bar.
        pt={asPage ? 0 : 5}
        pb={5}
        px={asPage ? 0 : { base: 4, md: 6 }}
        flex={asPage ? undefined : "1 1 auto"}
        minH={asPage ? undefined : 0}
        overflowY={asPage ? undefined : "auto"}
      >
        <VStack align="stretch" gap={6}>
          {/* Whole-claim actions — above the first section title, since they
              act on the claim, not on one section.

              Drawer only. In the page they move to the top of the rail, over
              the plan holder card, where the plan's own actions sit on the
              profile — one place on a desktop where the actions for whatever is
              open are found. */}
          {!asPage && (
            <SimpleGrid columns={5} gap={{ base: 2, md: 3 }}>
              {PRIMARY_ACTIONS.map(({ label, icon }) => (
                <ActionTile
                  key={label}
                  label={label}
                  icon={icon}
                  onClick={() => runAction(label)}
                />
              ))}
            </SimpleGrid>
          )}

          {/* ───────────────── Claim Details ─────────────────
              Untitled by design: this is what the claim IS, and the card is the
              first thing under the plan holder it was filed against.

              Two layouts of the same facts, and the caller picks — which is why
              neither is written to change size on its own.

              In the PAGE, stacked label-over-value pairs flowing across four
              columns in {@link detailItems}' order: a dotted leader is the wrong
              shape once the card is a full column wide, stretching half a foot
              of empty rule between a label and its value a dozen times over.

              In the DRAWER they are those leader rows after all — a phone's
              width holds nothing else.

              {@link InfoLabel} and not the kit's `InfoItem`, {@link DetailCard}
              and not the kit's `Card`: same shapes, set for this card. See each
              for why. */}
          <DetailCard>
            {asPage ? (
              <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gapX={4} gapY={3}>
                {detailItems(claim, true).map(({ label, value }) => (
                  <InfoLabel key={label} label={label} value={value} />
                ))}
              </SimpleGrid>
            ) : (
              detailItems(claim, false).map(({ label, value }) => (
                <RowItem key={label} label={label} value={value} />
              ))
            )}
          </DetailCard>

          {/* ─────────────── Remarks · Notes ───────────────
              Per-claim remarks and notes, one section each. Endorsing the claim
              writes a line into Remarks, so that section doubles as the
              hand-off trail; Notes is written by hand from its own heading. */}
          <PlanholderRemarks
            remarks={claim.remarks}
            notes={claim.notes}
            onAddNote={handleAddNote}
          />

          {/* ─────────────── Computation/Explanation ─────────────── */}
          <Box>
            <PlanholderSectionHeader title="Computation/Explanation" />
            <VStack align="stretch" gap={0}>
              <CompRow
                label="Plan Value"
                value={amount(claim.computation?.planValue)}
              />
              <CompRow
                label="Percent Rate"
                value={rate(claim.computation?.percentRate)}
              />
              <CompRow label="Gross" value={amount(claim.computation?.gross)} />
              <Text fontSize="sm" color="gray.500" py="5px">
                Less:
              </Text>
              <CompRow
                label="Processing Fee"
                value={amount(claim.computation?.processingFee)}
                indent
              />
              <CompRow
                label="Others"
                value={amount(claim.computation?.others)}
                indent
              />
              <CompRow
                label="Net Proceeds"
                value={amount(claim.computation?.netProceeds)}
                emphasize
              />
            </VStack>
          </Box>

          {/* ─────────────── Payee's Information ─────────────── */}
          <Box>
            <PlanholderSectionHeader
              title="Payee's Information"
              action={
                <TertiarySmButton onClick={() => setAddPayeeOpen(true)}>
                  <LuPlus /> Add Payee
                </TertiarySmButton>
              }
            />

            <Box>
              {payees.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  textAlign="center"
                  py={10}
                  gap={3}
                >
                  <Box
                    p={4}
                    borderRadius="full"
                    bg="gray.100"
                    color="gray.500"
                  >
                    <LuFolderOpen size={24} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      No payees yet
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1} maxW="280px">
                      Payees named on this claim will appear here.
                    </Text>
                  </Box>
                </Flex>
              ) : (
                <VStack align="stretch" gap={2}>
                  {payees.map((payee) => (
                    <PayeeRow
                      key={`${payee.idx}-${payee.personId}`}
                      payee={payee}
                      onClick={() => setSelectedPayee(payee)}
                      onRequestRemove={() => handleRemovePayee(payee)}
                    />
                  ))}
                </VStack>
              )}
            </Box>
          </Box>
        </VStack>
      </Box>
    </>
  );

  /* Every sheet the actions open. Rendered once, outside the layout, so the
     page and the drawer get the same set from the same state. */
  const sheets = (
    <>

      {/* Endorse — pick where the claim goes next. */}
      <Drawer.Root
        open={endorseOpen}
        onOpenChange={(e) => setEndorseOpen(e.open)}
        placement="bottom"
      >
        <Portal>
          <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
          <Drawer.Positioner>
            <Drawer.Content
              roundedTop="2xl"
              maxH="70vh"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <Box pt={3} pb={1} display="flex" justifyContent="center">
                <Box
                  w="36px"
                  h="4px"
                  bg="gray.300"
                  borderRadius="full"
                  opacity={0.7}
                />
              </Box>
              <Drawer.Header
                pt={2}
                pb={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box minW={0}>
                  <Drawer.Title>
                    <Text fontWeight="bold" color={BRAND_COLORS.darkGreen}>
                      Endorse Claim
                    </Text>
                  </Drawer.Title>
                  <Text fontSize="xs" color="gray.500" truncate>
                    {claimNoOf(claim)}
                  </Text>
                </Box>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body pb={6} pt={3} overflowY="auto">
                <VStack align="stretch" gap={2}>
                  {ENDORSEMENT_TARGETS.map((option) => (
                    <EndorseOption
                      key={option.target}
                      label={option.label}
                      description={option.description}
                      onClick={() => handleEndorse(option.target)}
                    />
                  ))}
                </VStack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      {/* Edit — correct the claim's details. */}
      <PlanholderClaimEditDrawer
        claim={claim}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      {/* Payee detail — a child drawer sharing this view's chrome. */}
      <PlanholderPayeeDrawer
        payee={selectedPayee}
        open={selectedPayee !== null}
        onClose={() => setSelectedPayee(null)}
      />

      {/* Add Payee — the same form the Add Beneficiary sheet uses. */}
      <PlanholderPayeeAddDrawer
        open={addPayeeOpen}
        onClose={() => setAddPayeeOpen(false)}
        claimNo={claimNoOf(claim)}
        onSave={handleAddPayee}
      />
    </>
  );

  if (!asPage || !planholder) {
    // The drawer: one column, the bar above its own scrolling body.
    return (
      <>
        {header}
        {body}
        {sheets}
      </>
    );
  }

  return (
    <>
      {/* The claim IS the page while it is open — the profile page drops its own
          title from its side, so this starts at the top of the content area and
          the sections below stand on the page directly.

          Not on a surface of their own. A panel around both columns turns every
          card inside it into a card on a card, and the two columns into the
          contents of one box rather than the page's own layout. What makes this
          read as a view laid over the profile is that it has replaced it and
          carries the way back at the top — not a border drawn around it. */}
      <Grid
        templateColumns={{
          base: "minmax(0, 1fr)",
          xl: "minmax(0, 1fr) 380px",
          "2xl": "minmax(0, 1fr) 420px",
        }}
        gap={6}
        // The clearance the page's own heading block used to leave under the
        // app header. With the heading hidden, both columns would otherwise
        // start on the header's bottom edge.
        pt="10px"
        // Each column as tall as its own content: the rail is a fraction of the
        // claim's height, and stretching it would only put a card's worth of
        // empty white beside it. It is also what lets the rail stick, since a
        // stretched item has nowhere to travel.
        alignItems="start"
      >
        <GridItem minW={0}>
          {/* Who the claim is about, at the top of the READING column.

              In this column and not across both: the rail is the column of
              things to reach for — the actions, the way into the full record —
              and a card the width of the page above it would push all of that a
              card's height down before any of it could be seen. The plan holder
              belongs with what is read, which is this column, at the top of it,
              above the claim filed against them. */}
          <Box pb={5}>
            <PlanholderProfileHeader planholder={planholder} />
          </Box>

          {body}
        </GridItem>

        <GridItem
          minW={0}
          // Follows the scroll. The claim is long and every line of it is about
          // this person — and the actions apply to the whole claim, not to
          // whatever part of it happens to be on screen, so both are worth more
          // beside it than above it.
          position="sticky"
          top="8px"
          // A flex COLUMN with a ceiling, the same shape the profile's rail
          // has, and for the same reason: the folder at the bottom of it holds
          // as many documents as the person has, and a pinned column taller
          // than the screen puts its own foot somewhere it can never be
          // scrolled to. One screenful is the budget — the app header takes
          // 64px above the scrollport and this sits 8px into it — and the
          // sections divide it between them. Only the folder gives ground: it
          // is the one with a list to scroll inside its share.
          //
          // The column itself NEVER scrolls. A pinned column that scrolls is a
          // second scrollbar next to the page's own, and the reader has to work
          // out which one their wheel is over; worse, the column's height then
          // moves with its content, so a tab with more rows in it makes the
          // whole rail taller. Height is the screen's, the folder takes what is
          // left of it, and the only thing that scrolls is the list inside the
          // folder. `hidden` is what holds that: the 4px the list box bleeds
          // sideways for a row's hover shadow is clipped here, and a box that
          // scrolls on one axis may not leave the other `visible` anyway — CSS
          // promotes it to `auto`, which was a horizontal scrollbar over four
          // pixels of shadow.
          display="flex"
          flexDirection="column"
          maxH="calc(100vh - 88px)"
          overflow="hidden"
          // The clip needs somewhere to land that is not on the cards. A card's
          // edge here IS a shadow — the summary card draws no border at all —
          // and a shadow paints OUTSIDE the box it belongs to, so a column
          // clipped flush to its content cuts every edge off level with the
          // card and leaves it looking like a rectangle of white. Four pixels
          // of padding is the room those edges need; the negative margin hands
          // it straight back to the gutter, so the cards stay the width they
          // were and stay level with the column beside them.
          //
          // It also catches the folder's list box, which bleeds the same 4px
          // sideways for a row's hover shadow — that used to be clipped too.
          px="4px"
          mx="-4px"
          pb="4px"
        >
          {/* The way back, at the top of the rail — above the actions rather
              than above the plan holder card opposite.

              It sits in the STICKY column on purpose: leaving a claim is worth
              reaching from anywhere in it, and in the reading column the link
              scrolled away with the first card and left a long claim with no
              way out but the browser's own back. Here it travels with the
              actions, which are already pinned for the same reason — they apply
              to the whole claim, not to the part of it on screen.

              Against the column's RIGHT edge, with the arrow after the words —
              the rail is read right-aligned at that edge (the "More" button
              ends there, and every value in the card below it is set to it),
              and a control tucked into the left corner of it starts a second
              edge for one line. Negative margin so the arrow's own padding does
              not inset it: the chevron ends level with the buttons below. */}
          <Flex justify="flex-end" mr="-4px" mb={2} flexShrink={0}>
            <BackButton
              onBack={onBack}
              label="Back to the plan holder"
              iconPlacement="end"
            >
              Back to profile
            </BackButton>
          </Flex>

          {/* The claim's actions, at the top of the rail — the same row of
              labelled buttons the profile puts above its own sections, and in
              the same place relative to the plan holder card.

              "More" is the sixth of them rather than a pill in the heading, so
              every way into an action on this claim is in one block. Three
              across, matching the plan's own row: six in a line would put
              "Endorse" in about fifty pixels.

              Wrapped so the row keeps its own height in the flex column: a row
              of buttons costs what it costs, and what is left over is what the
              folder below scrolls inside. */}
          <Box flexShrink={0}>
            <ActionButtonRow
              columns={3}
              actions={PRIMARY_ACTIONS.map(({ label, icon }) => ({
                label,
                icon,
                onClick: () => runAction(label),
              }))}
              after={
                /* A DROPDOWN, not the phone's bottom sheet. A sheet slides up
                   from the bottom of the window and takes it over — right for a
                   thumb, and far from a button sitting in a rail two thirds up
                   the screen with a pointer already on it. The menu opens where
                   the button is.

                   It lists only what is NOT already a button: the five beside
                   it are right there, and repeating them would make the menu
                   look like the place actions live rather than the overflow. */
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <ActionRowButton label="More" icon={LuEllipsis} />
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content minW="248px">
                        {MORE_ACTIONS.map(
                          ({ label, icon: Icon, description, iconColor }) => (
                            <Menu.Item
                              key={label}
                              value={label}
                              onClick={() => runAction(label)}
                              py={2}
                            >
                              <Flex align="center" gap={2.5} minW={0}>
                                <Box
                                  color={iconColor ?? BRAND_COLORS.darkGreen}
                                  flexShrink={0}
                                >
                                  <Icon size={15} />
                                </Box>
                                <Box minW={0}>
                                  <Text
                                    fontSize="sm"
                                    fontWeight="500"
                                    color="gray.800"
                                  >
                                    {label}
                                  </Text>
                                  {description && (
                                    <Text fontSize="11px" color="gray.500">
                                      {description}
                                    </Text>
                                  )}
                                </Box>
                              </Flex>
                            </Menu.Item>
                          ),
                        )}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              }
            />
          </Box>

          {/* The plan holder's RECORD — the card that opens their full details.
              The profile card that used to head this pair is at the top of the
              page now, so what is left in the rail is the way into everything
              the top card does not show. */}
          <Box flexShrink={0}>
            {/* Pairs, not leader rows — this view is a desktop's, and the ten
                facts come to five rows instead of ten. What that saves is the
                folder's, directly below. See the prop. */}
            <PlanholderDetailsDrawer planholder={planholder} summaryAsPairs />
          </Box>

          {/* The folder, under the summary — the same section the profile keeps
              at the foot of its own rail, on the same person, so a document is
              opened from the same place whether the claim is being read or the
              profile is.

              It is here rather than in the reading column because a claim is
              DECIDED on its documents: a processor checks the death certificate
              against the date of death on the card opposite, and a folder two
              screens down the claim is a scroll away from the thing it is being
              read against.

              `0 1 auto` — shrink, never grow. The height it asks for is its
              content's; the rail only ever takes height away, and what is taken
              becomes a scroll inside the list rather than a heading pushed off
              the bottom. `minH: 0` is what lets a flex item shrink below its
              content at all. */}
          <Box
            mt={4}
            display="flex"
            flexDirection="column"
            flex="0 1 auto"
            // `minH: 0` — no floor. The section's height is whatever the screen
            // has left after the three above it, measured on every resize, and
            // its list scrolls inside that. A floor here would be the section
            // refusing the height it was given, which the column can only
            // answer by growing past the screen and scrolling — the two things
            // the rail is shaped not to do.
            minH={0}
            // The rail's last section: the space below it is the gap to the
            // bottom of the screenful, not to another section.
            pb={1}
          >
            {/* Two lists here, not one: a claim is held up by what is MISSING
                as often as it is decided by what is filed, and the deficiency
                tab is that question asked of the same folder. On the profile
                the section stays a plain list — see the prop. */}
            <PlanholderDocuments
              personId={planholder.personId}
              withDeficiencies
            />
          </Box>
        </GridItem>
      </Grid>
      {sheets}
    </>
  );
}

export default PlanholderClaimDetail;
