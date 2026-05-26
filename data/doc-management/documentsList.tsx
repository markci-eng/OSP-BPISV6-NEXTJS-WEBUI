"use client";

import { useMemo, useState } from "react";
import { FileText, Check, Filter } from "lucide-react";
import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { DocumentListProps } from "./documenttype";

export default function DocumentList({
  documents,
  selectedIds,
  onToggle,
}: DocumentListProps) {
  const [filterType, setFilterType] = useState<string>("ALL");

  const documentTypes = useMemo(() => {
    const types = Array.from(new Set(documents.map((d) => d.type)));
    return ["ALL", ...types.sort()];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return filterType === "ALL"
      ? documents
      : documents.filter((d) => d.type === filterType);
  }, [documents, filterType]);

  const allSelectedFiltered =
    filteredDocuments.length > 0 &&
    filteredDocuments.every((d) => selectedIds.includes(d.id));

  const handleSelectAll = () => {
    if (allSelectedFiltered) {
      filteredDocuments.forEach((d) => {
        if (selectedIds.includes(d.id)) onToggle(d.id);
      });
    } else {
      filteredDocuments.forEach((d) => {
        if (!selectedIds.includes(d.id)) onToggle(d.id);
      });
    }
  };

  const showEmptyNoDocs = documents.length === 0;
  const showEmptyNoResults =
    documents.length > 0 && filteredDocuments.length === 0;

  return (
    <Flex direction="column" gap="3">
      <HStack justify="space-between">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Documents to Reassign
        </Text>

        <Button
          onClick={handleSelectAll}
          variant="ghost"
          size="sm"
          disabled={filteredDocuments.length === 0}
        >
          {allSelectedFiltered ? "Deselect All" : "Select All"}
        </Button>
      </HStack>

      {documents.length > 0 && (
        <HStack gap="2" align="center">
          <Box opacity={0.7}>
            <Filter size={16} />
          </Box>

          <Flex wrap="wrap" gap="1.5">
            {documentTypes.map((type) => {
              const active = filterType === type;
              return (
                <Button
                  key={type}
                  size="xs"
                  variant={active ? "solid" : "subtle"}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </Button>
              );
            })}
          </Flex>
        </HStack>
      )}

      {showEmptyNoDocs ? (
        <Box
          borderWidth="1px"
          borderStyle="dashed"
          borderRadius="lg"
          bg="bg.muted"
          p="8"
          textAlign="center"
          color="black"
        >
          <Box display="grid" placeItems="center" mb="2" opacity={0.6}>
            <FileText size={32} />
          </Box>
          <Text fontSize="sm" color="fg.muted">
            Select a source employee to view their documents
          </Text>
        </Box>
      ) : showEmptyNoResults ? (
        <Box
          borderWidth="1px"
          borderStyle="dashed"
          borderRadius="lg"
          bg="bg.muted"
          p="6"
          textAlign="center"
        >
          <Text fontSize="sm" color="fg.muted">
            No {filterType} documents found
          </Text>
        </Box>
      ) : (
        <Box
          borderWidth="1px"
          borderRadius="lg"
          bg="bg"
          p="2"
          maxH="320px"
          overflowY="auto"
        >
          <Flex direction="column" gap="2">
            {filteredDocuments.map((doc) => {
              const isSelected = selectedIds.includes(doc.id);

              return (
                <Button
                  key={doc.id}
                  onClick={() => onToggle(doc.id)}
                  variant="ghost"
                  w="full"
                  h="auto"
                  py="3"
                  px="3"
                  borderRadius="md"
                  // ✅ force left layout like screenshot #1
                  justifyContent="flex-start"
                  textAlign="left"
                  alignItems="stretch"
                  bg={isSelected ? "colorPalette.subtle" : "transparent"}
                >
                  {/* ✅ make inner container full width */}
                  <Box w="full">
                    <HStack gap="3" w="full" align="center">
                      {/* checkbox square */}
                      <Box
                        h="5"
                        w="5"
                        borderWidth="1px"
                        borderRadius="sm"
                        display="grid"
                        placeItems="center"
                        flexShrink={0}
                        bg={isSelected ? "colorPalette.solid" : "bg"}
                        color={isSelected ? "colorPalette.contrast" : "fg"}
                        borderColor={
                          isSelected ? "colorPalette.solid" : "border"
                        }
                      >
                        {isSelected ? <Check size={12} /> : null}
                      </Box>

                      {/* file icon */}
                      <Box opacity={0.7} flexShrink={0}>
                        <FileText size={16} />
                      </Box>

                      {/* text block */}
                      <Box minW="0" flex="1" textAlign="left">
                        <Text fontSize="sm" fontWeight="semibold" truncate>
                          {doc.name}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          {doc.type} · {doc.date}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                </Button>
              );
            })}
          </Flex>
        </Box>
      )}

      {documents.length > 0 && (
        <Text fontSize="sm" color="fg.muted">
          {selectedIds.length} of {documents.length} documents selected
        </Text>
      )}
    </Flex>
  );
}
