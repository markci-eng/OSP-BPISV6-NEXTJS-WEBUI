"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";

import type { PermissionMap } from "../types";
import {
  ACCESS_MODULES,
  TOTAL_PERMISSION_COUNT,
} from "../data/access-modules";
import {
  ACCESS_COLORS,
  CODE_FONT,
} from "../lib/access-theme";

type EffectiveAccessCardProps = {
  /** Union of the roles in the working draft. */
  effective: PermissionMap;
  /** Union of the roles the user currently holds, for the per-module delta. */
  current: PermissionMap;
};

/**
 * Module-by-module readout of what the user would end up with — the union of
 * every selected preset, with a delta against what they hold today.
 */
export function EffectiveAccessCard({
  effective,
  current,
}: EffectiveAccessCardProps) {
  const total = ACCESS_MODULES.reduce(
    (sum, module) =>
      sum + module.functions.filter((fn) => effective[fn.code]).length,
    0,
  );

  return (
    <Box
      as="section"
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="xs"
      overflow="hidden"
    >
      <Flex
        align="center"
        gap={2.5}
        px={4}
        py={3}
        borderBottomWidth="1px"
        borderColor="gray.100"
        wrap="wrap"
      >
        <Text fontSize="sm" fontWeight="600" color="gray.800">
          Resulting access
        </Text>
        <Text fontSize="xs" color="gray.500">
          {total} of {TOTAL_PERMISSION_COUNT} permissions · union of all
          selected role presets
        </Text>
      </Flex>

      <Box px={{ base: 2, md: 3 }} pt={2} pb={3}>
        {ACCESS_MODULES.map((module) => {
          const granted = module.functions.filter(
            (fn) => effective[fn.code],
          ).length;
          const held = module.functions.filter((fn) => current[fn.code]).length;
          const delta = granted - held;
          const moduleTotal = module.functions.length;
          const isAll = granted === moduleTotal;

          return (
            <Flex
              key={module.code}
              align="center"
              gap={3}
              px={1}
              py={2.5}
              borderBottomWidth="1px"
              borderColor="gray.50"
            >
              <Text
                flexShrink={0}
                w="44px"
                textAlign="center"
                fontFamily={CODE_FONT}
                fontSize="11px"
                px={1.5}
                py="2px"
                borderRadius="sm"
                bg="gray.100"
                color="gray.500"
              >
                {module.code}
              </Text>

              <Text
                flex="1"
                minW={0}
                fontSize="sm"
                fontWeight="500"
                color="gray.700"
                lineClamp={1}
              >
                {module.name}
              </Text>

              {delta !== 0 && (
                <Text
                  flexShrink={0}
                  minW="34px"
                  textAlign="center"
                  fontSize="11px"
                  fontWeight="600"
                  px={2}
                  py="2px"
                  borderRadius="full"
                  color={
                    delta > 0
                      ? ACCESS_COLORS.grantText
                      : ACCESS_COLORS.revokeText
                  }
                  bg={delta > 0 ? ACCESS_COLORS.grantBg : ACCESS_COLORS.revokeBg}
                >
                  {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
                </Text>
              )}

              <HStack gap={3} flexShrink={0}>
                <Box
                  w="70px"
                  h="5px"
                  borderRadius="full"
                  bg="gray.100"
                  overflow="hidden"
                  display={{ base: "none", sm: "block" }}
                >
                  <Box
                    h="100%"
                    borderRadius="full"
                    transition="width 0.2s ease"
                    width={`${Math.round((granted / moduleTotal) * 100)}%`}
                    bg={isAll ? ACCESS_COLORS.grantText : ACCESS_COLORS.accent}
                  />
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight="500"
                  minW="46px"
                  textAlign="right"
                  color={
                    granted === 0
                      ? "gray.400"
                      : isAll
                        ? ACCESS_COLORS.grantText
                        : "gray.600"
                  }
                >
                  {granted} / {moduleTotal}
                </Text>
              </HStack>
            </Flex>
          );
        })}
      </Box>
    </Box>
  );
}
