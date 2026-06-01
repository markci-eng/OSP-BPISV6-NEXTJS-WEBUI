import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { OSPBadgeProps, OSPBadgeTypes } from "./badge.types";

export function OSPBadge({
  type = undefined,
  children,
  ...props
}: OSPBadgeProps) {
  const color = OSPBadgeTypes.find((i) => type === i.type);

  return (
    <Flex
      align="center"
      gap={1.5}
      px={2}
      py={1}
      borderRadius="full"
      bg={color?.background}
      flexShrink={0}
    >
      <Box w="5px" h="5px" borderRadius="full" bg={color?.border} />
      <Text fontSize="10px" fontWeight="semibold" color={color?.foreground}>
        <Flex gap={1} align={"center"}>
          {children}
        </Flex>
      </Text>
    </Flex>
    // <Badge
    //   bg={color?.background}
    //   color={color?.foreground}
    //   fontWeight="semibold"
    //   border="1px solid"
    //   borderColor={color?.border}
    //   {...props}
    // >
    //   {children}
    // </Badge>
  );
}
