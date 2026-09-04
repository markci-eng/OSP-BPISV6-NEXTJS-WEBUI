"use client";

// `/claims/service-payables/for-verification` — the queue of billings that have
// been put through and are waiting to be checked.
//
// THE SCREEN IS `ProcessorWorkspace`, which For Approval is too: they are the
// same page over two stages, and the note at the top of that file has the whole
// of why — including why a queue is named one step ahead of the billings in it,
// which is what `stage` says here.
//
// What is left in this file is what is genuinely this route's: which stage it
// reads, what it is called, and the words it uses for the act it is waiting on.

import { ProcessorWorkspace } from "../components/ProcessorWorkspace";

export { PROCESSOR_PARAM } from "../components/ProcessorWorkspace";

export default function ForVerificationPage() {
  return (
    <ProcessorWorkspace
      stage="processed"
      title="For Verification"
      description="Billings that have been put through, and the plans terminated into them."
      action="verify"
      awaiting="awaiting verification"
    />
  );
}
