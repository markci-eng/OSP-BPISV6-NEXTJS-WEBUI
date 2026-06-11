import { Box, Flex, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { LuHash } from "react-icons/lu";

export function Card({
  activeIcon,
  title,
  subtitle,
  children,
}: {
  activeIcon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Box
      w="full"
      position="relative"
      p={1}
      borderRadius="2xl"
      bg="white"
      shadow="sm"
      transition="all 0.25s ease"
      _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
      overflow="hidden"
      cursor="pointer"
    >
      {/* Header / trigger */}
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={3}
        cursor="pointer"
        role="button"
        tabIndex={0}
        transition="background 0.15s ease"
      >
        <Flex align="center" gap={2}>
          <Box
            p={2}
            borderRadius="full"
            bg={"gray.100"}
            color={"inherit"}
            transition="background 0.2s ease, color 0.2s ease"
          >
            {activeIcon}
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
              {title}
            </Text>
            <Flex align="center" gap={1} fontSize="xs" color="gray.500">
              <Text>{subtitle}</Text>
            </Flex>
          </Box>
        </Flex>
      </Flex>

      <Box p={4} borderTopWidth={1} borderColor="gray.100">
        {children}
      </Box>
    </Box>
  );
}
