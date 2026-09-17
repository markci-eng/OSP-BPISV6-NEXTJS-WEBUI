"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Box, Flex, HStack, Input, Text } from "@chakra-ui/react";
import { LuChevronDown, LuSearch } from "react-icons/lu";
import { BrandedAvatar, OSPBadge } from "osp-ui-kit";

import type { AccessUser } from "../types";
import { ACCESS_COLORS, CODE_FONT } from "../lib/access-theme";

type UserSelectCardProps = {
  users: AccessUser[];
  selectedUser: AccessUser | null;
  onSelect: (user: AccessUser) => void;
  /** "12 / 60" — granted vs. total permissions for the selected user. */
  grantedLabel: string;
};

function InfoField({ label, value }: { label: string; value: ReactNode }) {
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

export function UserSelectCard({
  users,
  selectedUser,
  onSelect,
  grantedLabel,
}: UserSelectCardProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.memberCode.includes(q) ||
        user.position.toLowerCase().includes(q),
    );
  }, [users, query]);

  const select = (user: AccessUser) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    onSelect(user);
    setQuery("");
    setOpen(false);
  };

  // The menu closes on blur, but a click on a result blurs the input *before*
  // the click lands — so defer the close by a tick and cancel it on select.
  const closeSoon = () => {
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="xs"
    >
      <Flex
        p={4}
        gap={4}
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        wrap="wrap"
      >
        <Text
          fontSize="xs"
          fontWeight="600"
          color="gray.600"
          flexShrink={0}
          display={{ base: "none", md: "block" }}
        >
          Search user
        </Text>

        <Box position="relative" flex="1" minW={0} maxW={{ md: "440px" }}>
          <Box
            position="absolute"
            left="11px"
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
            pointerEvents="none"
            zIndex={1}
          >
            <LuSearch size={15} />
          </Box>
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={closeSoon}
            placeholder="Name, member code or position…"
            pl="33px"
            pr="30px"
            fontSize="sm"
            bg="white"
            borderColor="gray.300"
            _focusVisible={{
              borderColor: ACCESS_COLORS.accent,
              boxShadow:
                "0 0 0 3px color-mix(in srgb, var(--chakra-colors-primary) 14%, transparent)",
            }}
          />
          <Box
            position="absolute"
            right="10px"
            top="50%"
            transform="translateY(-50%)"
            color="gray.500"
            pointerEvents="none"
          >
            <LuChevronDown size={14} />
          </Box>

          {open && (
            <Box
              position="absolute"
              top="calc(100% + 6px)"
              left={0}
              right={0}
              zIndex={40}
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="lg"
              shadow="lg"
              maxH="288px"
              overflowY="auto"
              p={1.5}
            >
              {results.map((user) => {
                const active = user.id === selectedUser?.id;
                return (
                  <HStack
                    key={user.id}
                    gap={3}
                    px={2.5}
                    py={2}
                    borderRadius="md"
                    cursor="pointer"
                    bg={
                      active
                        ? "color-mix(in srgb, var(--chakra-colors-primary) 8%, transparent)"
                        : "transparent"
                    }
                    _hover={{ bg: "gray.100" }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => select(user)}
                  >
                    <BrandedAvatar name={user.name} size="sm" />
                    <Box minW={0} flex="1">
                      <Text fontSize="sm" fontWeight="500" color="gray.800">
                        {user.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500" lineClamp={1}>
                        {user.position} · {user.branch}
                      </Text>
                    </Box>
                    <Text
                      fontFamily={CODE_FONT}
                      fontSize="xs"
                      color="gray.400"
                      flexShrink={0}
                    >
                      {user.memberCode}
                    </Text>
                  </HStack>
                );
              })}

              {results.length === 0 && (
                <Box py={4} px={3} textAlign="center">
                  <Text fontSize="xs" color="gray.400">
                    No users match &ldquo;{query}&rdquo;
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Text
          fontSize="xs"
          color="gray.400"
          flexShrink={0}
          ml={{ md: "auto" }}
          display={{ base: "none", md: "block" }}
        >
          {users.length} users in scope
        </Text>
      </Flex>

      {selectedUser && (
        <Flex
          borderTopWidth="1px"
          borderColor="gray.100"
          bg="gray.50"
          borderBottomRadius="xl"
          p={4}
          gap={{ base: 3, md: 5 }}
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", lg: "row" }}
        >
          <HStack gap={3} flexShrink={0}>
            <BrandedAvatar name={selectedUser.name} size="lg" ringed />
            <Box minW={0}>
              <Text fontSize="md" fontWeight="600" color="gray.800">
                {selectedUser.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {selectedUser.email}
              </Text>
            </Box>
          </HStack>

          <Flex
            gap={{ base: 5, md: 8 }}
            wrap="wrap"
            pl={{ lg: 5 }}
            borderLeftWidth={{ base: 0, lg: "1px" }}
            borderColor="gray.200"
          >
            <InfoField
              label="Member code"
              value={
                <Text fontFamily={CODE_FONT} fontSize="sm" color="gray.700">
                  {selectedUser.memberCode}
                </Text>
              }
            />
            <InfoField
              label="Position"
              value={
                <Text fontSize="sm" color="gray.700">
                  {selectedUser.position}
                </Text>
              }
            />
            <InfoField
              label="Branch"
              value={
                <Text fontSize="sm" color="gray.700">
                  {selectedUser.branch}
                </Text>
              }
            />
            <InfoField
              label="Status"
              value={
                <OSPBadge
                  type={selectedUser.status === "Active" ? "success" : "warning"}
                >
                  {selectedUser.status}
                </OSPBadge>
              }
            />
            <InfoField
              label="Total access"
              value={
                <Text fontSize="sm" color="gray.700">
                  {grantedLabel}
                </Text>
              }
            />
          </Flex>
        </Flex>
      )}
    </Box>
  );
}
