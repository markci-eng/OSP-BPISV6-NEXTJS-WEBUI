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
  LuBadgeCheck,
  LuEllipsis,
  LuEye,
  LuFilePlus,
  LuFileX,
  LuFolderOpen,
  LuPencil,
  LuPlus,
  LuPrinter,
  LuSend,
  LuTrash2,
  LuUser,
} from "react-icons/lu";
import { toast } from "sonner";
import { Card, useMessageDialog } from "osp-ui-kit";
import { TertiarySmButton } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { RowItem } from "@/components/info-card/row-item";
import ActionButtons, {
  type ActionButtonItem,
} from "@/components/primitives/ActionButtons";
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
import { DrawerPageHeader } from "./DrawerPageHeader";
import { PlanholderProfileHeader } from "./PlanholderProfileHeader";
import { PlanholderDetailsDrawer } from "./PlanholderDetailsDrawer";
import { SwipeToRemoveRow } from "./SwipeToRemoveRow";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { PlanholderRemarks } from "./PlanholderRemarks";
import { PlanholderPayeeDrawer } from "./PlanholderPayeeDrawer";
import {
  PlanholderPayeeAddDrawer,
  type PayeeFormValues,
} from "./PlanholderPayeeAddDrawer";
import { PlanholderClaimEditDrawer } from "./PlanholderClaimEditDrawer";

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

/** An entry in the "More" sheet, before its onClick is bound to the claim. */
type ClaimAction = Omit<
  Extract<ActionButtonItem, { type?: "action" }>,
  "onClick"
>;

/**
 * The most-used claim actions. They apply to the whole claim, not to any one
 * section, and appear twice: as the tile row at the top of the body, and as the
 * first entries in the "More" sheet. Print and Delete are not wired yet; the
 * rest are.
 */
const ENDORSE_ACTION = "Endorse";
const VERIFY_ACTION = "Verify";
const EDIT_ACTION = "Edit";

const PRIMARY_ACTIONS: ClaimAction[] = [
  { label: "Print", icon: LuPrinter, description: "Print this claim" },
  {
    label: EDIT_ACTION,
    icon: LuPencil,
    description: "Correct the claim's details",
  },
  {
    label: "Delete",
    icon: LuTrash2,
    description: "Remove this claim",
    iconBg: "#fdeaea",
    iconColor: "#c53030",
  },
  {
    label: VERIFY_ACTION,
    icon: LuBadgeCheck,
    description: "Mark the claim verified",
  },
  {
    label: ENDORSE_ACTION,
    icon: LuSend,
    description: "Send the claim onward",
  },
];

/**
 * The remaining legacy PISv5 toolbar actions. They don't earn a tile of their
 * own, so they only appear in the "More" sheet — the same ActionButtons /
 * BottomQuickActions pairing the sales agent profile uses. None are wired to a
 * back end yet, so each one says so rather than failing silently.
 */
const MORE_ACTIONS: ClaimAction[] = [
  { label: "Preview", icon: LuEye, description: "Open the claim as printed" },
  { label: "Reprint", icon: LuPrinter, description: "Print another copy" },
  // No "Notes" entry. It opened nothing this page does not already have: the
  // Notes section below writes a note from its own heading, which is the same
  // action arrived at by reading what is already on file first.
  {
    label: "Edit Nature of Claim",
    icon: LuPencil,
    description: "Change how this claim is classified",
  },
  {
    label: "Create QuitClaim",
    icon: LuFilePlus,
    description: "Draft the quit claim document",
  },
  {
    label: "Print QuitClaim",
    icon: LuPrinter,
    description: "Print the quit claim document",
  },
  {
    label: "Denial Letter",
    icon: LuFileX,
    description: "Issue a denial letter for this claim",
    iconBg: "#fdeaea",
    iconColor: "#c53030",
  },
];

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
function PayeeRow({
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
    const lastName = values.lastName.trim();
    const firstName = values.firstName.trim();
    // Guard the two fields the row is identified by; the rest can be filled in
    // later without leaving a blank row behind.
    if (!lastName || !firstName) {
      toast.error("First name and last name are required");
      return;
    }

    const middleName = values.middleName.trim();
    const suffix = values.suffix.trim();
    // Assembled the same way every other name in claims is, rather than
    // concatenating here.
    const name = toFullName({
      firstName,
      middleName: middleName || undefined,
      lastName,
      suffix: suffix || undefined,
    });

    const address =
      [
        [values.lotBldgUnit.trim(), values.street.trim()]
          .filter(Boolean)
          .join(" "),
        values.barangay.trim() ? `Brgy. ${values.barangay.trim()}` : "",
        values.district.trim(),
        values.city.trim(),
        values.province.trim(),
      ]
        .filter(Boolean)
        .join(", ") || "—";

    const payeeAmount = Number(values.amount) || 0;

    // A payee row shows one payout, so the first channel registered is the one
    // it is paid through — the same choice `toClaimPayees` makes when it picks
    // the active account off a person's list.
    const primary = payouts[0];

    setPayees((prev) => [
      {
        // No payee record on file for one added in-session, hence the index
        // past the end and the empty person id.
        idx: prev.length + 1,
        claimNo: claimNoOf(claim),
        personId: "",
        name,
        relation: values.relation || "—",
        amount: payeeAmount,
        amountDisplay:
          "₱" +
          payeeAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
        birthDate: values.birthDate ? formatFiledDate(values.birthDate) : "—",
        birthDateISO: values.birthDate,
        address,
        contact: "—",
        isOnHold: values.isOnHold,
        payout: primary
          ? `${primary.channelName} ${primary.accountNoMasked}`
          : "—",
        channelName: primary?.channelName ?? "—",
        channelCode: primary?.channelCode ?? "",
        accountNo: primary?.accountNo ?? "—",
        accountNoMasked: primary?.accountNoMasked ?? "—",
        payoutBranch: "—",
      },
      ...prev,
    ]);

    toast.success(`${name} added`, { description: claimNoOf(claim) });
    setAddPayeeOpen(false);
  };

  /* Page-style bar: "<" back, claim number over claim type. In the page view
     the same bar is the claim's own heading and the "<" returns to the profile.

     The "More" pill rides in the bar's tool slot on a PHONE, where that slot is
     the only place for it. In the page it is a button in the row with the
     rest — the actions are all in one place there, and a pill stranded at the
     far end of a heading is a long way from anything it acts on. */
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
        py={5}
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
              Untitled by design: the header already names the claim, so the
              fields just sit in a card (label · dotted leader · value rows). */}
          <Card.Root>
            <Card.MainContent>
              <RowItem label="Claim Status" value={claim.phase} />
              <RowItem label="Date Filed" value={claim.filedDisplay} />
              <RowItem
                label="Date Received"
                value={claim.dateReceivedDisplay}
              />
              <RowItem label="Date of Death" value={claim.dateOfDeathDisplay} />
              <RowItem
                label="Contestability"
                value={contestabilityLabel(claim) || undefined}
              />
              <RowItem label="Age at Death" value={claim.ageOfDeath} />
              <RowItem label="Req. Branch" value={claim.requestingBranch} />
              <RowItem label="BM" value={claim.processor.name} />
              <RowItem label="Nature of Claim" value={claim.natureOfClaim} />
              <RowItem label="Deficient" />
              <RowItem label="Audit User" value={claim.processor.name} />
              <RowItem label="Audit Date" value={claim.auditDateDisplay} />
              <RowItem label="Cause of Death" value={claim.causeOfIncident} />
              {/* Blank until the claim is verified / endorsed. */}
              <RowItem label="Verified By" value={claim.verifiedDisplay} />
              <RowItem label="Endorsed To" value={claim.endorsedTo} />
              <RowItem label="Endorsed By" value={claim.endorsedDisplay} />
            </Card.MainContent>
          </Card.Root>

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
      <Grid
        templateColumns={{
          base: "minmax(0, 1fr)",
          xl: "minmax(0, 1fr) 380px",
          "2xl": "minmax(0, 1fr) 420px",
        }}
        gap={6}
        // Each column as tall as its own content: the rail is a fraction of the
        // claim's height, and stretching it would only put a card's worth of
        // empty white beside it. It is also what lets the rail stick, since a
        // stretched item has nowhere to travel.
        alignItems="start"
      >
        <GridItem minW={0}>
          {header}
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
        >
          {/* The claim's actions, at the top of the rail — the same row of
              labelled buttons the profile puts above its own sections, and in
              the same place relative to the plan holder card.

              "More" is the sixth of them rather than a pill in the heading, so
              every way into an action on this claim is in one block. Three
              across, matching the plan's own row: six in a line would put
              "Endorse" in about fifty pixels. */}
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

                 It lists only what is NOT already a button: the five beside it
                 are right there, and repeating them would make the menu look
                 like the place actions live rather than the overflow. */
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

          {/* The same pair the create form puts in its rail: the profile card,
              then the details card that opens the full record. */}
          <Box mt={4}>
            <PlanholderProfileHeader planholder={planholder} />
            <PlanholderDetailsDrawer planholder={planholder} />
          </Box>
        </GridItem>
      </Grid>
      {sheets}
    </>
  );
}

export default PlanholderClaimDetail;
