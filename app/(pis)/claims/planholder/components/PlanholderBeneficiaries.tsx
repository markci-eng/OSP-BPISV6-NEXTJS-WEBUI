"use client";

import { useEffect, useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { EmptyStateCard } from "osp-ui-kit";
import {
  getPlanholderBeneficiaries,
  type PlanholderBeneficiary,
} from "../../claims-data";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { BeneficiaryCard } from "./BeneficiaryCard";

/* WRITE ACTIONS — add, edit and remove, all off for claims; see the note on the
   component. The imports they need, kept together so restoring is one block:

import { toast } from "sonner";
import { useMessageDialog } from "osp-ui-kit";
import { LuPlus } from "react-icons/lu";
import { TertiarySmButton } from "st-peter-ui";
import {
  ageFromBirthDateISO,
  toFullName,
  type BeneficiaryPayout,
} from "../../claims-data";
import { BeneficiaryRow } from "./BeneficiaryRow";
import { PlanholderBeneficiaryDetailDrawer } from "./PlanholderBeneficiaryDetailDrawer";
import {
  PlanholderBeneficiaryDrawer,
  type BeneficiaryFormValues,
} from "./PlanholderBeneficiaryDrawer";
*/

/* ------------------------------ section ------------------------------ */

interface PlanholderBeneficiariesProps {
  /** The plan whose declared beneficiaries are listed (by LPA number). */
  lpaNo?: string;
}

/**
 * Beneficiaries declared on a plan — the people the plan holder named when the
 * plan was bought, listed below Payments as one card each.
 *
 * These are NOT claim payees: a payee is filed against a specific claim and can
 * be someone else entirely.
 *
 * THE SECTION IS READ-ONLY FOR CLAIMS. The plan holder declared these people;
 * a claim reads them. Every write path — add, edit, remove, and registering a
 * payout channel — is commented out rather than deleted, because the capability
 * is expected back. Each block says what it was, so restoring is uncommenting
 * rather than rewriting.
 *
 * That is also why {@link BeneficiaryCard} is drawn rather than
 * {@link BeneficiaryRow}: the two look the same — the compact row every list on
 * this page uses, and the one Payee's Information keeps — but the card has no
 * tap, no swipe and no menu, because there is nothing left behind them. The row
 * was a summary that opened a drawer for the rest; with the drawer's three
 * actions gone there was nothing behind it but the same three lines.
 *
 * The card is kept to those lines on purpose — a plan can name several
 * beneficiaries, and this section sits between Payments and Claim Requests on a
 * page that is already long. Anything that grows this list by a screenful per
 * person belongs behind something, not in it.
 *
 * There is no write path to the data layer yet, so the list is held in state and
 * a reload restores the seed. That state is what the commented handlers wrote
 * to; it is kept for them.
 */
export function PlanholderBeneficiaries({
  lpaNo,
}: PlanholderBeneficiariesProps) {
  // Held in state so a restored add/edit/remove takes effect immediately.
  const [beneficiaries, setBeneficiaries] = useState<PlanholderBeneficiary[]>(
    [],
  );
  useEffect(() => {
    setBeneficiaries(lpaNo ? getPlanholderBeneficiaries(lpaNo) : []);
  }, [lpaNo]);

  // ─── WRITE ACTIONS — commented out for claims; see the note on the component.
  //
  // const { messageBox } = useMessageDialog();
  //
  // The beneficiary open in the detail drawer. Held by id, not by value, so the
  // detail keeps showing the latest saved values after an edit rather than the
  // snapshot taken when the row was tapped.
  //
  // const [selectedId, setSelectedId] = useState<string | null>(null);
  // const selected = beneficiaries.find((b) => b.id === selectedId) ?? null;
  //
  // const openDetail = (beneficiary: PlanholderBeneficiary) =>
  //   setSelectedId(beneficiary.id);
  //
  // const closeDetail = () => setSelectedId(null);
  //
  // Line comments rather than one block: the code below carries doc comments of
  // its own, and JS block comments do not nest — the first `*/` inside would end
  // the outer one and leave the rest as live code.
  //
  // The beneficiary the FORM is editing, which is not the same question as which
  // one is open in the detail.
  //
  // They were one id until the row's menu grew an Edit of its own: pointing the
  // form at a beneficiary by selecting it also opened the detail, so Edit raised
  // two drawers at once. Two ids, because there are two things being asked —
  // "whose record is being read" and "whose record is being changed". Editing
  // FROM the detail sets both, which is what leaves the detail underneath.
  //
  // const [editingId, setEditingId] = useState<string | null>(null);
  // const editing = beneficiaries.find((b) => b.id === editingId) ?? null;
  //
  // The form drawer. Open with `editingId` is an edit; open without one is an
  // add.
  //
  // const [formOpen, setFormOpen] = useState(false);
  //
  // const openAdd = () => {
  //   setEditingId(null);
  //   setFormOpen(true);
  // };
  //
  // Edit straight from the row's menu — the form, and nothing else. Only
  // `editingId` is set, so the detail stays shut: a menu item named Edit that
  // also threw the record open behind the form was the bug this pair of ids was
  // split to fix.
  //
  // const openEdit = (beneficiary: PlanholderBeneficiary) => {
  //   setEditingId(beneficiary.id);
  //   setFormOpen(true);
  // };
  //
  // Edit from inside the detail — the form over the record being read, which
  // stays where it is so dismissing the form returns to it.
  //
  // const openEditFromDetail = () => {
  //   setEditingId(selectedId);
  //   setFormOpen(true);
  // };
  //
  // const closeForm = () => setFormOpen(false);

  const count = beneficiaries.length;

  // ─── WRITE ACTIONS (cont.) — the form's save. Both branches are here, so
  // restoring returns adding and editing together.
  //
  // Save the drawer — an add when nothing is being edited, otherwise an edit.
  //
  // const handleSave = (
  //   values: BeneficiaryFormValues,
  //   payouts: BeneficiaryPayout[],
  // ) => {
  //   const lastName = values.lastName.trim();
  //   const firstName = values.firstName.trim();
  //   // Guard the two fields the row is identified by; the rest can be filled in
  //   // later without leaving a blank row behind.
  //   if (!lastName || !firstName) {
  //     toast.error("First name and last name are required");
  //     return;
  //   }
  //
  //   const middleName = values.middleName.trim();
  //   const suffix = values.suffix.trim();
  //   // The row displays the assembled name, so build it the same way every
  //   // other name in claims is built rather than concatenating here.
  //   const name = toFullName({
  //     firstName,
  //     middleName: middleName || undefined,
  //     lastName,
  //     suffix: suffix || undefined,
  //   });
  //
  //   const parts = {
  //     lotBldgUnit: values.lotBldgUnit.trim(),
  //     street: values.street.trim(),
  //     barangay: values.barangay.trim(),
  //     district: values.district.trim(),
  //     city: values.city.trim(),
  //     province: values.province.trim(),
  //     zipCode: values.zipCode.trim(),
  //   };
  //
  //   const patch = {
  //     name,
  //     lastName,
  //     firstName,
  //     middleName,
  //     suffix,
  //     // Age is never typed — it follows from the date of birth.
  //     age: ageFromBirthDateISO(values.birthDate),
  //     birthDateISO: values.birthDate,
  //     relation: values.relation || "—",
  //     // Assembled the same way `Address.formatted` does, so an edited address
  //     // reads identically to one that came off a Person record.
  //     address: [
  //       [parts.lotBldgUnit, parts.street].filter(Boolean).join(" "),
  //       parts.barangay ? `Brgy. ${parts.barangay}` : "",
  //       parts.district,
  //       parts.city,
  //       parts.province,
  //     ]
  //       .filter(Boolean)
  //       .join(", "),
  //     ...parts,
  //     payouts,
  //   };
  //
  //   if (editing) {
  //     setBeneficiaries((prev) =>
  //       prev.map((b) => (b.id === editing.id ? { ...b, ...patch } : b)),
  //     );
  //     toast.success(`${name} updated`);
  //   } else {
  //     setBeneficiaries((prev) => [
  //       // No Person row for one added in-session — hence the generated id and
  //       // the empty personId.
  //       { id: `BF-LOCAL-${Date.now()}`, personId: "", ...patch },
  //       ...prev,
  //     ]);
  //     toast.success(`${name} added`);
  //   }
  //
  //   // The form closes, but the detail underneath stays open — it re-reads the
  //   // list by id, so an edit is visible the moment the form is dismissed.
  //   closeForm();
  // };
  //
  // Write the selected beneficiary's payout channels back to the list. The
  // detail drawer registered channels without going through the edit form, so
  // this was the only path that touched `payouts` on its own.
  //
  // const handlePayoutsChange = (payouts: BeneficiaryPayout[]) => {
  //   if (!selectedId) return;
  //   setBeneficiaries((prev) =>
  //     prev.map((b) => (b.id === selectedId ? { ...b, payouts } : b)),
  //   );
  // };
  //
  // Confirm, then drop the beneficiary from the list. Shared by the row's swipe
  // and the detail drawer's Delete — a beneficiary is never removed without
  // asking. Resolves whether it was actually removed, which is what holds a
  // swiped row open while the confirmation is up.
  //
  // const handleRemove = async (
  //   beneficiary: PlanholderBeneficiary,
  // ): Promise<boolean> => {
  //   const confirmed = await messageBox({
  //     title: "REMOVE BENEFICIARY",
  //     message: `Remove ${beneficiary.name} from this plan's declared beneficiaries?`,
  //     confirmText: "Remove",
  //     variant: "confirmation",
  //   });
  //   if (!confirmed) return false;
  //
  //   setBeneficiaries((prev) => prev.filter((b) => b.id !== beneficiary.id));
  //   toast.success(`${beneficiary.name} removed`);
  //   // Nothing may be left open on a beneficiary that is gone — the detail if
  //   // it was the one being read, the form if it was the one being changed.
  //   // The two are asked separately because they can now be different people:
  //   // the card's menu edits without opening the detail.
  //   if (selectedId === beneficiary.id) closeDetail();
  //   if (editingId === beneficiary.id) closeForm();
  //   return true;
  // };
  // ─── END WRITE ACTIONS

  return (
    <Box>
      {/* ADD — commented out for claims; see the note on the component. The
          heading takes no action now, which is what leaves the section reading
          as a list of what was declared rather than a list being built.

          action={
            // Ghost, matching the other section-heading controls (Add Document,
            // Add Note): a heading stays quiet next to its own content.
            <TertiarySmButton onClick={openAdd}>
              <LuPlus /> Add Beneficiary
            </TertiarySmButton>
          } */}
      <PlanholderSectionHeader
        title="Beneficiaries"
        subtitle="Declared by the plan holder on this plan"
      />

      <Box>
        {count === 0 ? (
          // The shared empty state — see the note in `PlanholderClaimRequests`.
          <EmptyStateCard
            title="No beneficiaries yet"
            description="People the plan holder declared on this plan will appear here."
          />
        ) : (
          <VStack align="stretch" gap={2}>
            {beneficiaries.map((beneficiary) => (
              <BeneficiaryCard key={beneficiary.id} beneficiary={beneficiary} />
            ))}
          </VStack>
        )}
      </Box>

      {/* THE ROW AND ITS DETAIL — replaced by the card above, which shows what
          the drawer showed. `BeneficiaryRow` and
          `PlanholderBeneficiaryDetailDrawer` are both untouched and still
          exported; this is all that stood between them and working again.

          Note that the row carries the swipe-to-remove gesture, so restoring
          removal means restoring the row as well as `handleRemove`.

          <BeneficiaryRow
            key={beneficiary.id}
            beneficiary={beneficiary}
            onClick={() => openDetail(beneficiary)}
            onRequestRemove={() => handleRemove(beneficiary)}
            onEdit={() => openEdit(beneficiary)}
          />

          <PlanholderBeneficiaryDetailDrawer
            beneficiary={selected}
            open={selected !== null}
            onClose={closeDetail}
            onEdit={openEditFromDetail}
            onDelete={() => {
              if (selected) void handleRemove(selected);
            }}
            onPayoutsChange={handlePayoutsChange}
          /> */}

      {/* ADD / EDIT — the form drawer. Commented out for claims; see the note on
          the component. `PlanholderBeneficiaryDrawer` is untouched and still
          exported, so this is the only thing standing between it and working
          again.

          The form — reached from Add, from a card's menu, or from the detail's
          Edit. It reads `editing`, never the selection, so it opens over the
          detail when that is where it was called from and on its own when it
          was not. Removal is not offered here: the detail, the card's menu and
          the row's swipe own it.

          <PlanholderBeneficiaryDrawer
            beneficiary={editing}
            open={formOpen}
            onClose={closeForm}
            onSave={handleSave}
          /> */}
    </Box>
  );
}

export default PlanholderBeneficiaries;
