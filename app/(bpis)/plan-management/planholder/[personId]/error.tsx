"use client";

import { Box } from "@chakra-ui/react";
import { ErrorStateCard } from "osp-ui-kit";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box p={{ base: 3, md: 6 }}>
      <ErrorStateCard
        title="Unable to load planholder profile"
        description="Something went wrong while fetching this profile."
        onRetry={reset}
      />
    </Box>
  );
}
