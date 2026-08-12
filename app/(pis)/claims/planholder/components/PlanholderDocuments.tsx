"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { LuChevronRight, LuFileText, LuPlus } from "react-icons/lu";
import { toast } from "sonner";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { EmptyStateCard, useMessageDialog } from "osp-ui-kit";
import { TertiarySmButton } from "st-peter-ui";
import {
  getDocumentTypes,
  getPlanholderDocuments,
  type DocumentType,
  type PlanholderDocument,
} from "../../claims-data";
import { ScrollFade } from "../../components/scroll-fade";
import { PlanholderSectionHeader } from "./PlanholderSectionHeader";
import { PlanholderDocumentDrawer } from "./PlanholderDocumentDrawer";
import { PlanholderDocumentListDrawer } from "./PlanholderDocumentListDrawer";
import { DocumentRow } from "./DocumentRow";
import { DocumentDeficiencyRow } from "./DocumentDeficiencyRow";

/** Rows shown inline before "View all" opens the full-list drawer. */
const COLLAPSED_LIMIT = 5;

/** Which list the section is showing, when it has two. */
type DocumentTab = "documents" | "deficiencies";

/**
 * One tab of the two-list heading — the section's title AND its switch.
 *
 * Deliberately not a title with tabs under it. The section is called Documents
 * and its first tab would be called Documents; naming the same thing twice,
 * eighteen pixels apart, says there are two things there. So the tabs ARE the
 * heading: whichever is on reads as the title of what is under it, and the one
 * beside it is where the rest of the section went. It also saves the line the
 * subtitle used, which in a rail is a row of the list.
 */
function TabPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      role="tab"
      aria-selected={active}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      flexShrink={0}
      px={2.5}
      py="5px"
      borderRadius="lg"
      borderWidth="1px"
      cursor="pointer"
      transition="all 0.15s ease"
      bg={active ? "#f4faf6" : "white"}
      borderColor={active ? BRAND_COLORS.darkGreen : "gray.200"}
      _hover={{ borderColor: active ? BRAND_COLORS.darkGreen : "gray.300" }}
    >
      <Text
        fontSize="xs"
        fontWeight="600"
        lineHeight="1.3"
        whiteSpace="nowrap"
        color={active ? BRAND_COLORS.darkGreen : "gray.600"}
      >
        {label}
        {/* The count rides inside the pill rather than in a badge of its own:
            two pills, two badges and an Add button come to more controls than
            a 380px rail has room for, and the number is what a reader is
            checking the tab for anyway. */}
        <Text as="span" ml={1.5} color={active ? "green.600" : "gray.400"}>
          {count}
        </Text>
      </Text>
    </Box>
  );
}

/**
 * The rows' container: a scroll box bounded by the rail's height on a desktop,
 * and nothing at all when the section is stacked down the page.
 *
 * A wrapper rather than props on one box, because the two are different
 * elements — `ScrollFade` owns a scroller, its overscroll and its edge fades,
 * and a stacked section wants none of that around five rows.
 */
function ListFrame({
  isRail,
  children,
}: {
  isRail: boolean;
  children: React.ReactNode;
}) {
  if (!isRail) return <>{children}</>;
  return (
    // `1 1 auto`, never `flex={1}` — see the note on the same prop in
    // `PlanholderClaimRequests`. A row lifts on hover and a scroll box clips
    // what leaves it, so the shadow needs room either side; taken straight back
    // with the negative margin.
    <ScrollFade flex="1 1 auto" minH={0} px={1} mx={-1}>
      {children}
    </ScrollFade>
  );
}

/* ------------------------------ section ------------------------------ */

interface PlanholderDocumentsProps {
  /** The owner whose documents are listed. */
  personId?: string;
  onSelect?: (doc: PlanholderDocument) => void;
  /**
   * Show the section as two tabbed lists — what is on file, and what is not.
   *
   * For the CLAIM view, where the folder is what the claim is decided on and
   * "which requirements are still missing" is the question being asked of it.
   * The profile leaves it off: a plan holder's folder is a record, and a record
   * has nothing to be deficient against.
   */
  withDeficiencies?: boolean;
}

/**
 * Documents on record for a plan holder — stacked below the Claim Requests
 * section, as compact rows. Tapping a row opens its detail drawer; swiping it
 * left removes the document from the person after a confirmation.
 *
 * With {@link PlanholderDocumentsProps.withDeficiencies} it carries a second
 * list beside the first: the document types with no file on record. Both are
 * read off the SAME state, which is the point of keeping them in one component
 * — uploading from either side moves the row from one tab to the other with no
 * refetch and nothing to keep in step.
 *
 * Removal is local to this view for now — there is no write path to the data
 * layer yet, so a reload brings the document back.
 */
export function PlanholderDocuments({
  personId,
  onSelect,
  withDeficiencies = false,
}: PlanholderDocumentsProps) {
  const { messageBox } = useMessageDialog();

  // Held in state so a removal takes effect immediately.
  const [documents, setDocuments] = useState<PlanholderDocument[]>([]);
  useEffect(() => {
    setDocuments(personId ? getPlanholderDocuments(personId) : []);
  }, [personId]);

  // The document currently open in the drawer.
  const [selected, setSelected] = useState<PlanholderDocument | null>(null);
  // The full-list drawer, opened from "View all".
  const [listOpen, setListOpen] = useState(false);

  // Add-document flow: step 1 picks a document type, step 2 uploads a file.
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const pendingType = useRef<DocumentType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Only offer types the person hasn't uploaded yet — one file per type.
  //
  // This same set IS the deficiency list: a document type with no file against
  // it is a requirement not yet met. Derived rather than read, because nothing
  // in the data layer records a deficiency yet — the claim's own `isDeficient`
  // is a placeholder for the same reason. When a real list arrives it replaces
  // this one expression; the tab below already reads the shape it will return.
  const uploadedCodes = new Set(documents.map((d) => d.code));
  const availableTypes = getDocumentTypes().filter(
    (t) => !uploadedCodes.has(t.code),
  );

  // Which of the two lists is showing. Only ever "deficiencies" when the
  // section was asked for both.
  const [tab, setTab] = useState<DocumentTab>("documents");
  const onDeficiencies = withDeficiencies && tab === "deficiencies";

  /**
   * Whether this is in the profile's side rail rather than stacked down the
   * page. `xl` is where the page becomes two columns and the rail gets a height
   * of its own; see the same flag in `PlanholderClaimRequests`.
   */
  const isRail =
    useBreakpointValue({ base: false, xl: true }, { ssr: false }) ?? false;

  const count = documents.length;
  // Stacked, five rows and a "View all" into the list drawer — a fixed preview,
  // because the page below it goes on and there is no height to fit into.
  //
  // In the rail there IS one, so the cut is made by the screen instead: every
  // row is in the list, as many as fit are on it, and the rest are a scroll
  // away rather than a drawer away.
  const visible = isRail ? documents : documents.slice(0, COLLAPSED_LIMIT);
  const hidden = count - visible.length;

  const handleSelect = (doc: PlanholderDocument) => {
    setSelected(doc);
    onSelect?.(doc);
  };

  /** Confirm, then drop the document from the list. */
  const handleRemove = async (doc: PlanholderDocument): Promise<boolean> => {
    const confirmed = await messageBox({
      title: "REMOVE DOCUMENT",
      message: `Remove "${doc.name}" (${doc.fileName}) from this plan holder's records?`,
      confirmText: "Remove",
      variant: "confirmation",
    });
    if (!confirmed) return false;

    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success(`${doc.name} removed`);
    return true;
  };

  /* -------------------------- add-document flow -------------------------- */

  /** Step 1 — a document type was chosen; open the file picker for it. */
  const handlePickType = (type: DocumentType) => {
    pendingType.current = type;
    setTypePickerOpen(false);
    // Let the sheet close before the OS file dialog steals focus.
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  };

  /** Step 2 — a file was chosen; add it to the list and notify. */
  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const type = pendingType.current;
    // Reset the input so re-picking the same file still fires onChange.
    e.target.value = "";
    pendingType.current = null;
    if (!file || !type) return;

    const ext = file.name.includes(".") ? file.name.split(".").pop()! : "";
    const newDoc: PlanholderDocument = {
      id: Date.now(),
      code: type.code,
      name: type.name,
      fileName: file.name,
      format: ext.toUpperCase(),
      // Local-only preview URL — there is no write path to the data layer yet.
      url: URL.createObjectURL(file),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    toast.success(`${type.name} added`, { description: file.name });
  };

  return (
    // In the rail this is a COLUMN that flexes — see the note on the same
    // wrapper in `PlanholderClaimRequests`. Stacked, none of it applies.
    <Box
      display={{ xl: "flex" }}
      flexDirection="column"
      flex={{ xl: "1 1 auto" }}
      minH={{ xl: 0 }}
    >
      {/* One heading or the other — never a heading AND a tab saying the same
          word. See {@link TabPill}.

          Add Document is in the same place either way: the far right of the
          heading row, ghost, matching the other section-heading controls (Add
          Note, Add Payee). It adds from BOTH tabs — the type picker it opens
          lists exactly what the Deficiencies tab lists. */}
      {withDeficiencies ? (
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
              count={count}
              active={!onDeficiencies}
              onClick={() => setTab("documents")}
            />
            <TabPill
              label="Deficiencies"
              count={availableTypes.length}
              active={onDeficiencies}
              onClick={() => setTab("deficiencies")}
            />
          </Flex>
          <TertiarySmButton onClick={() => setTypePickerOpen(true)}>
            <LuPlus /> Add
          </TertiarySmButton>
        </Flex>
      ) : (
        <PlanholderSectionHeader
          title="Documents"
          subtitle="Files on record for this plan holder"
          action={
            <TertiarySmButton onClick={() => setTypePickerOpen(true)}>
              <LuPlus /> Add Document
            </TertiarySmButton>
          }
        />
      )}

      {/* Hidden input driving step 2 of the add flow. */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileChosen}
      />

      <Box
        display={{ xl: "flex" }}
        flexDirection="column"
        flex={{ xl: "1 1 auto" }}
        minH={{ xl: 0 }}
      >
        {onDeficiencies ? (
          availableTypes.length === 0 ? (
            <EmptyStateCard
              title="Nothing outstanding"
              description="Every document type on file has a file for this plan holder."
            />
          ) : (
            // The same frame the documents list uses, so switching tabs changes
            // what is listed and not how the section behaves.
            <ListFrame isRail={isRail}>
              <VStack align="stretch" gap={2}>
                {availableTypes.map((type) => (
                  <DocumentDeficiencyRow
                    key={type.code}
                    type={type}
                    onUpload={() => handlePickType(type)}
                  />
                ))}
              </VStack>
            </ListFrame>
          )
        ) : count === 0 ? (
          // The shared empty state — see the note in `PlanholderClaimRequests`.
          <EmptyStateCard
            title="No documents yet"
            description="Documents filed for this plan holder will appear here."
          />
        ) : (
          <>
            {/* In the rail the rows scroll inside the height they were given;
                stacked, the plain stack is as tall as its five rows. A row is
                swiped left to remove, so the scroller is deliberately the only
                thing that moves vertically — `ScrollFade` contains its own
                overscroll and never hands the gesture back to the page. */}
            <ListFrame isRail={isRail}>
              <VStack align="stretch" gap={2}>
                {visible.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    onClick={() => handleSelect(doc)}
                    onRequestRemove={() => handleRemove(doc)}
                  />
                ))}
              </VStack>
            </ListFrame>

            {/* Overflow lives in a dedicated list drawer (infinite scroll +
                its own Add button), so the row's swipe-to-remove is never
                fighting a horizontal pager. */}
            {hidden > 0 && (
              <Flex justify="center" pt={3}>
                <Button
                  variant="ghost"
                  size="xs"
                  borderRadius="full"
                  color="gray.600"
                  onClick={() => setListOpen(true)}
                >
                  View all {count}
                  <LuChevronRight size={13} />
                </Button>
              </Flex>
            )}
          </>
        )}
      </Box>

      {/* Full-list drawer — the whole list with infinite scroll; opens the
          document on tap, removes on swipe, and can add without closing. */}
      <PlanholderDocumentListDrawer
        documents={documents}
        open={listOpen}
        onClose={() => setListOpen(false)}
        onSelect={handleSelect}
        onRequestRemove={handleRemove}
        onAdd={() => setTypePickerOpen(true)}
      />

      <PlanholderDocumentDrawer
        document={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onRemove={async () => {
          if (!selected) return;
          // Close the drawer once the document is actually gone; a declined
          // confirmation leaves the user where they were.
          if (await handleRemove(selected)) setSelected(null);
        }}
      />

      {/* Step 1 — pick the document type, then the file dialog opens. */}
      <Drawer.Root
        open={typePickerOpen}
        onOpenChange={(e) => setTypePickerOpen(e.open)}
        placement="bottom"
      >
        <Portal>
          <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
          <Drawer.Positioner>
            <Drawer.Content
              roundedTop="2xl"
              maxH="70vh"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <Box pt={3} pb={1} display="flex" justifyContent="center">
                <Box
                  w="36px"
                  h="4px"
                  bg="gray.300"
                  borderRadius="full"
                  opacity={0.7}
                />
              </Box>
              <Drawer.Header
                pt={2}
                pb={3}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box minW={0}>
                  <Drawer.Title>
                    <Text fontWeight="bold" color={BRAND_COLORS.darkGreen}>
                      Add Document
                    </Text>
                  </Drawer.Title>
                  <Text fontSize="xs" color="gray.500">
                    Choose a document type to upload
                  </Text>
                </Box>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body pb={6} overflowY="auto">
                {availableTypes.length === 0 ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    textAlign="center"
                    py={10}
                    gap={3}
                  >
                    <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
                      <LuFileText size={24} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="gray.700">
                        All document types uploaded
                      </Text>
                      <Text fontSize="xs" color="gray.500" mt={1} maxW="280px">
                        Every document type on file already has a file for this
                        plan holder.
                      </Text>
                    </Box>
                  </Flex>
                ) : (
                <VStack align="stretch" gap={1.5}>
                  {availableTypes.map((type) => (
                    <Flex
                      key={type.code}
                      role="button"
                      tabIndex={0}
                      onClick={() => handlePickType(type)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handlePickType(type);
                        }
                      }}
                      align="center"
                      justify="space-between"
                      gap={3}
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="xl"
                      bg="white"
                      px={3}
                      py="10px"
                      cursor="pointer"
                      transition="all 0.15s ease"
                      _hover={{
                        borderColor: BRAND_COLORS.primaryGreen,
                        bg: "#f4faf6",
                      }}
                    >
                      <Flex align="center" gap={3} minW={0}>
                        <Box
                          p={2}
                          borderRadius="lg"
                          bg="#eaf5ee"
                          color={BRAND_COLORS.darkGreen}
                          flexShrink={0}
                        >
                          <LuFileText size={16} />
                        </Box>
                        <Box minW={0}>
                          <Text
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.800"
                            truncate
                          >
                            {type.name}
                          </Text>
                          <Text fontSize="11px" color="gray.500" truncate>
                            {type.code}
                          </Text>
                        </Box>
                      </Flex>
                      <LuChevronRight
                        size={16}
                        color="var(--chakra-colors-gray-400, #9ca3af)"
                      />
                    </Flex>
                  ))}
                </VStack>
                )}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
}

export default PlanholderDocuments;
