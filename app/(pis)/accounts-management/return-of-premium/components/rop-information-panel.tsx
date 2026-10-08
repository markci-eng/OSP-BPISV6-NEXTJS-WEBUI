"use client";

// ROP Information — the right panel: who the return is for, and the ledger it
// is decided on.
//
// IT WAS THE ACCOUNT MANAGEMENT PROFILE, shown whole, and is not any more. The
// profile's sections were switched off one by one until an identity header was
// all that stood, and the header itself then wanted a shape that card does not
// take — see the note in `RopPlanholderCard`. The planholder DATA still comes
// from `buildPlanholderProfile`, the same assembly the profile screen uses, so
// the two screens still agree about what a planholder is.

import { useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import {
  InfoCardAccordion,
  PrimaryMdButton,
  ProfileHeaderCardSkeleton,
} from "osp-ui-kit";
import { toast } from "sonner";

import { CalendarClock, Save, Wallet } from "lucide-react";

import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import {
  RopCofpReplacementDialog,
  type CofpReplacementForm,
} from "./rop-cofp-replacement-dialog";
import { RopDetailsCard } from "./rop-details-card";
import { RopHistoryCard } from "./rop-history-card";
import { RopPayoutCard, type RopPayoutSelection } from "./rop-payout-card";
import { RopPayoutProofCard } from "./rop-payout-proof-card";
import { RopPhInfoDialog, type PhInfoForm } from "./rop-ph-info-dialog";
import { RopPlanholderCard } from "./rop-planholder-card";
import { RopRemarksCard } from "./rop-remarks-card";
import { RopScheduleCard } from "./rop-schedule-card";
import { RopValidationCard } from "./rop-validation-card";
import { RopSubmittedDocumentsCard } from "./rop-submitted-documents-card";
import { ROP_SCHEDULE_STATUS_BADGE } from "../data/data";
import type { RopRecord } from "../data/types";

export interface RopInformationPanelProps {
  record?: RopRecord;
  loading?: boolean;
  /** The COFP request dialog. Opened from the page header's button, beside
   *  the title (user, 2026-10-02), so its state lives on the page. */
  cofpOpen?: boolean;
  onCofpOpenChange?: (open: boolean) => void;
}

/**
 * The 30% column every state of this panel sits in — 30/70 against the
 * Submitted Documents, so the stacked ROP form and IDs get the room to be
 * read (user, 2026-10-08). The payout fold matches it; the ROP Schedule
 * fold keeps its own 40/60 split.
 *
 * Shared by the loading and empty states as well as the loaded one, so the
 * panel does not change width as it fills — a column that starts full-width
 * and snaps to a third once the record lands is a page that looks broken while
 * it loads.
 */
const COLUMN_WIDTH = { base: "100%", lg: "30%" } as const;
const COLUMN_MIN_WIDTH = { lg: "280px" } as const;

export function RopInformationPanel({
  record,
  loading = false,
  cofpOpen = false,
  onCofpOpenChange,
}: RopInformationPanelProps) {
  // Which payout the Payout Details card is showing, so the Proof of Payout
  // card beside it can show that submission's scan. Above the early returns,
  // because a hook cannot sit below one.
  const [payoutSelection, setPayoutSelection] = useState<RopPayoutSelection>({
    onCheque: false,
  });
  const [phInfoOpen, setPhInfoOpen] = useState(false);
  // Edit PH Info drafts, keyed by record id so an edit stays with its own
  // request when the list selection moves. Nothing is persisted yet.
  const [phInfoEdits, setPhInfoEdits] = useState<Record<string, PhInfoForm>>(
    {},
  );

  // The planholder as the panel shows it: the saved draft where there is one,
  // else the record. Memoized because both dialogs reset to it whenever it
  // changes — a fresh object each render would wipe the typing. The record
  // prints the name "Last, First"; the forms want them apart.
  const phInfo = useMemo<PhInfoForm>(() => {
    const edited = record ? phInfoEdits[record.id] : undefined;
    if (edited) return edited;
    const [lastName = "", firstName = ""] = (record?.planholderName ?? "")
      .split(",")
      .map((part) => part.trim());
    return {
      lastName,
      firstName,
      middleName: "",
      birthdate: record?.birthdate ?? "",
    };
  }, [record, phInfoEdits]);

  // The COFP request opens on the corrected details, since those are what
  // should print on the new certificate.
  const cofpDefaults: CofpReplacementForm = phInfo;

  if (loading) {
    // The kit's own placeholder for the card that is coming, so the panel does
    // not jump when the profile arrives. One card, because the request details
    // are now part of that card rather than a second one above it.
    return (
      <Box w={COLUMN_WIDTH} minW={COLUMN_MIN_WIDTH}>
        <ProfileHeaderCardSkeleton />
      </Box>
    );
  }

  if (!record) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap={2}
        w={COLUMN_WIDTH}
        minW={COLUMN_MIN_WIDTH}
        bg="white"
        borderWidth="1px"
        borderColor="border.muted"
        borderRadius={SURFACE_RADIUS}
        shadow="xs"
        py={16}
        px={6}
        textAlign="center"
      >
        <Text fontSize="md" fontWeight="600" color="gray.700">
          No ROP selected
        </Text>
        <Text fontSize="sm" color="gray.500">
          Pick a record from the list to see its information.
        </Text>
      </Flex>
    );
  }

  // The schedule's status, the same one the list rows and the list's status
  // view read — not the request's older PENDING/APPROVED/DENIED flag.
  const badge = {
    label: record.schedule.status,
    type: ROP_SCHEDULE_STATUS_BADGE[record.schedule.status],
  };

  // Surname-first, the way the record prints it, with the middle name after
  // the first where one was entered.
  const displayName = `${phInfo.lastName}, ${[phInfo.firstName, phInfo.middleName]
    .filter(Boolean)
    .join(" ")}`;

  // EVERY FIELD ON THIS PANEL NOW COMES OFF THE ROP RECORD. The planholder
  // profile was the source while the panel showed that profile; with it pared
  // back to an identity card, the record already carries the name, the LPA
  // number and the birthdate, and reaching into the profile tables for them
  // would be a second answer to questions this record answers.

  // A ROW, THEN A CARD UNDER ITS LEFT HALF.
  //
  // The Submitted Documents card is to be exactly as tall as the planholder card and
  // the ROP details card TOGETHER (user, 2026-09-24) — not as tall as the whole
  // left column, which is what it became when the payout card joined it. So the
  // pairing is made structural: those two cards and the ID card are one row,
  // and the payout card is a second row that only occupies the left width.
  //
  // Within that row the columns STRETCH, so the left pair sets the height and
  // the ID card fills it, its viewer taking up the slack.
  //
  // `gap="10px"` between every card, down the column and across the row, the
  // same as Reinstatement (user, 2026-09-28): the payout card should read as
  // the next card down the left stack, not as a separate block under the row.
  //
  // It all STACKS below `lg` — identity, ledger, IDs, payout — which puts the
  // scans in front of the reader before the payee they are checked against.
  return (
    <Flex direction="column" gap="10px" w="full" minW={0}>
      <Flex
        direction={{ base: "column", lg: "row" }}
        align="stretch"
        gap="10px"
        w="full"
        minW={0}
      >
        {/* LEFT — 30%, and it is the COLUMN that carries the width rather than
            each card in it (user, 2026-09-24): two nested percentage rules
            would have shrunk the inner card twice. `flexShrink={0}` holds the third against
            the viewer beside it, which would otherwise pull the row wider. */}
        <Flex
          direction="column"
          gap="10px"
          w={COLUMN_WIDTH}
          minW={COLUMN_MIN_WIDTH}
          flexShrink={0}
        >
          {/* WHO THE RETURN IS FOR. It was the Account Management profile with
              its sections switched off one at a time; what was left was an
              identity header, and the last round of changes to it (LPA under
              the name, no rule, centred) are ones the kit's card has no prop
              for — see the note in `RopPlanholderCard`. */}
          <RopPlanholderCard
            name={displayName}
            lpaNo={record.lpaNo}
            personId={record.personId}
            birthdate={phInfo.birthdate}
            status={badge}
            onEdit={() => setPhInfoOpen(true)}
          />

          {/* THE REQUEST'S LEDGER: the account's dates and statuses, which are
              what the return is actually decided on. */}
          <RopDetailsCard record={record} />
        </Flex>

        {/* RIGHT — whatever is left. `minW={0}` so a wide scan cannot push the
            row past the panel; the image scales inside it instead.

            OUT OF FLOW ON `lg` (absolute inside a relative box), so the card's
            height is the left pair's and nothing else (user, 2026-09-30).
            In flow, the scan's own height — which grows with the column's
            width — fed back into the row, and hiding the list made the card
            taller. The scan is fitted inside the viewer instead. */}
        <Box
          flex="1"
          minW={0}
          w={{ base: "full", lg: "auto" }}
          position={{ base: "static", lg: "relative" }}
        >
          <Box position={{ base: "static", lg: "absolute" }} inset={0}>
            <RopSubmittedDocumentsCard documents={record.submittedDocuments} />
          </Box>
        </Box>
      </Flex>

      {/* WHERE THE MONEY GOES, and the check that the person collecting is the
          person entitled to. Below the row rather than in it, so its height is
          its own and the ID card beside the row is not stretched by it. */}
      {/* A SECOND ROW with the same 30/70 split as the first, so the
          proof sits under the Submitted Documents card and the two image cards line
          up. Stretched, so the proof is as tall as the payout details it is
          checked against. */}
      {/* ONE CARD AROUND THE PAIR (user, 2026-09-24): the details and their
          proof are a single check, so they share a surface — a collapsible
          fold, like the remarks card under it (user, 2026-09-28).

          SPLIT AS THE TRANSFEROR CARD IS (user, 2026-10-02): no card inside
          the card, just the details on the left half and the proof on the
          right under column headings, with a vertical rule between them that
          turns horizontal once they stack below `lg`. */}
      <InfoCardAccordion
        icon={<Wallet />}
        title="Payout Details and Proof of Payout"
        defaultOpen
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="stretch"
          w="full"
          minW={0}
        >
          {/* THE DETAILS, the left half. They set the fold's height. */}
          <Box
            w={{ base: "full", lg: "30%" }}
            flexShrink={0}
            minW={0}
            pr={{ base: 0, lg: 4 }}
          >
            <RopPayoutCard
              embedded
              payouts={record.payouts}
              onSelectionChange={setPayoutSelection}
            />
          </Box>

          {/* THE DIVIDING RULE — vertical beside, horizontal once stacked. */}
          <Box
            flexShrink={0}
            alignSelf="stretch"
            borderLeftWidth={{ base: 0, lg: "1px" }}
            borderTopWidth={{ base: "1px", lg: 0 }}
            borderColor="border.muted"
            my={{ base: 3, lg: 0 }}
          />

          {/* THE PROOF, the right half. OUT OF FLOW ON `lg`, so it is exactly
              as tall as the details beside it rather than as tall as the scan
              it happens to show. */}
          <Box
            flex="1"
            minW={0}
            position={{ base: "static", lg: "relative" }}
          >
            <Box
              position={{ base: "static", lg: "absolute" }}
              inset={0}
              pl={{ base: 0, lg: 4 }}
            >
              <RopPayoutProofCard
                embedded
                payout={payoutSelection.payout}
                onCheque={payoutSelection.onCheque}
              />
            </Box>
          </Box>
        </Flex>
      </InfoCardAccordion>

      {/* THE PLAN HOLDER MODULE'S TRAIL, and the processor's notes on it —
          under the payout pair (user, 2026-09-24). Keyed by record, so the
          notes list opens on its first page for each request. */}
      <RopRemarksCard
        key={record.id}
        lpaNo={record.lpaNo}
        planholderName={displayName}
        remarks={record.planholderRemarks}
        notes={record.planholderNotes}
      />

      {/* THE RELEASE BEING PROCESSED — half the panel wide (user,
          2026-09-24), full width once the columns stack. */}
      {/* ONE CARD AROUND THE SCHEDULE AND ITS VALIDATION (user, 2026-09-24),
          the same way the payout details and their proof share one above.
          The schedule takes 40%, the two validation lists the rest.

          The schedule sets the row's height; the validation lists beside it
          fill that height and scroll. On `lg` they are taken out of flow
          (absolute inside a relative box) so their own content cannot make
          the row taller than the schedule. */}
      {/* The "ROP Schedule" title is on this outer card (user, 2026-09-24),
          heading the schedule and its validation together. A collapsible fold
          like the cards above it (user, 2026-09-28). */}
      <InfoCardAccordion
        icon={<CalendarClock />}
        title="ROP Schedule"
        defaultOpen
      >
        {/* THE LAST RELEASE ON FILE, above the one being set (user,
            2026-09-24), so the processor reads the history first. */}
        {/* A rule under the history, the same as the one above Save Changes,
            so the audit record reads apart from the release being set. */}
        <Box
          mb={3}
          pb={3}
          minW={0}
          borderBottomWidth="1px"
          borderBottomColor="gray.100"
        >
          <RopHistoryCard history={record.history} />
        </Box>

        <Flex
          direction={{ base: "column", lg: "row" }}
          align="stretch"
          gap={4}
          w="full"
          minW={0}
          py={1}
        >
          <Box w={{ base: "full", lg: "40%" }} minW={0} flexShrink={0}>
            <RopScheduleCard schedule={record.schedule} />
          </Box>

          <Box flex="1" minW={0} position={{ base: "static", lg: "relative" }}>
            <Box position={{ base: "static", lg: "absolute" }} inset={0}>
              {/* Keyed by record, so ticks and searches start clean on each. */}
              <RopValidationCard key={record.id} />
            </Box>
          </Box>
        </Flex>
      </InfoCardAccordion>

      {/* ONE SAVE FOR THE WHOLE APPLICATION (user, 2026-09-24), bottom right
          under the ROP Schedule card rather than inside it (user, 2026-09-28),
          so it is in reach with the fold closed. Nothing is persisted yet —
          there is no endpoint. */}
      <Flex justify="flex-end">
        <PrimaryMdButton
          onClick={() => toast.success(`${record.ropNo} changes saved`)}
        >
          <Save size={16} />
          Save Changes
        </PrimaryMdButton>
      </Flex>

      <RopCofpReplacementDialog
        open={cofpOpen}
        onOpenChange={(open) => onCofpOpenChange?.(open)}
        defaults={cofpDefaults}
      />

      <RopPhInfoDialog
        open={phInfoOpen}
        onOpenChange={setPhInfoOpen}
        lpaNo={record.lpaNo}
        defaults={phInfo}
        onSave={(info) => {
          setPhInfoEdits((edits) => ({ ...edits, [record.id]: info }));
          toast.success("Planholder info updated");
        }}
      />
    </Flex>
  );
}

export default RopInformationPanel;
