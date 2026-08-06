"use client";

import { Badge } from "@chakra-ui/react";
import type { RitfStatus } from "../data/types";

export function RitfStatusBadge({ status }: { status: RitfStatus }) {
  const colorPalette =
    status === "APPROVED" ? "green" : status === "DENIED" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}
