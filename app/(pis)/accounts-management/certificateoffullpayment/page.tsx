"use client";

import { useMemo, useState } from "react";
import { Flex, Grid } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";

import { CofpDeficiencyListCard } from "./components/deficiency-list-card";
import { CofpPlanholderCard } from "./components/planholder-card";
import { CofpRequestListCard } from "./components/request-list-card";
import { deficienciesFor, planholderFor, requestsFor } from "./data/data";
import type { CofpView } from "./data/types";

export default function CertificateOfFullPaymentPage() {
  // Generate is the view on arrival (user, 2026-09-22): the rail's action
  // buttons pick which requests it lists, and raising a certificate is the
  // thing the screen is most often opened to do.
  const [view, setView] = useState<CofpView>("GENERATE");
  const requests = useMemo(() => requestsFor(view), [view]);
  // Generate's second list — the accounts it cannot raise a certificate on.
  const deficiencies = useMemo(() => deficienciesFor(view), [view]);

  // The first request is picked on arrival: the panel beside the rail has
  // nothing to say with no selection, and an empty right column reads as a
  // screen that failed to load rather than one waiting to be told what to show.
  const [selectedId, setSelectedId] = useState(requests[0]?.id);

  // The same rule when the view changes: the row that was picked is not in
  // the new list, so the first of that list takes its place. Set in the
  // handler rather than an effect, so the card never renders against a
  // request from the view it just left.
  const changeView = (next: CofpView) => {
    setView(next);
    setSelectedId(requestsFor(next)[0]?.id);
  };

  // Looked up across BOTH of the rail's lists: a deficiency row is picked the
  // same way any other is, and the card it opens is the same card — with the
  // balance and the account status carrying why the certificate cannot go out.
  const selected = useMemo(
    () =>
      requests.find((request) => request.id === selectedId) ??
      deficiencies.find((request) => request.id === selectedId),
    [requests, deficiencies, selectedId],
  );

  return (
    <Page.Root
      title="Certificate of Full Payment"
      description="Certificate of full payment."
      headerButton="menu"
      // TIGHTER THAN THE SHELL'S OWN INSET (user, 2026-09-22). `Page.Root`
      // sets `px: { base: 0, lg: "44px" }` and spreads what it is given after
      // its own values, so this overrides it: 10px, near enough flush, which
      // is what the rail and the plan holder card beside it want. Mobile
      // keeps the shell's flush edge — 360px of screen has none to give.
      px={{ base: 0, lg: "10px" }}
    >
      <Page.MainContent>
        {/* Rail left, plan holder right. Both columns start at the top so the
            rail does not stretch to whatever height the card beside it takes. */}
        <Grid
          templateColumns={{ base: "minmax(0, 1fr)", lg: "360px minmax(0, 1fr)" }}
          gap={5}
          alignItems="start"
        >
          {/* The left column is a STACK, not one card: the deficiency list is
              a card of its own under the rail, and both are the same 360px
              wide. Only Generate has one, so the column is a single card on
              every other view. */}
          <Flex direction="column" gap={5} minW={0}>
            <CofpRequestListCard
              requests={requests}
              view={view}
              onViewChange={changeView}
              selectedId={selectedId}
              onSelect={(request) => setSelectedId(request.id)}
            />

            {deficiencies.length > 0 && (
              <CofpDeficiencyListCard
                requests={deficiencies}
                selectedId={selectedId}
                onSelect={(request) => setSelectedId(request.id)}
              />
            )}
          </Flex>

          {selected && <CofpPlanholderCard planholder={planholderFor(selected)} />}
        </Grid>
      </Page.MainContent>
    </Page.Root>
  );
}
