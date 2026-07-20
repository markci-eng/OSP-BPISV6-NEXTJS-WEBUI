"use client";

/**
 * AiField — the universal form input for the application steps.
 *
 * Every field in every step routes through here so the whole form shares one
 * store, one look, and one set of AI affordances:
 *
 *   • AI-filled + confident  → subtle green highlight + "AI Filled" badge.
 *     Editing it clears the badge instantly (the value is now the user's).
 *   • AI-read but low confidence → left EMPTY, amber "Verify" highlight, and a
 *     one-tap suggestion chip so the user can accept or ignore it.
 *   • Plain field → looks like a normal floating-label input.
 *
 * Fields are never locked. The store guarantees a user edit is never
 * overwritten by a later extraction.
 */

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuSparkles, LuTriangleAlert, LuCheck } from "react-icons/lu";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";
import { useField } from "../../app/(bpis)/sales-force/new/application/application-context";
import type { FieldKey } from "../../app/(bpis)/sales-force/new/application/types";

const PRIMARY = "var(--chakra-colors-primary)";
const PRIMARY_SOFT = "var(--chakra-colors-primary-disabled)";
const AMBER = "#D97706";
const AMBER_SOFT = "#FEF3C7";

interface AiFieldOption {
  value: string;
  label: string;
}

interface AiFieldProps {
  fieldKey: FieldKey;
  label: string;
  type?: "text" | "email" | "number" | "tel" | "date" | "select";
  options?: AiFieldOption[];
}

export function AiField({
  fieldKey,
  label,
  type = "text",
  options,
}: AiFieldProps) {
  const { value, aiFilled, suggestion, setValue, acceptSuggestion } =
    useField(fieldKey);

  const showAi = aiFilled && !!value;
  const showVerify = !!suggestion && !aiFilled && !value;

  const borderColor = showVerify ? AMBER : showAi ? PRIMARY : "gray.200";
  const bg = showVerify ? "#FFFBEB" : showAi ? "#F6FEF9" : "white";

  return (
    <Box position="relative" w="full" pt={2.5}>
      {/* Corner badge */}
      {(showAi || showVerify) && (
        <Flex
          position="absolute"
          top="0"
          right="10px"
          zIndex={2}
          align="center"
          gap={1}
          px={1.5}
          py="1px"
          borderRadius="full"
          fontSize="10px"
          fontWeight={700}
          letterSpacing="0.02em"
          pointerEvents="none"
          style={
            showAi
              ? { color: "#15803D", background: "#DCFCE7" }
              : { color: "#B45309", background: AMBER_SOFT }
          }
        >
          {showAi ? <LuSparkles size={10} /> : <LuTriangleAlert size={10} />}
          {showAi ? "AI Filled" : "Verify"}
        </Flex>
      )}

      {/* Floating-label input / select */}
      {type === "select" ? (
        <FloatingLabelSelect
          label={label}
          value={value}
          bg={bg}
          onValueChange={setValue}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FloatingLabelSelect>
      ) : (
        <FloatingLabelInput
          label={label}
          value={value}
          type={type}
          autoComplete="off"
          borderColor={borderColor}
          bg={bg}
          _hover={{ borderColor: showVerify ? AMBER : PRIMARY }}
          _focus={{
            borderColor: showVerify ? AMBER : PRIMARY,
            boxShadow: `0 0 0 3px ${showVerify ? AMBER_SOFT : PRIMARY_SOFT}`,
            outline: "none",
          }}
          onValueChange={setValue}
        />
      )}

      {/* Low-confidence suggestion chip */}
      {showVerify && (
        <Flex
          align="center"
          gap={2}
          mt={1.5}
          px={2.5}
          py={1.5}
          borderRadius="lg"
          bg={AMBER_SOFT}
          borderWidth="1px"
          borderColor="#FDE68A"
        >
          <Text fontSize="xs" color="#92400E" minW={0} truncate flex="1">
            AI read this as{" "}
            <Text as="span" fontWeight={700}>
              “{suggestion}”
            </Text>{" "}
            — please confirm.
          </Text>
          <Flex
            as="button"
            align="center"
            gap={1}
            px={2}
            py={1}
            borderRadius="md"
            bg="white"
            color="#B45309"
            borderWidth="1px"
            borderColor="#FCD34D"
            fontSize="11px"
            fontWeight={700}
            cursor="pointer"
            flexShrink={0}
            _hover={{ bg: "#FFFBEB" }}
            onClick={() => acceptSuggestion()}
          >
            <LuCheck size={11} />
            Use
          </Flex>
        </Flex>
      )}
    </Box>
  );
}
