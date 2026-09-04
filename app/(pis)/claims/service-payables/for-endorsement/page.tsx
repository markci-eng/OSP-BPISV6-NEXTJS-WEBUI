"use client";

// `/claims/service-payables/for-endorsement` — where a billing lands once its
// number has been APPROVED, and the last of the four queues.
//
// THE ROUTE WAS `/approved-billing` (user, 2026-08-27), the last one still named
// after the STAGE a billing here is rather than after what the pile is waiting
// for. All four now read as the queue: For Process, For Verification, For
// Approval, For Endorsement. `BillingStage` keeps `approved` as the stage's own
// name — see `BILLING_QUEUE_LABELS` for why the two vocabularies are both right.
//
// AND IT IS A SCREEN NOW rather than a `StageComingSoon` placeholder. It is
// `ProcessorWorkspace`, the same component For Verification and For Approval
// are, at the stage after them: same rail, same staff picker, same stack of
// accordion cards, same record behind a row (user: "the design is similar to the
// for-approval page").
//
// WHAT IT CANNOT DO YET IS ACT. `action="endorse"` draws the approval screen
// minus its one button, because the endorsement's own act has not been described
// yet ("we will tweak later the buttons and process"). A queue that offered
// Approve here would offer to re-approve what is already approved, and a button
// invented ahead of the process it commits is the one thing harder to correct
// than a missing one. Everything else — the reading, the print, the record — is
// live. See `ProcessorWorkspaceProps.action` for where the button goes when the
// process is settled.

import { ProcessorWorkspace } from "../components/ProcessorWorkspace";

export default function ForEndorsementPage() {
  return (
    <ProcessorWorkspace
      stage="approved"
      title="For Endorsement"
      description="Billings that have been approved and are waiting to be endorsed."
      action="endorse"
      awaiting="awaiting endorsement"
    />
  );
}
