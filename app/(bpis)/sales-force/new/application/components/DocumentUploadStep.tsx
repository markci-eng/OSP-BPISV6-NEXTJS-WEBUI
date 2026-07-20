"use client";

/**
 * DocumentUploadStep — Step 1 of the application.
 *
 * Renders one DocumentUploadCard per configured document type (fully driven by
 * DOCUMENT_TYPES) plus the "Information detected" summary. The upload grid,
 * validation, and AI processing all come from the shared building blocks, so
 * this file stays declarative.
 */

import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { LuShieldCheck, LuSparkles, LuLock } from "react-icons/lu";
import { DOCUMENT_TYPES } from "../document-config";
import { DocumentUploadCard } from "./DocumentUploadCard";
import { ExtractionSummary } from "./ExtractionSummary";

const PRIMARY = "var(--chakra-colors-primary)";
const PRIMARY_SOFT = "var(--chakra-colors-primary-disabled)";

const TrustChip = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <Flex align="center" gap={1.5} fontSize="xs" color="gray.500">
    <Box color={PRIMARY}>{icon}</Box>
    {label}
  </Flex>
);

export function DocumentUploadStep() {
  return (
    <Flex direction="column" gap={4}>
      {/* Intro / value proposition */}
      <Box
        borderRadius="2xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor="gray.200"
        bg="white"
        shadow="xs"
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "flex-start", sm: "center" }}
          gap={3}
          px={{ base: 4, md: 5 }}
          py={4}
          bg={`${PRIMARY}/10`}
        >
          <Flex
            align="center"
            justify="center"
            boxSize={10}
            borderRadius="xl"
            bg="white"
            color={PRIMARY}
            flexShrink={0}
          >
            <LuSparkles size={20} />
          </Flex>
          <Box>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              fontWeight={700}
              color="gray.900"
            >
              Upload documents to autofill your application
            </Text>
            <Text fontSize="sm" color="gray.600" mt={0.5}>
              We&apos;ll read the details from your ID and signature so you type
              less. Review everything in the next steps.
            </Text>
          </Box>
        </Flex>
        <Flex
          gap={{ base: 3, md: 5 }}
          px={{ base: 4, md: 5 }}
          py={2.5}
          wrap="wrap"
        >
          <TrustChip
            icon={<LuShieldCheck size={13} />}
            label="Encrypted upload"
          />
          <TrustChip
            icon={<LuSparkles size={13} />}
            label="AI-assisted, you stay in control"
          />
          <TrustChip
            icon={<LuLock size={13} />}
            label="Used only for this application"
          />
        </Flex>
      </Box>

      {/* Upload grid — one card per configured document type */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
        gap={3}
      >
        {DOCUMENT_TYPES.map((config) => (
          <DocumentUploadCard key={config.id} config={config} />
        ))}
      </Grid>

      {/* AI results summary */}
      <ExtractionSummary />
    </Flex>
  );
}
