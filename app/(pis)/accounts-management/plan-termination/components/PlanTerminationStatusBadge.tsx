"use client";

import { Badge } from "@chakra-ui/react";
import type { PlanTerminationStatus } from "../data/types";

export function PlanTerminationStatusBadge({
  status,
}: {
  status: PlanTerminationStatus;
}) {
  const colorPalette =
    status === "APPROVED" ? "green" : status === "DENIED" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}
