// PRINT SOA — the one action behind every "Print SOA" in claims: the claim's
// plan actions, the plan holder's, and the Payments look-up (user, 2026-10-02:
// "the function is the same as the death claim print soa").
//
// One function so the day the statement is built it is built once. Until then
// it says so, naming the plan it would print.
//
// THE WHOLE STATEMENT, whatever the Payments filters show — a filtered SOA is
// not a statement of account.

import { toast } from "sonner";

export const PRINT_SOA_LABEL = "Print SOA";

export function printSoa(lpaNo: string) {
  toast.info(`${PRINT_SOA_LABEL} is not available yet`, {
    description: `LPA No. ${lpaNo}`,
  });
}
