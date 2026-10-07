"use client";

// Franchise Deductions — the royalty and loan a franchise's payable carries.
//
// ITS OWN PAGE, NOT A BUTTON ON SERVICE PAYABLES (user, 2026-10-01), because the
// person who works it is not on the service payables team and needs none of
// that screen: no queue, no accounts, no planholders — the billing, the
// mortuary, the period and the money. A processed franchise billing waits here
// (`for-deduction`) and reaches For Verification once its deduction is posted.

import { Box } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";
import { ClaimsToaster } from "../components/toaster";
import {
  SHELL_NAV_HEIGHT,
  SHELL_NAV_HIDE_EASE,
  SHELL_NAV_SHOW_EASE,
  useShellNavHidden,
} from "../components/use-shell-nav-hidden";
import { DeductionsTable } from "./components/DeductionsTable";

export default function FranchiseDeductionsPage() {
  const navHidden = useShellNavHidden();

  return (
    <>
      <Page.Root
        title="Franchise Deductions"
        description="Royalty and loan deductions on franchise billings."
        headerButton="menu"
        // THE SHELL'S 96px RESERVE, HANDED BACK ON A PHONE (user, 2026-10-05:
        // "remove the white space below it when mobile"). The bottom nav hides
        // on a downward scroll, which is how a reader reaches Post, so a fixed
        // reserve sat empty under the buttons. The box below pads for the nav
        // only while it is up — the death claim's rule. PC keeps the 96px.
        paddingBottom={{ base: 0, lg: "96px" }}
      >
        <Page.MainContent>
          <Box
            pb={{
              base: navHidden ? 4 : `calc(${SHELL_NAV_HEIGHT} + 16px)`,
              lg: 0,
            }}
            transition={`padding-bottom ${navHidden ? SHELL_NAV_HIDE_EASE : SHELL_NAV_SHOW_EASE}`}
          >
            <DeductionsTable />
          </Box>
        </Page.MainContent>
      </Page.Root>
      {/* Outside Page.Root, which drops anything that is not its own slot. */}
      <ClaimsToaster />
    </>
  );
}
