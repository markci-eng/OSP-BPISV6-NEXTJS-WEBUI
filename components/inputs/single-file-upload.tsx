"use client";

import React from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Text,
} from "@chakra-ui/react";
import {
  LuUpload,
  LuFileCheck,
  LuFileText,
  LuRefreshCw,
  LuX,
  LuTriangleAlert,
} from "react-icons/lu";

export interface SingleFileUploadProps {
  /** Visible label shown on the row. */
  label: string;
  /** Optional helper text shown below the label. */
  description?: string;
  /** Accept attribute for the input (e.g. ".pdf,.png,.jpg"). */
  accept?: string;
  /** Max allowed size in MB. Defaults to 20. */
  maxSizeMB?: number;
  /** Marks the row as required (visual asterisk only). */
  required?: boolean;
  /** Currently selected file, if controlled. */
  value?: File | null;
  /** Fires when the file changes (or is removed -> null). */
  onFileChange?: (file: File | null) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Compact, single-document uploader. Renders a one-row card with the label and
 * description on the left and an upload button on the right. After a file is
 * picked, the row swaps to show the file name with Replace / Remove controls.
 *
 * Strictly accepts a single file (the input has no `multiple` attribute and
 * extra files in a drop are ignored beyond the first).
 */
const SingleFileUpload = ({
  label,
  description,
  accept = ".pdf,.png,.jpg,.jpeg",
  maxSizeMB = 20,
  required = false,
  value,
  onFileChange,
}: SingleFileUploadProps) => {
  const [internalFile, setInternalFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const file = value !== undefined ? value : internalFile;

  const setFile = (next: File | null) => {
    if (value === undefined) setInternalFile(next);
    onFileChange?.(next);
  };

  const handlePick = (incoming: File | null) => {
    setError(null);
    if (!incoming) {
      setFile(null);
      return;
    }
    if (incoming.size > maxSizeMB * 1024 * 1024) {
      setError(`Exceeds ${maxSizeMB}MB limit`);
      return;
    }
    setFile(incoming);
  };

  const openPicker = () => inputRef.current?.click();

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Box
      borderWidth="1px"
      borderColor={error ? "red.300" : "border"}
      borderRadius="md"
      px={{ base: 3, md: 4 }}
      py={3}
      bg="bg.panel"
      transition="border-color 0.15s"
    >
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          handlePick(f);
        }}
      />

      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={3}
      >
        <Flex gap={3} align="center" minW={0} flex="1">
          <Box
            color={file ? "green.500" : "gray.500"}
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {file ? <LuFileCheck size={20} /> : <LuFileText size={20} />}
          </Box>

          <Box minW={0} flex="1">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="gray.700"
              truncate
            >
              {label}
              {required ? (
                <Text as="span" color="red.500" ml={1}>
                  *
                </Text>
              ) : null}
            </Text>
            {file ? (
              <Text fontSize="xs" color="gray.500" truncate>
                {file.name} · {formatFileSize(file.size)}
              </Text>
            ) : description ? (
              <Text fontSize="xs" color="gray.500">
                {description}
              </Text>
            ) : null}
          </Box>
        </Flex>

        <Flex gap={1} align="center" flexShrink={0}>
          {file ? (
            <>
              <Button
                size="xs"
                variant="ghost"
                onClick={openPicker}
                colorPalette="blue"
              >
                <LuRefreshCw size={14} />
                Replace
              </Button>
              <IconButton
                size="xs"
                variant="ghost"
                colorPalette="red"
                aria-label={`Remove ${label}`}
                onClick={removeFile}
              >
                <LuX size={14} />
              </IconButton>
            </>
          ) : (
            <Button size="xs" variant="outline" onClick={openPicker}>
              <LuUpload size={14} />
              Upload
            </Button>
          )}
        </Flex>
      </Flex>

      {error ? (
        <Flex align="center" gap={1} mt={2} color="red.500">
          <LuTriangleAlert size={14} />
          <Text fontSize="xs">{error}</Text>
        </Flex>
      ) : null}
    </Box>
  );
};

export default SingleFileUpload;
