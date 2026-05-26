import {
  AbsoluteCenter,
  Box,
  Flex,
  ProgressCircle,
  Strong,
} from "@chakra-ui/react";
import { Body } from "st-peter-ui";
import { Badge } from "../components/badge/badge";

interface ProgressCardProps {
  current: number;
  total: number;
  title: string;
  description: string;
  transactionId: string;
  onClick?: () => void;
}

export function ProgressCard({
  current,
  total,
  title,
  description,
  transactionId,
  onClick,
}: ProgressCardProps) {
  const percentage = (current / total) * 100;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Flex
      align="center"
      gap={2}
      borderRadius={"lg"}
      borderWidth="1px"
      bg="bg"
      py={2}
      shadow="sm"
      cursor={"pointer"}
      _hover={{ bg: "gray.50" }}
      minW={0}
      w={"full"}
      onClick={() => onClick?.()}
    >
      <ProgressCircle.Root value={percentage} ml={2} size="lg">
        <ProgressCircle.Circle>
          <ProgressCircle.Track
            color={"var(--chakra-colors-primary-disabled)/20"}
          />
          <ProgressCircle.Range
            stroke={"var(--chakra-colors-primary)"}
            strokeLinecap="round"
          />
        </ProgressCircle.Circle>
        <AbsoluteCenter>
          <ProgressCircle.ValueText />
        </AbsoluteCenter>
      </ProgressCircle.Root>

      <Box w={"full"}>
        <Strong color={"gray.700"}>{title}</Strong>
        <Body color="gray.500">{description}</Body>
        <Badge type="info"># {transactionId}</Badge>
      </Box>
    </Flex>
  );
}
