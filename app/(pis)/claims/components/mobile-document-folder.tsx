"use client";

// THE FOLDER ON A PHONE — `DocumentFolder`'s phone layout, shared by the
// service record and the death claim (user, 2026-10-01: "implement this in
// death claim document section also. Make it a component").
//
// A SUMMARY, NOT TABS (option B of the mock-up). Two rows, each with its count
// and the first names on it; the list itself in a bottom sheet with its Add at
// the foot. Tabs were ruled out because the rows already swipe left to remove,
// and a tab strip over them invites the same gesture to mean something else.
//
// AN EMPTY LIST IS NOT OPENED (user, same day): nothing to interact with, so
// the row goes straight to that list's Add.
//
// WHAT THIS DOES NOT OWN: the rows, and the Add flows. The callers' rows are
// genuinely different (see `DocumentFolder`), and so are their Adds.

import { useState, type ReactNode } from "react";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { PrimarySmButton } from "osp-ui-kit";
import {
  LuChevronRight,
  LuFileText,
  LuFileWarning,
  LuPlus,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { BottomSheet } from "./bottom-sheet";
import type { DocumentTab } from "./document-folder";
import { SectionTitle } from "./section-title";

const TONES = {
  documents: { bg: "#eaf5ee", color: BRAND_COLORS.darkGreen },
  deficiencies: { bg: "#fdf3e3", color: "#b45309" },
} as const;

export interface MobileFolderList {
  count: number;
  /** What is on the list, for the summary row's second line. */
  names: string[];
  /** The rows, as the caller draws them. */
  rows: ReactNode;
  /** The sheet's foot — "Add document", "Raise deficiency". */
  addLabel: string;
  onAdd: () => void;
  /** The summary row's second line while the list is empty. */
  emptyText: string;
  /** A line over the rows, as on `DocumentFolder`. */
  note?: ReactNode;
}

export interface MobileDocumentFolderProps {
  documents: MobileFolderList;
  deficiencies: MobileFolderList;
  /**
   * Which sheet is open, when the caller drives it — the service record does,
   * so its Deficient tick can open the deficiency sheet. Omit it and the
   * folder keeps its own.
   */
  sheet?: DocumentTab | null;
  onSheetChange?: (sheet: DocumentTab | null) => void;
}

/** "Official Receipt, Statement of Account +1". */
function namesOf(names: string[]): string {
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

function SummaryRow({
  tab,
  title,
  list,
  onClick,
}: {
  tab: DocumentTab;
  title: string;
  list: MobileFolderList;
  onClick: () => void;
}) {
  const tone = TONES[tab];
  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap={3}
      w="full"
      minH="56px"
      py={2}
      textAlign="left"
      cursor="pointer"
      aria-haspopup="dialog"
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "2px",
      }}
    >
      <Box p={2} borderRadius="lg" flexShrink={0} {...tone}>
        {tab === "documents" ? (
          <LuFileText size={16} />
        ) : (
          <LuFileWarning size={16} />
        )}
      </Box>
      <Box minW={0} flex="1">
        <Text fontSize="sm" fontWeight="700" color="gray.800" truncate>
          {title}
        </Text>
        <Text fontSize="xs" color="gray.500" truncate>
          {list.count ? namesOf(list.names) : list.emptyText}
        </Text>
      </Box>
      <Box
        flexShrink={0}
        px={2}
        py="2px"
        borderRadius="full"
        fontSize="13px"
        fontWeight="700"
        fontFamily="mono"
        {...(list.count ? tone : { bg: "gray.100", color: "gray.500" })}
      >
        {list.count}
      </Box>
      <Box color="gray.400" flexShrink={0}>
        <LuChevronRight size={16} />
      </Box>
    </Flex>
  );
}

export function MobileDocumentFolder({
  documents,
  deficiencies,
  sheet: controlledSheet,
  onSheetChange,
}: MobileDocumentFolderProps) {
  const [ownSheet, setOwnSheet] = useState<DocumentTab | null>(null);
  const sheet = controlledSheet === undefined ? ownSheet : controlledSheet;
  const setSheet = (next: DocumentTab | null) => {
    onSheetChange?.(next);
    if (controlledSheet === undefined) setOwnSheet(next);
  };

  // Kept after closing so the sheet does not swap lists mid-slide — the Jump
  // sheet's own trick. Set while rendering, so the first frame is right.
  const [shown, setShown] = useState<DocumentTab>("documents");
  if (sheet && sheet !== shown) setShown(sheet);

  const onDefs = shown === "deficiencies";
  const list = onDefs ? deficiencies : documents;
  const title = onDefs ? "Deficiencies" : "Documents";

  const open = (tab: DocumentTab, target: MobileFolderList) =>
    target.count ? setSheet(tab) : target.onAdd();

  return (
    <>
      <SectionTitle title="Documents" />
      <Flex direction="column" mt={-1}>
        <SummaryRow
          tab="documents"
          title="On file"
          list={documents}
          onClick={() => open("documents", documents)}
        />
        <Box borderTopWidth="1px" borderColor="gray.100" />
        <SummaryRow
          tab="deficiencies"
          title="Deficiencies"
          list={deficiencies}
          onClick={() => open("deficiencies", deficiencies)}
        />
      </Flex>

      {/* ONE SHEET FOR BOTH LISTS, pulled up from the bottom like History.
          Mounted always, `open` driving it. */}
      <BottomSheet
        title={
          <>
            {title}{" "}
            <Text as="span" color="gray.400" fontFamily="mono" fontSize="sm">
              {list.count}
            </Text>
          </>
        }
        open={sheet !== null}
        onClose={() => setSheet(null)}
        footer={
          <PrimarySmButton w="full" h="40px" minH="40px" onClick={list.onAdd}>
            <LuPlus /> {list.addLabel}
          </PrimarySmButton>
        }
      >
        {list.note && list.count > 0 && (
          <Text fontSize="11px" color="gray.400" mb={2}>
            {list.note}
          </Text>
        )}
        {list.count ? (
          <VStack align="stretch" gap={2}>
            {list.rows}
          </VStack>
        ) : (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            {onDefs ? "Nothing outstanding" : "No documents yet"}
          </Text>
        )}
      </BottomSheet>
    </>
  );
}

export default MobileDocumentFolder;
