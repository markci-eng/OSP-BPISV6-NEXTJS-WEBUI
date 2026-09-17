"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";

import type { AccessDiff } from "../types";
import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";

/** Changes listed in full before the list collapses to a "+ N more" line. */
const PREVIEW_LIMIT = 6;

function Tally({
  value,
  label,
  color,
  divider,
}: {
  value: string;
  label: string;
  color: string;
  divider?: boolean;
}) {
  return (
    <Box
      flex="1"
      px={3.5}
      py={3}
      borderRightWidth={divider ? "1px" : 0}
      borderColor="gray.200"
    >
      <Text fontSize="lg" fontWeight="600" color={color} letterSpacing="-0.02em">
        {value}
      </Text>
      <Text fontSize="xs" color="gray.500" mt="2px">
        {label}
      </Text>
    </Box>
  );
}

/**
 * Granted/revoked tallies over a scrollable preview of the individual
 * permissions. Shared by both confirmation dialogs, which differ only in the
 * words wrapped around this.
 */
export function PermissionChangeSummary({
  diff,
  grantedLabel = "granted",
  revokedLabel = "revoked",
}: {
  diff: AccessDiff;
  grantedLabel?: string;
  revokedLabel?: string;
}) {
  const changes = [...diff.granted, ...diff.revoked];
  const preview = changes.slice(0, PREVIEW_LIMIT);
  const remaining = changes.length - preview.length;

  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="lg">
      <Flex>
        <Tally
          value={`+${diff.granted.length}`}
          label={grantedLabel}
          color={ACCESS_COLORS.grantText}
          divider
        />
        <Tally
          value={`−${diff.revoked.length}`}
          label={revokedLabel}
          color={ACCESS_COLORS.revokeText}
        />
      </Flex>

      <Box
        borderTopWidth="1px"
        borderColor="gray.200"
        maxH="168px"
        overflowY="auto"
        bg="gray.50"
        borderBottomRadius="lg"
      >
        {preview.map((change) => (
          <HStack
            key={change.code}
            gap={2.5}
            px={3.5}
            py={2}
            borderBottomWidth="1px"
            borderColor="gray.100"
          >
            <Text
              flexShrink={0}
              fontSize="10px"
              fontWeight="600"
              letterSpacing="0.04em"
              textTransform="uppercase"
              px={1.5}
              py="2px"
              borderRadius="sm"
              color={
                change.kind === "grant"
                  ? ACCESS_COLORS.grantText
                  : ACCESS_COLORS.revokeText
              }
              bg={
                change.kind === "grant"
                  ? ACCESS_COLORS.grantBg
                  : ACCESS_COLORS.revokeBg
              }
            >
              {change.kind === "grant" ? "Grant" : "Revoke"}
            </Text>

            <Text flex="1" minW={0} fontSize="xs" color="gray.700">
              {change.description}
            </Text>

            <Text
              flexShrink={0}
              fontFamily={CODE_FONT}
              fontSize="11px"
              color="gray.400"
            >
              {change.code}
            </Text>
          </HStack>
        ))}

        {changes.length === 0 && (
          <Text px={3.5} py={2.5} fontSize="xs" color="gray.400">
            No permission changes.
          </Text>
        )}

        {remaining > 0 && (
          <Text px={3.5} py={2.5} fontSize="xs" color="gray.500">
            + {remaining} more change(s)
          </Text>
        )}
      </Box>
    </Box>
  );
}
