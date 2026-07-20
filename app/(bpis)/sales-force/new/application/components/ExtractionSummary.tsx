"use client";

/**
 * ExtractionSummary — the "Information detected" reassurance panel.
 *
 * Appears once at least one document has finished processing and confirms, in
 * plain language, what was read from the applicant's documents before they move
 * on. It never blocks progress; it builds trust.
 */

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuCheck, LuSparkles, LuCircleDashed } from "react-icons/lu";
import { useApplication } from "../application-context";

const PRIMARY = "var(--chakra-colors-primary)";
const PRIMARY_SOFT = "var(--chakra-colors-primary-disabled)";

export function ExtractionSummary() {
  const { documents, extractionSummary } = useApplication();

  const anyCompleted = Object.values(documents).some(
    (d) => d.status === "completed",
  );
  if (!anyCompleted) return null;

  const detectedCount = extractionSummary.filter((i) => i.detected).length;

  return (
    <Box
      borderWidth="1px"
      borderColor={PRIMARY}
      borderRadius="2xl"
      overflow="hidden"
      bg="white"
      shadow="xs"
    >
      <Flex
        align="center"
        gap={2}
        px={{ base: 4, md: 5 }}
        py={3}
        bg={`${PRIMARY}/10`}
      >
        <Flex
          align="center"
          justify="center"
          boxSize={7}
          borderRadius="full"
          bg="white"
          color={PRIMARY}
          flexShrink={0}
        >
          <LuSparkles size={15} />
        </Flex>
        <Box>
          <Text
            fontSize="sm"
            fontWeight={700}
            color="gray.900"
            lineHeight="1.2"
          >
            Information detected
          </Text>
          <Text fontSize="xs" color="gray.600">
            {detectedCount} of {extractionSummary.length} items ready to prefill
          </Text>
        </Box>
      </Flex>

      <Box px={{ base: 4, md: 5 }} py={3}>
        <Flex direction="column" gap={2}>
          {extractionSummary.map((item) => (
            <Flex key={item.label} align="center" gap={2.5}>
              <Flex
                align="center"
                justify="center"
                boxSize={5}
                borderRadius="full"
                bg={item.detected ? PRIMARY : "gray.100"}
                color={item.detected ? "white" : "gray.400"}
                flexShrink={0}
              >
                {item.detected ? (
                  <LuCheck size={12} />
                ) : (
                  <LuCircleDashed size={12} />
                )}
              </Flex>
              <Text
                fontSize="sm"
                fontWeight={item.detected ? 600 : 400}
                color={item.detected ? "gray.800" : "gray.400"}
              >
                {item.label}
              </Text>
              {!item.detected && (
                <Text fontSize="xs" color="gray.400" ml="auto">
                  add manually
                </Text>
              )}
            </Flex>
          ))}
        </Flex>

        <Text fontSize="xs" color="gray.500" mt={3} lineHeight="1.5">
          We&apos;ll prefill the next steps with this information. You can
          review and edit everything before submitting — nothing is locked.
        </Text>
      </Box>
    </Box>
  );
}
