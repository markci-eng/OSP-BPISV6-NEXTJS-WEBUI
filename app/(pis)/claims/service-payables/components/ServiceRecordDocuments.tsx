"use client";

// The paperwork behind the service record: what is on file, what is still
// wanting, and whatever has been noted on the plan.
//
// TWO LISTS, ONE FACT. Documents is what has been received; Deficiency is what
// has not. They are read off the SAME state, which is why they live in one
// component: adding a document moves the row from one column to the other with
// nothing to keep in step and nothing to refetch. See
// `service-documents-store`, where the Deficiency list is DERIVED rather than
// stored for exactly that reason.
//
// THE ROWS ARE THE DEATH CLAIM'S ROWS. Same construction, same typography, same
// gesture: a tinted icon chip, the document's name at `sm`, its file underneath
// at 11px, a mark at the right — green `LuFileText` and a format pill for one
// on file, amber `LuFileWarning` and an upload arrow for one that is not. Two
// screens in the same module listing the same objects had no business drawing
// them two different ways, and the plan holder page got there first.
//
// REMOVAL DIFFERS BY LAYOUT, deliberately. Below `xl` this section is inside a
// drawer on a touch screen, and a row is swiped left — the plan holder page's
// gesture, imported from it as `SwipeToRemoveRow` rather than reimplemented.
//
// On a desktop there is no swipe. A row is TAPPED, which opens the document,
// and Delete is a button in there beside Close — see `ServiceDocumentPreview`.
// Dragging a row 64 pixels with a mouse to destroy a record somebody filed was
// the wrong door for the action behind it, and the preview is somewhere the
// user can see what they are about to delete before they do.
//
// A hand-raised deficiency has nothing to preview, so its desktop control is a
// trash button on the row. It is the only icon-button in either list, which is
// what keeps it from reading as one option among several.
//
// WHAT CHANGED FROM "SUBMITTED DOCUMENTS" / "TO BE SUBMITTED". Those were two
// read-only lists and the right-hand one was every document type in the
// company's catalogue — twenty-odd rows, most of which this service was never
// going to need. It could not be a checklist because it was not a list of
// requirements; it was a list of everything that exists.
//
// Now the right-hand column is the service's REQUIREMENTS that are outstanding,
// plus whatever has been raised by hand on top. And both columns are worked
// rather than read: a document can be added and removed, a deficiency can be
// raised for the special cases the requirement list does not carry.
//
// THE REQUIREMENT LIST IS A STAND-IN. Every service is checked against the same
// six documents, because there is no per-service requirement table in this data
// layer yet — see `REQUIRED_DOCUMENT_CODES`. Fixed rather than sampled: a list
// drawn at random per service would give the same plan holder different
// requirements each time their record was opened, which is a checklist that
// cannot be worked. The heading says it is provisional, where it is read.

import { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { EmptyStateCard, TertiarySmButton, useMessageDialog } from "osp-ui-kit";
import {
  LuFileText,
  LuFileWarning,
  LuPlus,
  LuTrash2,
  LuUpload,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { db } from "../../../data";
import { ScrollFade } from "../../components/scroll-fade";
import { SectionTitle } from "../../components/section-title";
import { toaster } from "../../components/toaster";
import { SwipeToRemoveRow } from "../../planholder/components/SwipeToRemoveRow";
import {
  REQUIRED_DOCUMENTS_RULE_PENDING,
  type ServiceRecord,
} from "../service-payables-data";
import {
  addDeficiency,
  addDocument,
  getAddableDocumentTypes,
  getRaisableDocumentTypes,
  getServiceDeficiencies,
  getServiceDocuments,
  removeDeficiency,
  removeDocument,
  useServiceDocumentsStore,
  type ServiceDeficiencyItem,
  type ServiceDocument,
} from "../service-documents-store";
import {
  AddDeficiencyDialog,
  type AddDeficiencySubmission,
} from "./AddDeficiencyDialog";
import {
  AddDocumentDialog,
  type AddDocumentSubmission,
} from "./AddDocumentDialog";
import {
  ServiceDocumentPreview,
  formatOf,
} from "./ServiceDocumentPreview";

/**
 * Tallest either list runs before it scrolls inside itself.
 *
 * A maximum, not a height: three documents take three rows' worth. It exists so
 * the two columns cannot pull the section to the length of the longer one —
 * six outstanding requirements beside one document would otherwise leave five
 * rows of white space under the document.
 */
const LIST_MAX_HEIGHT = "300px";

/** The red the deficiency panel and the territory cards already use. */
const DEFICIENCY_ACCENT = "#e11d48";

/** The file's format, as the plan holder page's document rows show it. */
function FormatPill({ format }: { format: string }) {
  return (
    <Box
      display="inline-flex"
      flexShrink={0}
      px={2}
      py="2px"
      borderRadius="full"
      fontSize="11px"
      fontWeight="semibold"
      whiteSpace="nowrap"
      bg="gray.100"
      color="gray.600"
    >
      {format}
    </Box>
  );
}

/** The tinted square a row's icon sits in — green on file, amber wanting. */
function IconChip({
  tone,
  children,
}: {
  tone: "on-file" | "wanting";
  children: React.ReactNode;
}) {
  return (
    <Box
      p={2}
      borderRadius="lg"
      flexShrink={0}
      bg={tone === "on-file" ? "#eaf5ee" : "#fdf3e3"}
      color={tone === "on-file" ? BRAND_COLORS.darkGreen : "#b45309"}
    >
      {children}
    </Box>
  );
}

/** Title over a muted second line — the body of every row in both lists. */
function RowText({
  title,
  caption,
  remarks,
}: {
  title: string;
  caption: string;
  remarks?: string;
}) {
  return (
    <Box minW={0}>
      <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
        {title}
      </Text>
      <Text fontSize="11px" color="gray.500" truncate>
        {caption}
      </Text>
      {/* Allowed to wrap rather than truncate — the same rule the dashboard's
          deficiency rows follow: a reason cut off mid-sentence is a row the user
          has to open something else to understand. */}
      {remarks && (
        <Text fontSize="11px" color="gray.500" mt="2px" lineHeight="1.5">
          {remarks}
        </Text>
      )}
    </Box>
  );
}

/* ------------------------------- frames ------------------------------- */

/**
 * The card a row is drawn on.
 *
 * On a desktop it is a plain clickable card. Below `xl` it is
 * {@link SwipeToRemoveRow}, which is the same card with the gesture and the
 * remove panel behind it — so the two layouts differ in what can be DONE to a
 * row and not in what it looks like.
 *
 * `onRequestRemove` is only reached by the swipe, and so is only ever called on
 * the narrow layout. It is required all the same rather than optional: a list
 * whose rows are removable on one layout and not the other is a decision, and
 * making the prop optional would let it be made by accident.
 */
function RowFrame({
  isDesktop,
  onClick,
  ariaLabel,
  onRequestRemove,
  children,
}: {
  isDesktop: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  onRequestRemove: () => Promise<boolean>;
  children: React.ReactNode;
}) {
  if (!isDesktop) {
    return (
      <SwipeToRemoveRow onClick={onClick} onRequestRemove={onRequestRemove}>
        {children}
      </SwipeToRemoveRow>
    );
  }

  return (
    <Box
      // Only a button when there is something to press. A document row always
      // has its preview; a special-case deficiency has nothing to open, and
      // announcing it as a button would promise an action that is not there.
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? ariaLabel : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={3}
      py="10px"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.15s ease"
      _hover={onClick ? { borderColor: "gray.300", boxShadow: "sm" } : undefined}
    >
      {children}
    </Box>
  );
}

/* ----------------------------- documents ----------------------------- */

/**
 * One document on file.
 *
 * The caption carries the CODE as well as the file, which the plan holder
 * page's row does not — there the folder is browsed by name, here it is checked
 * against a requirement list that names codes.
 *
 * Tapping it opens the preview, at every width. That is the ONLY way to delete
 * it on a desktop, and one of two below `xl` where the row also swipes.
 */
function ServiceDocumentRow({
  document,
  isDesktop,
  onOpen,
  onRequestRemove,
}: {
  document: ServiceDocument;
  isDesktop: boolean;
  onOpen: () => void;
  onRequestRemove: () => Promise<boolean>;
}) {
  return (
    <RowFrame
      isDesktop={isDesktop}
      onClick={onOpen}
      ariaLabel={`Open ${document.documentDesc}`}
      onRequestRemove={onRequestRemove}
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" gap={3} minW={0}>
          <IconChip tone="on-file">
            <LuFileText size={16} />
          </IconChip>
          <RowText
            title={document.documentDesc}
            caption={`${document.documentCode} · ${document.fileName}`}
          />
        </Flex>
        <FormatPill format={formatOf(document.fileName)} />
      </Flex>
    </RowFrame>
  );
}

/* ---------------------------- deficiencies ---------------------------- */

/**
 * The inside of a deficiency row, shared by both of its presentations.
 *
 * A required one and a hand-raised one say the same thing and must look it —
 * what differs is only what can be DONE with them, which is the frame's job
 * below and not this.
 */
function DeficiencyBody({
  deficiency,
  onWithdraw,
}: {
  deficiency: ServiceDeficiencyItem;
  /**
   * The desktop withdraw control. Omitted on the narrow layout, where the row
   * swipes instead, and on required rows, which cannot be withdrawn at all.
   */
  onWithdraw?: () => void;
}) {
  const isManual = deficiency.source === "manual";

  return (
    <Flex align="center" justify="space-between" gap={3}>
      <Flex align="center" gap={3} minW={0}>
        <IconChip tone="wanting">
          <LuFileWarning size={16} />
        </IconChip>
        <RowText
          title={deficiency.description}
          // A required one is named by its code; a hand-raised one is named by
          // the fact that somebody raised it, which is what a reader is checking
          // when they find a row the checklist did not put there.
          caption={
            isManual
              ? `${deficiency.documentCode || "Special case"} · raised by ${deficiency.raisedBy}`
              : deficiency.documentCode
          }
          remarks={deficiency.remarks}
        />
      </Flex>

      <Flex align="center" gap={1} flexShrink={0}>
        {/* Only where there is a document to submit — the plan holder page's
            upload arrow, in the place a document shows its format. A special
            case has no document behind it, so an arrow on it would offer a file
            picker for a requirement no file can answer. */}
        {deficiency.documentCode && (
          <Box className="deficiency-upload" color="gray.400">
            <LuUpload size={16} />
          </Box>
        )}

        {onWithdraw && (
          <IconButton
            aria-label={`Withdraw ${deficiency.description}`}
            // The row underneath opens the add flow; this must not also.
            onClick={(e) => {
              e.stopPropagation();
              onWithdraw();
            }}
            variant="ghost"
            size="xs"
            color="gray.400"
            _hover={{ color: DEFICIENCY_ACCENT, bg: "red.50" }}
          >
            <LuTrash2 size={14} />
          </IconButton>
        )}
      </Flex>
    </Flex>
  );
}

/**
 * One outstanding requirement, in whichever frame its source calls for.
 *
 * REQUIRED — a clickable card that opens the add flow for its document. Never
 * removable, on any layout: the requirement is the company's, and it is cleared
 * by SUBMITTING the document, not by deleting the line that says it is missing.
 *
 * MANUAL — the same card, plus a way to withdraw it, because this one WAS
 * somebody's to raise. A trash button on a desktop, the swipe below `xl`. It
 * still opens the add flow on a tap when it names a document; a special case
 * has nothing to open, so it is not a button at all.
 */
function ServiceDeficiencyRow({
  deficiency,
  isDesktop,
  onUpload,
  onWithdraw,
  onRequestWithdraw,
}: {
  deficiency: ServiceDeficiencyItem;
  isDesktop: boolean;
  onUpload: () => void;
  /** The desktop trash button. */
  onWithdraw: () => void;
  /** The narrow layout's swipe, which waits on the confirmation. */
  onRequestWithdraw: () => Promise<boolean>;
}) {
  const isManual = deficiency.source === "manual";
  const openable = Boolean(deficiency.documentCode);
  const body = (
    <DeficiencyBody
      deficiency={deficiency}
      onWithdraw={isManual && isDesktop ? onWithdraw : undefined}
    />
  );

  if (isManual) {
    return (
      <RowFrame
        isDesktop={isDesktop}
        onClick={openable ? onUpload : undefined}
        ariaLabel={`Submit ${deficiency.description}`}
        onRequestRemove={onRequestWithdraw}
      >
        {body}
      </RowFrame>
    );
  }

  // Required, and so never swipeable at any width — the frame above would give
  // it a remove gesture below `xl` that must not exist.
  return (
    <Flex
      role="button"
      tabIndex={0}
      onClick={onUpload}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onUpload();
        }
      }}
      aria-label={`Submit ${deficiency.description}`}
      direction="column"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={3}
      py="10px"
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: BRAND_COLORS.primaryGreen, bg: "#f4faf6" }}
      css={{ "&:hover .deficiency-upload": { color: BRAND_COLORS.darkGreen } }}
    >
      {body}
    </Flex>
  );
}

/* ------------------------------ section ------------------------------ */

/**
 * The scroller both lists sit in.
 *
 * `ScrollFade` rather than `overflowY="auto"`, for two reasons the plain box
 * cannot answer. A clipped list with no scrollbar looks like a list that ENDS
 * there, and the fade says otherwise at the place the reader is already
 * looking; and the rows are swiped, so the scroller must contain its own
 * overscroll rather than handing the gesture back to the page.
 *
 * The padding and the negative margin either side of it are taken straight
 * back: a row lifts on hover and a scroll box clips what leaves it, so the
 * shadow needs the room.
 */
function ListFrame({ children }: { children: React.ReactNode }) {
  return (
    <ScrollFade maxH={LIST_MAX_HEIGHT} px={1} mx={-1} pb={1}>
      <VStack align="stretch" gap={2}>
        {children}
      </VStack>
    </ScrollFade>
  );
}

export interface ServiceRecordDocumentsProps {
  service: ServiceRecord;
  /**
   * Whether this is the two-column PAGE rather than the drawer.
   *
   * HANDED DOWN rather than measured. It used to be read off an `xl` media
   * query here, on the reasoning that `xl` was where the record view swapped —
   * true at the time and no longer, now that the swap turns over on the
   * workspace's own width. Two derivations of one fact drift the moment either
   * moves, and this one had already drifted by a rendering.
   *
   * `ServiceRecordView` knows the answer outright — it is its own `asPage` —
   * so it says so.
   */
  isDesktop?: boolean;
}

export function ServiceRecordDocuments({
  service,
  isDesktop = false,
}: ServiceRecordDocumentsProps) {
  const { messageBox } = useMessageDialog();

  // Subscribe. The lists themselves are read through the store's getters, which
  // overlay this session's writes on the seed — the same read pattern
  // `service-payables-data` uses over the billing store.
  useServiceDocumentsStore();

  const planholder = db.getPlanholder(service.lpaNo);
  const personId = planholder?.personId ?? "";

  const documents = personId ? getServiceDocuments(personId) : [];
  const deficiencies = personId
    ? getServiceDeficiencies(personId, service)
    : [];

  // Which dialog is up. Both stay MOUNTED and are driven by these — never
  // conditionally rendered, which is what strands the page unclickable.
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [addDefOpen, setAddDefOpen] = useState(false);
  /**
   * The document type the add dialog opens on, set when it was opened from a
   * deficiency row rather than from the Add Document button.
   */
  const [presetCode, setPresetCode] = useState<string>();

  /**
   * The document open in the preview, held by ID rather than as a snapshot —
   * the store is the truth, and a removal has to be able to close the sheet
   * by making the lookup fail rather than by a second piece of state agreeing.
   */
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const openDocument = documents.find((d) => d.id === openDocId) ?? null;

  const openAddDocument = (code?: string) => {
    setPresetCode(code);
    setAddDocOpen(true);
  };

  /* ------------------------------ writes ------------------------------ */

  const handleAddDocument = (submission: AddDocumentSubmission) => {
    if (!personId) return;
    const added = addDocument(personId, {
      documentCode: submission.documentCode,
      file: submission.file,
    });
    toaster.create({
      type: "success",
      title: `${added.documentDesc} added`,
      description: `${service.lpaNo} · ${submission.file.name}`,
    });
  };

  /** Resolves true once the document is actually gone — what the swipe waits on. */
  const handleRemoveDocument = async (
    document: ServiceDocument,
  ): Promise<boolean> => {
    const confirmed = await messageBox({
      title: "REMOVE DOCUMENT",
      message: `Remove "${document.documentDesc}" from ${service.lpaNo}? If it is a required document it will go back to the deficiency list.`,
      confirmText: "Remove",
      variant: "confirmation",
    });
    if (!confirmed || !personId) return false;

    removeDocument(personId, document.id);
    // Whether or not the preview was the thing that asked. Closing it here
    // rather than in the button's own handler covers the swipe as well, and a
    // sheet left open over a document that no longer exists is worse than a
    // redundant state write.
    setOpenDocId(null);
    toaster.create({
      type: "success",
      title: `${document.documentDesc} removed`,
      description: service.lpaNo,
    });
    return true;
  };

  const handleAddDeficiency = (submission: AddDeficiencySubmission) => {
    if (!personId) return;
    const raised = addDeficiency(personId, submission);

    // `null` means the store refused it as a duplicate. Reported as what it is
    // rather than as a success that did not happen.
    if (!raised) {
      toaster.create({
        type: "info",
        title: "Already outstanding",
        description: `${submission.description} is already on the deficiency list.`,
      });
      return;
    }

    toaster.create({
      type: "success",
      title: "Deficiency added",
      description: `${service.lpaNo} · ${raised.description}`,
    });
  };

  const handleWithdrawDeficiency = async (
    deficiency: ServiceDeficiencyItem,
  ): Promise<boolean> => {
    const confirmed = await messageBox({
      title: "WITHDRAW DEFICIENCY",
      message: `Remove "${deficiency.description}" from the deficiency list for ${service.lpaNo}?`,
      confirmText: "Withdraw",
      variant: "confirmation",
    });
    if (!confirmed || !personId) return false;

    removeDeficiency(personId, deficiency.id);
    toaster.create({
      type: "success",
      title: "Deficiency withdrawn",
      description: `${service.lpaNo} · ${deficiency.description}`,
    });
    return true;
  };

  /* ------------------------------ render ------------------------------ */

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 6, lg: 5 }}>
        {/* ---------------------------- Documents --------------------------- */}
        <Box minW={0}>
          <SectionTitle
            title="Documents"
            subtitle={
              documents.length === 0
                ? "Nothing on file"
                : // How to act on a row, said where the rows are — and it is
                  // not the same sentence on both layouts, because it is not
                  // the same interaction. See the note at the top.
                  `${documents.length} on file · ${
                    isDesktop ? "open one to view or delete" : "swipe to remove"
                  }`
            }
            action={
              <TertiarySmButton onClick={() => openAddDocument()}>
                <LuPlus /> Add
              </TertiarySmButton>
            }
          />

          {documents.length === 0 ? (
            <EmptyStateCard
              title="No documents yet"
              description="Documents received for this service will appear here."
            />
          ) : (
            <ListFrame>
              {documents.map((document) => (
                <ServiceDocumentRow
                  key={document.id}
                  document={document}
                  isDesktop={isDesktop}
                  onOpen={() => setOpenDocId(document.id)}
                  onRequestRemove={() => handleRemoveDocument(document)}
                />
              ))}
            </ListFrame>
          )}
        </Box>

        {/* --------------------------- Deficiency --------------------------- */}
        <Box minW={0}>
          <SectionTitle
            title="Deficiency"
            subtitle={
              deficiencies.length === 0
                ? "Nothing outstanding"
                : // The stand-in is admitted in the one line that is read
                  // before the list under it — see the note at the top.
                  `${deficiencies.length} outstanding${
                    REQUIRED_DOCUMENTS_RULE_PENDING
                      ? " · provisional requirement list"
                      : ""
                  }`
            }
            action={
              <TertiarySmButton onClick={() => setAddDefOpen(true)}>
                <LuPlus /> Add
              </TertiarySmButton>
            }
          />

          {deficiencies.length === 0 ? (
            <EmptyStateCard
              title="Nothing outstanding"
              description="Everything this service was asked for has been received."
            />
          ) : (
            <ListFrame>
              {deficiencies.map((deficiency) => (
                <ServiceDeficiencyRow
                  key={deficiency.id}
                  deficiency={deficiency}
                  isDesktop={isDesktop}
                  onUpload={() => openAddDocument(deficiency.documentCode)}
                  onWithdraw={() => void handleWithdrawDeficiency(deficiency)}
                  onRequestWithdraw={() => handleWithdrawDeficiency(deficiency)}
                />
              ))}
            </ListFrame>
          )}
        </Box>
      </SimpleGrid>

      {/* A SECOND "NOTES" SECTION STOOD HERE and is gone. It listed the plan
          holder's notes — `getPlanholderNotes`, written on the plan itself —
          under a heading spelled exactly like the one `ServiceRecordNotes`
          puts a few inches above it. Two sections of the same name on one
          record is read as the page repeating itself, and the reader has to
          get as far as the subtitle to learn which set of notes they are
          looking at. The record keeps ONE Notes section, and it is the one
          that belongs to the service being worked. */}

      {/* The document, opened. Where Delete lives on a desktop; below `xl` it
          is the second way in, beside the swipe. */}
      <ServiceDocumentPreview
        document={openDocument}
        open={openDocument !== null}
        onClose={() => setOpenDocId(null)}
        onDelete={() => {
          if (openDocument) void handleRemoveDocument(openDocument);
        }}
      />

      {/* All three mounted with the section and driven by `open` — see the note
          on the state above. The type lists are recomputed each render, so a
          document added a moment ago is already gone from what they offer. */}
      <AddDocumentDialog
        types={personId ? getAddableDocumentTypes(personId) : []}
        presetCode={presetCode}
        open={addDocOpen}
        onOpenChange={setAddDocOpen}
        onSubmit={handleAddDocument}
      />

      <AddDeficiencyDialog
        types={personId ? getRaisableDocumentTypes(personId, service) : []}
        open={addDefOpen}
        onOpenChange={setAddDefOpen}
        onSubmit={handleAddDeficiency}
      />
    </Box>
  );
}

export default ServiceRecordDocuments;
