"use client";

// PAYEE'S INFORMATION — who gets paid, and how much.
//
// The section from the claim detail drawer, as a component any claims screen
// can place. Lives here rather than under one dashboard because two of them
// show it now. Not a copy of it: the
// row, the add sheet and the detail sheet are all that page's own components,
// and the one piece of logic that could have drifted — how a filled-in form
// becomes a payee row — was pulled into `claimPayeeFromForm` so both callers
// build the same thing.
//
// PER CLAIM, and the only section on this page besides the notes and the folder
// that is. Everything above it belongs to the plan holder and reads the same
// whichever of their claims was picked; a payee is filed AGAINST a claim, and a
// different claim of the same person can name someone else entirely.
//
// WHAT IT CAN DO is what the drawer can: add one, open one to read the payout
// details, swipe a row to remove it. Removal is local for now — there is no
// write path to the data layer yet, so a reload brings the seed back. Same
// caveat the drawer carries.

import { useEffect, useState } from "react";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { LuFolderOpen, LuPlus } from "react-icons/lu";
import { toast } from "sonner";
import { TertiarySmButton, useMessageDialog } from "osp-ui-kit";
import type { BeneficiaryPayout, ClaimPayee } from "../claims-data";
import { getClaimPayeesForRequest } from "../claims-data";
import { PlanholderSectionHeader } from "../planholder/components/PlanholderSectionHeader";
import { PayeeRow } from "../planholder/components/PlanholderClaimDetail";
import { PlanholderPayeeDrawer } from "../planholder/components/PlanholderPayeeDrawer";
import {
  PlanholderPayeeAddDrawer,
  type PayeeFormValues,
} from "../planholder/components/PlanholderPayeeAddDrawer";
import { claimPayeeFromForm } from "../planholder/components/claim-payee-from-form";
import type { DeathClaim } from "../death-claim/death-claims-data";

export function ClaimPayees({ claim }: { claim: DeathClaim }) {
  const { messageBox } = useMessageDialog();

  const claimNo = claim.claimNo ?? claim.reference;

  /**
   * The payees on this claim.
   *
   * Held in state so an add or a remove shows immediately, and KEYED ON THE
   * REFERENCE rather than on the claim object: the page looks the claim up
   * fresh on every store write, so a new object arrives whenever a note is
   * added — and refetching on that would throw away a payee just added by hand.
   * Same reasoning, and the same bug avoided, as in the claim detail drawer.
   */
  const [payees, setPayees] = useState<ClaimPayee[]>([]);
  useEffect(() => {
    setPayees(getClaimPayeesForRequest(claim.reference));
  }, [claim.reference]);

  const [selected, setSelected] = useState<ClaimPayee | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  /**
   * Confirm, then drop the payee. Resolves whether it was actually removed,
   * which is what holds a swiped row open while the confirmation is up.
   *
   * Matched on `idx` + `personId`, the pair the row is keyed by: a payee has no
   * id of its own, and one record naming two people flattens into two entries
   * sharing an `idx`.
   */
  const remove = async (payee: ClaimPayee): Promise<boolean> => {
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
    if (selected?.idx === payee.idx && selected?.personId === payee.personId) {
      setSelected(null);
    }
    toast.success(`${payee.name} removed`, { description: claimNo });
    return true;
  };

  const add = (values: PayeeFormValues, payouts: BeneficiaryPayout[]) => {
    const payee = claimPayeeFromForm({
      values,
      payouts,
      claimNo,
      existingCount: payees.length,
    });
    if (!payee) {
      toast.error("First name and last name are required");
      return;
    }

    setPayees((prev) => [payee, ...prev]);
    toast.success(`${payee.name} added`, { description: claimNo });
    setAddOpen(false);
  };

  return (
    <Box>
      <PlanholderSectionHeader
        title="Payee's Information"
        action={
          <TertiarySmButton onClick={() => setAddOpen(true)}>
            <LuPlus /> Add Payee
          </TertiarySmButton>
        }
      />

      {payees.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          py={8}
          gap={3}
        >
          <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
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
              onClick={() => setSelected(payee)}
              onRequestRemove={() => remove(payee)}
            />
          ))}
        </VStack>
      )}

      {/* BOTH SHEETS ALWAYS MOUNTED, with `open` driving them — never
          `{selected && <Drawer/>}`. A dialog mounted at the moment it opens has
          left this app with the page behind it unclickable.

          `asDialog` is what makes them arrive the way this page's other
          look-ups do: a centred sheet sized to its content with a cross in the
          corner, rather than the claim drawer's full-height page. Same content,
          same form, same saves — only the chrome differs. */}
      <PlanholderPayeeDrawer
        payee={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        asDialog
      />

      <PlanholderPayeeAddDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        claimNo={claimNo}
        onSave={add}
        asDialog
      />
    </Box>
  );
}

export default ClaimPayees;
