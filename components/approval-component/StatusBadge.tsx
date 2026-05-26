"use client";

import { Badge } from "@chakra-ui/react";

const statusMap: Record<
  string,
  { colorPalette: string; variant?: "subtle" | "solid" }
> = {
  pending: { colorPalette: "yellow", variant: "subtle" },
  approved: { colorPalette: "green", variant: "subtle" },
  denied: { colorPalette: "red", variant: "subtle" },
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const config = statusMap[normalized];

  return (
    <Badge
      colorPalette={config?.colorPalette ?? "gray"}
      variant={config?.variant ?? "subtle"}
      rounded="full"
      px="2"
      py="0.5"
      fontSize="xs"
      fontWeight="medium"
      textTransform="capitalize"
    >
      {status}
    </Badge>
  );
}
