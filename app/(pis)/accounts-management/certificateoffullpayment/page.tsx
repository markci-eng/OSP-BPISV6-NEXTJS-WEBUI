"use client";

import { useMemo, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";

import { CollapsibleListLayout } from "../components/collapsible-list-layout";
import { SubmittedDocumentsCard } from "../reinstatement/components/submitted-documents-card";
import { useAddConfiscatedCofp } from "./components/add-confiscated-cofp-button";
import { CofpAddSpecialButton } from "./components/add-special-cofp-button";
import { useCofpCancelAction } from "./components/cancel-cofp-button";
import { CofpForPrintingListCard } from "./components/for-printing-list-card";
import { CofpPlanholderCard } from "./components/planholder-card";
import { CofpPrintTransmittalButton } from "./components/print-transmittal-button";
import { CofpRegionCard } from "./components/region-card";
import { CofpReplacementDecisionButtons } from "./components/replacement-decision-buttons";
import { CofpReplacementInfoCard } from "./components/replacement-info-card";
import { CofpReplacementPlanholderCard } from "./components/replacement-planholder-card";
import { CofpRequestListCard } from "./components/request-list-card";
import { useCofpReturnAction } from "./components/return-cofp-button";
import {
  COFP_BRANCHES,
  COFP_REPLACEMENT_BRANCHES,
  branchRowsOf,
  isBranchView,
  printedMemosOf,
  replacementRowsOf,
  type CofpSpecialCandidate,
} from "./data/branches";
import { planholderFor, requestsFor } from "./data/data";
import {
  COFP_REGIONS,
  COFP_SPECIAL_REQUEST,
  forPrintingOf,
} from "./data/regions";
import { replacementDetailsOf } from "./data/replacement-details";
import type {
  CofpReplacementRequest,
  CofpReplacementSource,
  CofpView,
} from "./data/types";

export default function CertificateOfFullPaymentPage() {
  // For Printing is the view on arrival (user, 2026-10-02): the rail's action
  // buttons pick which requests it lists, and Generate is gone from them.
  const [view, setView] = useState<CofpView>("FOR_PRINTING");
  const requests = useMemo(() => requestsFor(view), [view]);

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

  const selected = useMemo(
    () => requests.find((request) => request.id === selectedId),
    [requests, selectedId],
  );

  // For Printing lists regions rather than requests, under the Special Request
  // pinned at the top (user, 2026-10-05) — that one, being first, is picked on
  // arrival for the same reason the first request is.
  const [regionCode, setRegionCode] = useState(COFP_SPECIAL_REQUEST.code);
  const selectedRegion = useMemo(
    () =>
      [COFP_SPECIAL_REQUEST, ...COFP_REGIONS].find(
        (region) => region.code === regionCode,
      ),
    [regionCode],
  );
  const showsRegions = view === "FOR_PRINTING";

  // Deficient and Confiscated list branches rather than requests (user,
  // 2026-10-05) — the first is picked on arrival, as with the regions.
  const [branchCode, setBranchCode] = useState(COFP_BRANCHES[0]?.code);
  const selectedBranch = useMemo(
    () => COFP_BRANCHES.find((branch) => branch.code === branchCode),
    [branchCode],
  );
  // Printed picks from the same branches with a combo box, and shares the
  // pick; the rail then lists the branch's memos (user, 2026-10-05).

  // Certificates cancelled with Cancel COFP leave their memo for the rest of
  // the visit, and a memo with none left leaves the rail.
  const [cancelledRowIds, setCancelledRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  // Confiscated certificates sent back with Return leave the list for the rest
  // of the visit (user, 2026-10-05).
  const [returnedRowIds, setReturnedRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const memos = useMemo(
    () =>
      selectedBranch
        ? printedMemosOf(selectedBranch)
            .map((memo) => ({
              ...memo,
              rows: memo.rows.filter((row) => !cancelledRowIds.has(row.id)),
            }))
            .filter((memo) => memo.rows.length > 0)
        : [],
    [selectedBranch, cancelledRowIds],
  );
  const [memoId, setMemoId] = useState<string>();
  // The first memo stands in until one is picked, and whenever the picked one
  // is not under the branch any more.
  const selectedMemo = memos.find((memo) => memo.id === memoId) ?? memos[0];

  // Replacement lists the requests from the source pressed under its title
  // (user, 2026-10-05) — SPFC on arrival. Branch shows nothing until a branch
  // is picked from its combo box.
  const [replacementSource, setReplacementSource] =
    useState<CofpReplacementSource>("SPFC");
  const [replacementBranchCode, setReplacementBranchCode] = useState<string>();
  const replacementBranch = COFP_REPLACEMENT_BRANCHES.find(
    (branch) => branch.code === replacementBranchCode,
  );
  // Added with Add Confiscated COFP (user, 2026-10-06) — newest first, above
  // the Confiscated list, for the rest of the visit.
  const [addedConfiscated, setAddedConfiscated] = useState<
    CofpReplacementRequest[]
  >([]);
  const replacementRows = useMemo(
    () =>
      replacementSource === "CONFISCATED"
        ? [...addedConfiscated, ...replacementRowsOf("CONFISCATED")]
        : replacementRowsOf(replacementSource, replacementBranch),
    [replacementSource, replacementBranch, addedConfiscated],
  );
  const addConfiscated = (planholder: CofpSpecialCandidate) =>
    setAddedConfiscated((prev) => [
      {
        ...planholder.row,
        // Unique however often the same planholder is added.
        id: `ADDED-${planholder.lpaNo}-${prev.length + 1}`,
        dateRequested: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  const showsReplacement = view === "REPLACEMENT";
  // Under Branch the requests are listed in the rail below the combo box
  // (user, 2026-10-05), and the one picked there is drawn on the right.
  const [replacementId, setReplacementId] = useState<string>();
  const selectedReplacement = replacementRows.find(
    (row) => row.id === replacementId,
  );
  // Only under Branch — the other sources list their requests in a table.
  // Memoized: it draws the scans.
  const replacementDetails = useMemo(
    () =>
      replacementSource === "BRANCH" && selectedReplacement
        ? replacementDetailsOf(selectedReplacement)
        : undefined,
    [replacementSource, selectedReplacement],
  );

  // Pressing Branch picks the combo box's first branch, so its list shows
  // straight away (user, 2026-10-05), and that list's first request with it —
  // the same first-is-picked rule as everywhere else on the screen.
  const changeReplacementSource = (next: CofpReplacementSource) => {
    setReplacementSource(next);
    if (next !== "BRANCH") return;
    const first = COFP_REPLACEMENT_BRANCHES[0];
    setReplacementBranchCode(first?.code);
    setReplacementId(first ? replacementRowsOf("BRANCH", first)[0]?.id : undefined);
  };

  // THE LISTS' BUTTONS ARE THE KIT TABLE'S OWN (user, 2026-10-06): Cancel COFP
  // and Return run on the checked rows from its selection bar, and Add
  // Confiscated COFP sits in its toolbar. Their dialogs are drawn below.
  const cancelAction = useCofpCancelAction({
    memo: selectedMemo,
    onCancelled: (cancelled) =>
      setCancelledRowIds((prev) => {
        const next = new Set(prev);
        cancelled.forEach((row) => next.add(row.id));
        return next;
      }),
  });
  const returnAction = useCofpReturnAction({
    branchCode: selectedBranch?.code,
    onReturned: (returned) =>
      setReturnedRowIds((prev) => {
        const next = new Set(prev);
        returned.forEach((row) => next.add(row.id));
        return next;
      }),
  });
  const addConfiscatedAction = useAddConfiscatedCofp(addConfiscated);
  const confiscatedRows = useMemo(
    () =>
      view === "CONFISCATED" && selectedBranch
        ? branchRowsOf(view, selectedBranch).filter(
            (row) => !returnedRowIds.has(row.id),
          )
        : [],
    [view, selectedBranch, returnedRowIds],
  );

  return (
    <Page.Root
      title="Certificate of Full Payment"
      headerButton="menu"
      // TIGHTER THAN THE SHELL'S OWN INSET (user, 2026-09-22). `Page.Root`
      // sets `px: { base: 0, lg: "44px" }` and spreads what it is given after
      // its own values, so this overrides it: 10px, near enough flush, which
      // is what the rail and the plan holder card beside it want. Mobile
      // keeps the shell's flush edge — 360px of screen has none to give.
      px={{ base: 0, lg: "10px" }}
    >
      {/* Add Special COFP sits beside the page title under For Printing,
          above the Selected Region card (user, 2026-10-05). */}
      {showsRegions && (
        <Page.ToolContent>
          <CofpAddSpecialButton />
        </Page.ToolContent>
      )}
      {/* Print Transmittal sits beside the page title under Printed (user,
          2026-10-05), for the whole memo picked in the rail. */}
      {view === "PRINTED" && selectedBranch && (
        <Page.ToolContent>
          <CofpPrintTransmittalButton
            memo={selectedMemo}
            branchName={selectedBranch.description}
          />
        </Page.ToolContent>
      )}
      <Page.MainContent>
        {/* Rail left, plan holder right, in the same collapsible layout the
            ROP, CSV, Transfer and Reinstatement screens use (user,
            2026-10-02): 26% / 74% on desktop, stacked below it, with the
            floating button that slides the rail out so the plan holder card
            can take the full width. */}
        <CollapsibleListLayout
          list={
            <CofpRequestListCard
              requests={requests}
              view={view}
              onViewChange={changeView}
              selectedId={selectedId}
              onSelect={(request) => setSelectedId(request.id)}
              regions={COFP_REGIONS}
              specialRequest={COFP_SPECIAL_REQUEST}
              selectedRegionCode={regionCode}
              onSelectRegion={(region) => setRegionCode(region.code)}
              branches={COFP_BRANCHES}
              selectedBranchCode={branchCode}
              onSelectBranch={(branch) => setBranchCode(branch.code)}
              memos={memos}
              selectedMemoId={selectedMemo?.id}
              onSelectMemo={(memo) => setMemoId(memo.id)}
              replacementSource={replacementSource}
              onReplacementSourceChange={changeReplacementSource}
              replacementBranches={COFP_REPLACEMENT_BRANCHES}
              replacementBranchCode={replacementBranchCode}
              onSelectReplacementBranch={(branch) => {
                setReplacementBranchCode(branch.code);
                setReplacementId(undefined);
              }}
              replacementCount={replacementRows.length}
              replacementRequests={replacementRows}
              selectedReplacementId={replacementId}
              onSelectReplacementRequest={(request) =>
                setReplacementId(request.id)
              }
            />
          }
        >
          {/* The lists page through their rows (the kit table's own paging)
              rather than scrolling inside a column cut to the screen's
              height, so the column takes the height it needs. */}
          <Flex direction="column" gap={5} minW={0}>
            {showsReplacement ? (
              replacementSource === "BRANCH" ? (
                selectedReplacement && replacementDetails ? (
                  // Planholder Information in 40%, the filed papers in the
                  // rest (user, 2026-10-06) — the CSV panel's row. Stacks
                  // below `lg`. COFP Replacement Information under the pair.
                  <Flex direction="column" gap="10px" w="full" minW={0}>
                  <Flex
                    direction={{ base: "column", lg: "row" }}
                    align="stretch"
                    gap="10px"
                    w="full"
                    minW={0}
                  >
                    <Box
                      w={{ base: "100%", lg: "40%" }}
                      minW={{ lg: "280px" }}
                      flexShrink={0}
                    >
                      <CofpReplacementPlanholderCard
                        request={selectedReplacement}
                        details={replacementDetails}
                      />
                    </Box>
                    {/* Out of flow on `lg`, as on CSV, so the card sets the
                        row's height and the scan is fitted inside it. */}
                    <Box
                      flex="1"
                      minW={0}
                      w={{ base: "full", lg: "auto" }}
                      position={{ base: "static", lg: "relative" }}
                    >
                      <Box
                        position={{ base: "static", lg: "absolute" }}
                        inset={0}
                      >
                        <SubmittedDocumentsCard
                          documents={replacementDetails.documents}
                        />
                      </Box>
                    </Box>
                  </Flex>
                  <CofpReplacementInfoCard info={replacementDetails.info} />
                  <CofpReplacementDecisionButtons
                    lpaNo={selectedReplacement.lpaNo}
                  />
                  </Flex>
                ) : (
                  <Box
                    bg="white"
                    borderWidth="1px"
                    borderColor="border.muted"
                    borderRadius="md"
                    py={10}
                    textAlign="center"
                    color="gray.400"
                    fontSize="sm"
                  >
                    {replacementBranch
                      ? "Pick a request from the list to see its details."
                      : "Pick a branch to see its replacement requests."}
                  </Box>
                )
              ) : (
                <CofpForPrintingListCard
                  key={`replacement-${replacementSource}-${replacementBranch?.code ?? ""}`}
                  rows={replacementRows}
                  regionCode={replacementBranch?.code ?? replacementSource}
                  title={
                    replacementSource === "SPFC"
                      ? "Replacement Requests — SPFC"
                      : replacementSource === "CONFISCATED"
                        ? "Replacement Requests — Confiscated"
                        : `Replacement Requests — ${replacementBranch?.description}`
                  }
                  emptyMessage="No replacement requests."
                  // Print COFP Replacement, bottom right (user, 2026-10-05):
                  // prints the replacement certificates for the rows shown.
                  printLabel="Print COFP Replacement"
                  headerActions={
                    replacementSource === "CONFISCATED"
                      ? addConfiscatedAction.button
                      : undefined
                  }
                />
              )
            ) : showsRegions
              ? selectedRegion && (
                  <>
                    <Box flexShrink={0}>
                      <CofpRegionCard region={selectedRegion} />
                    </Box>
                    <CofpForPrintingListCard
                      rows={forPrintingOf(selectedRegion)}
                      regionCode={selectedRegion.code}
                    />
                  </>
                )
              : view === "PRINTED"
                ? // The certificates the picked memo carried.
                  selectedBranch && (
                    <CofpForPrintingListCard
                      key={selectedMemo?.id}
                      rows={selectedMemo?.rows ?? []}
                      regionCode={selectedBranch.code}
                      title={
                        selectedMemo
                          ? `List of Printed — ${selectedMemo.memoNo}`
                          : "List of Printed"
                      }
                      emptyMessage="No printed certificates in this branch."
                      printable={false}
                      bulkActions={[cancelAction]}
                    />
                  )
              : isBranchView(view)
                ? // The For Printing list for the picked branch, without its
                  // Print button (user, 2026-10-05). Confiscated draws the
                  // same list with a search beside its title.
                  selectedBranch &&
                  (view === "CONFISCATED" ? (
                    <CofpForPrintingListCard
                      key={`${view}-${selectedBranch.code}`}
                      rows={confiscatedRows}
                      regionCode={selectedBranch.code}
                      title="List of Confiscated COFP"
                      emptyMessage="No confiscated certificates in this branch."
                      printable={false}
                      bulkActions={[returnAction.action]}
                    />
                  ) : (
                    <CofpForPrintingListCard
                      rows={branchRowsOf(view, selectedBranch)}
                      regionCode={selectedBranch.code}
                      title="List of Deficient"
                      emptyMessage="No deficient certificates in this branch."
                      printable={false}
                    />
                  ))
                : selected && (
                    <CofpPlanholderCard planholder={planholderFor(selected)} />
                  )}
          </Flex>
        </CollapsibleListLayout>
        {returnAction.dialog}
        {addConfiscatedAction.dialog}
      </Page.MainContent>
    </Page.Root>
  );
}
