"use client";

import * as React from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Grid,
  HStack,
  Portal,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Ban,
  Check,
  Clock,
} from "lucide-react";

import {
  type DocumentRecord,
  type TimelineType,
  booklets,
  daysTo,
  expState,
  fmt,
  fmtDate,
  getAgent,
  isActiveStatus,
  seriesLabel,
} from "../data";
import { AgentAvatar, ProgressMeter, StatusChip, TypeBadge } from "./atoms";

type Props = {
  doc: DocumentRecord | null;
  onClose: () => void;
  onReassign: (doc: DocumentRecord) => void;
  onBlock: (doc: DocumentRecord) => void;
};

const TL_ICON: Record<TimelineType, React.ElementType> = {
  assigned: Check,
  reassign: ArrowRightLeft,
  block: Ban,
  used: Clock,
  expired: AlertTriangle,
};

const TL_PALETTE: Record<TimelineType, string> = {
  assigned: "green",
  reassign: "blue",
  block: "red",
  used: "gray",
  expired: "red",
};

function KeyVal({
  label,
  value,
  mono,
  span,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  span?: boolean;
}) {
  return (
    <VStack align="start" gap={1} gridColumn={span ? "1 / -1" : undefined}>
      <Text
        fontSize="10px"
        fontWeight="600"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="0.03em"
      >
        {label}
      </Text>
      <Box fontSize="sm" color="fg" fontWeight={mono ? "600" : "medium"} fontFamily={mono ? "mono" : "body"}>
        {value}
      </Box>
    </VStack>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box px={{ base: 5, md: 6 }} py={5} borderTopWidth="1px" borderColor="border.muted">
      <Text
        fontSize="xs"
        fontWeight="700"
        color="fg"
        textTransform="uppercase"
        letterSpacing="0.04em"
        mb={3.5}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

export default function DocumentDrawer({ doc, onClose, onReassign, onBlock }: Props) {
  const placement = useBreakpointValue<"bottom" | "end">({ base: "bottom", md: "end" }) ?? "end";

  if (!doc) return null;

  const agent = getAgent(doc.agentId);
  const active = isActiveStatus(doc.status);
  const es = expState(doc.expiry);
  const canAct = active && doc.remaining > 0;
  const pct = doc.assignedQty > 0 ? Math.round((doc.remaining / doc.assignedQty) * 100) : 0;
  const timeline = doc.timeline.slice().sort((a, b) => (b.date < a.date ? -1 : 1));

  return (
    <Drawer.Root
      open={!!doc}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement={placement}
      size={placement === "bottom" ? "full" : "md"}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            maxH={placement === "bottom" ? "92vh" : undefined}
            display="flex"
            flexDirection="column"
          >
            {/* Header */}
            <Box px={{ base: 5, md: 6 }} pt={5} pb={4} borderBottomWidth="1px" borderColor="border.muted">
              <HStack align="flex-start" justify="space-between" gap={3}>
                <VStack align="start" gap={2}>
                  <Text fontFamily="mono" fontSize="lg" fontWeight="600" color="fg" letterSpacing="-0.01em">
                    {doc.code}
                  </Text>
                  <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                    {doc.control}
                  </Text>
                </VStack>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </HStack>
              <HStack gap={2} mt={3.5} flexWrap="wrap">
                <StatusChip status={doc.status} />
                <TypeBadge type={doc.type} />
              </HStack>
            </Box>

            {/* Body */}
            <Drawer.Body p={0} flex="1" overflowY="auto">
              <Section title="Document Information">
                <Grid templateColumns="1fr 1fr" gap="16px 20px">
                  <KeyVal label="Document Code" value={doc.code} mono />
                  <KeyVal label="Control Number" value={doc.control} mono />
                  <KeyVal label="Document Type" value={doc.type} />
                  <KeyVal label="Unit" value={doc.unit} />
                  <KeyVal label="Original Series" value={`${doc.origS} – ${doc.origE}`} mono />
                  <KeyVal label="Assigned Series" value={seriesLabel(doc)} mono />
                  <KeyVal
                    label="Assigned Quantity"
                    mono
                    value={`${fmt(doc.assignedQty)} ${
                      doc.unit === "Booklets"
                        ? `pcs · ${booklets(doc.assignedQty, doc.bookletSize)} bk`
                        : "pcs"
                    }`}
                  />
                  <KeyVal label="Remaining Quantity" value={`${fmt(doc.remaining)} pcs`} mono />

                  <Box gridColumn="1 / -1">
                    <HStack justify="space-between" mb={1.5}>
                      <Text
                        fontSize="10px"
                        fontWeight="600"
                        color="fg.muted"
                        textTransform="uppercase"
                        letterSpacing="0.03em"
                      >
                        Remaining of assigned
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        fontFamily="mono"
                        color={active ? "colorPalette.fg" : "fg.muted"}
                      >
                        {pct}%
                      </Text>
                    </HStack>
                    <ProgressMeter remaining={doc.remaining} total={doc.assignedQty} active={active} />
                  </Box>

                  <KeyVal
                    span
                    label="Expiry Date"
                    value={
                      <HStack gap={1.5} color={es === "expired" ? "red.600" : es === "near" ? "orange.600" : "fg"}>
                        {es !== "ok" && <AlertTriangle size={14} />}
                        <Text fontWeight={es === "ok" ? "medium" : "600"}>
                          {fmtDate(doc.expiry)}
                          {es === "near" && ` · in ${daysTo(doc.expiry)} days`}
                          {es === "expired" && " · expired"}
                        </Text>
                      </HStack>
                    }
                  />
                </Grid>
              </Section>

              <Section title="Assignment Information">
                <VStack align="stretch" gap={4}>
                  <HStack
                    gap={3}
                    p={3}
                    bg="bg.subtle"
                    borderWidth="1px"
                    borderColor="border.muted"
                    borderRadius="lg"
                  >
                    <AgentAvatar agent={agent} size={42} />
                    <Box>
                      <Text fontSize="sm" fontWeight="700" color="fg">
                        {agent.name}
                      </Text>
                      <HStack fontSize="xs" color="fg.muted" gap={2}>
                        <Text fontFamily="mono">{agent.emp}</Text>
                        <Box w="3px" h="3px" borderRadius="full" bg="border.emphasized" />
                        <Text>{agent.branch}</Text>
                      </HStack>
                    </Box>
                  </HStack>
                  <Grid templateColumns="1fr 1fr" gap="16px 20px">
                    <KeyVal label="Assigned Date" value={fmtDate(doc.assignedDate)} />
                    <KeyVal label="Assigned By" value={doc.by} />
                  </Grid>
                </VStack>
              </Section>

              <Section title="Activity Timeline">
                <VStack align="stretch" gap={0}>
                  {timeline.map((t, i) => {
                    const Icon = TL_ICON[t.type] ?? Clock;
                    const palette = TL_PALETTE[t.type] ?? "gray";
                    const last = i === timeline.length - 1;
                    return (
                      <HStack key={i} gap={3.5} align="stretch">
                        <VStack gap={0} align="center">
                          <Box
                            w="30px"
                            h="30px"
                            borderRadius="full"
                            bg="bg"
                            borderWidth="2px"
                            borderColor={`${palette}.solid`}
                            color={`${palette}.fg`}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <Icon size={14} />
                          </Box>
                          {!last && <Box w="2px" flex="1" minH="20px" bg="border.muted" my={0.5} />}
                        </VStack>
                        <Box pb={last ? 0 : 5} flex="1">
                          <Text fontSize="sm" color="fg" fontWeight="medium" lineHeight="1.45">
                            {t.text}
                          </Text>
                          <Text fontSize="xs" color="fg.muted" mt={0.5}>
                            {fmtDate(t.date)} · {t.by}
                          </Text>
                        </Box>
                      </HStack>
                    );
                  })}
                </VStack>
              </Section>
            </Drawer.Body>

            {/* Footer */}
            <HStack
              px={{ base: 5, md: 6 }}
              py={3.5}
              gap={3}
              borderTopWidth="1px"
              borderColor="border.muted"
            >
              <Button variant="outline" flex="1" disabled={!canAct} onClick={() => onReassign(doc)}>
                <ArrowRightLeft size={16} /> Reassign
              </Button>
              <Button colorPalette="red" flex="1" disabled={!canAct} onClick={() => onBlock(doc)}>
                <Ban size={16} /> Block
              </Button>
            </HStack>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
