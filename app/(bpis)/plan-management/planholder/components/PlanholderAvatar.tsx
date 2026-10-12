import { Avatar, Box, Icon } from "@chakra-ui/react";
import { Ban, ShieldCheck } from "lucide-react";
import { Tooltip } from "osp-ui-kit";

type PlanholderAvatarProps = {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isInsured?: boolean;
};

/** Avatar ringed in the planholder's insurability colour, with a badge. */
export function PlanholderAvatar({
  src,
  name,
  size = "md",
  isInsured = true,
}: PlanholderAvatarProps) {
  const color = isInsured ? "success" : "warning";
  const fg = isInsured ? "successFg" : "warningFg";
  const bg = isInsured ? "successTint" : "warningTint";
  const tintVar = isInsured
    ? "var(--chakra-colors-success-tint)"
    : "var(--chakra-colors-warning-tint)";
  const label = isInsured ? "Insurable" : "Non-Insurable";

  return (
    <Tooltip
      content={`This planholder is ${label}`}
      contentProps={{
        // The tint is translucent in dark mode; lay it over an opaque surface
        // so the page underneath doesn't show through the tooltip.
        background: `linear-gradient(${tintVar}, ${tintVar}), var(--chakra-colors-surface-raised)`,
        color: fg,
      }}
    >
      <Box
        position="relative"
        flexShrink={0}
        border="3px solid"
        borderColor={color}
        borderRadius="full"
        p="2px"
      >
        <Avatar.Root size={size} bg={bg}>
          {src && <Avatar.Image src={src} />}
          <Avatar.Fallback name={name} color={fg} fontWeight="semibold" />
        </Avatar.Root>

        {/* Insurability badge */}
        <Box
          position="absolute"
          bottom="-5px"
          right="-7px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="20px"
          h="20px"
          bg="surface"
          border="2px solid"
          borderColor="surface"
          borderRadius="full"
        >
          <Icon size="sm" color={fg}>
            {isInsured ? <ShieldCheck /> : <Ban />}
          </Icon>
        </Box>
      </Box>
    </Tooltip>
  );
}
