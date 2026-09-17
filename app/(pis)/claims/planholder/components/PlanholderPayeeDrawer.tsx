"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Drawer,
  Flex,
  Grid,
  IconButton,
  Portal,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  LuBadgeCheck,
  LuCheck,
  LuEye,
  LuEyeOff,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
// THE KIT, AND ONLY THE KIT. These four came from `st-peter-ui`, which the kit
// replaced — see the note in CLAUDE.md. Same names, same components; the old
// package is a transitive dependency now and nothing here should import it.
import {
  BottomQuickActions,
  PrimaryMdButton,
  PrimarySmButton,
  SecondaryMdButton,
  SecondarySmButton,
  TertiarySmButton,
  useMessageDialog,
} from "osp-ui-kit";
import { SectionTitle } from "../../components/section-title";
import { ClaimsToaster, toaster } from "../../components/toaster";
import { type ClaimPayee } from "../../claims-data";
import { DrawerPageHeader } from "./DrawerPageHeader";
import { PlanholderPayeeEditDrawer } from "./PlanholderPayeeEditDrawer";
import { DIALOG_SHEET_CSS } from "./dialog-sheet";

/** Display name for the fallback "check" payout channel (seed code 104). */
const CHECK_CHANNEL_NAME = "CHECK";

type Verification = "valid" | "invalid" | null;

/**
 * A labelled fact, as a row.
 *
 * NO DOTTED LEADER, and that is the whole difference from the shared
 * {@link RowItem} this replaced. A leader is a device for a printed contents
 * page, where the gap between a chapter and its page number is the only thing
 * joining them. Here the pair is already adjacent, and in an 840px dialog the
 * leader made the eye cross the entire sheet to join a label to its value — or,
 * on the three fields most payees leave blank, to cross it and arrive at an em
 * dash. A hairline UNDER the row separates one fact from the next, which is the
 * job that actually needed doing.
 *
 * `RowItem` itself is untouched: it belongs to the shared component library and
 * several other screens read the way they do because of it.
 */
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Flex
      align="baseline"
      justify="space-between"
      gap={4}
      py={2}
      fontSize="sm"
      borderBottomWidth="1px"
      borderColor="gray.100"
      _last={{ borderBottomWidth: 0 }}
    >
      <Text color="gray.500" whiteSpace="nowrap" flexShrink={0}>
        {label}
      </Text>
      <Flex align="center" gap={1.5} minW={0} justify="flex-end">
        {children}
      </Flex>
    </Flex>
  );
}

/** The plain case: a row whose value is a string. */
function DetailValue({ children }: { children: React.ReactNode }) {
  return (
    <Text fontWeight="600" textAlign="right" css={{ overflowWrap: "anywhere" }}>
      {children}
    </Text>
  );
}

/**
 * A state worn by the payee — its relation, whether it is on hold, whether
 * anyone has checked it.
 *
 * CHIPS AND NOT ROWS, because these are not facts you look up: they are things
 * that change what you do next, and they belong where the eye lands first. "On
 * Hold: NO" as the fifth row of eight was a fact filed away; "On hold" as an
 * amber chip beside the name is a fact that stops you.
 */
function StateChip({
  tone,
  children,
}: {
  tone: "neutral" | "ok" | "warn" | "bad";
  children: React.ReactNode;
}) {
  const palette = {
    neutral: { bg: "gray.100", color: "gray.700" },
    ok: { bg: BRAND_COLORS.successBg, color: BRAND_COLORS.darkGreen },
    warn: { bg: BRAND_COLORS.warningBg, color: BRAND_COLORS.warningText },
    bad: { bg: BRAND_COLORS.errorBg, color: BRAND_COLORS.destructiveRed },
  }[tone];

  return (
    <Box
      px={2}
      py="2px"
      borderRadius="full"
      fontSize="11px"
      fontWeight="700"
      whiteSpace="nowrap"
      {...palette}
    >
      {children}
    </Box>
  );
}

interface PlanholderPayeeDrawerProps {
  /** The payee being viewed. `null`/`undefined` keeps the drawer closed. */
  payee?: ClaimPayee | null;
  open: boolean;
  onClose: () => void;
  /**
   * Show this as a CENTRED DIALOG rather than a full-height sheet.
   *
   * Same content, different presentation — see the twin prop on
   * `PlanholderPayeeAddDrawer`. The drawer is right where this stacks over the
   * claim detail sheet; the dialog is right on `/claims/death-claim`, where
   * the payee list is one section of a column and its detail should arrive the
   * way that page's other look-ups do.
   */
  asDialog?: boolean;
}

/**
 * Payee detail drawer — a child of the claim request drawer. Headed by the
 * shared {@link DrawerPageHeader}, the same page-style bar the parent carries,
 * so the two read as one flow. The title is fixed ("Payee's Details"); the
 * description carries the owning claim's number.
 */
export function PlanholderPayeeDrawer({
  payee,
  open,
  onClose,
  asDialog = false,
}: PlanholderPayeeDrawerProps) {
  // Account number is masked until the reviewer chooses to reveal it.
  const [showAccountNo, setShowAccountNo] = useState(false);

  // The edit form drawer, slid up over this one when "Edit" is tapped.
  const [editOpen, setEditOpen] = useState(false);

  // Verify flow: the Valid/Invalid picker, then the committed result. When
  // "invalid", the payout falls back to a check and the account is withheld.
  const [verifyChoiceOpen, setVerifyChoiceOpen] = useState(false);
  const [verification, setVerification] = useState<Verification>(null);

  // Editable remarks — a draft plus the saved baseline. The draft only exists
  // while the remarks sheet is up; the section itself shows the baseline.
  const [remarksOpen, setRemarksOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [savedRemarks, setSavedRemarks] = useState("");

  const { messageBox } = useMessageDialog();

  // Re-mask / re-collapse / clear verification / reset remarks whenever the
  // drawer closes or a different payee opens.
  useEffect(() => {
    setShowAccountNo(false);
    setVerification(null);
    setVerifyChoiceOpen(false);
    setRemarksOpen(false);
    const initial = payee?.remarks ?? "";
    setRemarks(initial);
    setSavedRemarks(initial);
  }, [payee, open]);

  const remarksDirty = remarks !== savedRemarks;

  /** Open the remarks sheet on the saved text, discarding any stale draft. */
  const openRemarks = () => {
    setRemarks(savedRemarks);
    setRemarksOpen(true);
  };

  const closeRemarks = () => setRemarksOpen(false);

  const handleSaveRemarks = () => {
    // No backend yet — acknowledge and adopt the draft as the new baseline.
    setSavedRemarks(remarks);
    setRemarksOpen(false);
    toaster.create({ type: "success", title: "Remarks saved." });
  };

  /**
   * Remove the payee — the one act here that cannot be taken back.
   *
   * IT ASKS FIRST, through the area's own `messageBox` rather than a dialog of
   * this file's own, and the question names the person and the amount: "delete
   * this payee" is a thing nobody reads twice, where "Paolo Domingo Reyes,
   * ₱60,000.00" is a sentence that stops the wrong click.
   *
   * There is nothing behind it yet — no store call and no endpoint — so it
   * confirms, reports, and closes the sheet. The confirmation is the part worth
   * building first: it is what stops the act, and the act is the easy half.
   */
  const handleDelete = async () => {
    if (!payee) return;
    const confirmed = await messageBox({
      title: "DELETE PAYEE",
      message: `Remove ${payee.name} from this claim? ${payee.amountDisplay} would no longer be payable to them. This cannot be undone.`,
      variant: "confirmation",
      confirmText: "Delete payee",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    toaster.create({
      type: "success",
      title: "Payee deleted.",
      description: payee.name,
    });
    onClose();
  };

  // The reviewer picked Valid / Invalid; apply the display change, then ask for
  // a final confirmation before committing the verification.
  const handleVerifySelect = async (result: Exclude<Verification, null>) => {
    setVerifyChoiceOpen(false);
    setVerification(result);
    const label = result === "valid" ? "Valid" : "Invalid";
    const confirmed = await messageBox({
      title: "Verify Payee",
      message:
        result === "invalid"
          ? "Mark this payee as Invalid? The payout channel will be set to Check and the account number withheld. Verify now?"
          : "Mark this payee as Valid and verify now?",
      variant: "confirmation",
      confirmText: "Verify",
      cancelText: "Cancel",
    });
    if (confirmed) {
      toaster.create({
        type: "success",
        title: `Payee verified as ${label}.`,
        description:
          result === "invalid"
            ? "Payout channel set to Check; account number withheld."
            : undefined,
      });
    } else {
      // Backed out — undo the display change.
      setVerification(null);
    }
  };

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` / `data-inert`
  // stuck on <body> after a modal closes, freezing the page. Restore it.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  // An invalid verification forces the payout to a check — the channel reads
  // "CHECK" and the account number is withheld entirely.
  const isInvalid = verification === "invalid";

  /**
   * The payout channel, in full.
   *
   * THE 16-CHARACTER CUT IS GONE, and so is the "Show all" that undid it. It
   * existed because the value was `truncate` — one line, ellipsis, no wrapping —
   * so a long name would have been clipped mid-word with no way to read it. The
   * row wraps now, which answers the same problem without a control: "SECURITY
   * BANK CORPORATION" fits on one line in the dialog and takes two on the phone
   * sheet, and either way it is readable without a tap.
   *
   * It also removes a rule that had started to disagree with itself — gated on
   * the PRESENTATION, the same 375px width truncated in the drawer and did not
   * in the dialog.
   */
  const channel = isInvalid ? CHECK_CHANNEL_NAME : (payee?.channelName ?? "—");
  const hasAccountNo = !!payee && payee.accountNo !== "—";
  const accountDisplay = showAccountNo
    ? (payee?.accountNo ?? "—")
    : (payee?.accountNoMasked ?? "—");

  /**
   * Whether anything is known about how to reach this payee.
   *
   * ASKED AS ONE QUESTION, because the answer is almost always no and three
   * rows of "—" say it three times. One line says it once and gives back the
   * space; the rows come back the moment there is anything in them.
   */
  const blank = (v?: string) => !v || v === "—" || v === "-";
  const hasContact =
    !!payee &&
    (!blank(payee.address) || !blank(payee.contact) || !blank(payee.email));

  /** The verification state, as the chip beside the name reads it. */
  const verificationChip =
    verification === "valid"
      ? { tone: "ok" as const, label: "Valid" }
      : verification === "invalid"
        ? { tone: "bad" as const, label: "Invalid" }
        : { tone: "warn" as const, label: "Not verified" };

  return (
    <>
      {/* Chakra's toaster only draws what is pushed to it while it is mounted,
        so it is mounted here beside the drawer that pushes — the two cannot be
        separated and leave a `toaster.create` call quietly doing nothing. */}
      <ClaimsToaster />

      <Drawer.Root
        open={open}
        onOpenChange={(e) => {
          if (!e.open) onClose();
        }}
        placement="bottom"
      >
        <Portal>
          <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
          <Drawer.Positioner
            alignItems={asDialog ? "center" : undefined}
            justifyContent={asDialog ? "center" : undefined}
            p={asDialog ? 3 : undefined}
          >
            <Drawer.Content
              display="flex"
              flexDirection="column"
              // A full-height sheet, or a centred one sized to its content —
              // see `asDialog`. The dialog's numbers are `SectionPopup`'s, so
              // the sheets on that page are the same size and corner.
              h={asDialog ? "auto" : "100dvh"}
              maxH={asDialog ? { base: "88dvh", md: "82vh" } : "100dvh"}
              w={asDialog ? "full" : undefined}
              maxW={
                asDialog
                  ? { base: "calc(100dvw - 24px)", md: "840px" }
                  : undefined
              }
            css={asDialog ? DIALOG_SHEET_CSS : undefined}
              borderRadius={asDialog ? "xl" : 0}
              overflow="hidden"
            >
              {/* The same page-style bar the claim detail drawer carries — this
                sheet stacks over it, so the two must not style headers apart. */}
              <DrawerPageHeader
                title="Payee's Details"
                description={payee?.claimNo}
                onBack={onClose}
                dismiss={asDialog ? "close" : "back"}
              />

              <Drawer.Body py={5} overflowY="auto">
                {payee ? (
                  <VStack align="stretch" gap={5}>
                    {/* WHO IS BEING PAID, AND HOW MUCH — the two facts the rest
                        of the sheet is detail about, and the two that were
                        hardest to find in it. The name was row one of eight in
                        the same 13.5px as every other row; the amount was row
                        four, set identically to an empty Email.

                        THE STATES RIDE WITH THE NAME. Relation, on-hold and the
                        verification verdict are not things you look up — they
                        change what you do next, so they sit where the eye lands
                        rather than filed among the fields. "Not verified" is
                        stated from the moment the sheet opens: it used to appear
                        only AFTER somebody verified, which left the one fact
                        that decides what to do here as the one fact never shown.

                        Not in `DrawerPageHeader`: that bar is shared with the
                        claim drawer this sheet stacks over, and the two must not
                        style headers apart. */}
                    <Flex
                      align="flex-start"
                      justify="space-between"
                      gap={{ base: 3, md: 6 }}
                      direction={{ base: "column", md: "row" }}
                    >
                      <Box minW={0}>
                        <Text
                          fontSize={{ base: "lg", md: "xl" }}
                          fontWeight="700"
                          color="gray.900"
                          lineHeight="1.25"
                        >
                          {payee.name}
                        </Text>
                        <Flex align="center" gap={2} wrap="wrap" mt={2}>
                          <StateChip tone="neutral">{payee.relation}</StateChip>
                          <StateChip tone={verificationChip.tone}>
                            {verificationChip.label}
                          </StateChip>
                          {payee.isOnHold && (
                            <StateChip tone="warn">On hold</StateChip>
                          )}
                        </Flex>
                      </Box>

                      {/* The figure that actually gets paid, in the weight it
                          earns. Tabular, so a column of payees lines up. */}
                      <Box
                        textAlign={{ base: "left", md: "right" }}
                        flexShrink={0}
                      >
                        <Text
                          fontSize="10px"
                          fontWeight="700"
                          letterSpacing="0.1em"
                          textTransform="uppercase"
                          color="gray.400"
                        >
                          Payable
                        </Text>
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="700"
                          letterSpacing="-0.02em"
                          lineHeight="1.2"
                          color={
                            payee.isOnHold
                              ? BRAND_COLORS.warningText
                              : "gray.900"
                          }
                          css={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {payee.amountDisplay}
                        </Text>
                      </Box>
                    </Flex>

                    {/* TWO COLUMNS WHERE THERE IS ROOM: who the payee is, and
                        how they are paid. One stack on the sheet, which is the
                        width this component also has to hold at.

                        It is what stops the dialog scrolling — the whole record
                        used to run down a single column inside an 840px sheet
                        and cut Payout Channel off at the fold. */}
                    <Grid
                      templateColumns={{
                        base: "1fr",
                        md: asDialog ? "1fr 1fr" : "1fr",
                      }}
                      gap={{ base: 5, md: 8 }}
                    >
                      <Box>
                        <SectionTitle title="Payee" />
                        <Box>
                          <DetailRow label="Date of birth">
                            <DetailValue>{payee.birthDate}</DetailValue>
                          </DetailRow>

                          {/* THE THREE FIELDS MOST PAYEES LEAVE BLANK, asked as
                              one question — see `hasContact`. */}
                          {hasContact ? (
                            <>
                              <DetailRow label="Address">
                                <DetailValue>{payee.address}</DetailValue>
                              </DetailRow>
                              <DetailRow label="Contact">
                                <DetailValue>{payee.contact}</DetailValue>
                              </DetailRow>
                              <DetailRow label="Email">
                                <DetailValue>{payee.email}</DetailValue>
                              </DetailRow>
                            </>
                          ) : (
                            <Box
                              mt={2}
                              px={3}
                              py={2.5}
                              borderWidth="1px"
                              borderStyle="dashed"
                              borderColor="gray.200"
                              borderRadius="lg"
                              bg="gray.50"
                            >
                              <Text fontSize="xs" color="gray.500">
                                No address, contact number or email on file.
                              </Text>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      <Box>
                      {/* THE VERDICT HAS MOVED to the chip beside the name, where
                          it is stated whether or not anyone has verified yet —
                          it used to render here only once a verdict existed. */}
                      <SectionTitle title="Paid by" />
                      <Box>
                        {/* Channel — in full, wrapping if it must. See `channel`. */}
                        <DetailRow label="Channel">
                          <DetailValue>{channel}</DetailValue>
                        </DetailRow>

                        {/* Account number — masked until revealed with the eye.
                          Withheld entirely for an invalid (check) payout.

                          THE BEST THING IN THE OLD SHEET, and untouched: a payout
                          account is the one field here somebody could be
                          shoulder-reading, and revealing it should be an act. */}
                        {!isInvalid ? (
                          <DetailRow label="Account no.">
                              <Text
                                fontWeight="600"
                                textAlign="right"
                                whiteSpace="nowrap"
                                fontFamily={showAccountNo ? "mono" : undefined}
                              >
                                {accountDisplay}
                              </Text>
                              {hasAccountNo ? (
                                <IconButton
                                  aria-label={
                                    showAccountNo
                                      ? "Hide account number"
                                      : "Show full account number"
                                  }
                                  size="xs"
                                  variant="ghost"
                                  color="gray.500"
                                  _hover={{
                                    color: "green.600",
                                    bg: "green.50",
                                  }}
                                  onClick={() => setShowAccountNo((v) => !v)}
                                >
                                  {showAccountNo ? (
                                    <LuEyeOff size={16} />
                                  ) : (
                                    <LuEye size={16} />
                                  )}
                                </IconButton>
                              ) : null}
                          </DetailRow>
                        ) : null}

                        <DetailRow label="Branch">
                          <DetailValue>{payee.payoutBranch}</DetailValue>
                        </DetailRow>
                      </Box>
                      </Box>
                    </Grid>

                    {/* Remarks — read-only here. Writing them happens in the
                      sheet Edit Remarks opens, so the section stays a panel of
                      text instead of carrying a Save button of its own.

                      TEXT, NOT A DISABLED TEXTAREA. It was a grey read-only
                      field with a placeholder, which is the exact shape of a form
                      control somebody has switched off — so an empty remark read
                      as "you cannot write here" rather than "nothing is written
                      here". The button above it is what writes. */}
                    <Box>
                      <SectionTitle
                        title="Remarks"
                        action={
                          <TertiarySmButton onClick={openRemarks}>
                            <LuPencil /> Edit Remarks
                          </TertiarySmButton>
                        }
                      />
                      {savedRemarks ? (
                        <Text
                          fontSize="sm"
                          color="gray.700"
                          lineHeight="1.6"
                          whiteSpace="pre-wrap"
                        >
                          {savedRemarks}
                        </Text>
                      ) : (
                        <Text fontSize="sm" color="gray.400" fontStyle="italic">
                          No remarks on this payee.
                        </Text>
                      )}
                    </Box>
                  </VStack>
                ) : null}
              </Drawer.Body>

              {/* THE ACTIONS, AT THE FOOT — after the record they act on.
                  They were four equal tiles ABOVE the first field, which offered
                  four ways to change a payee before anything about them had been
                  read, and gave the irreversible one the same weight and the
                  same size as the rest.

                  RANKED NOW, and the ranking is the point: Verify is what this
                  sheet is opened to do, so it is the solid button; Edit is the
                  outline beside it; Delete stands apart on the far left, quiet
                  and easy to reach but nowhere near the hand's default path —
                  the same arrangement the claims pages use for their own
                  destructive exits. It asks before it acts; see `handleDelete`.

                  ENDORSE IS NOT HERE. It was a tile with no click handler at
                  all, drawn exactly like the two that worked. An inert control
                  that looks live is worse than an absent one — it comes back the
                  day it does something. */}
              {payee ? (
                <Flex
                  align="center"
                  gap={3}
                  px={{ base: 4, md: 5 }}
                  py={3}
                  borderTopWidth="1px"
                  borderColor="gray.200"
                  bg="gray.50"
                  flexShrink={0}
                >
                  <Button
                    onClick={handleDelete}
                    variant="ghost"
                    size="sm"
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.600"
                    px={3}
                    _hover={{
                      bg: BRAND_COLORS.errorBg,
                      color: BRAND_COLORS.destructiveRed,
                    }}
                  >
                    <LuTrash2 />
                    Delete
                  </Button>

                  <Box flex="1" />

                  {/* Already verified: the buttons give way to what was decided,
                      rather than standing there inviting a second, contradictory
                      answer. */}
                  {verification ? (
                    <Flex align="center" gap={2}>
                      <Box
                        color={
                          isInvalid
                            ? BRAND_COLORS.destructiveRed
                            : BRAND_COLORS.darkGreen
                        }
                      >
                        <LuCheck size={15} />
                      </Box>
                      <Text fontSize="sm" fontWeight="700" color="gray.800">
                        {isInvalid ? "Verified invalid" : "Verified valid"}
                      </Text>
                    </Flex>
                  ) : (
                    <>
                      <SecondarySmButton onClick={() => setEditOpen(true)}>
                        Edit
                      </SecondarySmButton>
                      <PrimarySmButton
                        onClick={() => setVerifyChoiceOpen(true)}
                      >
                        Verify
                      </PrimarySmButton>
                    </>
                  )}
                </Flex>
              ) : null}
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <PlanholderPayeeEditDrawer
        payee={payee}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        asDialog={asDialog}
      />

      {/* Write the remarks — the same sheet "Add Note" uses, so the form and its
        buttons live here rather than sitting under the read-only section. */}
      <BottomQuickActions
        open={remarksOpen}
        onOpenChange={(next) => {
          if (!next) closeRemarks();
        }}
        title="Edit Remarks"
        subtitle={payee ? payee.name : "Remarks on this payee's payout"}
      >
        <VStack align="stretch" gap={3}>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Write the remarks…"
            rows={6}
            resize="none"
            bg="white"
            autoFocus
          />
          {/* One row at every width — Cancel on the left, Save on the right. */}
          <Flex align="center" justify="space-between" gap={3}>
            <SecondaryMdButton onClick={closeRemarks}>Cancel</SecondaryMdButton>
            <PrimaryMdButton
              onClick={handleSaveRemarks}
              disabled={!remarksDirty}
            >
              Save
            </PrimaryMdButton>
          </Flex>
        </VStack>
      </BottomQuickActions>

      {/* Verify — pick Valid / Invalid before the confirmation prompt. */}
      <Dialog.Root
        open={verifyChoiceOpen}
        onOpenChange={(e) => {
          if (!e.open) setVerifyChoiceOpen(false);
        }}
        size="sm"
        placement="center"
        motionPreset="scale"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              borderRadius="2xl"
              overflow="hidden"
              maxW="360px"
              boxShadow="xl"
            >
              <VStack gap={3} pt={8} pb={6} px={6} textAlign="center">
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="blue.subtle"
                  color="blue.600"
                  display="inline-flex"
                >
                  <LuBadgeCheck size={26} strokeWidth={1.75} />
                </Box>
                <VStack gap={1}>
                  <Text fontWeight="semibold" fontSize="md" color="fg">
                    Verify Payee
                  </Text>
                  <Text fontSize="sm" color="fg.muted" lineHeight="tall">
                    Is this payee&apos;s payout information valid or invalid?
                  </Text>
                </VStack>
              </VStack>
              <Flex px={6} pb={6} gap={3}>
                <Button
                  flex={1}
                  variant="outline"
                  colorPalette="red"
                  borderRadius="15px"
                  onClick={() => handleVerifySelect("invalid")}
                >
                  Invalid
                </Button>
                <Button
                  flex={1}
                  colorPalette="green"
                  borderRadius="15px"
                  onClick={() => handleVerifySelect("valid")}
                >
                  Valid
                </Button>
              </Flex>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}

export default PlanholderPayeeDrawer;
