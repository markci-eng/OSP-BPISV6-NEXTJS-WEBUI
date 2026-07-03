"use client";

import { Box, Flex, Spinner, Text } from "@chakra-ui/react";

/* ─── Submitting screen ──────────────────────────────────────────────────── */

export const SubmittingScreen = () => (
  <Flex direction="column" align="center" justify="center" gap={4} py="120px">
    <Spinner size="xl" color="gray.500" borderWidth="3px" />
    <Box textAlign="center">
      <Text fontWeight="700" fontSize="lg" color="gray.900">
        Submitting reorganization…
      </Text>
      <Text fontSize="sm" color="gray.500" mt={1}>
        Please wait while we process your request.
      </Text>
    </Box>
  </Flex>
);
