import { HStack, Strong, VStack } from "@chakra-ui/react";
import { Small } from "st-peter-ui";

export default function InfoItem({
  label,
  value,
  color,
  orientation = "vertical",
}: {
  label: string;
  value: string | null | undefined;
  color?: string;
  orientation?: "horizontal" | "vertical";
}) {
  if (orientation == "vertical") {
    return (
      <VStack gap={1} align="start" minW={0}>
        <Small color="gray.500">{label}</Small>
        <Strong color={color ?? "gray.700"}>{value}</Strong>
      </VStack>
    );
  } else {
    return (
      <HStack gap={1} align="center" justify={"space-between"} minW={0}>
        <Small color="gray.500">{label}</Small>
        <Small
          fontWeight={"semibold"}
          textAlign={"end"}
          color={color ?? "gray.700"}
        >
          {value}
        </Small>
      </HStack>
    );
  }
}
