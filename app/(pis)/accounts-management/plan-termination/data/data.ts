import type { PlanTerminationRequest, PlanTerminationStatus } from "./types";

const STATUS_CYCLE: PlanTerminationStatus[] = [
  "PENDING",
  "PENDING",
  "APPROVED",
  "DENIED",
];

const TERMINATION_REASONS = ["Non-payment", "Planholder request"];

const REQUESTERS = [
  "Grae Sensano",
  "Bryan Dalagdag",
  "Mark Ibe",
  "Jerome Jardio",
  "Jimwell Ocsio",
];

const PLANHOLDERS = [
  "Rosario Villanueva",
  "Fernando Aquino",
  "Cristina Domingo",
  "Ramon Castillo",
  "Beatriz Navarro",
  "Emmanuel Pascual",
];

const PLAN_TYPES = ["G5M6", "G1A6", "LG5A10", "LG5M10", "A1A10", "G5Q6"];

function lpaNo(i: number) {
  return `L25${String(2000 + i).padStart(5, "0")}`;
}

function dateOffset(i: number, base = 1) {
  return `2026-0${((i + base) % 6) + 1}-${String((i % 27) + 1).padStart(2, "0")}`;
}

export const PLAN_TERMINATION_REQUESTS: PlanTerminationRequest[] = Array.from(
  { length: 18 },
  (_, i) => ({
    id: `PT-${String(i + 1).padStart(4, "0")}`,
    lpaNo: lpaNo(i),
    planholderName: PLANHOLDERS[i % PLANHOLDERS.length],
    planType: PLAN_TYPES[i % PLAN_TYPES.length],
    terminationReason: TERMINATION_REASONS[i % TERMINATION_REASONS.length],
    refundAmount: 1000 + i * 100,
    terminationDate: dateOffset(i, 2),
    requestDate: dateOffset(i),
    requester: REQUESTERS[i % REQUESTERS.length],
    status: STATUS_CYCLE[i % STATUS_CYCLE.length],
  }),
);
