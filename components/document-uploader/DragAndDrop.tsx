"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Progress,
  Spinner,
} from "@chakra-ui/react";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";
import FilePreviewDialog from "./FilePreviewDialog";

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  errorMessage?: string;
  uploadedAt: Date;
}

interface DocumentUploaderProps {
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  onFilesChange?: (files: UploadedFile[]) => void;
  canPicture?: boolean;
  className?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIconColor = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";

  const colors: Record<string, string> = {
    pdf: "red.500",
    doc: "blue.500",
    docx: "blue.500",
    xls: "green.500",
    xlsx: "green.500",
  };

  return colors[ext] ?? "gray.500";
};

const FILE_ITEM_HEIGHT = 72;
const MAX_VISIBLE_FILES = 5;

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg",
  maxSizeMB = 20,
  maxFiles = 10,
  onFilesChange,
  canPicture = false,
  className,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback(
    (uploadFile: UploadedFile) => {
      const duration = 1200 + Math.random() * 1800;
      const interval = 50;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        const progress = Math.min(100, Math.round((elapsed / duration) * 100));

        setFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  progress,
                  status:
                    progress === 100
                      ? ("success" as const)
                      : ("uploading" as const),
                }
              : f,
          );

          if (progress === 100) onFilesChange?.(updated);
          return updated;
        });

        if (elapsed >= duration) clearInterval(timer);
      }, interval);
    },
    [onFilesChange],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const remaining = maxFiles - files.length;
      const valid = arr.slice(0, remaining);

      const newFiles: UploadedFile[] = valid
        .filter((f) => f.size <= maxSizeMB * 1024 * 1024)
        .map((f) => ({
          id: crypto.randomUUID(),
          file: f,
          progress: 0,
          status: "uploading" as const,
          uploadedAt: new Date(),
        }));

      const oversized: UploadedFile[] = valid
        .filter((f) => f.size > maxSizeMB * 1024 * 1024)
        .map((f) => ({
          id: crypto.randomUUID(),
          file: f,
          progress: 0,
          status: "error" as const,
          errorMessage: `Exceeds ${maxSizeMB}MB limit`,
          uploadedAt: new Date(),
        }));

      const all = [...newFiles, ...oversized];

      setFiles((prev) => [...prev, ...all]);
      newFiles.forEach((f) => simulateUpload(f));
    },
    [files.length, maxFiles, maxSizeMB, simulateUpload],
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const updated = prev.filter((f) => f.id !== id);
        onFilesChange?.(updated);

        if (previewFile?.id === id) {
          setPreviewFile(null);
        }

        return updated;
      });
    },
    [onFilesChange, previewFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);

      if (e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const needsScroll = files.length > MAX_VISIBLE_FILES;

  const fileList = (
    <VStack as="ul" gap={2} align="stretch" listStyle="none" p={0} m={0}>
      {files.map((f) => (
        <HStack
          as="li"
          key={f.id}
          gap={3}
          align="center"
          p={{ base: 3, sm: 4 }}
          borderWidth="1px"
          borderColor="border"
          bg="bg.panel"
          rounded="lg"
          transition="all 0.2s"
          _hover={{ shadow: "sm" }}
          role="group"
          cursor={f.status === "success" ? "pointer" : "default"}
          onClick={() => {
            if (f.status === "success") {
              setPreviewFile(f);
            }
          }}
        >
          <Box flexShrink={0} color={getFileIconColor(f.file.name)}>
            <FileText size={20} />
          </Box>

          <Box flex="1" minW={0}>
            <HStack justify="space-between" gap={2} align="start">
              <Text truncate fontSize="sm" fontWeight="medium" color="fg">
                {f.file.name}
              </Text>

              <Text flexShrink={0} fontSize="xs" color="fg.muted">
                {formatFileSize(f.file.size)}
              </Text>
            </HStack>

            {f.status === "uploading" && (
              <HStack mt={2} gap={2}>
                <Progress.Root value={f.progress} size="xs" flex="1">
                  <Progress.Track rounded="full">
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>

                <Text
                  w="8"
                  textAlign="right"
                  fontSize="xs"
                  color="fg.muted"
                  fontVariantNumeric="tabular-nums"
                >
                  {f.progress}%
                </Text>
              </HStack>
            )}

            {f.status === "success" && (
              <HStack mt={1} gap={1} color="green.500">
                <CheckCircle2 size={14} />
                <Text fontSize="xs">Uploaded</Text>
              </HStack>
            )}

            {f.status === "error" && (
              <HStack mt={1} gap={1} color="red.500">
                <AlertCircle size={14} />
                <Text fontSize="xs">{f.errorMessage ?? "Upload failed"}</Text>
              </HStack>
            )}
          </Box>

          {f.status === "uploading" ? (
            <Spinner size="sm" color="fg.muted" flexShrink={0} />
          ) : (
            <IconButton
              aria-label={`Remove ${f.file.name}`}
              variant="ghost"
              size="sm"
              flexShrink={0}
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.2s"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(f.id);
              }}
            >
              <X size={16} />
            </IconButton>
          )}
        </HStack>
      ))}
    </VStack>
  );

  return (
    <Box w="full" maxW="2xl" mx="auto" className={className}>
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        cursor="pointer"
        rounded="xl"
        borderWidth="2px"
        borderStyle="dashed"
        p={{ base: 8, sm: 12 }}
        textAlign="center"
        transition="all 0.2s"
        borderColor={isDragActive ? "blue.500" : "border.emphasized"}
        bg={isDragActive ? "blue.50" : "bg.muted"}
        transform={isDragActive ? "scale(1.01)" : "scale(1)"}
        shadow={isDragActive ? "lg" : "none"}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          hidden
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        <VStack gap={3}>
          <Box
            rounded="full"
            p={4}
            bg={isDragActive ? "blue.100" : "blue.50"}
            color={isDragActive ? "blue.600" : "fg.muted"}
            transition="all 0.2s"
          >
            <Upload size={28} />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="fg">
              Drop files here or{" "}
              <Box as="span" color="blue.500" textDecoration="underline">
                browse
              </Box>
            </Text>

            <Text mt={1} fontSize="xs" color="fg.muted">
              Up to {maxFiles} files · Max {maxSizeMB}MB each
            </Text>
          </Box>
        </VStack>
      </Box>
      {canPicture && (
        <Box mt={3} display="flex" justifyContent="center">
          {/* <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        /> */}

          <Button
            variant="outline"
            size="sm"
            onClick={() => cameraRef.current?.click()}
          >
            <Camera size={16} />
            <Text ml={2}>Take a photo</Text>
          </Button>
        </Box>
      )}

      {files.length > 0 && (
        <Box
          mt={4}
          maxH={
            needsScroll
              ? `${MAX_VISIBLE_FILES * FILE_ITEM_HEIGHT}px`
              : undefined
          }
          overflowY={needsScroll ? "auto" : "visible"}
          pr={needsScroll ? 2 : 0}
        >
          {fileList}
        </Box>
      )}

      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open: boolean) => {
          if (!open) setPreviewFile(null);
        }}
      />
    </Box>
  );
};

export default DocumentUploader;
