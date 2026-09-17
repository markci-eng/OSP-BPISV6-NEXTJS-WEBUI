"use client";

// The way from a plan holder to a NEW claim — the Claim Requests heading's own
// control, beside the list it adds to.
//
// That section lists claims that have been OPENED: ones with a claim no. A
// request nobody has worked yet has none, so it does not appear there, and until
// this existed the only way to open one was to go back to the death dashboard
// and find it in the "For Process" queue. A processor reading a plan holder's
// page is already looking at the person the request is about; this is the step
// they were being sent away to take.
//
// On the heading rather than in the rail beside it, which is where this first
// went: every other section on the page puts its "add one of these" control on
// its own title — Add Document, Add Note, Add Payee — and a button that fills
// this list belongs on this list, not in a column of plan-wide operations that
// do something else entirely.
//
// It is a MENU rather than a button per request: a plan can carry several
// unopened requests, and which one is being opened is a choice the processor has
// to make deliberately — the claim form is filled in against that reference and
// nothing later asks whether it was the right one.

import { useRouter } from "next/navigation";
import { Box, Menu, Portal, Text } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { TertiarySmButton } from "st-peter-ui";
import { useClaimStore } from "../../claim-store";
import { getClaimRequests, type ClaimRequest } from "../../claims-data";

/**
 * The only kind of request this can open.
 *
 * The destination is the DEATH claim form, so a Dismemberment or a Waiver of
 * Installment request must not be offered here — the form would open on a
 * reference it cannot compute, and the processor would find that out only after
 * filling it in. Those two have no create form of their own yet; when they get
 * one, this is where the branch belongs.
 */
const OPENABLE_KIND = "Death Claim";

/**
 * Requests on this plan that are waiting to be opened.
 *
 * "No claim no" is the whole test, and it is the same fact the Claim Requests
 * section filters ON rather than out: a request has one once the claim exists,
 * and a claim that exists is not one to create. The two lists are therefore
 * complements — every request on the plan is in exactly one of them.
 */
function openableRequests(lpaNo: string): ClaimRequest[] {
  return getClaimRequests(lpaNo).filter(
    (request) => !request.claimNo && request.kind === OPENABLE_KIND,
  );
}

export function PlanholderCreateClaim({ lpaNo }: { lpaNo: string }) {
  // Re-read when a claim is created, so this button drops the request it just
  // opened — and disappears when it was the last one.
  useClaimStore();
  const router = useRouter();

  const requests = openableRequests(lpaNo);

  // Nothing to open: no control. An empty one would be a button that is only
  // ever disabled, which is a worse answer than not being there — and the
  // heading's action slot takes nothing when this returns null, so the title
  // closes up rather than leaving a gap where a button was.
  if (requests.length === 0) return null;

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        {/* The same control as Add Document and Add Note — ghost, small, a
            leading plus. A heading stays quiet next to its own content, and
            this one is no louder than the others even though it is the only one
            here that is wired to anything.

            No count on the label, for the same reason: Add Document does not
            carry one, and the heading already has a count of its own beside the
            title. The waiting requests are named in the menu. */}
        <TertiarySmButton>
          <LuPlus /> Create Claim
        </TertiarySmButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="280px">
            {requests.map((request) => (
              <Menu.Item
                key={request.id}
                value={request.reference}
                onClick={() =>
                  router.push(
                    `/claims/death-claim/create/${encodeURIComponent(
                      request.reference,
                    )}`,
                  )
                }
              >
                <Box minW={0}>
                  {/* The REQUEST no, and correctly so — this is the one place
                      in the profile where it is the right number, because the
                      claim it will become does not exist yet. */}
                  <Text fontSize="sm" fontWeight="600" truncate>
                    {request.reference}
                  </Text>
                  <Text fontSize="11px" color="gray.500" truncate>
                    Filed {request.filedDisplay} · {request.requestingBranch}
                  </Text>
                </Box>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

export default PlanholderCreateClaim;
