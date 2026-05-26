import { Flex, FlexProps } from "@chakra-ui/react";
import { Body, Small } from "st-peter-ui";

type EmptyStateProps = {
  title: string;
  description?: string;
} & FlexProps;

export const EmptyStateCard = ({
  title,
  description,
  children,
  ...props
}: EmptyStateProps) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py={{ base: 8, md: 12 }}
      px={4}
      border="1px dashed"
      borderColor="gray.200"
      borderRadius="md"
      textAlign="center"
      color="gray.500"
      gap={2}
      h={"full"}
      {...props}
    >
      <Body fontWeight="semibold">{title}</Body>

      {description && <Small>{description}</Small>}

      {children}
    </Flex>
  );
};
