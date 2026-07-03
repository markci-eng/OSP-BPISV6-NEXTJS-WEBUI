"use client";

import {
  getPositionDesc,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import { Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { LuUserCheck, LuUsers } from "react-icons/lu";
import { CARD_RADIUS, SOFT_SHADOW } from "../constants";
import { fullName } from "../utils";

/* ─── Destination banner (always shows where agents will move) ───────────── */

export const DestinationBanner = ({
  superior,
  count,
}: {
  superior: SalesAgent | null;
  count: number;
}) => (
  <Flex
    align="center"
    justify="space-between"
    gap={3}
    px={{ base: 4, md: 5 }}
    py={3}
    borderRadius={CARD_RADIUS}
    borderWidth="1px"
    borderColor="gray.200"
    bg={superior ? "gray.50" : "white"}
    boxShadow={SOFT_SHADOW}
  >
    <HStack gap={3} minW={0}>
      <Flex
        align="center"
        justify="center"
        boxSize="36px"
        borderRadius="full"
        flexShrink={0}
        bg={superior ? "gray.200" : "gray.100"}
        color={superior ? "gray.800" : "gray.400"}
      >
        <LuUserCheck size={18} />
      </Flex>
      <Box minW={0}>
        <Text
          fontSize="10px"
          fontWeight="700"
          letterSpacing="0.06em"
          textTransform="uppercase"
          color="gray.500"
        >
          Receiving Superior
        </Text>
        {superior ? (
          <Text fontSize="sm" fontWeight="700" color="gray.900" truncate>
            {fullName(superior)}{" "}
            <Text as="span" color="gray.500" fontWeight="500">
              · {superior.id} · {getPositionDesc(superior.position)}
            </Text>
          </Text>
        ) : (
          <Text fontSize="sm" color="gray.500">
            No superior selected yet
          </Text>
        )}
      </Box>
    </HStack>

    <Badge
      colorPalette="gray"
      variant={count > 0 ? "solid" : "surface"}
      color={count > 0 ? "white" : "gray.500"}
      borderRadius="full"
      px={3}
      py={1.5}
      flexShrink={0}
    >
      <LuUsers size={13} />
      <Text ml={1} fontWeight="700" fontSize="xs">
        {count} agent{count === 1 ? "" : "s"}
      </Text>
    </Badge>
  </Flex>
);
