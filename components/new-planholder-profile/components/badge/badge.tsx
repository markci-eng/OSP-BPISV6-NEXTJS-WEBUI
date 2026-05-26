import { Badge as ChakraBadge } from "@chakra-ui/react";
import { OSPBadgeProps, OSPBadgeTypes } from "./badge.types";

export function Badge({ type = undefined, children, ...props }: OSPBadgeProps) {
  const color = OSPBadgeTypes.find((i) => type === i.type);

  return (
    <ChakraBadge
      bg={color?.background}
      color={color?.foreground}
      fontWeight={"semibold"}
      border={"1px solid"}
      borderColor={color?.border}
      borderRadius="md"
      px={2}
      py={0.5}
      {...props}
    >
      {children}
    </ChakraBadge>
  );
}
