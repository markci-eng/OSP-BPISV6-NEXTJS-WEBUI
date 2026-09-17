"use client";

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { ModalForm, ModalFormField } from "osp-ui-kit";

import { CODE_FONT } from "../lib/access-theme";
import type { AccessGroup } from "../types";

type CopyFromGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The group being edited — excluded from its own copy list. */
  targetGroup: AccessGroup;
  groups: AccessGroup[];
  permissionCounts: Record<string, number>;
  onPick: (sourceCode: string) => void;
};

/**
 * Replaces the working draft with another group's preset. It only touches the
 * draft, so the choice is still reviewable — and revertible — before saving.
 */
export function CopyFromGroupDialog({
  open,
  onOpenChange,
  targetGroup,
  groups,
  permissionCounts,
  onPick,
}: CopyFromGroupDialogProps) {
  const options = groups.filter((group) => group.code !== targetGroup.code);

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      confirmation={false}
      title="Copy permissions from…"
      description={
        <Text fontSize="sm" color="gray.500" lineHeight="1.55">
          Replaces the current draft of{" "}
          <Text as="span" color="gray.700" fontWeight="600">
            {targetGroup.description}
          </Text>{" "}
          with the selected group&rsquo;s preset. Nothing is saved until you
          confirm.
        </Text>
      }
      footer={
        <Button
          w="full"
          variant="outline"
          borderColor="gray.300"
          color="gray.700"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
      }
    >
      <ModalFormField fullWidth>
        {/* Full-screen on mobile, so the modal body scrolls and a nested
            scroller would only make the list harder to reach. Capped from
            `md`, where the dialog is a centred panel that must stay short. */}
        <Flex
          direction="column"
          gap={1}
          maxH={{ base: "none", md: "300px" }}
          overflowY={{ base: "visible", md: "auto" }}
        >
          {options.map((group) => (
            <HStack
              key={group.code}
              gap={2.5}
              px={2.5}
              py={2.5}
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => onPick(group.code)}
            >
              <Text
                flexShrink={0}
                fontFamily={CODE_FONT}
                fontSize="11px"
                px={1.5}
                py="2px"
                borderRadius="sm"
                bg="gray.100"
                color="gray.600"
              >
                {group.code}
              </Text>
              <Text
                flex="1"
                minW={0}
                fontSize="sm"
                fontWeight="500"
                color="gray.800"
              >
                {group.description}
              </Text>
              <Text fontSize="xs" color="gray.400" flexShrink={0}>
                {permissionCounts[group.code] ?? 0} permissions
              </Text>
            </HStack>
          ))}

          {options.length === 0 && (
            <Box py={6} textAlign="center">
              <Text fontSize="xs" color="gray.400">
                There is no other group to copy from yet.
              </Text>
            </Box>
          )}
        </Flex>
      </ModalFormField>
    </ModalForm>
  );
}
