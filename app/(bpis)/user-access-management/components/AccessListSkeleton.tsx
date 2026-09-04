"use client";

import { Box, Flex, HStack, Skeleton, Spinner, Text } from "@chakra-ui/react";

const ROW_COUNT = 5;

/** Placeholder rows shown while a user's permissions are being fetched. */
export function AccessListSkeleton({ userName }: { userName: string }) {
  return (
    <Flex direction="column" gap={2.5}>
      <HStack gap={2.5} pb={1.5} px={0.5}>
        <Spinner size="xs" color="var(--chakra-colors-primary)" />
        <Text fontSize="xs" color="gray.500">
          Loading permissions for {userName}…
        </Text>
      </HStack>

      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <Skeleton
          key={index}
          h={{ base: "66px", md: "58px" }}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Box />
        </Skeleton>
      ))}
    </Flex>
  );
}
