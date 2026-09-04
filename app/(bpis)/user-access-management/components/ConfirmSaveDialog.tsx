"use client";

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { ModalForm, ModalFormSection, PrimaryMdButton } from "osp-ui-kit";

import type { AccessDiff, AccessUser } from "../types";
import { ACCESS_COLORS, CODE_FONT } from "../lib/access-theme";

/** Changes listed in full before the list collapses to a "+ N more" line. */
const PREVIEW_LIMIT = 6;

type ConfirmSaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AccessUser;
  diff: AccessDiff;
  saving: boolean;
  onConfirm: () => void;
};

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

export function ConfirmSaveDialog({
  open,
  onOpenChange,
  user,
  diff,
  saving,
  onConfirm,
}: ConfirmSaveDialogProps) {
  const changes = [...diff.granted, ...diff.revoked];
  const preview = changes.slice(0, PREVIEW_LIMIT);
  const remaining = changes.length - preview.length;

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      confirmation={false}
      title="Save permission changes?"
      description={
        <Text fontSize="sm" color="gray.500" lineHeight="1.55">
          You&rsquo;re about to update access permissions for{" "}
          <Text as="span" color="gray.700" fontWeight="600">
            {user.name}
          </Text>{" "}
          ({user.memberCode}). This takes effect on their next sign-in.
        </Text>
      }
      footer={
        <HStack gap={2.5} w="full">
          <Button
            flex="1"
            variant="outline"
            borderColor="gray.300"
            color="gray.700"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <PrimaryMdButton
            flex="1.4"
            loading={saving}
            loadingText="Saving…"
            onClick={onConfirm}
          >
            Save changes
          </PrimaryMdButton>
        </HStack>
      }
    >
      <ModalFormSection>
        <Box borderWidth="1px" borderColor="gray.200" borderRadius="lg">
          <Flex>
            <Tally
              value={`+${diff.granted.length}`}
              label="granted"
              color={ACCESS_COLORS.grantText}
              divider
            />
            <Tally
              value={`−${diff.revoked.length}`}
              label="revoked"
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

            {remaining > 0 && (
              <Text px={3.5} py={2.5} fontSize="xs" color="gray.500">
                + {remaining} more change(s)
              </Text>
            )}
          </Box>
        </Box>
      </ModalFormSection>
    </ModalForm>
  );
}
