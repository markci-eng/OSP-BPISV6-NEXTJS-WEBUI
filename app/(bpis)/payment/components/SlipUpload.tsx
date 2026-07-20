"use client";

import { useRef, useState } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import {
  LuUpload,
  LuCamera,
  LuFolderOpen,
  LuFileText,
  LuTriangleAlert,
  LuRefreshCw,
  LuTrash2,
  LuReplace,
  LuSparkles,
} from "react-icons/lu";
import { toast } from "sonner";

const PRIMARY = "var(--chakra-colors-primary)";
const PRIMARY_SOFT = "var(--chakra-colors-primary-disabled)";
const ACCEPT = "image/jpeg,image/png,application/pdf";
const MAX_SIZE_MB = 10;

export type SlipUploadStatus = "idle" | "processing" | "completed" | "failed";

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const validate = (file: File): string | null => {
  const accepted = ACCEPT.split(",").map((s) => s.trim());
  if (!accepted.includes(file.type))
    return "Unsupported file type. Please upload a JPG, PNG or PDF.";
  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
  return null;
};

const GhostBtn = ({
  icon,
  label,
  onClick,
  tone = "gray",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "gray" | "danger" | "primary";
}) => {
  const tones = {
    gray: { c: "gray.600", h: "gray.50", b: "gray.200" },
    danger: { c: "#B91C1C", h: "#FEF2F2", b: "#FECACA" },
    primary: { c: PRIMARY, h: PRIMARY_SOFT, b: PRIMARY },
  } as const;
  const t = tones[tone];
  return (
    <Flex
      as="button"
      align="center"
      gap={1.5}
      px={2.5}
      py={1.5}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={t.b}
      color={t.c}
      bg="white"
      fontSize="xs"
      fontWeight={600}
      cursor="pointer"
      _hover={{ bg: t.h }}
      transition="all 0.15s"
      onClick={onClick}
    >
      {icon}
      {label}
    </Flex>
  );
};

const Thumb = ({
  url,
  isPdf,
  fileName,
}: {
  url?: string;
  isPdf?: boolean;
  fileName?: string;
}) => (
  <Flex
    align="center"
    justify="center"
    boxSize={{ base: "56px", md: "64px" }}
    borderRadius="lg"
    borderWidth="1px"
    borderColor="gray.200"
    overflow="hidden"
    flexShrink={0}
    bg="gray.50"
  >
    {isPdf || !url ? (
      <Flex direction="column" align="center" color="gray.400" gap={0.5}>
        <LuFileText size={22} />
        <Text fontSize="9px" fontWeight={600}>
          {isPdf ? "PDF" : "FILE"}
        </Text>
      </Flex>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={fileName ?? "slip preview"}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    )}
  </Flex>
);

export type SlipUploadProps = {
  /** What the uploaded document is called in copy, e.g. "cheque slip", "deposit slip". */
  documentLabel: string;
  status: SlipUploadStatus;
  fileName?: string;
  fileSize?: number;
  previewUrl?: string;
  error?: string;
  extractedCount?: number;
  onFilesSelected: (files: File[]) => void;
  onRetry: () => void;
  onRemove: () => void;
};

export function SlipUpload({
  documentLabel,
  status,
  fileName,
  fileSize,
  previewUrl,
  error,
  extractedCount = 0,
  onFilesSelected,
  onRetry,
  onRemove,
}: SlipUploadProps) {
  const browseRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isPdf = fileName?.toLowerCase().endsWith(".pdf");

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const errorMsg = validate(file);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    onFilesSelected([file]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const renderDropzone = () => (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={2}
      py={{ base: 6, md: 7 }}
      px={4}
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={dragging ? PRIMARY : "gray.200"}
      borderRadius="xl"
      bg={dragging ? PRIMARY_SOFT : "gray.50"}
      transition="all 0.15s"
      textAlign="center"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onClick={() => browseRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") browseRef.current?.click();
      }}
      cursor="pointer"
      _hover={{ borderColor: PRIMARY, bg: PRIMARY_SOFT }}
    >
      <Flex
        align="center"
        justify="center"
        boxSize={11}
        borderRadius="full"
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        color={PRIMARY}
      >
        <LuUpload size={18} />
      </Flex>
      <Box>
        <Text fontSize="sm" fontWeight={600} color="gray.800">
          Upload the {documentLabel} to autofill these fields
        </Text>
        <Text fontSize="xs" color="gray.500" mt={0.5}>
          JPG, PNG or PDF · up to {MAX_SIZE_MB}MB
        </Text>
      </Box>
      <Flex gap={2} mt={1} onClick={(e) => e.stopPropagation()}>
        <GhostBtn
          icon={<LuFolderOpen size={13} />}
          label="Browse"
          tone="primary"
          onClick={() => browseRef.current?.click()}
        />
        <GhostBtn
          icon={<LuCamera size={13} />}
          label="Take photo"
          onClick={() => cameraRef.current?.click()}
        />
      </Flex>
    </Flex>
  );

  const renderBusy = () => (
    <Flex gap={3} align="center">
      <Thumb url={previewUrl} isPdf={isPdf} fileName={fileName} />
      <Box flex="1" minW={0}>
        <Text fontSize="sm" fontWeight={600} color="gray.800" truncate>
          {fileName}
        </Text>
        <Flex align="center" gap={2} mt={1.5}>
          <Flex
            align="center"
            gap={1.5}
            px={2}
            py={1}
            borderRadius="md"
            bg="#F5F3FF"
            color="#7C3AED"
            fontSize="xs"
            fontWeight={600}
          >
            <LuSparkles size={12} />
            Reading {documentLabel} with AI…
          </Flex>
          <Spinner size="xs" color="#7C3AED" borderWidth="2px" />
        </Flex>
        <Text fontSize="11px" color="gray.400" mt={1.5}>
          This can take a few seconds.
        </Text>
      </Box>
    </Flex>
  );

  const renderFailed = () => (
    <Box>
      <Flex gap={3} align="flex-start">
        <Thumb url={previewUrl} isPdf={isPdf} fileName={fileName} />
        <Box flex="1" minW={0}>
          <Text fontSize="sm" fontWeight={600} color="gray.800" truncate>
            {fileName ?? documentLabel}
          </Text>
          <Flex align="flex-start" gap={1.5} mt={1} color="#B91C1C">
            <Box mt="1px">
              <LuTriangleAlert size={13} />
            </Box>
            <Text fontSize="xs" lineHeight="1.4">
              {error ?? `We couldn't process this ${documentLabel}.`}
            </Text>
          </Flex>
        </Box>
      </Flex>
      <Flex gap={2} mt={3} wrap="wrap">
        <GhostBtn
          icon={<LuRefreshCw size={13} />}
          label="Retry"
          tone="primary"
          onClick={onRetry}
        />
        <GhostBtn
          icon={<LuReplace size={13} />}
          label="Choose another"
          onClick={() => browseRef.current?.click()}
        />
        <GhostBtn
          icon={<LuTrash2 size={13} />}
          label="Remove"
          tone="danger"
          onClick={onRemove}
        />
      </Flex>
    </Box>
  );

  const renderCompleted = () => (
    <Box>
      <Flex gap={3} align="center">
        <Thumb url={previewUrl} isPdf={isPdf} fileName={fileName} />
        <Box flex="1" minW={0}>
          <Text fontSize="sm" fontWeight={600} color="gray.800" truncate>
            {fileName}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {formatBytes(fileSize)}
          </Text>
          <Flex
            align="center"
            gap={1.5}
            mt={1.5}
            color={PRIMARY}
            fontSize="xs"
            fontWeight={600}
          >
            <LuSparkles size={12} />
            {extractedCount} field{extractedCount === 1 ? "" : "s"} extracted
          </Flex>
        </Box>
      </Flex>
      <Flex gap={2} mt={3} wrap="wrap">
        <GhostBtn
          icon={<LuReplace size={13} />}
          label="Replace"
          onClick={() => browseRef.current?.click()}
        />
        <GhostBtn
          icon={<LuTrash2 size={13} />}
          label="Remove"
          tone="danger"
          onClick={onRemove}
        />
      </Flex>
    </Box>
  );

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      p={{ base: 3, md: 4 }}
    >
      <Flex align="center" gap={1.5} mb={2.5} color="gray.500">
        <LuSparkles size={13} />
        <Text fontSize="xs" fontWeight={600}>
          Upload the {documentLabel} first — we&apos;ll prefill the fields
          below
        </Text>
      </Flex>

      {status === "idle" && renderDropzone()}
      {status === "processing" && renderBusy()}
      {status === "failed" && renderFailed()}
      {status === "completed" && renderCompleted()}

      <input
        ref={browseRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </Box>
  );
}
