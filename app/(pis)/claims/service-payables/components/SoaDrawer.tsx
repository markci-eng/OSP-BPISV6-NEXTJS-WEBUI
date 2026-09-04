"use client";

// The plan's Statement of Account — what the "SOA" button in the rail opens.
//
// The screen this replaces had `[-] SOA` as a toggle that expanded a panel
// inside the PH Info block. A drawer rather than an expander here, for the same
// reason the plan holder details are one: the record beside it is a form being
// filled in, and pushing every field down half a screen to read a payment
// history is losing the user's place to answer a question they asked in passing.
//
// This is REAL. The payments, the pay class each was posted under, the branch
// that took it and the plan's own totals are all on file — this reads them, it
// does not invent them.

import { useEffect } from "react";
import { Box, Drawer, Flex, Portal, SimpleGrid, Text } from "@chakra-ui/react";
import { db, formatFiledDate, type Planholder } from "../../../data";
import { DetailCard } from "../../components/detail-card";
import { GroupLabel } from "../../components/group-label";
import { InfoLabel } from "../../components/info-label";
import { DrawerPageHeader } from "../../planholder/components/DrawerPageHeader";

/** Pesos as the ledger prints them. */
function peso(amount: number | undefined): string | undefined {
  if (amount === undefined || !Number.isFinite(amount)) return undefined;
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface SoaDrawerProps {
  lpaNo: string;
  planholder?: Planholder;
  open: boolean;
  onClose: () => void;
}

export function SoaDrawer({
  lpaNo,
  planholder,
  open,
  onClose,
}: SoaDrawerProps) {
  const payments = db.getPayments(lpaNo);
  const detail = planholder?.planDetail;

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` /
  // `data-inert` stuck on <body> after a modal closes, freezing the page. The
  // query is what keeps it from firing while something else is still up.
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
              title="Statement of Account"
              description={lpaNo}
              onBack={onClose}
            />

            <Box flex="1" overflowY="auto" px={4} py={5}>
              <DetailCard>
                <GroupLabel>Plan</GroupLabel>
                <SimpleGrid columns={2} gapX={4} gapY={3}>
                  <InfoLabel
                    label="Contract Price"
                    value={peso(detail?.contractPrice)}
                  />
                  <InfoLabel label="TAP" value={peso(detail?.tap)} />
                  <InfoLabel
                    label="Total Amount Paid"
                    value={peso(detail?.totalAmountPaid)}
                  />
                  <InfoLabel label="Balance" value={peso(detail?.balance)} />
                  <InfoLabel
                    label="Installment"
                    value={peso(detail?.instAmount)}
                  />
                  <InfoLabel label="Inst. No." value={detail?.instNo} />
                  <InfoLabel
                    label="Due Date"
                    value={detail ? formatFiledDate(detail.dueDate) : undefined}
                  />
                  <InfoLabel
                    label="Last Payment"
                    value={
                      detail ? formatFiledDate(detail.lastPaymentDate) : undefined
                    }
                  />
                </SimpleGrid>
              </DetailCard>

              <Box mt={5}>
                <GroupLabel>
                  {payments.length === 1
                    ? "1 payment"
                    : `${payments.length} payments`}
                </GroupLabel>

                {payments.length === 0 ? (
                  <Box
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderStyle="dashed"
                    borderRadius="lg"
                    py={6}
                    px={3}
                    textAlign="center"
                  >
                    <Text fontSize="xs" color="gray.400">
                      No payments are on file for this plan.
                    </Text>
                  </Box>
                ) : (
                  <Flex direction="column" gap={2}>
                    {payments.map((payment) => (
                      // The OR number leads: it is what a payment is quoted by,
                      // and the one thing on the row that identifies it.
                      <Flex
                        key={payment.orNo}
                        justify="space-between"
                        align="flex-start"
                        gap={3}
                        borderWidth="1px"
                        borderColor="gray.200"
                        borderRadius="lg"
                        bg="white"
                        px={3}
                        py={2.5}
                      >
                        <Box minW={0}>
                          <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="gray.800"
                            truncate
                          >
                            {payment.orNo}
                          </Text>
                          <Text fontSize="11px" color="gray.500" truncate>
                            {formatFiledDate(payment.orDateISO)} ·{" "}
                            {payment.payClassName}
                          </Text>
                          <Text fontSize="10px" color="gray.400" truncate>
                            {payment.branchCode}
                          </Text>
                        </Box>
                        <Text
                          fontSize="xs"
                          fontWeight="700"
                          color="gray.800"
                          whiteSpace="nowrap"
                        >
                          {peso(payment.amount)}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Box>
            </Box>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default SoaDrawer;
