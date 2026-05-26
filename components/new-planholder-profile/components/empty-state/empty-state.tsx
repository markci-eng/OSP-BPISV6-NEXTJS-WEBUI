import { Flex } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { Body } from "st-peter-ui";

export interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState(props: EmptyStateProps) {
  return (
    <Flex
      width={"full"}
      direction="column"
      align="center"
      justify="center"
      py={12}
      border="1px dashed"
      borderColor="gray.200"
      borderRadius="md"
      textAlign="center"
      color="gray.500"
      gap={2}
    >
      <Body fontWeight="semibold">{props.title}</Body>
      <Body fontSize="sm">{props.description}</Body>
    </Flex>
  );
}
