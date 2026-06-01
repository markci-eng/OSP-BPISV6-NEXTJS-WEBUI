import { HStack, Icon, Strong, VStack } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { Small } from "st-peter-ui";

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
          color={"var(--chakra-colors-primary)"}
          alignSelf={"start"}
        />
      )}
      <VStack gap={0} align="start" minW={0}>
        <Small color="gray.500" textWrap={"nowrap"}>
          {label}
        </Small>
        <Strong color={color ?? "gray.700"}>{value}</Strong>
      </VStack>
    </HStack>
  );
}
