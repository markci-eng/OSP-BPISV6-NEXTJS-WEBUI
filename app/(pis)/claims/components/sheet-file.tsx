"use client";

// THE PHONE SHEETS' FILE PICKING — the dashed "Choose file" target and the row
// a chosen file becomes. Pulled out of Add Document when the Add payout channel
// sheet needed the same (user, 2026-10-02), so the two cannot draw a file apart.
//
// ONE TARGET, NO CAMERA BUTTON: the phone's own picker already offers its
// camera from a plain file input.

import { useRef } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LuFileUp } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SHEET_ERROR_RED } from "./sheet-picker";

export const SHEET_FILE_ACCEPT = ".pdf,.png,.jpg,.jpeg";

/** "PDF" off a file name. */
function formatOf(fileName: string): string {
  if (!fileName.includes(".")) return "FILE";
  return fileName.split(".").pop()!.toUpperCase();
}

/** "412 KB", "1.8 MB". */
function sizeOf(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A hidden file input and the function that opens it. `multiple` lets the
 * picker return several at once.
 */
export function useSheetFileInput({
  multiple = false,
  onFiles,
}: {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const input = (
    <input
      ref={ref}
      type="file"
      accept={SHEET_FILE_ACCEPT}
      multiple={multiple}
      hidden
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length) onFiles(files);
        // Cleared so choosing the same file again still fires.
        e.target.value = "";
      }}
    />
  );
  return { input, open: () => ref.current?.click() };
}

/** The big dashed target. */
export function SheetFileTarget({
  invalid = false,
  onClick,
}: {
  invalid?: boolean;
  onClick: () => void;
}) {
  return (
    <Flex
      as="button"
      onClick={onClick}
      direction="column"
      align="center"
      justify="center"
      gap={1}
      w="full"
      h="88px"
      bg="white"
      borderWidth="1.5px"
      borderStyle="dashed"
      borderColor={invalid ? SHEET_ERROR_RED : "gray.300"}
      borderRadius="xl"
      color={BRAND_COLORS.darkGreen}
      cursor="pointer"
    >
      <LuFileUp size={22} />
      <Text fontSize="13px" fontWeight="700">
        Choose file
      </Text>
      <Text fontSize="11px" color="gray.400">
        PDF, JPG or PNG
      </Text>
    </Flex>
  );
}

/** A chosen file: its format, name and size, and one action at the right. */
export function SheetFileRow({
  file,
  actionLabel,
  onAction,
}: {
  file: File;
  /** "Replace" on a one-file form, "Remove" on a list. */
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Flex
      align="center"
      gap={2.5}
      px={2.5}
      py={2}
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
    >
      <Flex
        w="44px"
        h="44px"
        flexShrink={0}
        align="center"
        justify="center"
        borderRadius="lg"
        bg="gray.100"
        fontSize="10px"
        fontWeight="700"
        color="gray.500"
      >
        {formatOf(file.name)}
      </Flex>
      <Box flex="1" minW={0}>
        <Text fontSize="13px" fontWeight="600" color="gray.800" truncate>
          {file.name}
        </Text>
        <Text fontSize="11px" fontFamily="mono" color="gray.500">
          {sizeOf(file.size)}
        </Text>
      </Box>
      <Box
        as="button"
        onClick={onAction}
        flexShrink={0}
        px={1.5}
        py={1.5}
        fontSize="12.5px"
        fontWeight="600"
        color={BRAND_COLORS.darkGreen}
        cursor="pointer"
      >
        {actionLabel}
      </Box>
    </Flex>
  );
}
