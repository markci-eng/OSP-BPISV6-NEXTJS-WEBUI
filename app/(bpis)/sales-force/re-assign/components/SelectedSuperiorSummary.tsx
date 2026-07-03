"use client";

import {
  getPositionDesc,
  getSubordinates,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import { Avatar, Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import {
  LuBuilding2,
  LuCheck,
  LuMapPin,
  LuRotateCcw,
  LuUsers,
} from "react-icons/lu";
import { fullName, initials } from "../utils";
import { MetaItem } from "./shared";

/* ─── Selected superior summary ──────────────────────────────────────────── */

export const SelectedSuperiorSummary = ({
  superior,
  onChange,
}: {
  superior: SalesAgent;
  onChange: () => void;
}) => {
  const teamSize = getSubordinates(superior.id).length;
  return (
    <Flex
      direction="column"
      gap={3}
      p={4}
      borderRadius="12px"
      borderWidth="1.5px"
      borderColor="gray.200"
      bg="gray.50"
    >
      <Flex align="center" justify="space-between" gap={3}>
        <HStack gap={3} minW={0}>
          <Avatar.Root colorPalette="gray" size="lg" flexShrink={0}>
            <Avatar.Fallback>{initials(superior)}</Avatar.Fallback>
          </Avatar.Root>
          <Box minW={0}>
            <Text fontWeight="700" fontSize="md" color="gray.900" truncate>
              {fullName(superior)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {superior.id} · {getPositionDesc(superior.position)}
            </Text>
          </Box>
        </HStack>
        <Badge
          bg="primary"
          variant="solid"
          color={"white"}
          borderRadius="full"
          px={2.5}
          py={1}
          flexShrink={0}
        >
          <LuCheck size={12} />
          <Text ml={1} fontSize="11px" fontWeight="700">
            Selected
          </Text>
        </Badge>
      </Flex>

      <Flex wrap="wrap" gap={2}>
        <MetaItem icon={<LuBuilding2 size={13} />}>{superior.branch}</MetaItem>
        <MetaItem icon={<LuMapPin size={13} />}>
          {superior.address.province}
        </MetaItem>
        <MetaItem icon={<LuUsers size={13} />}>
          {teamSize} current team member{teamSize === 1 ? "" : "s"}
        </MetaItem>
      </Flex>

      <Flex
        as="button"
        onClick={onChange}
        align="center"
        justify="center"
        gap={1.5}
        py={2}
        borderRadius="8px"
        borderWidth="1px"
        borderColor="gray.300"
        bg="white"
        color="gray.700"
        fontSize="13px"
        fontWeight="600"
        cursor="pointer"
        _hover={{ bg: "gray.50" }}
        transition="background 0.15s ease"
      >
        <LuRotateCcw size={14} />
        Change receiving superior
      </Flex>
    </Flex>
  );
};
