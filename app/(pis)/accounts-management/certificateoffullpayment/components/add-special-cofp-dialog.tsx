"use client";

// Add Special COFP — opened from the button beside the page title under For
// Printing (user, 2026-10-05).
//
// Search for the plan holder by LPA number or name; the hits list their LPA
// No and PH Name, and picking one fills in the Originating Branch (the plan
// holder's own branch, shown, never edited). The Preferred Branch — where the
// certificate is to go — is picked from every branch. An optional Remarks
// follows (user, 2026-10-07).
//
// Nothing is persisted: the page is handed what was picked, until there is
// somewhere to send it.

import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Portal,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { FilePlus, Search } from "lucide-react";
import {
  FloatingLabelInput,
  PrimaryMdButton,
  SecondaryMdButton,
} from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  COFP_BRANCHES,
  searchSpecialCandidates,
  type CofpSpecialCandidate,
} from "../data/branches";
import type { CofpBranch } from "../data/types";
import { BranchCombobox } from "./request-list-card";

export interface CofpSpecialRequest {
  planholder: CofpSpecialCandidate;
  /** Set whenever the dialog asks for one — Add Special COFP always does. */
  preferredBranch?: CofpBranch;
  /** Trimmed; empty when none was entered or the dialog does not ask. */
  remarks: string;
}

export interface CofpAddSpecialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (request: CofpSpecialRequest) => void;
  /** The dialog's title and its confirm button. Defaults to "Add Special COFP". */
  title?: string;
  /** The line under the title. */
  subtitle?: string;
  /**
   * Whether the Preferred Branch is asked for. Off for Add Confiscated COFP
   * (user, 2026-10-06), which only needs the planholder.
   */
  askPreferredBranch?: boolean;
  /**
   * Whether the optional Remarks is asked for. On for Add Special COFP
   * (user, 2026-10-07); off for Add Confiscated COFP.
   */
  askRemarks?: boolean;
}

/** A small uppercase heading over a group of fields. */
function GroupLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="semibold"
      color="gray.500"
      textTransform="uppercase"
      letterSpacing="wider"
    >
      {children}
    </Text>
  );
}

export function CofpAddSpecialDialog({
  open,
  onOpenChange,
  onAdd,
  title = "Add Special COFP",
  subtitle = "Find the planholder, then pick the branch it goes to",
  askPreferredBranch = true,
  askRemarks = true,
}: CofpAddSpecialDialogProps) {
  const [query, setQuery] = useState("");
  // `undefined` until a search is run, so "no matches" is only said after one.
  const [results, setResults] = useState<CofpSpecialCandidate[]>();
  const [planholder, setPlanholder] = useState<CofpSpecialCandidate>();
  const [preferredCode, setPreferredCode] = useState<string>();
  const [remarks, setRemarks] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Every opening starts blank, so a cancelled one leaves nothing behind.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults(undefined);
    setPlanholder(undefined);
    setPreferredCode(undefined);
    setRemarks("");
    setSubmitted(false);
  }, [open]);

  const search = () => {
    setResults(searchSpecialCandidates(query));
    setPlanholder(undefined);
  };

  const preferredBranch = COFP_BRANCHES.find((b) => b.code === preferredCode);

  const add = () => {
    setSubmitted(true);
    if (!planholder || (askPreferredBranch && !preferredBranch)) return;
    onAdd({
      planholder,
      preferredBranch,
      remarks: askRemarks ? remarks.trim() : "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size="lg"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <Dialog.Header pb={2}>
              <Flex align="start" gap={3} minW={0}>
                <Box color={BRAND_COLORS.primaryGreen} mt={0.5} flexShrink={0}>
                  <FilePlus size={18} />
                </Box>
                <Box minW={0}>
                  <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                    {title}
                  </Dialog.Title>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    {subtitle}
                  </Text>
                </Box>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Flex direction="column" gap={4}>
                <GroupLabel>Planholder</GroupLabel>
                <Flex gap={2} align="start">
                  <Box flex={1} minW={0}>
                    <FloatingLabelInput
                      label="Search LPA No. or Planholder Name"
                      autoFocus
                      value={query}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setQuery(e.target.value)
                      }
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          search();
                        }
                      }}
                      errorText={
                        submitted && !planholder ? "Search and pick a planholder" : undefined
                      }
                    />
                  </Box>
                  <Box flexShrink={0}>
                    <PrimaryMdButton
                      type="button"
                      onClick={search}
                      disabled={!query.trim()}
                    >
                      <Search size={16} />
                      Search
                    </PrimaryMdButton>
                  </Box>
                </Flex>

                {results && (
                  <Box
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <Grid
                      templateColumns="140px 1fr"
                      px={3}
                      py={2}
                      bg="gray.50"
                      position="sticky"
                      top={0}
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.600"
                    >
                      <Text>LPA No.</Text>
                      <Text>PH Name</Text>
                    </Grid>
                    {results.length === 0 ? (
                      <Text fontSize="sm" color="gray.500" px={3} py={3}>
                        No planholder matches.
                      </Text>
                    ) : (
                      results.map((candidate) => {
                        const picked = candidate.lpaNo === planholder?.lpaNo;
                        return (
                          <Grid
                            key={candidate.lpaNo}
                            as="button"
                            w="full"
                            textAlign="left"
                            templateColumns="140px 1fr"
                            px={3}
                            py={2}
                            fontSize="sm"
                            borderTopWidth="1px"
                            borderColor="gray.100"
                            bg={picked ? "green.50" : undefined}
                            fontWeight={picked ? "semibold" : undefined}
                            _hover={{ bg: picked ? "green.50" : "gray.50" }}
                            cursor="pointer"
                            onClick={() => setPlanholder(candidate)}
                          >
                            <Text>{candidate.lpaNo}</Text>
                            <Text truncate>{candidate.name}</Text>
                          </Grid>
                        );
                      })
                    )}
                  </Box>
                )}

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                  <FloatingLabelInput
                    label="LPA No."
                    value={planholder?.lpaNo ?? ""}
                    readOnly
                    disabled
                  />
                  <FloatingLabelInput
                    label="PH Name"
                    value={planholder?.name ?? ""}
                    readOnly
                    disabled
                  />
                </Grid>

                <GroupLabel>Branch</GroupLabel>
                <FloatingLabelInput
                  label="Originating Branch"
                  value={
                    planholder
                      ? `${planholder.branch.code} — ${planholder.branch.description}`
                      : ""
                  }
                  readOnly
                  disabled
                />
                {askPreferredBranch && (
                  <BranchCombobox
                    branches={COFP_BRANCHES}
                    value={preferredCode}
                    onChange={(branch) => setPreferredCode(branch.code)}
                    label="Preferred Branch"
                    // Kept inside the dialog, which would otherwise trap focus
                    // away from a list portalled out of it.
                    portalled={false}
                    errorText={
                      submitted && !preferredBranch ? "Required" : undefined
                    }
                  />
                )}

                {askRemarks && (
                  <>
                    <GroupLabel>Remarks (Optional)</GroupLabel>
                    <Textarea
                      size="sm"
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.currentTarget.value)}
                      placeholder="ENTER REMARKS..."
                      textTransform="uppercase"
                      _placeholder={{ color: "gray.400" }}
                    />
                  </>
                )}
              </Flex>
            </Dialog.Body>

            <Dialog.Footer gap={2}>
              <SecondaryMdButton type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </SecondaryMdButton>
              <PrimaryMdButton type="button" onClick={add}>
                {title}
              </PrimaryMdButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default CofpAddSpecialDialog;
