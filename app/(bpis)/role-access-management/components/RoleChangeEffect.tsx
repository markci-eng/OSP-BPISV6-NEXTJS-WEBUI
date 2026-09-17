"use client";

import { Box, Button, Flex, Grid, HStack, Text } from "@chakra-ui/react";

import type {
  AccessDiff,
  PermissionChange,
} from "../types";
import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";

/** Permissions listed per column before collapsing to a "+ N more" line. */
const PREVIEW_LIMIT = 8;

function ChangeColumn({
  heading,
  changes,
  sign,
  color,
  emptyLabel,
  divider,
}: {
  heading: string;
  changes: PermissionChange[];
  sign: string;
  color: string;
  emptyLabel: string;
  divider?: boolean;
}) {
  const preview = changes.slice(0, PREVIEW_LIMIT);
  const remaining = changes.length - preview.length;

  return (
    <Box
      px={4}
      py={3.5}
      borderRightWidth={{ base: 0, md: divider ? "1px" : 0 }}
      borderBottomWidth={{ base: divider ? "1px" : 0, md: 0 }}
      borderColor="gray.100"
    >
      <Text
        fontSize="11.5px"
        fontWeight="600"
        color={color}
        textTransform="uppercase"
        letterSpacing="0.04em"
        mb={2.5}
      >
        {heading} {changes.length}
      </Text>

      <Flex direction="column" gap={1.5}>
        {preview.map((change) => (
          <HStack key={change.code} gap={2} fontSize="xs">
            <Text color={color} fontWeight="600" flexShrink={0}>
              {sign}
            </Text>
            <Text flex="1" minW={0} color="gray.700">
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
          <Text fontSize="xs" color="gray.400">
            {emptyLabel}
          </Text>
        )}

        {remaining > 0 && (
          <Text fontSize="xs" color="gray.500" mt="2px">
            + {remaining} more
          </Text>
        )}
      </Flex>
    </Box>
  );
}

/**
 * What the pending role selection would actually change for this user, in
 * permissions rather than role names — the part an approver needs to see.
 */
export function RoleChangeEffect({
  diff,
  onRevert,
}: {
  diff: AccessDiff;
  onRevert: () => void;
}) {
  return (
    <Box
      as="section"
      bg="white"
      borderWidth="1px"
      borderColor={ACCESS_COLORS.pendingCardBorder}
      borderRadius="xl"
      overflow="hidden"
    >
      <Flex
        align="center"
        gap={2.5}
        px={4}
        py={3}
        borderBottomWidth="1px"
        borderColor="gray.100"
        wrap="wrap"
      >
        <Text fontSize="sm" fontWeight="600" color="gray.800">
          Effect of this change
        </Text>
        <Text fontSize="xs" color="gray.500">
          {diff.granted.length} gained · {diff.revoked.length} removed
        </Text>
        <Button
          ml="auto"
          size="xs"
          variant="outline"
          borderColor="gray.300"
          color="gray.700"
          onClick={onRevert}
        >
          Revert
        </Button>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
        <ChangeColumn
          heading="Gains"
          changes={diff.granted}
          sign="+"
          color={ACCESS_COLORS.grantText}
          emptyLabel="No new permissions."
          divider
        />
        <ChangeColumn
          heading="Loses"
          changes={diff.revoked}
          sign="−"
          color={ACCESS_COLORS.revokeText}
          emptyLabel="No permissions removed."
        />
      </Grid>
    </Box>
  );
}
