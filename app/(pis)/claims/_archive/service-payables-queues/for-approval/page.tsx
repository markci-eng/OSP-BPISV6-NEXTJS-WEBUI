"use client";

// `/claims/service-payables/for-approval` — the queue of billings that have been
// checked and are waiting to be approved.
//
// THE ROUTE WAS `/verified-billing` (user, 2026-08-27), named after the STAGE a
// billing here is rather than after what the pile is waiting for. That was the
// last of the four still reading one step behind its own queue — the change
// `BILLING_STAGE_ROUTES` has been describing since For Verification made it, now
// made again.
//
// AND IT IS A SCREEN NOW rather than a `StageComingSoon` placeholder. It is
// `ProcessorWorkspace`, the same component For Verification is, at the stage
// after it: same rail, same staff picker, same stack of accordion cards, same
// record behind a row.
//
// ONE DIFFERENCE, AND IT IS THE POINT OF THE STAGE (user: "no checkbox in the
// table, since the approval is for billing"). Verification is a reading of
// ACCOUNTS — a verifier works down the plan holders one at a time and signs each
// off, which is what tick boxes are for. Approval is a judgement on the BILLING:
// the accounts have already been read and signed by somebody else, and an
// approver either puts the document through or does not. There is nothing to
// tick, so nothing is drawn. See `action` on `BillingAccordionCard`.

import { ProcessorWorkspace } from "../../../service-payables/components/ProcessorWorkspace";

export default function ForApprovalPage() {
  return (
    <ProcessorWorkspace
      stage="verified"
      title="For Approval"
      description="Billings that have been checked and are waiting to be approved."
      action="approve"
      awaiting="awaiting approval"
    />
  );
}
