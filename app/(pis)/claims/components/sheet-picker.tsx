"use client";

// THE PHONE FORMS' PICKER — a field that opens a list inside the same bottom
// sheet, in place of a native select. Shared by Add Document and Raise
// Deficiency (user, 2026-10-01: "do the same for raise deficiency"), so the two
// sheets draw their one choice the same way.

import { forwardRef, type ReactNode } from "react";
import {
  Box,
  chakra,
  Flex,
  Text,
  Textarea,
  type TextareaProps,
} from "@chakra-ui/react";
import { LuChevronDown, LuChevronLeft } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export const SHEET_ERROR_RED = "#bf1f2f";

/** The amber the deficiency rows use. */
const WANTING = { bg: "#fdf3e3", color: "#b45309" } as const;

/** One line under a field, after a submit was tried. */
export function FieldError({ children }: { children: ReactNode }) {
  return (
    <Text fontSize="xs" color={SHEET_ERROR_RED} mt={1.5}>
      {children}
    </Text>
  );
}

/** The sheet's title while the list is up — a back arrow and its name. */
export function PickerTitle({
  label,
  onBack,
}: {
  label: string;
  onBack: () => void;
}) {
  return (
    <Flex as="span" align="center" gap={1}>
      <Flex
        as="button"
        onClick={onBack}
        align="center"
        aria-label="Back to the form"
        color={BRAND_COLORS.darkGreen}
        cursor="pointer"
      >
        <LuChevronLeft size={18} />
      </Flex>
      {label}
    </Flex>
  );
}

/** The closed field: its label, the choice (or a placeholder), a chevron. */
export function PickerField({
  label,
  value,
  placeholder,
  tag,
  invalid = false,
  onClick,
}: {
  label: string;
  value?: string;
  placeholder: string;
  /** A small amber pill at the right — "Deficiency". */
  tag?: string;
  invalid?: boolean;
  onClick: () => void;
}) {
  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap={2.5}
      w="full"
      minH="52px"
      px={3}
      py={1.5}
      textAlign="left"
      bg="white"
      borderWidth="1px"
      borderColor={invalid ? SHEET_ERROR_RED : "gray.200"}
      borderRadius="xl"
      cursor="pointer"
      aria-haspopup="listbox"
    >
      <Box flex="1" minW={0}>
        <Text fontSize="10.5px" color="gray.500">
          {label}
        </Text>
        <Text
          fontSize="13.5px"
          fontWeight={value ? "600" : "500"}
          color={value ? "gray.800" : "gray.400"}
          truncate
        >
          {value ?? placeholder}
        </Text>
      </Box>
      {tag && (
        <Box
          flexShrink={0}
          px={2}
          py="2px"
          borderRadius="full"
          fontSize="10px"
          fontWeight="600"
          {...WANTING}
        >
          {tag}
        </Box>
      )}
      <Box color="gray.400" flexShrink={0}>
        <LuChevronDown size={16} />
      </Box>
    </Flex>
  );
}

/**
 * A long free-text field in the picker's own frame — the label inside the box,
 * the text under it. For Remarks (user, 2026-10-01: "make the remarks a little
 * bigger since it takes long characters"): four lines tall, growing with what
 * is typed rather than scrolling inside one line. The kit has no textarea, so
 * this matches `PickerField` instead.
 */
export const SheetTextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps & { label: string }
>(function SheetTextArea({ label, id, ...rest }, ref) {
  const inputId = id ?? `sheet-textarea-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      px={3}
      pt={1.5}
      pb={1}
      _focusWithin={{ borderColor: BRAND_COLORS.primaryGreen }}
    >
      <chakra.label
        htmlFor={inputId}
        display="block"
        fontSize="10.5px"
        color="gray.500"
      >
        {label}
      </chakra.label>
      <Textarea
        ref={ref}
        id={inputId}
        autoresize
        rows={4}
        maxH="40dvh"
        px={0}
        py={0.5}
        border="none"
        outline="none"
        _focusVisible={{ outline: "none", boxShadow: "none" }}
        fontSize="13.5px"
        color="gray.800"
        resize="none"
        {...rest}
      />
    </Box>
  );
});

/** A labelled card of rows in the open list. */
export function PickerGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Text
        fontSize="10px"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="gray.400"
        mb={1.5}
      >
        {label}
      </Text>
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        overflow="hidden"
      >
        {children}
      </Box>
    </Box>
  );
}

/** One choice: a dot (amber when outstanding), its name, its code. */
export function PickerRow({
  label,
  code,
  outstanding = false,
  onPick,
}: {
  label: string;
  code?: string;
  outstanding?: boolean;
  onPick: () => void;
}) {
  return (
    <Flex
      as="button"
      onClick={onPick}
      align="center"
      gap={2.5}
      w="full"
      minH="48px"
      px={3}
      py={1.5}
      textAlign="left"
      bg="white"
      cursor="pointer"
      _notFirst={{ borderTopWidth: "1px", borderColor: "gray.100" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "-2px",
      }}
    >
      <Box
        w="8px"
        h="8px"
        borderRadius="full"
        flexShrink={0}
        bg={outstanding ? WANTING.color : "gray.200"}
      />
      <Text flex="1" minW={0} fontSize="13px" fontWeight="600" color="gray.800">
        {label}
      </Text>
      {code && (
        <Text flexShrink={0} fontSize="11px" fontFamily="mono" color="gray.400">
          {code}
        </Text>
      )}
    </Flex>
  );
}
