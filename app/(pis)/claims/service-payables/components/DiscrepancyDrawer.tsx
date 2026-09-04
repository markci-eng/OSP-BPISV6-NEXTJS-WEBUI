"use client";

// What is holding this service, in full — the old screen's "View Deficiency",
// pointed at the thing that actually holds one.
//
// A drawer for the reason the SOA is one: the record beside it is a form being
// filled in, and pushing every field half a screen down to read why a service
// cannot be paid loses the user's place to answer a question they asked in
// passing.
//
// IT OPENS ON A DISCREPANCY AND NOTHING ELSE (user-confirmed 2026-08-25). An
// account that violates the rules and should not have been served is the one
// state on this record that somebody outside this department has to be TOLD
// about — so it is the one that gets View and Send. A requirement not yet
// complied with is chased through the documents on the record itself; it holds
// nothing and it interrupts nothing.
//
// THE CORRECTION IS NOT MADE HERE either. A discrepancy is put right in a module
// that does not exist yet, so this drawer reads it out and sends it on; nothing
// in this workspace claims to have fixed it.

import { useEffect } from "react";
import { Box, Drawer, Flex, Portal, Text } from "@chakra-ui/react";
import { LuCircleAlert, LuSend } from "react-icons/lu";
import { formatFiledDate } from "../../../data";
import { DetailCard } from "../../components/detail-card";
import { GroupLabel } from "../../components/group-label";
import { DrawerPageHeader } from "../../planholder/components/DrawerPageHeader";
import {
  DISCREPANCY_KIND_LABELS,
  deceasedName,
  type ServiceDiscrepancy,
  type ServiceRecord,
} from "../service-payables-data";
import type { ServiceNotice } from "../service-documents-store";

/** The red every discrepancy in this module is drawn in. */
const DISCREPANCY_ACCENT = "#e11d48";

/** The discrepancy itself, read out. */
function DiscrepancyEntry({
  discrepancy,
  branchName,
}: {
  discrepancy: ServiceDiscrepancy;
  branchName: string;
}) {
  return (
    <Flex
      align="flex-start"
      gap={2.5}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={3}
      py="10px"
    >
      <Box mt="2px" color={DISCREPANCY_ACCENT} flexShrink={0}>
        <LuCircleAlert size={16} />
      </Box>
      <Box minW={0} flex="1">
        <Text fontSize="sm" fontWeight="600" color="gray.800">
          {DISCREPANCY_KIND_LABELS[discrepancy.kind]}
        </Text>
        <Text fontSize="xs" color="gray.600" mt={1} lineHeight="1.6">
          {discrepancy.reason}.
        </Text>
        {/* THE NAME THE CHAPEL SENT, against the one on file — the two lines a
            name discrepancy is reconciled from, and the whole reason the source
            table keeps its own copy of the plan holder's name. */}
        {discrepancy.endorsedName && (
          <Text fontSize="11px" color="gray.500" mt={1.5}>
            Endorsed as {discrepancy.endorsedName}
          </Text>
        )}
        {/* WHO TO RING, when the plan was serviced somewhere else first. The
            correction is a conversation with that branch. */}
        {discrepancy.claimedByBranchCode && (
          <Text fontSize="11px" color="gray.500" mt={1.5}>
            Earlier claim at {discrepancy.claimedByBranchCode}
          </Text>
        )}
        <Text fontSize="11px" color="gray.500" mt="6px">
          Raised {formatFiledDate(discrepancy.raisedAtISO)} · answered by{" "}
          {branchName}
        </Text>
      </Box>
    </Flex>
  );
}

export interface DiscrepancyDrawerProps {
  service: ServiceRecord;
  /**
   * The discrepancy to read out.
   *
   * OPTIONAL so the caller can keep this mounted unconditionally — an overlay
   * unmounted while it is closing can leave the page unclickable. A service with
   * none never opens it, and the body renders nothing if one somehow does.
   */
  discrepancy?: ServiceDiscrepancy;
  /** The last notice sent for this service, if one has been. */
  notice?: ServiceNotice;
  /** The branch a notice goes to — named even before one is sent. */
  branchName: string;
  open: boolean;
  onClose: () => void;
}

export function DiscrepancyDrawer({
  service,
  discrepancy,
  notice,
  branchName,
  open,
  onClose,
}: DiscrepancyDrawerProps) {
  // Safety net for Chakra v3 (zag-js) leaving `pointer-events: none` /
  // `data-inert` on <body> after a modal closes — the same guard every overlay
  // in this module carries.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <Drawer.Positioner>
          <Drawer.Content
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <DrawerPageHeader
              title="Discrepancy"
              description={`${service.lpaNo} · ${deceasedName(service)}`}
              onBack={onClose}
            />

            <Box flex="1" overflowY="auto" px={4} py={5}>
              {discrepancy && (
                <DetailCard>
                  <GroupLabel>What is wrong</GroupLabel>
                  <DiscrepancyEntry
                    discrepancy={discrepancy}
                    branchName={branchName}
                  />
                  {/* WHERE IT GETS PUT RIGHT, said plainly rather than implied
                      by the absence of a button. A processor who has read this
                      needs to know that the next move is somewhere else — not
                      that they have missed a control. */}
                  <Text
                    fontSize="11px"
                    color="gray.500"
                    mt={2.5}
                    lineHeight="1.6"
                  >
                    The account is corrected outside this workspace. Nothing here
                    resolves it; the notice is how the branch is told.
                  </Text>
                </DetailCard>
              )}

              <Box mt={4}>
                <DetailCard>
                  <GroupLabel>Notice</GroupLabel>
                  {notice ? (
                    <Flex align="flex-start" gap={2.5}>
                      <Box mt="2px" color="gray.400" flexShrink={0}>
                        <LuSend size={15} />
                      </Box>
                      <Box minW={0}>
                        <Text fontSize="sm" color="gray.800">
                          Sent to {branchName}
                        </Text>
                        <Text fontSize="11px" color="gray.500" mt="1px">
                          {formatFiledDate(notice.sentAtISO)} · by{" "}
                          {notice.sentBy}
                        </Text>
                        {/* Said here as well as in the toast, because this is
                            the panel somebody opens a week later to check
                            whether the branch was ever told. */}
                        <Text fontSize="11px" color="gray.400" mt={1.5}>
                          Recorded in this session only — there is no outbound
                          channel wired into this area yet.
                        </Text>
                      </Box>
                    </Flex>
                  ) : (
                    <Text fontSize="xs" color="gray.500" lineHeight="1.6">
                      Nothing has been sent yet. Send notifies {branchName}, the
                      branch that handled the claim.
                    </Text>
                  )}
                </DetailCard>
              </Box>
            </Box>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default DiscrepancyDrawer;
