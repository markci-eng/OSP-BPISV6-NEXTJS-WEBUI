"use client";

import * as React from "react";
import {
  Box,
  Button,
  Grid,
  HStack,
  Textarea,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { AlertTriangle, Ban } from "lucide-react";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";

import { type DocumentRecord, fmt, getAgent, seriesLabel } from "../data";
import { BLOCK_REASONS } from "../meta";
import { AgentAvatar, CalcBox, RadioCard } from "./atoms";
import { WorkflowModal } from "./WorkflowModal";

export type BlockResult = {
  method: "entire" | "portion";
  s: number;
  e: number;
  blocked: number;
  reason: string;
  remarks: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  doc: DocumentRecord | null;
  onConfirm: (result: BlockResult) => void;
};

const reasonCollection = createListCollection({
  items: BLOCK_REASONS.map((r) => ({ label: r, value: r })),
});

export default function BlockModal({ open, onClose, doc, onConfirm }: Props) {
  const [method, setMethod] = React.useState<"entire" | "portion">("entire");
  const [pStart, setPStart] = React.useState("");
  const [pEnd, setPEnd] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setMethod("entire");
      setPStart("");
      setPEnd("");
      setReason("");
      setRemarks("");
    }
  }, [open]);

  if (!doc) return null;

  const cur = getAgent(doc.agentId);

  let s2 = doc.s;
  let e2 = doc.e;
  if (method === "portion") {
    s2 = Number(pStart);
    e2 = Number(pEnd);
  }
  const blocked =
    method === "portion" ? (Number.isFinite(s2) && Number.isFinite(e2) ? e2 - s2 + 1 : 0) : doc.remaining;
  const portionValid =
    method !== "portion" ||
    (pStart !== "" && pEnd !== "" && s2 >= doc.s && e2 <= doc.e && s2 <= e2 && blocked <= doc.remaining);
  const valid = !!reason && portionValid && blocked > 0;

  const footer = (
    <>
      <Text mr="auto" fontSize="xs" color="fg.muted">
        {valid ? `Blocking ${fmt(blocked)} pcs` : "Select a reason to continue"}
      </Text>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button
        colorPalette="red"
        disabled={!valid}
        onClick={() => onConfirm({ method, s: s2, e: e2, blocked, reason, remarks })}
      >
        <Ban size={16} /> Confirm Block
      </Button>
    </>
  );

  return (
    <WorkflowModal
      open={open}
      onClose={onClose}
      title="Block Documents"
      subtitle={`${doc.code} · ${doc.type}`}
      maxW="660px"
      footer={footer}
    >
      <HStack
        align="flex-start"
        gap={3}
        bg="orange.subtle"
        borderWidth="1px"
        borderColor="orange.muted"
        borderRadius="xl"
        p={3.5}
        mb={5}
      >
        <Box color="orange.fg" flexShrink={0}>
          <AlertTriangle size={18} />
        </Box>
        <Text fontSize="xs" color="orange.fg" lineHeight="1.5">
          Blocking removes the selected series from active circulation. This action is logged and
          reflected in the table immediately.
        </Text>
      </HStack>

      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3} mb={5}>
        <HStack gap={3} p={3} borderWidth="1px" borderColor="border.muted" borderRadius="xl">
          <AgentAvatar agent={cur} size={36} />
          <Box>
            <Text fontSize="10px" color="fg.muted" fontWeight="600" textTransform="uppercase" letterSpacing="0.03em">
              Current Assignment
            </Text>
            <Text fontSize="sm" fontWeight="600" color="fg">
              {cur.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" fontFamily="mono">
              {seriesLabel(doc)}
            </Text>
          </Box>
        </HStack>
        <Box p={3} borderWidth="1px" borderColor="border.muted" borderRadius="xl">
          <Text fontSize="10px" color="fg.muted" fontWeight="600" textTransform="uppercase" letterSpacing="0.03em">
            Remaining Qty
          </Text>
          <Text fontSize="xl" fontWeight="700" fontFamily="mono" color="fg">
            {fmt(doc.remaining)}
          </Text>
        </Box>
      </Grid>

      <VStack align="stretch" gap={3}>
        <RadioCard
          selected={method === "entire"}
          onClick={() => setMethod("entire")}
          title="Block Entire Remaining Assignment"
          desc={`Block all ${fmt(doc.remaining)} remaining pcs.`}
        />
        <RadioCard
          selected={method === "portion"}
          onClick={() => setMethod("portion")}
          title="Block a Portion"
          desc="Block a specific sub-range of the series."
        />
      </VStack>

      {method === "portion" && (
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

      {method === "portion" && pStart !== "" && pEnd !== "" && !portionValid && (
        <HStack fontSize="xs" color="red.600" fontWeight="medium" mt={2.5} gap={1.5}>
          <AlertTriangle size={15} />
          <Text>
            Portion must be within {doc.s}–{doc.e} and not exceed remaining.
          </Text>
        </HStack>
      )}

      <Grid templateColumns="1fr 1fr" gap={2.5} my={4}>
        <CalcBox label="Blocked Quantity" value={valid ? fmt(blocked) : "—"} tone="red.600" />
        <CalcBox label="Remaining Active" value={valid ? fmt(doc.remaining - blocked) : fmt(doc.remaining)} tone="green.600" />
      </Grid>

      <Box mb={4}>
        <FloatingLabelSelect
          label="Block Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {reasonCollection.items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </FloatingLabelSelect>
      </Box>

      <VStack align="stretch" gap={2}>
        <Text fontSize="xs" fontWeight="600" color="fg.muted">
          Remarks (optional)
        </Text>
        <Textarea
          placeholder="Add context for this block…"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          minH="70px"
        />
      </VStack>
    </WorkflowModal>
  );
}
