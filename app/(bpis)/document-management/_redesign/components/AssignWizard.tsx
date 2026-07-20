"use client";

import * as React from "react";
import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import {
  AlertTriangle,
  Boxes,
  Check,
  ClipboardCheck,
  Files,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import FormSteps from "@/claude components/FormSteps";

import {
  AGENTS,
  BATCHES,
  type Batch,
  type DocType,
  type DocumentRecord,
  fmt,
  fmtDate,
  getAgent,
} from "../data";
import { DOC_TYPES, TYPE_META } from "../meta";
import { AgentAvatar, CalcBox, RadioCard, ReviewRow, TypeBadge } from "./atoms";
import { WorkflowModal } from "./WorkflowModal";

type Props = {
  open: boolean;
  onClose: () => void;
  existingCount: number;
  onConfirm: (doc: DocumentRecord) => void;
};

type Method = "entire" | "partial";

function typeAvailable(type: DocType): number {
  return BATCHES.filter((b) => b.type === type).reduce(
    (a, b) => a + (b.e - b.s + 1),
    0,
  );
}

export default function AssignWizard({
  open,
  onClose,
  existingCount,
  onConfirm,
}: Props) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [type, setType] = React.useState<DocType | "">("");
  const [batchId, setBatchId] = React.useState("");
  const [agentId, setAgentId] = React.useState("");
  const [method, setMethod] = React.useState<Method>("entire");
  const [pStart, setPStart] = React.useState("");
  const [pEnd, setPEnd] = React.useState("");
  const [agentSearch, setAgentSearch] = React.useState("");

  // Reset everything each time the modal opens.
  React.useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setType("");
      setBatchId("");
      setAgentId("");
      setMethod("entire");
      setPStart("");
      setPEnd("");
      setAgentSearch("");
    }
  }, [open]);

  const batch: Batch | undefined = BATCHES.find((b) => b.id === batchId);
  const bq = batch ? batch.e - batch.s + 1 : 0;

  let s2 = batch ? batch.s : 0;
  let e2 = batch ? batch.e : 0;
  if (method === "partial") {
    s2 = Number(pStart);
    e2 = Number(pEnd);
  }
  const qty =
    method === "partial" && batch
      ? Number.isFinite(s2) && Number.isFinite(e2)
        ? e2 - s2 + 1
        : 0
      : bq;

  const partialValid =
    !!batch &&
    pStart !== "" &&
    pEnd !== "" &&
    s2 >= batch.s &&
    e2 <= batch.e &&
    s2 <= e2;

  const handleConfirm = () => {
    if (!batch) return;
    const agent = getAgent(agentId);
    const seq = String(existingCount + 21).padStart(4, "0");
    const q = qty;
    const doc: DocumentRecord = {
      id: "d" + Date.now(),
      code: `${TYPE_META[batch.type].code}-2026-${seq}`,
      control: `CN-${Math.floor(100000 + Math.random() * 899999)}`,
      type: batch.type,
      s: s2,
      e: e2,
      origS: s2,
      origE: e2,
      unit: batch.unit,
      assignedQty: q,
      remaining: q,
      status: "Assigned",
      agentId: agent.id,
      assignedDate: "2026-07-15",
      by: "You (Admin)",
      expiry: batch.expiry,
      bookletSize: batch.bookletSize ?? null,
      timeline: [
        {
          type: "assigned",
          date: "2026-07-15",
          by: "You (Admin)",
          text: `Assigned ${q.toLocaleString()} ${batch.unit.toLowerCase()} (${s2}–${e2}) to ${agent.name}`,
        },
      ],
    };
    onConfirm(doc);
  };

  const agentList = AGENTS.filter((a) => {
    const q = agentSearch.toLowerCase();
    return (
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.emp.toLowerCase().includes(q) ||
      a.branch.toLowerCase().includes(q)
    );
  });

  const stepsData = [
    /* Step 1 — Type */
    {
      title: "Type",
      icon: Files,
      validateBeforeNext: () => {
        if (!type) {
          toast.error("Select a document type to continue.");
          return false;
        }
        return true;
      },
      content: (
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={4}>
            Choose the accountable document type to assign from inventory.
          </Text>
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
            {DOC_TYPES.map((t) => {
              const sel = type === t;
              const meta = TYPE_META[t];
              return (
                <Box
                  key={t}
                  as="button"
                  textAlign="left"
                  display="flex"
                  alignItems="center"
                  gap={3}
                  p={4}
                  borderRadius="xl"
                  borderWidth="1.5px"
                  borderColor={sel ? "colorPalette.solid" : "border"}
                  bg={sel ? "colorPalette.subtle" : "bg"}
                  cursor="pointer"
                  transition="all .15s"
                  _hover={
                    sel ? undefined : { borderColor: "border.emphasized" }
                  }
                  onClick={() => {
                    setType(t);
                    setBatchId("");
                  }}
                >
                  <Box
                    w="40px"
                    h="40px"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="700"
                    fontSize="xs"
                    fontFamily="mono"
                    flexShrink={0}
                    colorPalette={meta.palette}
                    bg="colorPalette.subtle"
                    color="colorPalette.fg"
                  >
                    {meta.code}
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="600" color="fg">
                      {t}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" mt={0.5}>
                      {fmt(typeAvailable(t))} pcs available
                    </Text>
                  </Box>
                  {sel && (
                    <Box color="colorPalette.fg">
                      <Check size={18} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Grid>
        </Box>
      ),
    },

    /* Step 2 — Inventory */
    {
      title: "Inventory",
      icon: Boxes,
      validateBeforeNext: () => {
        if (!batchId) {
          toast.error("Select an inventory batch to continue.");
          return false;
        }
        return true;
      },
      content: (
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={4}>
            Select an available inventory batch of <b>{type}</b>.
          </Text>
          <VStack align="stretch" gap={2.5}>
            {BATCHES.filter((b) => b.type === type).map((b) => {
              const sel = batchId === b.id;
              const q = b.e - b.s + 1;
              return (
                <Box
                  key={b.id}
                  as="button"
                  textAlign="left"
                  display="flex"
                  alignItems="center"
                  gap={3.5}
                  p={4}
                  borderRadius="xl"
                  borderWidth="1.5px"
                  borderColor={sel ? "colorPalette.solid" : "border"}
                  bg={sel ? "colorPalette.subtle" : "bg"}
                  cursor="pointer"
                  transition="all .15s"
                  _hover={
                    sel ? undefined : { borderColor: "border.emphasized" }
                  }
                  onClick={() => setBatchId(b.id)}
                >
                  <Box
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    borderWidth="2px"
                    borderColor={
                      sel ? "colorPalette.solid" : "border.emphasized"
                    }
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    {sel && (
                      <Box
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        bg="colorPalette.solid"
                      />
                    )}
                  </Box>
                  <Grid
                    flex="1"
                    templateColumns="1.4fr 1fr 1fr"
                    gap={3}
                    alignItems="center"
                  >
                    <MiniStat label="Series" value={`${b.s} – ${b.e}`} mono />
                    <MiniStat
                      label="Qty / Unit"
                      value={`${fmt(q)} ${b.unit}`}
                    />
                    <MiniStat label="Expiry" value={fmtDate(b.expiry)} />
                  </Grid>
                </Box>
              );
            })}
          </VStack>
        </Box>
      ),
    },

    /* Step 3 — Agent */
    {
      title: "Agent",
      icon: UserRound,
      validateBeforeNext: () => {
        if (!agentId) {
          toast.error("Select an agent to continue.");
          return false;
        }
        return true;
      },
      content: (
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={3.5}>
            Select the agent who will receive this assignment.
          </Text>
          <Box position="relative" mb={3.5}>
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              zIndex={1}
              color="fg.muted"
              pointerEvents="none"
            >
              <Search size={17} />
            </Box>
            <FloatingLabelInput
              label="Search agents"
              placeholder="Search by name, employee no., or branch"
              value={agentSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAgentSearch(e.target.value)
              }
              pl="38px"
            />
          </Box>
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={2.5}>
            {agentList.map((a) => {
              const sel = agentId === a.id;
              return (
                <Box
                  key={a.id}
                  as="button"
                  textAlign="left"
                  display="flex"
                  alignItems="center"
                  gap={3}
                  p={3}
                  borderRadius="xl"
                  borderWidth="1.5px"
                  borderColor={sel ? "colorPalette.solid" : "border"}
                  bg={sel ? "colorPalette.subtle" : "bg"}
                  cursor="pointer"
                  transition="all .15s"
                  _hover={
                    sel ? undefined : { borderColor: "border.emphasized" }
                  }
                  onClick={() => setAgentId(a.id)}
                >
                  <AgentAvatar agent={a} size={38} />
                  <Box flex="1" minW={0}>
                    <Text fontSize="sm" fontWeight="600" color="fg" truncate>
                      {a.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      <Text as="span" fontFamily="mono">
                        {a.emp}
                      </Text>{" "}
                      · {a.branch}
                    </Text>
                  </Box>
                  {sel && (
                    <Box color="colorPalette.fg">
                      <Check size={17} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Grid>
        </Box>
      ),
    },

    /* Step 4 — Assignment method */
    {
      title: "Assignment",
      icon: SlidersHorizontal,
      validateBeforeNext: () => {
        if (method === "partial" && !partialValid) {
          toast.error("Enter a valid series range to continue.");
          return false;
        }
        return true;
      },
      content: (
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={4}>
            Choose how much of the batch to assign.
          </Text>
          <VStack align="stretch" gap={3}>
            <RadioCard
              selected={method === "entire"}
              onClick={() => setMethod("entire")}
              title="Entire Series"
              desc={`Assign the whole batch — ${fmt(bq)} ${
                batch ? batch.unit.toLowerCase() : "pcs"
              } (${batch ? `${batch.s} – ${batch.e}` : ""}).`}
            />
            <RadioCard
              selected={method === "partial"}
              onClick={() => setMethod("partial")}
              title="Partial Series"
              desc="Assign a specific sub-range from the batch."
            />
          </VStack>

          {method === "partial" && (
            <Box
              mt={4}
              p={4}
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.muted"
              borderRadius="xl"
            >
              <Grid templateColumns="1fr 1fr" gap={3} mb={3.5}>
                <FloatingLabelInput
                  type="number"
                  label="Series Start"
                  placeholder={String(batch?.s ?? "")}
                  value={pStart}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPStart(e.target.value)
                  }
                />
                <FloatingLabelInput
                  type="number"
                  label="Series End"
                  placeholder={String(batch?.e ?? "")}
                  value={pEnd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPEnd(e.target.value)
                  }
                />
              </Grid>
              {pStart !== "" && pEnd !== "" && !partialValid && (
                <HStack
                  fontSize="xs"
                  color="red.600"
                  fontWeight="medium"
                  mb={3}
                  gap={1.5}
                >
                  <AlertTriangle size={15} />
                  <Text>
                    Range must be within {batch ? `${batch.s}–${batch.e}` : ""}{" "}
                    and start ≤ end.
                  </Text>
                </HStack>
              )}
              <Grid templateColumns="1fr 1fr 1fr" gap={2.5}>
                <CalcBox
                  label="Assigned Qty"
                  value={partialValid ? fmt(qty) : "—"}
                  tone="colorPalette.fg"
                />
                <CalcBox
                  label="Remaining Inventory"
                  value={partialValid ? fmt(bq - qty) : fmt(bq)}
                  tone="fg.muted"
                />
                <CalcBox
                  label="Validation"
                  value={partialValid ? "Valid" : "—"}
                  tone={partialValid ? "green.600" : "fg.muted"}
                  ok={partialValid}
                />
              </Grid>
            </Box>
          )}
        </Box>
      ),
    },

    /* Step 5 — Review */
    {
      title: "Review",
      icon: ClipboardCheck,
      content: batch ? (
        <Box>
          <Text fontSize="sm" color="fg.muted" mb={4}>
            Review the assignment before confirming.
          </Text>
          <Box
            borderWidth="1px"
            borderColor="border.muted"
            borderRadius="xl"
            overflow="hidden"
          >
            <ReviewRow
              label="Document Type"
              value={<TypeBadge type={batch.type} />}
            />
            <ReviewRow
              label="Assignment Method"
              value={method === "entire" ? "Entire Series" : "Partial Series"}
            />
            <ReviewRow
              label="Series Range"
              value={
                <Text fontFamily="mono" fontWeight="600">
                  {s2} – {e2}
                </Text>
              }
            />
            <ReviewRow
              label="Quantity"
              value={
                <Text fontFamily="mono" fontWeight="700">
                  {fmt(qty)} {batch.unit.toLowerCase()}
                </Text>
              }
            />
            <ReviewRow label="Expiry Date" value={fmtDate(batch.expiry)} />
            <ReviewRow
              label="Assigned To"
              last
              value={
                <HStack gap={2}>
                  <AgentAvatar agent={getAgent(agentId)} size={28} />
                  <Text fontWeight="600">{getAgent(agentId).name}</Text>
                  <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                    {getAgent(agentId).emp}
                  </Text>
                </HStack>
              }
            />
          </Box>
        </Box>
      ) : null,
    },
  ];

  return (
    <WorkflowModal
      open={open}
      onClose={onClose}
      title="Assign Documents"
      subtitle="Assign accountable documents to an agent"
      maxW="820px"
    >
      <FormSteps
        stepsData={stepsData}
        title=""
        description=""
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onStepsComplete={handleConfirm}
        submitButtonText="Assign Documents"
      />
    </WorkflowModal>
  );
}

function MiniStat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Box>
      <Text
        fontSize="10px"
        color="fg.muted"
        fontWeight="600"
        textTransform="uppercase"
        letterSpacing="0.03em"
      >
        {label}
      </Text>
      <Text
        fontSize="sm"
        color="fg"
        fontWeight={mono ? "600" : "medium"}
        fontFamily={mono ? "mono" : "body"}
        mt={0.5}
      >
        {value}
      </Text>
    </Box>
  );
}
