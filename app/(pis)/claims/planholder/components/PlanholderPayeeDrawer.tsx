"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Drawer,
  Flex,
  IconButton,
  Portal,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  LuBadgeCheck,
  LuEye,
  LuEyeOff,
  LuPencil,
  LuSend,
  LuTrash2,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { RowItem } from "@/components/info-card/row-item";
import { BottomQuickActions, useMessageDialog } from "osp-ui-kit";
import {
  PrimaryMdButton,
  SecondaryMdButton,
  TertiarySmButton,
} from "st-peter-ui";
import { SectionTitle } from "../../components/section-title";
import { ClaimsToaster, toaster } from "../../components/toaster";
import { type ClaimPayee } from "../../claims-data";
import { DrawerPageHeader } from "./DrawerPageHeader";
import { PlanholderPayeeEditDrawer } from "./PlanholderPayeeEditDrawer";

/** Display name for the fallback "check" payout channel (seed code 104). */
const CHECK_CHANNEL_NAME = "CHECK";

type Verification = "valid" | "invalid" | null;

/**
 * The payee-level actions shown at the top of the drawer. They act on the payee
 * / payout, mirroring the whole-claim actions on the parent claim drawer. No
 * handlers wired yet — here to show the layout.
 */
const PAYEE_ACTIONS = [
  { label: "Edit", icon: LuPencil },
  { label: "Delete", icon: LuTrash2 },
  { label: "Endorse", icon: LuSend },
  { label: "Verify", icon: LuBadgeCheck },
];

/**
 * A single payee action — bordered card, icon over label. Matches the
 * whole-claim ActionTile on the parent claim request drawer.
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
      _hover={{ borderColor: accent, bg: "#f4faf6" }}
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

interface PlanholderPayeeDrawerProps {
  /** The payee being viewed. `null`/`undefined` keeps the drawer closed. */
  payee?: ClaimPayee | null;
  open: boolean;
  onClose: () => void;
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
}: PlanholderPayeeDrawerProps) {
  // Account number is masked until the reviewer chooses to reveal it; a long
  // channel name collapses to "BDO…" until expanded.
  const [showAccountNo, setShowAccountNo] = useState(false);
  const [showFullChannel, setShowFullChannel] = useState(false);

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
    setShowFullChannel(false);
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

  // Route the top action tiles. Only Edit and Verify are wired for now.
  const handleAction = (label: string) => {
    if (label === "Edit") setEditOpen(true);
    else if (label === "Verify") setVerifyChoiceOpen(true);
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

  // Channel names longer than this collapse to a "BDO…" preview.
  const CHANNEL_MAX = 16;
  const channel = isInvalid ? CHECK_CHANNEL_NAME : (payee?.channelName ?? "—");
  const channelTooLong = channel.length > CHANNEL_MAX;
  const channelDisplay =
    channelTooLong && !showFullChannel
      ? `${channel.slice(0, CHANNEL_MAX).trimEnd()}…`
      : channel;
  const hasAccountNo = !!payee && payee.accountNo !== "—";
  const accountDisplay = showAccountNo
    ? (payee?.accountNo ?? "—")
    : (payee?.accountNoMasked ?? "—");

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
          <Drawer.Positioner>
            <Drawer.Content
              display="flex"
              flexDirection="column"
              h="100dvh"
              maxH="100dvh"
              borderRadius={0}
              overflow="hidden"
            >
              {/* The same page-style bar the claim detail drawer carries — this
                sheet stacks over it, so the two must not style headers apart. */}
              <DrawerPageHeader
                title="Payee's Details"
                description={payee?.claimNo}
                onBack={onClose}
              />

              <Drawer.Body py={5} overflowY="auto">
                {payee ? (
                  <VStack align="stretch" gap={5}>
                    {/* Payee-level actions — above the first section title. */}
                    <SimpleGrid columns={4} gap={{ base: 2, md: 3 }}>
                      {PAYEE_ACTIONS.map(({ label, icon }) => (
                        <ActionTile
                          key={label}
                          label={label}
                          icon={icon}
                          onClick={
                            label === "Edit" || label === "Verify"
                              ? () => handleAction(label)
                              : undefined
                          }
                        />
                      ))}
                    </SimpleGrid>

                    <Box>
                      <SectionTitle title="Details" />
                      <Box>
                        <RowItem label="Payee Name" value={payee.name} />
                        <RowItem label="Relation" value={payee.relation} />
                        <RowItem
                          label="Date of Birth"
                          value={payee.birthDate}
                        />
                        <RowItem label="Amount" value={payee.amountDisplay} />
                        <RowItem
                          label="On Hold"
                          value={payee.isOnHold ? "YES" : "NO"}
                        />
                        <RowItem label="Address" value={payee.address} />
                        <RowItem label="Contact" value={payee.contact} />
                        <RowItem label="Email" value={payee.email} />
                      </Box>
                    </Box>

                    <Box>
                      {/* The verification verdict rides in the heading's action
                        slot, where every other section's trailing control sits. */}
                      <SectionTitle
                        title="Payout Channel"
                        action={
                          verification ? (
                            <Box
                              px={2}
                              py="1px"
                              borderRadius="full"
                              fontSize="10px"
                              fontWeight="bold"
                              textTransform="uppercase"
                              letterSpacing="wide"
                              bg={isInvalid ? "red.100" : "green.100"}
                              color={isInvalid ? "red.700" : "green.700"}
                            >
                              {isInvalid ? "Invalid" : "Valid"}
                            </Box>
                          ) : undefined
                        }
                      />
                      <Box>
                        {/* Channel — collapses to "BDO…" when long, tap to expand. */}
                        <Flex align="center" py={1.5} fontSize="sm">
                          <Text color="gray.500" whiteSpace="nowrap">
                            Channel
                          </Text>
                          <Box
                            flex="1"
                            mx={3}
                            borderBottom="1px dashed"
                            borderColor="gray.300"
                            transform="translateY(2px)"
                          />
                          <Flex align="center" gap={2} minW={0}>
                            <Text
                              fontWeight="medium"
                              textAlign="right"
                              truncate
                            >
                              {channelDisplay}
                            </Text>
                            {channelTooLong ? (
                              <Text
                                as="button"
                                onClick={() => setShowFullChannel((v) => !v)}
                                fontSize="xs"
                                fontWeight="semibold"
                                color="green.600"
                                _dark={{ color: "green.400" }}
                                flexShrink={0}
                                cursor="pointer"
                              >
                                {showFullChannel ? "Show less" : "Show all"}
                              </Text>
                            ) : null}
                          </Flex>
                        </Flex>

                        {/* Account number — masked until revealed with the eye.
                          Withheld entirely for an invalid (check) payout. */}
                        {!isInvalid ? (
                          <Flex align="center" py={1.5} fontSize="sm">
                            <Text color="gray.500" whiteSpace="nowrap">
                              Account No.
                            </Text>
                            <Box
                              flex="1"
                              mx={3}
                              borderBottom="1px dashed"
                              borderColor="gray.300"
                              transform="translateY(2px)"
                            />
                            <Flex align="center" gap={1.5}>
                              <Text
                                fontWeight="medium"
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
                            </Flex>
                          </Flex>
                        ) : null}

                        <RowItem label="Branch" value={payee.payoutBranch} />
                      </Box>
                    </Box>

                    {/* Remarks — read-only here. Writing them happens in the
                      sheet Edit Remarks opens, so the section stays a panel of
                      text instead of carrying a Save button of its own. */}
                    <Box>
                      <SectionTitle
                        title="Remarks"
                        action={
                          <TertiarySmButton onClick={openRemarks}>
                            <LuPencil /> Edit Remarks
                          </TertiarySmButton>
                        }
                      />
                      <Textarea
                        value={savedRemarks}
                        readOnly
                        placeholder="No remarks on this payee yet."
                        rows={4}
                        resize="none"
                        bg="gray.50"
                        color="gray.700"
                        borderColor="gray.200"
                        cursor="default"
                        _focusVisible={{
                          borderColor: "gray.300",
                          boxShadow: "none",
                        }}
                      />
                    </Box>
                  </VStack>
                ) : null}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <PlanholderPayeeEditDrawer
        payee={payee}
        open={editOpen}
        onClose={() => setEditOpen(false)}
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
