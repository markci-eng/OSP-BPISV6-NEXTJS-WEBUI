"use client";

// ASK WHY, THEN COMMIT — the shape both of this screen's negative answers take.
//
// Approve is one press because an approval explains itself: the claim met the
// terms. The other two do not. A DENIAL is the outcome somebody will be asked to
// justify — by a supervisor this week, by a claimant's family, possibly by a
// regulator years later — and a trail reading "Sent for denial by J. Cruz"
// answers none of it. A RETURN is an instruction to a branch, and one that does
// not say what it wants is a round trip that changes nothing. So both collect a
// reason before the verdict, not after it and not optionally.
//
// ONE COMPONENT FOR BOTH, because they are the same form: a list of grounds, a
// free-text case, and a confirmation. Built for the denial first and generalised
// the moment the return needed it — two copies would have drifted the first time
// one of them gained a field.
//
// A DROPDOWN, NOT A STACK OF CARDS. The denial's version was seven cards, each
// with a line explaining when it applies, and the form ran past the fold on a
// laptop — a two-second decision turned into a scroll. A select states the
// current answer in one line and costs one row. The explanation is not lost: the
// chosen ground's line shows under the field, read once by the person who needs
// it rather than seven times by everyone who does not.
//
// THE TEXT BOX ONLY APPEARS FOR "OTHER", and then it is required. Free text
// beside a filled-in dropdown is a field most people skip and some fill with
// something that contradicts the code above it; the one case that genuinely
// needs words is the one with no code for it.
//
// A REASON THEN A CONFIRMATION, rather than a dropdown that acts on change.
// Picking from a list is a browsing gesture and people make it carelessly; the
// claims this screen serves are somebody's death benefit. The second press is
// cheap and it is the one that means it.

import { useEffect, useState } from "react";
import { Box, Flex, NativeSelect, Text, Textarea } from "@chakra-ui/react";
import { PrimarySmButton, SecondarySmButton } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SectionPopup } from "../../components/section-popup";
import { SectionTitle } from "../../components/section-title";
import {
  OTHER_DENIAL_REASON,
  type DenialReason,
} from "../../claim-store";

export function ReasonDialog({
  open,
  onClose,
  title,
  subtitle,
  reasons,
  confirmText,
  destructive = false,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  /** Heading, and the dialog's name for a screen reader. */
  title: string;
  subtitle: string;
  /** The grounds on offer — see `DENIAL_REASONS` / `COMPLIANCE_REASONS`. */
  reasons: DenialReason[];
  /** What the committing button says: "Deny claim", "Return claim". */
  confirmText: string;
  /**
   * Whether this answer ENDS the claim.
   *
   * Red is for the denial alone. A return is not a bad outcome — it is a
   * question put to a branch, and dressing it in the same colour as the one
   * irreversible action on the screen would spend the warning on the wrong
   * button and leave nothing to say when the real one arrives.
   */
  destructive?: boolean;
  /** Called with the reason as it should read in the claim's trail. */
  onConfirm: (reason: string) => void;
}) {
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // CLEARED EVERY TIME IT OPENS. The dialog is mounted for the life of the page
  // — see `SectionPopup` — so without this, the reason chosen for the last claim
  // would be sitting selected when the next one is answered, which is the single
  // worst default this screen could have.
  useEffect(() => {
    if (open) {
      setCode("");
      setNote("");
      setError(null);
    }
  }, [open]);

  const chosen = reasons.find((reason) => reason.code === code);
  const isOther = code === OTHER_DENIAL_REASON;

  /**
   * The denial's red, forced past the kit's own primary.
   *
   * `bg` DOES NOT WIN HERE, and it looked as though it did. `PrimarySmButton`
   * carries the brand green as a generated class, and a `bg` style prop lands as
   * another class of equal weight — so which one applies comes down to
   * stylesheet order, and the kit's was winning: the button rendered green while
   * the code said red, which is the worst kind of wrong because nothing about
   * reading it suggests a problem. Measured, not assumed — `getComputedStyle`
   * returned `rgb(16, 148, 72)`.
   *
   * `!important` through `css`, therefore, and on hover and active too, or the
   * pointer landing on it takes it back to green.
   */
  const destructiveCss = destructive
    ? {
        background: `${BRAND_COLORS.destructiveRed} !important`,
        "&:hover": { background: "#A11B29 !important" },
        "&:active": { background: "#8C1724 !important" },
      }
    : undefined;

  const confirm = () => {
    if (!code) {
      setError("Choose a reason first.");
      return;
    }
    if (isOther && !note.trim()) {
      setError("Say what the reason is.");
      return;
    }
    // "Other" IS the note; every other ground is its own sentence. Either way
    // what goes into the trail reads without this screen to explain it.
    onConfirm(isOther ? note.trim() : (chosen?.label ?? code));
  };

  return (
    <SectionPopup
      title={title}
      open={open}
      onClose={onClose}
      // NARROW, because this is a form of two fields and not a table. The
      // look-up default of 840 would stretch one dropdown across most of a
      // laptop screen with its label stranded at the far left.
      maxW="520px"
    >
      <SectionTitle title={title} subtitle={subtitle} />

      <Text fontSize="xs" fontWeight="700" color="gray.600" mb={1}>
        Reason
      </Text>
      <NativeSelect.Root size="sm">
        <NativeSelect.Field
          aria-label={`Reason — ${title}`}
          h="36px"
          borderRadius="lg"
          bg="white"
          value={code}
          onChange={(event) => {
            setCode(event.currentTarget.value);
            setError(null);
          }}
        >
          {/* AN EMPTY FIRST OPTION, so the field opens on no answer rather than
              on the first ground in the list. A select that arrives pre-filled
              is an answer nobody chose. */}
          <option value="">Choose a reason…</option>
          {reasons.map((reason) => (
            <option key={reason.code} value={reason.code}>
              {reason.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      {/* WHEN THE CHOSEN GROUND APPLIES — the line that would otherwise sit on
          every option, shown for the one that was picked. */}
      {chosen && !isOther && (
        <Text fontSize="xs" color="gray.500" mt={1.5}>
          {chosen.description}
        </Text>
      )}

      {isOther && (
        <Box mt={3}>
          <Text fontSize="xs" fontWeight="700" color="gray.600" mb={1}>
            In your own words
          </Text>
          <Textarea
            value={note}
            onChange={(event) => {
              setNote(event.currentTarget.value);
              setError(null);
            }}
            placeholder={chosen?.description}
            rows={3}
            fontSize="sm"
            resize="vertical"
          />
        </Box>
      )}

      {/* INLINE, NOT A DISABLED BUTTON. A greyed-out control says something is
          wrong without saying what. */}
      {error && (
        <Text fontSize="xs" color={BRAND_COLORS.destructiveRed} mt={2}>
          {error}
        </Text>
      )}

      <Flex justify="flex-end" gap={2} mt={5}>
        <SecondarySmButton onClick={onClose}>Cancel</SecondarySmButton>
        <PrimarySmButton
          onClick={confirm}
          // THE ONE RED BUTTON ON THE SCREEN, and only on the denial — see
          // `destructive` and `destructiveCss`. Everywhere else the primary is
          // brand green, because everywhere else the primary action is the one
          // you want taken.
          css={destructiveCss}
        >
          {confirmText}
        </PrimarySmButton>
      </Flex>
    </SectionPopup>
  );
}

export default ReasonDialog;
