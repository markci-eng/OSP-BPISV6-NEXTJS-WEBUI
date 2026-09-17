"use client";

// THE FOLDER: what is on file, and what is still wanting, as two tabs.
//
// Two screens in claims ask the same question of the same kind of thing — the
// death claim's documents and the service record's — and they had drifted into
// two copies of one answer. Both grew the same tabbed heading on the same day
// (2026-09-11), in two files, and a heading drawn twice is a heading that
// drifts. A shape built twice is one component (user, 2026-09-17: "make the
// service payables used the same components"), which is the same rule that put
// the card, the section title and the pill in one place each.
//
// TABS AND NOT TWO COLUMNS. Both screens spent a day side by side and came back
// — see the history in `TabPill` for why a tab is the title rather than sitting
// under one. What tabs buy here is width: the showing list has the whole card
// instead of half, which is what the rows want. On the plan holder profile's
// claim rail the section is 380px, and two columns there were never possible at
// all.
//
// WHAT THIS OWNS: the heading row — the two pills, the count in each, and the
// control at the far right — the switch between the lists, and each list's
// empty state.
//
// WHAT IT DOES NOT OWN: the rows, and the frame they scroll in. Those are the
// callers', and they are genuinely different — a service document carries a code
// and a format pill and opens a preview; a plan holder's opens a drawer and
// swipes away, and its list is bounded by a rail's height rather than by a fixed
// cap. Dragging those in here would be one component with two of everything
// inside it, which is the thing being fixed and not a second helping of it.
//
// THE ADD BELONGS TO THE TAB, which is why it is per-column rather than one prop
// on the folder. On the service record the two lists are written to by two
// different acts — a document is added, a deficiency is RAISED — so the button
// changes with the tab. On the plan holder's both columns pass the same button,
// because there it really is one act.

import type { ReactNode } from "react";
import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { EmptyStateCard } from "osp-ui-kit";
import { TabPill } from "./tab-pill";

/** Which of the folder's two lists is showing. */
export type DocumentTab = "documents" | "deficiencies";

export interface FolderTab {
  /** The number on the pill. */
  count: number;
  /** The control at the far right while this tab is showing, usually an Add. */
  action?: ReactNode;
  /**
   * A line between the heading and the list — anything true of the whole list
   * that the count cannot say. The service record admits here that its
   * requirement list is provisional.
   */
  note?: ReactNode;
  /**
   * Whether the list has nothing in it. Passed rather than inferred from
   * `children` so the empty state stays this component's: it is the one part of
   * a tab that both screens word differently and lay out identically.
   */
  isEmpty: boolean;
  /** What stands in the list's place while {@link isEmpty}. */
  empty: { title: string; description: string };
  /** The list itself, in whatever frame the caller bounds it with. */
  children: ReactNode;
}

export interface DocumentFolderProps {
  documents: FolderTab;
  deficiencies: FolderTab;
  /**
   * Which list to show, when the caller drives the tabs. Omit it and the folder
   * keeps its own.
   *
   * THE SERVICE RECORD DRIVES IT because the Deficient tick on the form above
   * sends the reader to the deficiency list, and the tick and the folder are in
   * different components — so the one that holds both has to hold the tab. The
   * plan holder's folder has nothing pointing into it and keeps its own.
   */
  tab?: DocumentTab;
  /** Told when a pill is pressed. Required to drive {@link tab} usefully. */
  onTabChange?: (tab: DocumentTab) => void;
}

/**
 * The two lists, one at a time, under a heading that is the two tabs.
 *
 * IT OPENS ON DOCUMENTS, EVEN WHEN NOTHING IS ON FILE. Opening on whichever list
 * has rows in it would be a different screen for every record, and what is on
 * FILE is the first question the folder answers; the count on the other pill
 * already says whether it is worth a click.
 */
export function DocumentFolder({
  documents,
  deficiencies,
  tab: controlledTab,
  onTabChange,
}: DocumentFolderProps) {
  const [ownTab, setOwnTab] = useState<DocumentTab>("documents");
  const tab = controlledTab ?? ownTab;
  const setTab = (next: DocumentTab) => {
    onTabChange?.(next);
    if (controlledTab === undefined) setOwnTab(next);
  };

  const onDeficiencies = tab === "deficiencies";
  const showing = onDeficiencies ? deficiencies : documents;

  return (
    <Flex
      direction="column"
      flex={{ xl: "1 1 auto" }}
      minH={{ xl: 0 }}
      minW={0}
    >
      {/* `flexShrink={0}` so the heading keeps its height when the list below it
          is the thing being squeezed — in the rail this section is given a
          height rather than taking one. */}
      <Flex
        role="tablist"
        align="center"
        justify="space-between"
        gap={2}
        mb={3}
        flexShrink={0}
      >
        <Flex gap={1.5} minW={0}>
          <TabPill
            label="Documents"
            count={documents.count}
            active={!onDeficiencies}
            onClick={() => setTab("documents")}
          />
          <TabPill
            label="Deficiencies"
            count={deficiencies.count}
            active={onDeficiencies}
            onClick={() => setTab("deficiencies")}
          />
        </Flex>
        {showing.action}
      </Flex>

      {showing.note && !showing.isEmpty && (
        <Box fontSize="11px" color="gray.400" mb={2} flexShrink={0}>
          {showing.note}
        </Box>
      )}

      {showing.isEmpty ? (
        <EmptyStateCard
          title={showing.empty.title}
          description={showing.empty.description}
        />
      ) : (
        /* KEYED BY TAB so switching lists remounts the frame rather than
           reusing it. The two lists scroll independently and one of them
           swipes; a shared scroller would hand the deficiency list the
           documents list's scroll position. */
        <Flex
          key={tab}
          direction="column"
          flex={{ xl: "1 1 auto" }}
          minH={{ xl: 0 }}
        >
          {showing.children}
        </Flex>
      )}
    </Flex>
  );
}

export default DocumentFolder;
