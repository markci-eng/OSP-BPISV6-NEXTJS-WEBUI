"use client";

import * as React from "react";
import {
  Box,
  Button,
  Grid,
  HStack,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { AlertTriangle, ArrowRightLeft } from "lucide-react";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";

import { AGENTS, type DocumentRecord, fmt, getAgent, seriesLabel } from "../data";
import { AgentAvatar, CalcBox, RadioCard, SeriesBar } from "./atoms";
import { WorkflowModal } from "./WorkflowModal";

export type ReassignResult = {
  newAgentId: string;
  method: "entire" | "partial";
  s: number;
  e: number;
  moved: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  doc: DocumentRecord | null;
  onConfirm: (result: ReassignResult) => void;
};

export default function ReassignModal({ open, onClose, doc, onConfirm }: Props) {
  const [newAgentId, setNewAgentId] = React.useState("");
  const [method, setMethod] = React.useState<"entire" | "partial">("entire");
  const [pStart, setPStart] = React.useState("");
  const [pEnd, setPEnd] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setNewAgentId("");
      setMethod("entire");
      setPStart("");
      setPEnd("");
    }
  }, [open]);

  const agentCollection = React.useMemo(
    () =>
      createListCollection({
        items: AGENTS.filter((a) => a.id !== doc?.agentId).map((a) => ({
          label: `${a.name} (${a.emp})`,
          value: a.id,
        })),
      }),
    [doc?.agentId],
  );

  if (!doc) return null;

  const cur = getAgent(doc.agentId);
  const nu = newAgentId ? getAgent(newAgentId) : null;

  let s2 = doc.s;
  let e2 = doc.e;
  if (method === "partial") {
    s2 = Number(pStart);
    e2 = Number(pEnd);
  }
  const moved =
    method === "partial" ? (Number.isFinite(s2) && Number.isFinite(e2) ? e2 - s2 + 1 : 0) : doc.remaining;
  const partialValid =
    method !== "partial" ||
    (pStart !== "" && pEnd !== "" && s2 >= doc.s && e2 <= doc.e && s2 <= e2 && moved <= doc.remaining);
  const valid = !!newAgentId && partialValid && moved > 0;

  const footer = (
    <>
      <Text mr="auto" fontSize="xs" color="fg.muted">
        {valid ? `Moving ${fmt(moved)} pcs` : "Complete the form to continue"}
      </Text>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button disabled={!valid} onClick={() => onConfirm({ newAgentId, method, s: s2, e: e2, moved })}>
        <ArrowRightLeft size={16} /> Confirm Reassignment
      </Button>
    </>
  );

  return (
    <WorkflowModal
      open={open}
      onClose={onClose}
      title="Reassign Documents"
      subtitle={`${doc.code} · ${doc.type}`}
      maxW="680px"
      footer={footer}
    >
      <Box
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.muted"
        borderRadius="xl"
        p={4}
        mb={5}
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="0.04em"
          mb={3}
        >
          Current Assignment
        </Text>
        <HStack gap={3} flexWrap="wrap">
          <AgentAvatar agent={cur} size={38} />
          <Box flex="1" minW="120px">
            <Text fontSize="sm" fontWeight="600" color="fg">
              {cur.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" fontFamily="mono">
              {cur.emp}
            </Text>
          </Box>
          <MiniKV label="Current Series" value={seriesLabel(doc)} />
          <MiniKV label="Remaining" value={fmt(doc.remaining)} />
        </HStack>
      </Box>

      <Box mb={4}>
        <FloatingLabelSelect
          label="Select New Agent"
          value={newAgentId}
          onChange={(e) => setNewAgentId(e.target.value)}
        >
          {agentCollection.items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </FloatingLabelSelect>
      </Box>

      <Text fontSize="sm" fontWeight="600" color="fg" mb={3}>
        Reassignment method
      </Text>
      <VStack align="stretch" gap={3}>
        <RadioCard
          selected={method === "entire"}
          onClick={() => setMethod("entire")}
          title="Entire Assignment"
          desc={`Move all ${fmt(doc.remaining)} remaining pcs to the new agent.`}
        />
        <RadioCard
          selected={method === "partial"}
          onClick={() => setMethod("partial")}
          title="Partial Assignment"
          desc="Move a specific portion of the series."
        />
      </VStack>

      {method === "partial" && (
        <Grid templateColumns="1fr 1fr" gap={3} mt={4}>
          <FloatingLabelInput
            type="number"
            label="Series Start"
            placeholder={String(doc.s)}
            value={pStart}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPStart(e.target.value)}
          />
          <FloatingLabelInput
            type="number"
            label="Series End"
            placeholder={String(doc.e)}
            value={pEnd}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPEnd(e.target.value)}
          />
        </Grid>
      )}

      {method === "partial" && pStart !== "" && pEnd !== "" && !partialValid && (
        <HStack fontSize="xs" color="red.600" fontWeight="medium" mt={2.5} gap={1.5}>
          <AlertTriangle size={15} />
          <Text>
            Portion must be within {doc.s}–{doc.e} and not exceed remaining.
          </Text>
        </HStack>
      )}

      <Box mt={5} p={4} bg="bg.subtle" borderWidth="1px" borderColor="border.muted" borderRadius="xl">
        <Text
          fontSize="xs"
          fontWeight="700"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="0.04em"
          mb={3.5}
        >
          Series Preview
        </Text>
        <SeriesBar label="Current assignment" s={doc.s} e={doc.e} domainS={doc.s} domainE={doc.e} muted />
        {valid && (
          <SeriesBar
            label={`Reassigned to ${nu ? nu.name : "new agent"}`}
            s={s2}
            e={e2}
            domainS={doc.s}
            domainE={doc.e}
          />
        )}
        <Grid templateColumns="1fr 1fr 1fr" gap={2.5} mt={3.5}>
          <CalcBox label="Reassigning" value={valid ? fmt(moved) : "—"} tone="colorPalette.fg" />
          <CalcBox
            label={`Remains with ${cur.name.split(" ")[0]}`}
            value={valid ? fmt(method === "entire" ? 0 : doc.remaining - moved) : fmt(doc.remaining)}
            tone="fg.muted"
          />
          <CalcBox label="New agent total" value={valid ? fmt(moved) : "—"} />
        </Grid>
      </Box>
    </WorkflowModal>
  );
}

function MiniKV({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="10px" color="fg.muted" fontWeight="600" textTransform="uppercase" letterSpacing="0.03em">
        {label}
      </Text>
      <Text fontSize="sm" color="fg" fontWeight="600" fontFamily="mono" mt={0.5}>
        {value}
      </Text>
    </Box>
  );
}
