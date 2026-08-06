"use client";

import { useEffect, useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { toast } from "sonner";
import { EmptyStateCard, useMessageDialog } from "osp-ui-kit";
import { TertiarySmButton } from "st-peter-ui";
import {
  ageFromBirthDateISO,
  getPlanholderBeneficiaries,
  toFullName,
  type BeneficiaryPayout,
  type PlanholderBeneficiary,
} from "../../claims-data";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { BeneficiaryRow } from "./BeneficiaryRow";
import { PlanholderBeneficiaryDetailDrawer } from "./PlanholderBeneficiaryDetailDrawer";
import {
  PlanholderBeneficiaryDrawer,
  type BeneficiaryFormValues,
} from "./PlanholderBeneficiaryDrawer";

/* ------------------------------ section ------------------------------ */

interface PlanholderBeneficiariesProps {
  /** The plan whose declared beneficiaries are listed (by LPA number). */
  lpaNo?: string;
}

/**
 * Beneficiaries declared on a plan — the people the plan holder named when the
 * plan was bought, listed below Payments as the same compact rows the sections
 * above use.
 *
 * These are NOT claim payees: a payee is filed against a specific claim and can
 * be someone else entirely. The details that matter here are the three a
 * beneficiary is known by — name, age, and relationship to the plan holder.
 *
 * Tapping a row opens the beneficiary's detail, which is where Delete and Edit
 * live; swiping a row left removes it after confirming, the same gesture the
 * documents list uses. Add opens the form empty. There is no write path to the
 * data layer yet, so the list is held in state and a reload restores the seed.
 */
export function PlanholderBeneficiaries({
  lpaNo,
}: PlanholderBeneficiariesProps) {
  const { messageBox } = useMessageDialog();

  // Held in state so an add/edit/remove takes effect immediately.
  const [beneficiaries, setBeneficiaries] = useState<PlanholderBeneficiary[]>(
    [],
  );
  useEffect(() => {
    setBeneficiaries(lpaNo ? getPlanholderBeneficiaries(lpaNo) : []);
  }, [lpaNo]);

  // The beneficiary open in the detail drawer. Held by id, not by value, so the
  // detail keeps showing the latest saved values after an edit rather than the
  // snapshot taken when the row was tapped.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = beneficiaries.find((b) => b.id === selectedId) ?? null;

  /**
   * The beneficiary the FORM is editing, which is not the same question as which
   * one is open in the detail.
   *
   * They were one id until the row's menu grew an Edit of its own: pointing the
   * form at a beneficiary by selecting it also opened the detail, so Edit raised
   * two drawers at once. Two ids, because there are two things being asked —
   * "whose record is being read" and "whose record is being changed". Editing
   * FROM the detail sets both, which is what leaves the detail underneath.
   */
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = beneficiaries.find((b) => b.id === editingId) ?? null;

  // The form drawer. Open with `editingId` is an edit; open without one is an
  // add.
  const [formOpen, setFormOpen] = useState(false);

  const count = beneficiaries.length;

  const openAdd = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const openDetail = (beneficiary: PlanholderBeneficiary) =>
    setSelectedId(beneficiary.id);

  /**
   * Edit straight from the row's menu — the form, and nothing else.
   *
   * Only `editingId` is set, so the detail stays shut: a menu item named Edit
   * that also threw the record open behind the form was the bug this pair of
   * ids was split to fix.
   */
  const openEdit = (beneficiary: PlanholderBeneficiary) => {
    setEditingId(beneficiary.id);
    setFormOpen(true);
  };

  /**
   * Edit from inside the detail — the form over the record being read, which
   * stays where it is so dismissing the form returns to it.
   */
  const openEditFromDetail = () => {
    setEditingId(selectedId);
    setFormOpen(true);
  };

  const closeDetail = () => setSelectedId(null);
  const closeForm = () => setFormOpen(false);

  /** Save the drawer — an add when nothing is being edited, otherwise an edit. */
  const handleSave = (
    values: BeneficiaryFormValues,
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
    // The row displays the assembled name, so build it the same way every
    // other name in claims is built rather than concatenating here.
    const name = toFullName({
      firstName,
      middleName: middleName || undefined,
      lastName,
      suffix: suffix || undefined,
    });

    const parts = {
      lotBldgUnit: values.lotBldgUnit.trim(),
      street: values.street.trim(),
      barangay: values.barangay.trim(),
      district: values.district.trim(),
      city: values.city.trim(),
      province: values.province.trim(),
      zipCode: values.zipCode.trim(),
    };

    const patch = {
      name,
      lastName,
      firstName,
      middleName,
      suffix,
      // Age is never typed — it follows from the date of birth.
      age: ageFromBirthDateISO(values.birthDate),
      birthDateISO: values.birthDate,
      relation: values.relation || "—",
      // Assembled the same way `Address.formatted` does, so an edited address
      // reads identically to one that came off a Person record.
      address: [
        [parts.lotBldgUnit, parts.street].filter(Boolean).join(" "),
        parts.barangay ? `Brgy. ${parts.barangay}` : "",
        parts.district,
        parts.city,
        parts.province,
      ]
        .filter(Boolean)
        .join(", "),
      ...parts,
      payouts,
    };

    if (editing) {
      setBeneficiaries((prev) =>
        prev.map((b) => (b.id === editing.id ? { ...b, ...patch } : b)),
      );
      toast.success(`${name} updated`);
    } else {
      setBeneficiaries((prev) => [
        // No Person row for one added in-session — hence the generated id and
        // the empty personId.
        { id: `BF-LOCAL-${Date.now()}`, personId: "", ...patch },
        ...prev,
      ]);
      toast.success(`${name} added`);
    }

    // The form closes, but the detail underneath stays open — it re-reads the
    // list by id, so an edit is visible the moment the form is dismissed.
    closeForm();
  };

  /**
   * Write the selected beneficiary's payout channels back to the list.
   *
   * The detail drawer registers channels without going through the edit form,
   * so this is the only path that touches `payouts` on its own.
   */
  const handlePayoutsChange = (payouts: BeneficiaryPayout[]) => {
    if (!selectedId) return;
    setBeneficiaries((prev) =>
      prev.map((b) => (b.id === selectedId ? { ...b, payouts } : b)),
    );
  };

  /**
   * Confirm, then drop the beneficiary from the list. Shared by the row's swipe
   * and the detail drawer's Delete — a beneficiary is never removed without
   * asking. Resolves whether it was actually removed, which is what holds a
   * swiped row open while the confirmation is up.
   */
  const handleRemove = async (
    beneficiary: PlanholderBeneficiary,
  ): Promise<boolean> => {
    const confirmed = await messageBox({
      title: "REMOVE BENEFICIARY",
      message: `Remove ${beneficiary.name} from this plan's declared beneficiaries?`,
      confirmText: "Remove",
      variant: "confirmation",
    });
    if (!confirmed) return false;

    setBeneficiaries((prev) => prev.filter((b) => b.id !== beneficiary.id));
    toast.success(`${beneficiary.name} removed`);
    // Nothing may be left open on a beneficiary that is gone — the detail if it
    // was the one being read, the form if it was the one being changed. The two
    // are asked separately because they can now be different people: the card's
    // menu edits without opening the detail.
    if (selectedId === beneficiary.id) closeDetail();
    if (editingId === beneficiary.id) closeForm();
    return true;
  };

  return (
    <Box>
      <PlanholderSectionHeader
        title="Beneficiaries"
        subtitle="Declared by the plan holder on this plan"
        action={
          // Ghost, matching the other section-heading controls (Add Document,
          // Add Note): a heading stays quiet next to its own content.
          <TertiarySmButton onClick={openAdd}>
            <LuPlus /> Add Beneficiary
          </TertiarySmButton>
        }
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
              <BeneficiaryRow
                key={beneficiary.id}
                beneficiary={beneficiary}
                onClick={() => openDetail(beneficiary)}
                onRequestRemove={() => handleRemove(beneficiary)}
                // The row's own Edit, on a desktop. Removal it already has —
                // the menu reuses `onRequestRemove`, so the swipe and the menu
                // ask the same question and drop the same record.
                onEdit={() => openEdit(beneficiary)}
              />
            ))}
          </VStack>
        )}
      </Box>

      {/* Detail — what a row opens. Delete and Edit sit at the top of it, and
          its payout section writes straight back here. */}
      <PlanholderBeneficiaryDetailDrawer
        beneficiary={selected}
        open={selected !== null}
        onClose={closeDetail}
        onEdit={openEditFromDetail}
        onDelete={() => {
          if (selected) void handleRemove(selected);
        }}
        onPayoutsChange={handlePayoutsChange}
      />

      {/* The form — reached from Add, from a card's menu, or from the detail's
          Edit. It reads `editing`, never the selection, so it opens over the
          detail when that is where it was called from and on its own when it
          was not. Removal is not offered here: the detail, the card's menu and
          the row's swipe own it. */}
      <PlanholderBeneficiaryDrawer
        beneficiary={editing}
        open={formOpen}
        onClose={closeForm}
        onSave={handleSave}
      />
    </Box>
  );
}

export default PlanholderBeneficiaries;
