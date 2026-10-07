"use client";

// Certificate of Insurance Coverage — COFP's For Printing and Printed process,
// cloned (user, 2026-10-06). For Printing lists regions and prints the
// Confirmations of Cover; Printed lists a branch's memos, with Print
// Transmittal in the header and Cancel COIC on the checked rows.

import { useMemo, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";

import { CollapsibleListLayout } from "../components/collapsible-list-layout";
import { CofpRegionCard } from "../certificateoffullpayment/components/region-card";
import { useCoicCancelAction } from "./components/cancel-coic-button";
import { CoicListCard } from "./components/coic-list-card";
import { CoicRailCard } from "./components/coic-rail-card";
import { CoicPrintTransmittalButton } from "./components/print-transmittal-button";
import {
  COIC_BRANCHES,
  COIC_REGIONS,
  coicForPrintingOf,
  coicPrintedMemosOf,
} from "./data/data";
import type { CoicView } from "./data/types";

export default function CertificateOfInsuranceCoveragePage() {
  const [view, setView] = useState<CoicView>("FOR_PRINTING");

  // The first region and branch are picked on arrival, as on COFP.
  const [regionCode, setRegionCode] = useState(COIC_REGIONS[0]?.code);
  const selectedRegion = COIC_REGIONS.find((region) => region.code === regionCode);
  const forPrintingRows = useMemo(
    () => (selectedRegion ? coicForPrintingOf(selectedRegion) : []),
    [selectedRegion],
  );

  const [branchCode, setBranchCode] = useState(COIC_BRANCHES[0]?.code);
  const selectedBranch = COIC_BRANCHES.find((branch) => branch.code === branchCode);

  // Certificates cancelled with Cancel COIC leave their memo for the rest of
  // the visit, and a memo with none left leaves the rail.
  const [cancelledRowIds, setCancelledRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const memos = useMemo(
    () =>
      selectedBranch
        ? coicPrintedMemosOf(selectedBranch)
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

  const cancelAction = useCoicCancelAction({
    memo: selectedMemo,
    onCancelled: (cancelled) =>
      setCancelledRowIds((prev) => {
        const next = new Set(prev);
        cancelled.forEach((row) => next.add(row.id));
        return next;
      }),
  });

  return (
    <Page.Root
      title="Certificate of Insurance Coverage"
      headerButton="menu"
      px={{ base: 0, lg: "10px" }}
    >
      {view === "PRINTED" && selectedBranch && (
        <Page.ToolContent>
          <CoicPrintTransmittalButton
            memo={selectedMemo}
            branchName={selectedBranch.description}
          />
        </Page.ToolContent>
      )}
      <Page.MainContent>
        <CollapsibleListLayout
          list={
            <CoicRailCard
              view={view}
              onViewChange={setView}
              regions={COIC_REGIONS}
              selectedRegionCode={regionCode}
              onSelectRegion={(region) => setRegionCode(region.code)}
              branches={COIC_BRANCHES}
              selectedBranchCode={branchCode}
              onSelectBranch={(branch) => setBranchCode(branch.code)}
              memos={memos}
              selectedMemoId={selectedMemo?.id}
              onSelectMemo={(memo) => setMemoId(memo.id)}
            />
          }
        >
          <Flex direction="column" gap={5} minW={0}>
            {view === "FOR_PRINTING"
              ? selectedRegion && (
                  <>
                    <Box flexShrink={0}>
                      <CofpRegionCard region={selectedRegion} />
                    </Box>
                    <CoicListCard
                      key={selectedRegion.code}
                      rows={forPrintingRows}
                      regionCode={selectedRegion.code}
                    />
                  </>
                )
              : selectedBranch && (
                  <CoicListCard
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
                )}
          </Flex>
        </CollapsibleListLayout>
      </Page.MainContent>
    </Page.Root>
  );
}
