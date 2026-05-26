import { Badge } from "@chakra-ui/react";
import { OSPBadgeProps, OSPBadgeTypes } from "./badge.types";

export function OSPBadge({
  type = undefined,
  children,
  ...props
}: OSPBadgeProps) {
  const color = OSPBadgeTypes.find((i) => type === i.type);

  return (
    <Badge
      fontSize={{
        base: "11px",
        md: "1rem",
      }}
      bg={color?.background}
      color={color?.foreground}
      fontWeight={"semibold"}
      border={"1px solid"}
      borderColor={color?.border}
      {...props}
    >
      {children}
    </Badge>
  );
}
