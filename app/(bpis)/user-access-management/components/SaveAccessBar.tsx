"use client";

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { PrimaryMdButton } from "osp-ui-kit";

import { ACCESS_COLORS } from "../lib/access-theme";

type SaveAccessBarProps = {
  dirty: boolean;
  loading: boolean;
  grantCount: number;
  revokeCount: number;
  /** Rendered when there is nothing pending, e.g. "last updated …". */
  savedLabel: string;
  onCancel: () => void;
  onSave: () => void;
};

export function SaveAccessBar({
  dirty,
  loading,
  grantCount,
  revokeCount,
  savedLabel,
  onCancel,
  onSave,
}: SaveAccessBarProps) {
  const enabled = dirty && !loading;

  const status = loading
    ? "Loading permissions…"
    : dirty
      ? `${grantCount} permission(s) to grant · ${revokeCount} to revoke`
      : savedLabel;

  return (
    <Box
      position="sticky"
      // Clears the mobile bottom navigation, which is fixed above this.
      bottom={{ base: "calc(64px + env(safe-area-inset-bottom, 0px))", lg: 0 }}
      zIndex={5}
      bg="bg"
      borderTopWidth="1px"
      borderColor={dirty ? ACCESS_COLORS.pendingCardBorder : "gray.200"}
      borderRadius={{ base: "xl", lg: 0 }}
      shadow={{ base: "md", lg: "0 -4px 16px rgba(16,24,40,.05)" }}
      px={{ base: 3, lg: 0 }}
      py={3}
      mt={2}
    >
      <Flex
        align="center"
        gap={3}
        direction={{ base: "column", sm: "row" }}
        px={{ lg: 1 }}
      >
        <HStack gap={2.5} flex="1" minW={0} w={{ base: "full", sm: "auto" }}>
          {dirty && (
            <Box
              boxSize="8px"
              borderRadius="full"
              flexShrink={0}
              bg={ACCESS_COLORS.pendingDot}
              boxShadow={`0 0 0 3px color-mix(in srgb, ${ACCESS_COLORS.pendingDot} 18%, transparent)`}
            />
          )}
          <Text
            fontSize="xs"
            lineClamp={2}
            color={dirty ? ACCESS_COLORS.pendingText : "gray.500"}
            fontWeight={dirty ? "500" : "400"}
          >
            {status}
          </Text>
        </HStack>

        <HStack gap={2} flexShrink={0} w={{ base: "full", sm: "auto" }}>
          <Button
            onClick={onCancel}
            disabled={!enabled}
            variant="outline"
            borderColor="gray.300"
            color="gray.700"
            fontSize="sm"
            flex={{ base: "1", sm: "initial" }}
          >
            Cancel
          </Button>
          <PrimaryMdButton
            onClick={onSave}
            disabled={!enabled}
            flex={{ base: "1", sm: "initial" }}
          >
            Save changes
          </PrimaryMdButton>
        </HStack>
      </Flex>
    </Box>
  );
}
