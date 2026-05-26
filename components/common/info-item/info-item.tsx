import { HStack, Icon, Strong, VStack } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { Small } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export default function InfoItem({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  color?: string;
  icon?: IconType;
}) {
  return (
    <HStack gap={2}>
      {icon && (
        <Icon
          as={icon}
          boxSize={4}
          my={1}
          color={BRAND_COLORS.primaryGreen}
          alignSelf={"start"}
          flexShrink={0}
        />
      )}
      <VStack gap={0} align="start" minW={0}>
        <Small color="gray.500" textWrap={"nowrap"}>
          {label}
        </Small>
        <Strong
          color={color ?? "gray.700"}
          wordBreak="break-word"
          overflowWrap="anywhere"
        >
          {value}
        </Strong>
      </VStack>
    </HStack>
  );
}
