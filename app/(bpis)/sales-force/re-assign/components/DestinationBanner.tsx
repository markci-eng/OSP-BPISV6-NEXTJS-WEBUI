"use client";

import {
  getPositionDesc,
  SalesAgent,
} from "@/components/common/agent-lookup/agent-lookup.type";
import { Avatar, Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import React from "react";
import { LuBuilding2, LuMapPin, LuUserCheck, LuUsers } from "react-icons/lu";
import { CARD_RADIUS, SOFT_SHADOW } from "../constants";
import { fullName, initials } from "../utils";
import { RankBadge } from "./shared";

/* Uppercase column head, matching the result-card column labels. */
const ColumnLabel = ({ children }: { children: React.ReactNode }) => (
  <Text
    fontSize="9px"
    fontWeight="700"
    letterSpacing="0.06em"
    textTransform="uppercase"
    color="gray.400"
    lineHeight="1"
  >
    {children}
  </Text>
);

/* Vertical hairline separating banner sections. */
const Divider = () => <Box w="1px" alignSelf="stretch" bg="gray.200" my={1} />;

/* Icon + value column, matching the result-card Branch / Area columns. */
const DetailColumn = ({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
}) => (
  <Flex direction="column" gap={1.5} flex="1" minW={0}>
    <ColumnLabel>{label}</ColumnLabel>
    <HStack gap={1.5} color="gray.700" minW={0}>
      <Box flexShrink={0} display="flex" color="gray.400">
        {icon}
      </Box>
      <Text fontSize="13px" fontWeight="600" truncate>
        {value}
      </Text>
    </HStack>
  </Flex>
);

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
    py={3}
    px={{ base: 4, md: 5, lg: 4 }}
    borderRadius={{ base: CARD_RADIUS, lg: "12px" }}
    borderWidth={{ base: "1px", lg: "1.5px" }}
    borderColor={{ base: "gray.200", lg: superior ? "gray.400" : "gray.200" }}
    bg={superior ? "gray.50" : "white"}
    boxShadow={SOFT_SHADOW}
  >
    {/* Mobile / tablet — original compact banner */}
    <Flex
      display={{ base: "flex", lg: "none" }}
      flex="1"
      align="center"
      justify="space-between"
      gap={3}
      minW={0}
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
        colorPalette="green"
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

    {/* Desktop — card-style layout with labeled columns */}
    <Flex
      display={{ base: "none", lg: "flex" }}
      flex="1"
      align="center"
      gap={4}
      minW={0}
    >
      {/* Identity */}
      <HStack gap={3} flex="1.4" minW={0}>
        {superior ? (
          <Avatar.Root colorPalette="gray" size="md" flexShrink={0}>
            <Avatar.Fallback>{initials(superior)}</Avatar.Fallback>
          </Avatar.Root>
        ) : (
          <Flex
            align="center"
            justify="center"
            boxSize="40px"
            borderRadius="full"
            flexShrink={0}
            bg="gray.100"
            color="gray.400"
          >
            <LuUserCheck size={18} />
          </Flex>
        )}

        <Box minW={0}>
          <ColumnLabel>Receiving Superior</ColumnLabel>
          {superior ? (
            <>
              <HStack gap={2} mt={1} minW={0}>
                <Text fontWeight="700" fontSize="sm" color="gray.900" truncate>
                  {fullName(superior)}
                </Text>
                <RankBadge position={superior.position} />
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={0.5}>
                {superior.id}
              </Text>
            </>
          ) : (
            <Text fontSize="sm" color="gray.500" mt={1}>
              No superior selected yet
            </Text>
          )}
        </Box>
      </HStack>

      {superior && (
        <>
          <Divider />
          <DetailColumn
            label="Branch"
            icon={<LuBuilding2 size={13} />}
            value={superior.branch}
          />
          <DetailColumn
            label="Area"
            icon={<LuMapPin size={13} />}
            value={superior.address.province}
          />
        </>
      )}

      <Divider />

      {/* Agents moving */}
      <Flex
        direction="column"
        gap={1.5}
        align="center"
        flexShrink={0}
        minW="76px"
      >
        <ColumnLabel>Agents</ColumnLabel>
        <Badge
          colorPalette="green"
          variant={count > 0 ? "solid" : "surface"}
          color={count > 0 ? "white" : "gray.500"}
          borderRadius="full"
          px={2.5}
          py={1}
        >
          <LuUsers size={13} />
          <Text ml={1} fontWeight="700" fontSize="11px">
            {count}
          </Text>
        </Badge>
      </Flex>
    </Flex>
  </Flex>
);
