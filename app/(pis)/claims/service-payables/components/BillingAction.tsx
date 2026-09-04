"use client";

// The one thing that can be done to the open billing, as the block at the FOOT
// of the rail: mint its number, or change one that exists.
//
// IT LIVES IN THE RAIL, under the chapel list — the same slot `RecordActions`
// takes one level down, where the plan holder list is followed by the record's
// own controls. The column keeps its job across the swap, so the action keeps
// its place in it: everything above is what you are choosing and reading, and
// the last thing you reach is the thing that acts on it.
//
// It sat directly under the territory picker for a while, above the list. The
// list is what a chapel is picked from; the button acts on the one that was
// picked, and reads better after it than over it.
//
// It was in the chapel card in the main column before that. The card is where
// the billing is READ — what is owed, to whom, for what — and pinning the
// action to the rail means it does not scroll away from a user working down a
// long table of plan holders, which is the same reasoning that put Terminate
// in the rail rather than in the form's footer.
//
// ONE CONTROL, TWO STATES, and it does not move between them. Before the
// billing is created the button offers to mint a number; after, it offers to
// change one. Splitting those across two places would make the button appear to
// jump the moment it was pressed.
//
// A SECOND CONTROL — Add Planholder, for keying a paper franchise's plan
// holders in — stands above that one, and no longer appears at all: those
// billings have left this workspace, because a franchise that submits on paper
// has no billing code to select. The branch is kept as the franchise module's
// wiring; see the note where it is rendered.
//
// WITH NO BILLING IT IS STILL HERE, disabled. The block used to be dropped
// entirely while no chapel was open — which is the whole of the page's first
// screen, before a territory has been picked — and the rail then grew a button
// out of nowhere the moment one was. A control that appears is a control the
// user has to notice; a disabled one that fills in is a control they have
// already read and are only waiting on.

import { useRef, useState } from "react";
import { Box, Button, Portal } from "@chakra-ui/react";
import { useMessageDialog } from "osp-ui-kit";
import { LuPencil, LuUserPlus } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { type ServiceBilling } from "../service-payables-data";
import {
  canAddManualService,
  useAddManualService,
} from "../use-add-manual-service";
import { canCreateBilling, useCreateBilling } from "../use-create-billing";
import { AddManualServiceDialog } from "./AddManualServiceDialog";
import { CreateBillingDialog } from "./CreateBillingDialog";

export interface BillingActionProps {
  /**
   * The open chapel's billing, or nothing when no chapel is open — which is
   * every visit before a territory has been picked, and a territory with
   * nothing left to bill. The block still renders; it just has nothing to act
   * on and says so.
   */
  billing?: ServiceBilling;
}

export function BillingAction({ billing }: BillingActionProps) {
  const createBilling = useCreateBilling();
  const addManualService = useAddManualService();
  const { messageBox } = useMessageDialog();
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);

  const created = Boolean(billing?.billingNo);
  const billable = billing ? canCreateBilling(billing) : false;
  const manual = billing ? canAddManualService(billing) : false;

  /**
   * The billing the DIALOG is built from, which is not quite the one above.
   *
   * The form has to stay mounted between openings — unmounting a Chakra v3
   * dialog in the same commit that closes it can leave `pointer-events: none`
   * on <body> and strand the page — so it cannot be dropped when `billing`
   * goes. And it does go: creating the last billing in a territory moves it out
   * of this stage, the list empties under the user, and the selection has
   * nowhere to fall to.
   *
   * Remembering the last one it had makes the prop monotonic — undefined until
   * a chapel has been opened, and never undefined again — so the dialog is
   * mounted from the first chapel onwards and closes on the billing it was
   * opened for.
   */
  const lastBilling = useRef<ServiceBilling>(undefined);
  if (billing) lastBilling.current = billing;
  const dialogBilling = billing ?? lastBilling.current;

  /**
   * PLACEHOLDER. Editing a billing is its own flow in the source system —
   * "Update Billing", against the number — and none of it exists here yet.
   *
   * The button is real all the same, because the point of this block is that it
   * reports the billing's state, and a numbered billing that offered nothing
   * would read as one that cannot be changed. Saying what is missing beats
   * hiding the affordance that says a number has been issued.
   */
  const handleEdit = () =>
    void messageBox({
      title: "UPDATE BILLING",
      message: `Billing ${billing?.billingNo} — ${billing?.chapelDesc}, ${billing?.periodLabel}. Editing a created billing is not wired up yet.`,
      confirmText: "OK",
      variant: "information",
      showCancel: false,
    });

  return (
    <Box>
      {/* THE PAPER-FRANCHISE PATH, AND IT NO LONGER OPENS FROM THIS SCREEN.
          `canAddManualService` requires a manual-franchise billing, and there
          are none here any more: a franchise that submits on paper has no
          billing code, so it has no row in this workspace to select. See the
          franchise note in `service-payables-data`. This branch is therefore
          inert, and it is kept rather than deleted because it is the working
          wiring the franchise module needs — the button, the dialog it opens
          and the write behind it — in the order that module works in: the
          billing NUMBER first, then the plan holders keyed in one at a time off
          the hard copies.

          What that module has to bring is the half this screen cannot supply: a
          billing identified by its number rather than by a code, minted against
          a mortuary code the processor searches for.

          Filled green, from when this was reachable: once the number existed,
          keying the plan holders in was the next thing to do, and Edit Billing
          beneath it dropped to outline so the block had one primary control. */}
      {manual && billing && (
        <Button
          w="full"
          mb={2}
          bg={BRAND_COLORS.primaryGreen}
          color="white"
          borderRadius="lg"
          _hover={{ bg: BRAND_COLORS.darkGreen }}
          onClick={() => setAdding(true)}
        >
          <LuUserPlus size={14} />
          Add Planholder
        </Button>
      )}

      {created ? (
        <Button
          w="full"
          variant="outline"
          borderRadius="lg"
          borderColor="gray.200"
          color="gray.700"
          onClick={handleEdit}
          _hover={{ borderColor: "gray.300", bg: "gray.50" }}
        >
          <LuPencil size={14} />
          Edit Billing
        </Button>
      ) : (
        <Button
          w="full"
          bg={BRAND_COLORS.primaryGreen}
          color="white"
          borderRadius="lg"
          _hover={{ bg: BRAND_COLORS.darkGreen }}
          onClick={() => setCreating(true)}
          // A billing with nothing billable has nothing to bill for: its
          // services are all held by a discrepancy, and a number raised against
          // zero pesos would only have to be voided. With no chapel open there
          // is not even a billing to raise one against.
          //
          // EXCEPT ON A MANUAL FRANCHISE, where an empty billing is the normal
          // starting point rather than a dead end — `canCreateBilling` owns that
          // exception, and this button is simply enabled by it.
          disabled={!billable}
        >
          Create Billing
        </Button>
      )}

      {/* NO CAPTION UNDER THE BUTTON.
          A line here used to name the billing the button acts on and what it
          would mint — which was three sentences of state, in the rail, for a
          control whose subject is already on screen twice: the chapel card
          heads the column beside it, and the row it belongs to is selected in
          the list directly below. It read as an explanation of a button that
          did not need explaining, and it was the tallest thing in the block. */}

      {/* PORTALLED TO <body>, and it must be.

          `ModalForm` does not portal itself — it renders its positioner where
          it is written — and this block lives in the rail, which is
          `position: sticky` on `xl`. Sticky ALWAYS creates a stacking context,
          whatever its z-index, so the dialog's own `z-index: 1500` stopped
          being page-wide and became "1500 within the rail". The rail is written
          FIRST in the page's grid (so that stacked, it sits above the billing),
          and the main column that follows it therefore paints on top: opening
          Create Billing drew the plan holder table straight through the middle
          of the form.

          It never happened while this dialog lived in `BillingDetail` — that is
          in the main column, with no sticky ancestor. Moving the button to the
          rail is what exposed it, and the portal is what makes the dialog
          independent of wherever the button happens to sit.

          The other overlays in this module already escape the same way: the SOA,
          record, deficiency and document-preview drawers all render inside a
          Chakra `<Portal>` of their own. `ModalForm` is the one construction
          that does not, so it gets one from the outside. */}
      <Portal>
        {/* ALWAYS MOUNTED, driven by `open` alone.

          It used to be `{creating && <CreateBillingDialog .../>}`, which meant
          the dialog was removed from the tree in the SAME commit that told it to
          close. A Chakra v3 (zag-js) dialog undoes its document-level side
          effects — the `pointer-events: none` it puts on <body>, the focus trap,
          the scroll lock — as it transitions from open to closed. Unmounted in
          that same commit, that transition never runs, and whatever it had set
          on the document can be left behind. What that looks like is a page that
          renders correctly and ignores every click.

          Nothing is lost by keeping it: the form reseeds itself whenever `open`
          becomes true, which is what "built fresh each time" actually needed.

          `dialogBilling` and not `billing`, so that "always mounted" survives
          the billing itself going away — see the note where it is worked out. */}
        {dialogBilling && (
          <CreateBillingDialog
            billing={dialogBilling}
            open={creating}
            onOpenChange={setCreating}
            onSubmit={(details) => createBilling(dialogBilling, details)}
          />
        )}

        {/* Same portal, same always-mounted rule, same remembered billing —
            see the three notes above, which apply to this dialog unchanged. */}
        {dialogBilling && (
          <AddManualServiceDialog
            billing={dialogBilling}
            open={adding}
            onOpenChange={setAdding}
            onSubmit={(submission) =>
              addManualService(dialogBilling, submission)
            }
          />
        )}
      </Portal>
    </Box>
  );
}

export default BillingAction;
