"use client";

import React, { useMemo, useEffect } from "react";
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Download,
} from "lucide-react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { UploadedFile } from "./DragAndDrop";
import { format } from "date-fns/format";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getCategory = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";

  if (["pdf"].includes(ext)) return "PDF";
  if (["doc", "docx", "txt"].includes(ext)) return "Document";
  if (["xls", "xlsx", "csv"].includes(ext)) return "Spreadsheet";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return "Image";

  return "Other";
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "PDF":
    case "Document":
      return FileText;
    case "Spreadsheet":
      return FileSpreadsheet;
    case "Image":
      return ImageIcon;
    default:
      return File;
  }
};

const categoryStyles: Record<
  string,
  {
    badgeBg: string;
    badgeColor: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  PDF: {
    badgeBg: "red.50",
    badgeColor: "red.600",
    iconBg: "red.50",
    iconColor: "red.600",
  },
  Document: {
    badgeBg: "blue.50",
    badgeColor: "blue.600",
    iconBg: "blue.50",
    iconColor: "blue.600",
  },
  Spreadsheet: {
    badgeBg: "green.50",
    badgeColor: "green.600",
    iconBg: "green.50",
    iconColor: "green.600",
  },
  Image: {
    badgeBg: "purple.50",
    badgeColor: "purple.600",
    iconBg: "purple.50",
    iconColor: "purple.600",
  },
  Other: {
    badgeBg: "gray.100",
    badgeColor: "gray.600",
    iconBg: "gray.100",
    iconColor: "gray.600",
  },
};

interface FilePreviewDialogProps {
  file: UploadedFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  file,
  open,
  onOpenChange,
}) => {
  const previewUrl = useMemo(() => {
    if (!file || !file.file.size) return null;

    const cat = getCategory(file.file.name);

    if (cat === "Image") {
      try {
        return URL.createObjectURL(file.file);
      } catch {
        return null;
      }
    }

    return null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!file) return null;

  const cat = getCategory(file.file.name);
  const IconComponent = getCategoryIcon(cat);
  const ext = file.file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  const style = categoryStyles[cat] ?? categoryStyles.Other;

  const handleDownload = () => {
    if (!file.file.size) return;

    try {
      const url = URL.createObjectURL(file.file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // File data not available
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      size="lg"
      placement="center"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxH="90vh" overflow="hidden">
          <Dialog.Header>
            <Dialog.Title>
              <HStack gap={2} minW={0} pr={8}>
                <Box color={style.iconColor} flexShrink={0}>
                  <Icon as={IconComponent} boxSize={5} />
                </Box>
                <Text fontSize="md" fontWeight="semibold" truncate>
                  {file.file.name}
                </Text>
              </HStack>
            </Dialog.Title>
            {/* <Dialog.Description>File details and preview</Dialog.Description> */}
          </Dialog.Header>

          <Dialog.Body overflowY="auto">
            <VStack align="stretch" gap={4}>
              <Box
                rounded="lg"
                borderWidth="1px"
                borderColor="border"
                bg="bg.muted"
                overflow="hidden"
              >
                {previewUrl ? (
                  <Box bg="bg.subtle" display="flex" justifyContent="center">
                    <img
                      src={previewUrl}
                      alt={file.file.name}
                      style={{
                        width: "100%",
                        maxHeight: "18rem",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </Box>
                ) : (
                  <VStack py={16} gap={3}>
                    <Box
                      rounded="xl"
                      p={4}
                      bg={style.iconBg}
                      color={style.iconColor}
                    >
                      <Icon as={IconComponent} boxSize={10} />
                    </Box>
                    <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                      .{ext} file
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      Preview not available
                    </Text>
                  </VStack>
                )}
              </Box>

              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                <Box
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.panel"
                  p={3}
                >
                  <Text fontSize="xs" color="fg.muted" mb={1}>
                    Category
                  </Text>
                  <Badge
                    variant="subtle"
                    bg={style.badgeBg}
                    color={style.badgeColor}
                    borderRadius="md"
                    px={2}
                    py={1}
                  >
                    {cat}
                  </Badge>
                </Box>

                <Box
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.panel"
                  p={3}
                >
                  <Text fontSize="xs" color="fg.muted" mb={1}>
                    Size
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color="fg">
                    {formatFileSize(file.file.size)}
                  </Text>
                </Box>

                <Box
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.panel"
                  p={3}
                >
                  <Text fontSize="xs" color="fg.muted" mb={1}>
                    Uploaded
                  </Text>
                  <Text fontSize="xs" fontWeight="medium" color="fg">
                    {format(file.uploadedAt, "MMM d, yyyy h:mm a")}
                  </Text>
                </Box>

                <Box
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.panel"
                  p={3}
                >
                  <Text fontSize="xs" color="fg.muted" mb={1}>
                    Modified
                  </Text>
                  <Text fontSize="xs" fontWeight="medium" color="fg">
                    {file.file.lastModified
                      ? format(new Date(file.file.lastModified), "MMM d, yyyy")
                      : "—"}
                  </Text>
                </Box>
              </SimpleGrid>

              {file.file.size > 0 && (
                <Button w="full" onClick={handleDownload}>
                  <Download size={16} />
                  <Text ml={2}>Download</Text>
                </Button>
              )}
            </VStack>
          </Dialog.Body>

          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default FilePreviewDialog;
