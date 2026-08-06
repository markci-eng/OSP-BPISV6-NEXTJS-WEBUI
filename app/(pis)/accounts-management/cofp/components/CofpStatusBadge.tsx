"use client";

import { Badge } from "@chakra-ui/react";
import type { CofpStatus } from "../data/types";

const STATUS_PALETTE: Record<CofpStatus, string> = {
  FOR_PRINTING: "blue",
  PRINTED: "purple",
  RELEASED: "green",
  CANCELLED: "red",
  CONFISCATED: "orange",
  RETURNED: "teal",
};

export function CofpStatusBadge({ status }: { status: CofpStatus }) {
  return (
    <Badge colorPalette={STATUS_PALETTE[status]} variant="subtle">
      {status}
    </Badge>
  );
}
