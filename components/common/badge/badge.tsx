import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { OSPBadgeProps, OSPBadgeTypes } from "./badge.types";

export function OSPBadge({
  type = undefined,
  children,
  ...props
}: OSPBadgeProps) {
  const color = OSPBadgeTypes.find((i) => type === i.type);

  return (
    // <Flex
    //   align="center"
    //   gap={1.5}
    //   px={2}
    //   py={1}
    //   borderRadius="full"
    //   bg={color?.background}
    //   flexShrink={0}
    // >
    //   <Box w="5px" h="5px" borderRadius="full" bg={color?.border} />
    //   <Text fontSize="10px" fontWeight="semibold" color={color?.foreground}>
    //     <Flex gap={1} align={"center"}>
    //       {children}
    //     </Flex>
    //   </Text>
    // </Flex>

    <Flex align="center" gap={2}>
      <Box w="2" h="2" borderRadius="full" bg={color?.color} shadow="sm" />
      <Badge
        colorPalette={color?.color}
        variant="subtle"
        px={2}
        py={1}
        fontSize="0.75rem"
      >
        {children}
      </Badge>
    </Flex>
  );
}

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
