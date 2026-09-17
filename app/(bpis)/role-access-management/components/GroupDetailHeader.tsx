"use client";

import type { ReactNode } from "react";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { LuLock } from "react-icons/lu";

import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";
import type { AccessGroup } from "../types";
import { SYSTEM_CODE } from "../data/access-groups";

type GroupDetailHeaderProps = {
  group: AccessGroup;
  /** "34 / 61" — granted vs. total for the working draft, so it tracks edits. */
  grantedLabel: string;
  memberCount: number;
};

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Text
        fontSize="10.5px"
        fontWeight="600"
        color="gray.400"
        letterSpacing="0.05em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Box mt="3px">{value}</Box>
    </Box>
  );
}

/** Identity and headline numbers for the group being edited. */
export function GroupDetailHeader({
  group,
  grantedLabel,
  memberCount,
}: GroupDetailHeaderProps) {
  return (
    <Flex
      align="flex-start"
      gap={4}
      p={4}
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="xs"
      wrap="wrap"
    >
      <Flex
        w="44px"
        h="44px"
        flexShrink={0}
        align="center"
        justify="center"
        borderRadius="lg"
        fontFamily={CODE_FONT}
        fontSize="xs"
        fontWeight="600"
        color={ACCESS_COLORS.accent}
        bg="color-mix(in srgb, var(--chakra-colors-primary) 10%, transparent)"
      >
        {group.code.slice(0, 3)}
      </Flex>

      <Box minW="200px" flex="1">
        <HStack gap={2} wrap="wrap">
          <Text fontSize="md" fontWeight="600" color="gray.800">
            {group.description}
          </Text>
          {group.system && (
            <HStack
              gap={1}
              px={2}
              py="1px"
              borderRadius="full"
              borderWidth="1px"
              borderColor="gray.200"
              bg="gray.100"
              color="gray.500"
            >
              <LuLock size={9} />
              <Text
                fontSize="10px"
                fontWeight="600"
                textTransform="uppercase"
                letterSpacing="0.04em"
              >
                Locked
              </Text>
            </HStack>
          )}
        </HStack>

        <Text fontSize="xs" color="gray.500" mt={1}>
          AccessGroupCode{" "}
          <Text as="span" fontFamily={CODE_FONT} color="gray.700">
            {group.code}
          </Text>{" "}
          · SystemCode{" "}
          <Text as="span" fontFamily={CODE_FONT} color="gray.700">
            {SYSTEM_CODE}
          </Text>
        </Text>
      </Box>

      <Flex gap={{ base: 5, md: 8 }} wrap="wrap">
        <Stat
          label="Permissions"
          value={
            <Text fontSize="sm" fontWeight="600" color="gray.700">
              {grantedLabel}
            </Text>
          }
        />
        <Stat
          label="Users assigned"
          value={
            <Text fontSize="sm" fontWeight="600" color="gray.700">
              {memberCount}
            </Text>
          }
        />
        <Stat
          label="Last modified"
          value={
            <Text fontSize="sm" color="gray.700">
              {group.modified}
            </Text>
          }
        />
      </Flex>
    </Flex>
  );
}
