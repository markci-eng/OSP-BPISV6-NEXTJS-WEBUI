"use client";

import { Badge } from "@chakra-ui/react";
import type { CsvStatus } from "../data/types";

export function CsvStatusBadge({ status }: { status: CsvStatus }) {
  const colorPalette =
    status === "APPROVED" ? "green" : status === "DENIED" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}
