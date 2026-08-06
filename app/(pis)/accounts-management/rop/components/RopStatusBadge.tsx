"use client";

import { Badge } from "@chakra-ui/react";
import type { RopStatus } from "../data/types";

export function RopStatusBadge({ status }: { status: RopStatus }) {
  const colorPalette =
    status === "APPROVED" ? "green" : status === "DENIED" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}
