"use client";

import { useEffect, useState } from "react";
import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import {
  FloatingLabelInput,
  ModalForm,
  ModalFormField,
  ModalFormSection,
  PrimaryMdButton,
} from "osp-ui-kit";

import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";
import type { AccessGroup, CreateGroupInput, NewGroupBase } from "../types";
import { SYSTEM_CODE } from "../data/access-groups";

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: AccessGroup[];
  /** Permission count per group code, shown against each "start from" option. */
  permissionCounts: Record<string, number>;
  creating: boolean;
  /** Server-side rejection (duplicate code, bad format) to surface inline. */
  error: string | null;
  onSubmit: (input: CreateGroupInput) => void;
};

function BaseOption({
  label,
  hint,
  picked,
  onPick,
}: {
  label: string;
  hint: string;
  picked: boolean;
  onPick: () => void;
}) {
  return (
    <HStack
      gap={2.5}
      px={3}
      py={2.5}
      borderRadius="lg"
      borderWidth="1px"
      cursor="pointer"
      borderColor={picked ? ACCESS_COLORS.accent : "gray.100"}
      bg={
        picked
          ? "color-mix(in srgb, var(--chakra-colors-primary) 8%, transparent)"
          : "white"
      }
      _hover={{ borderColor: picked ? ACCESS_COLORS.accent : "gray.300" }}
      onClick={onPick}
    >
      <Flex
        w="16px"
        h="16px"
        flexShrink={0}
        align="center"
        justify="center"
        borderRadius="full"
        borderWidth="1.5px"
        borderColor={picked ? ACCESS_COLORS.accent : "gray.300"}
      >
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg={picked ? ACCESS_COLORS.accent : "transparent"}
        />
      </Flex>
      <Text flex="1" minW={0} fontSize="sm" fontWeight="500" color="gray.800">
        {label}
      </Text>
      <Text fontSize="xs" color="gray.400" flexShrink={0}>
        {hint}
      </Text>
    </HStack>
  );
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  groups,
  permissionCounts,
  creating,
  error,
  onSubmit,
}: CreateGroupDialogProps) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [base, setBase] = useState<NewGroupBase>("blank");

  // Reopening the dialog should offer an empty form, not the last attempt.
  useEffect(() => {
    if (!open) return;
    setCode("");
    setDescription("");
    setBase("blank");
  }, [open]);

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      confirmation={false}
      title="New access group"
      description={
        <Text fontSize="sm" color="gray.500" lineHeight="1.55">
          Creates a header record for SystemCode{" "}
          <Text as="span" fontFamily={CODE_FONT} color="gray.700">
            {SYSTEM_CODE}
          </Text>
          . Detail rows are written when you save the preset.
        </Text>
      }
      footer={
        <HStack gap={2.5} w="full">
          <Button
            flex="1"
            variant="outline"
            borderColor="gray.300"
            color="gray.700"
            disabled={creating}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <PrimaryMdButton
            flex="1.4"
            loading={creating}
            loadingText="Creating…"
            onClick={() => onSubmit({ code, description, base })}
          >
            Create group
          </PrimaryMdButton>
        </HStack>
      }
    >
      {/* Each direct child is a cell in the modal body's grid: one column on
          mobile, two from `lg`. So these two fields sit side by side on a wide
          modal and stack on a narrow one, with no layout of their own. */}
      <ModalFormField>
        <FloatingLabelInput
          label="Access group code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          maxLength={10}
          fontFamily={CODE_FONT}
          letterSpacing="0.02em"
          helperText="2–10 characters: letters, numbers or underscore."
        />
      </ModalFormField>

      <ModalFormField>
        <FloatingLabelInput
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          helperText="Shown wherever the role is listed."
        />
      </ModalFormField>

      {error && (
        <ModalFormField fullWidth>
          <Box
            px={3}
            py={2.5}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="#F5C7C2"
            bg={ACCESS_COLORS.revokeBg}
          >
            <Text fontSize="xs" color={ACCESS_COLORS.revokeText}>
              {error}
            </Text>
          </Box>
        </ModalFormField>
      )}

      <ModalFormSection
        title="Start from"
        description="Copy an existing preset as the starting point, or begin with nothing granted."
      >
        {/* The list is one cell spanning both columns; without this it would
            take half the width and leave the other half empty. */}
        <ModalFormField fullWidth>
          <Flex
            direction="column"
            gap={1.5}
            // Full-screen on mobile, so the modal body scrolls and a nested
            // scroller would only make the list harder to reach. Capped from
            // `md`, where the dialog is a centred panel that must stay short.
            maxH={{ base: "none", md: "260px" }}
            overflowY={{ base: "visible", md: "auto" }}
            pr={{ base: 0, md: 1 }}
          >
            <BaseOption
              label="Blank preset"
              hint="0 permissions"
              picked={base === "blank"}
              onPick={() => setBase("blank")}
            />
            {groups.map((group) => (
              <BaseOption
                key={group.code}
                label={group.description}
                hint={`${permissionCounts[group.code] ?? 0} permissions`}
                picked={base === group.code}
                onPick={() => setBase(group.code)}
              />
            ))}
          </Flex>
        </ModalFormField>
      </ModalFormSection>
    </ModalForm>
  );
}
