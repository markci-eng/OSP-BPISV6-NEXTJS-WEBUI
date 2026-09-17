"use client";

import { Badge } from "@chakra-ui/react";

export function ApprovalStatusBadge({ status }: { status: string }) {
  const colorPalette =
    status === "Approved" ? "green" : status === "Denied" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}
